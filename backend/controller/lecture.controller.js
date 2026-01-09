import { z } from 'zod';
import { Lecture } from '../model/lecture.model.js';
import { Section } from '../model/section.model.js';
import { Course } from '../model/course.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createLectureSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  videoUrl: z.string().url('Invalid video URL').optional(),
  duration: z.number().min(0, 'Duration must be positive').optional(),
  isPreview: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

const updateLectureSchema = z.object({
  title: z.string().min(3).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().min(0).optional(),
  isPreview: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Get all lectures in a section
 */
export const getSectionLectures = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization for unpublished courses
    if (!section.course.published) {
      if (
        !req.user ||
        (section.course.instructor.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin')
      ) {
        return ApiResponse.forbidden('Unauthorized access').send(res);
      }
    }

    const lectures = await Lecture.find({ section: sectionId }).sort({
      order: 1,
    });

    return ApiResponse.success('Lectures fetched successfully', lectures).send(
      res
    );
  } catch (error) {
    console.error('Get lectures error:', error);
    return ApiResponse.serverError('Failed to fetch lectures').send(res);
  }
};

/**
 * Get single lecture
 */
export const getLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findById(id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lecture) {
      return ApiResponse.notFound('Lecture not found').send(res);
    }

    const course = lecture.section.course;

    // Check authorization for unpublished courses or non-preview lectures
    if (!course.published || !lecture.isPreview) {
      if (
        !req.user ||
        (course.instructor.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin')
      ) {
        // Check if user is enrolled
        const { Enrollment } = await import('../model/enrollment.model.js');
        const enrollment = await Enrollment.findOne({
          user: req.user?._id,
          course: course._id,
        });

        if (!enrollment) {
          return ApiResponse.forbidden(
            'You must be enrolled to access this lecture'
          ).send(res);
        }
      }
    }

    return ApiResponse.success('Lecture fetched successfully', lecture).send(
      res
    );
  } catch (error) {
    console.error('Get lecture error:', error);
    return ApiResponse.serverError('Failed to fetch lecture').send(res);
  }
};

/**
 * Create lecture (Instructor/Admin)
 */
export const createLecture = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, videoUrl, duration, isPreview, order } =
      createLectureSchema.parse(req.body);

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization
    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can create lectures'
      ).send(res);
    }

    // Auto-assign order if not provided
    let lectureOrder = order;
    if (lectureOrder === undefined) {
      const lastLecture = await Lecture.findOne({ section: sectionId }).sort({
        order: -1,
      });
      lectureOrder = lastLecture ? lastLecture.order + 1 : 0;
    }

    const lecture = await Lecture.create({
      title,
      section: sectionId,
      videoUrl,
      duration,
      isPreview: isPreview || false,
      order: lectureOrder,
    });

    return ApiResponse.created('Lecture created successfully', lecture).send(
      res
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create lecture error:', error);
    return ApiResponse.serverError('Failed to create lecture').send(res);
  }
};

/**
 * Update lecture (Instructor/Admin)
 */
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updateLectureSchema.parse(req.body);

    const lecture = await Lecture.findById(id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lecture) {
      return ApiResponse.notFound('Lecture not found').send(res);
    }

    const course = lecture.section.course;

    // Check authorization
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can update lectures'
      ).send(res);
    }

    if (updates.title !== undefined) lecture.title = updates.title;
    if (updates.videoUrl !== undefined) lecture.videoUrl = updates.videoUrl;
    if (updates.duration !== undefined) lecture.duration = updates.duration;
    if (updates.isPreview !== undefined) lecture.isPreview = updates.isPreview;
    if (updates.order !== undefined) lecture.order = updates.order;

    await lecture.save();

    return ApiResponse.success('Lecture updated successfully', lecture).send(
      res
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Update lecture error:', error);
    return ApiResponse.serverError('Failed to update lecture').send(res);
  }
};

/**
 * Delete lecture (Instructor/Admin)
 */
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findById(id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lecture) {
      return ApiResponse.notFound('Lecture not found').send(res);
    }

    const course = lecture.section.course;

    // Check authorization
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can delete lectures'
      ).send(res);
    }

    await Lecture.findByIdAndDelete(id);

    return ApiResponse.success('Lecture deleted successfully').send(res);
  } catch (error) {
    console.error('Delete lecture error:', error);
    return ApiResponse.serverError('Failed to delete lecture').send(res);
  }
};

/**
 * Reorder lectures in a section (Instructor/Admin)
 */
export const reorderLectures = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { lectureIds } = z
      .object({
        lectureIds: z.array(z.string()).min(1, 'Lecture IDs array required'),
      })
      .parse(req.body);

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization
    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can reorder lectures'
      ).send(res);
    }

    // Update order for each lecture
    const updatePromises = lectureIds.map((lectureId, index) =>
      Lecture.findByIdAndUpdate(lectureId, { order: index })
    );

    await Promise.all(updatePromises);

    const updatedLectures = await Lecture.find({ section: sectionId }).sort({
      order: 1,
    });

    return ApiResponse.success(
      'Lectures reordered successfully',
      updatedLectures
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Reorder lectures error:', error);
    return ApiResponse.serverError('Failed to reorder lectures').send(res);
  }
};
