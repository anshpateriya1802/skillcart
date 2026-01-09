import { z } from 'zod';
import { Progress } from '../model/progress.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { Lecture } from '../model/lecture.model.js';
import { Section } from '../model/section.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schema
const toggleLectureSchema = z.object({
  lectureId: z.string().min(1, 'Lecture ID is required'),
});

/**
 * Get course progress for current user
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }

    // Get progress
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    }).populate('completedLectures', 'title duration videoUrl');

    if (!progress) {
      return ApiResponse.notFound('Progress not found').send(res);
    }

    // Get total lectures in course
    const sections = await Section.find({ course: courseId });
    const sectionIds = sections.map((s) => s._id);
    const totalLectures = await Lecture.countDocuments({
      section: { $in: sectionIds },
    });

    return ApiResponse.success('Progress fetched successfully', {
      ...progress.toObject(),
      totalLectures,
      completedCount: progress.completedLectures.length,
    }).send(res);
  } catch (error) {
    console.error('Get course progress error:', error);
    return ApiResponse.serverError('Failed to fetch progress').send(res);
  }
};

/**
 * Get all progress for current user
 */
export const getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('course', 'title slug thumbnail')
      .sort({ updatedAt: -1 });

    // Get total lectures for each course
    const progressWithDetails = await Promise.all(
      progressList.map(async (progress) => {
        const sections = await Section.find({ course: progress.course._id });
        const sectionIds = sections.map((s) => s._id);
        const totalLectures = await Lecture.countDocuments({
          section: { $in: sectionIds },
        });

        return {
          ...progress.toObject(),
          totalLectures,
          completedCount: progress.completedLectures.length,
        };
      })
    );

    return ApiResponse.success(
      'All progress fetched successfully',
      progressWithDetails
    ).send(res);
  } catch (error) {
    console.error('Get all progress error:', error);
    return ApiResponse.serverError('Failed to fetch progress').send(res);
  }
};

/**
 * Toggle lecture completion (mark as completed/uncompleted)
 */
export const toggleLectureCompletion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId } = toggleLectureSchema.parse(req.body);

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }

    // Verify lecture belongs to this course
    const lecture = await Lecture.findById(lectureId).populate('section');
    if (!lecture) {
      return ApiResponse.notFound('Lecture not found').send(res);
    }

    if (lecture.section.course.toString() !== courseId) {
      return ApiResponse.badRequest(
        'Lecture does not belong to this course'
      ).send(res);
    }

    // Get or create progress
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        completedLectures: [],
        progressPercentage: 0,
      });
    }

    // Toggle lecture completion
    const lectureIndex = progress.completedLectures.findIndex(
      (id) => id.toString() === lectureId
    );

    let isCompleted;
    if (lectureIndex > -1) {
      // Remove from completed (mark as uncompleted)
      progress.completedLectures.splice(lectureIndex, 1);
      isCompleted = false;
    } else {
      // Add to completed
      progress.completedLectures.push(lectureId);
      isCompleted = true;
    }

    // Calculate progress percentage
    const sections = await Section.find({ course: courseId });
    const sectionIds = sections.map((s) => s._id);
    const totalLectures = await Lecture.countDocuments({
      section: { $in: sectionIds },
    });

    progress.progressPercentage =
      totalLectures > 0
        ? Math.round((progress.completedLectures.length / totalLectures) * 100)
        : 0;

    await progress.save();

    // Auto-complete course if 100% progress
    if (progress.progressPercentage === 100 && !enrollment.completed) {
      enrollment.completed = true;
      await enrollment.save();
    }

    return ApiResponse.success(
      isCompleted ? 'Lecture marked as completed' : 'Lecture marked as incomplete',
      {
        progress: {
          completedLectures: progress.completedLectures,
          progressPercentage: progress.progressPercentage,
          totalLectures,
          completedCount: progress.completedLectures.length,
        },
        courseCompleted: enrollment.completed,
      }
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Toggle lecture completion error:', error);
    return ApiResponse.serverError(
      'Failed to update lecture completion'
    ).send(res);
  }
};

/**
 * Reset course progress
 */
export const resetProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.forbidden('Not enrolled in this course').send(res);
    }

    // Reset progress
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      return ApiResponse.notFound('Progress not found').send(res);
    }

    progress.completedLectures = [];
    progress.progressPercentage = 0;
    await progress.save();

    // Mark enrollment as not completed
    if (enrollment.completed) {
      enrollment.completed = false;
      await enrollment.save();
    }

    return ApiResponse.success('Progress reset successfully', progress).send(
      res
    );
  } catch (error) {
    console.error('Reset progress error:', error);
    return ApiResponse.serverError('Failed to reset progress').send(res);
  }
};
