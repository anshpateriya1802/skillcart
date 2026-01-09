import { z } from 'zod';
import { Section } from '../model/section.model.js';
import { Lecture } from '../model/lecture.model.js';
import { Course } from '../model/course.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createSectionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  order: z.number().int().min(0).optional(),
});

const updateSectionSchema = z.object({
  title: z.string().min(3).optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Get all sections for a course (Public if course is published)
 */
export const getCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check authorization for unpublished courses
    if (!course.published) {
      if (!req.user || 
          (course.instructor.toString() !== req.user._id.toString() && 
           req.user.role !== 'admin')) {
        return ApiResponse.forbidden('Course not published yet').send(res);
      }
    }

    const sections = await Section.find({ course: courseId }).sort({ order: 1 });

    // Get lecture count for each section
    const sectionsWithLectures = await Promise.all(
      sections.map(async (section) => {
        const lectures = await Lecture.find({ section: section._id }).sort({ order: 1 });
        return {
          ...section.toObject(),
          lectures,
          lectureCount: lectures.length,
        };
      })
    );

    return ApiResponse.success(
      'Sections fetched successfully',
      sectionsWithLectures
    ).send(res);
  } catch (error) {
    console.error('Get sections error:', error);
    return ApiResponse.serverError('Failed to fetch sections').send(res);
  }
};

/**
 * Get single section with lectures
 */
export const getSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findById(id).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization for unpublished courses
    if (!section.course.published) {
      if (!req.user || 
          (section.course.instructor.toString() !== req.user._id.toString() && 
           req.user.role !== 'admin')) {
        return ApiResponse.forbidden('Unauthorized access').send(res);
      }
    }

    const lectures = await Lecture.find({ section: id }).sort({ order: 1 });

    return ApiResponse.success('Section fetched successfully', {
      ...section.toObject(),
      lectures,
    }).send(res);
  } catch (error) {
    console.error('Get section error:', error);
    return ApiResponse.serverError('Failed to fetch section').send(res);
  }
};

/**
 * Create section (Instructor/Admin)
 */
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, order } = createSectionSchema.parse(req.body);

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check authorization
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can create sections'
      ).send(res);
    }

    // Auto-assign order if not provided
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const lastSection = await Section.findOne({ course: courseId }).sort({ order: -1 });
      sectionOrder = lastSection ? lastSection.order + 1 : 0;
    }

    const section = await Section.create({
      title,
      course: courseId,
      order: sectionOrder,
    });

    return ApiResponse.created('Section created successfully', section).send(
      res
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create section error:', error);
    return ApiResponse.serverError('Failed to create section').send(res);
  }
};

/**
 * Update section (Instructor/Admin)
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updateSectionSchema.parse(req.body);

    const section = await Section.findById(id).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization
    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can update sections'
      ).send(res);
    }

    if (updates.title !== undefined) section.title = updates.title;
    if (updates.order !== undefined) section.order = updates.order;

    await section.save();

    return ApiResponse.success('Section updated successfully', section).send(
      res
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Update section error:', error);
    return ApiResponse.serverError('Failed to update section').send(res);
  }
};

/**
 * Delete section (Instructor/Admin)
 * Also deletes all lectures in the section
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findById(id).populate('course');
    if (!section) {
      return ApiResponse.notFound('Section not found').send(res);
    }

    // Check authorization
    if (
      section.course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can delete sections'
      ).send(res);
    }

    // Delete all lectures in this section
    await Lecture.deleteMany({ section: id });

    // Delete section
    await Section.findByIdAndDelete(id);

    return ApiResponse.success('Section and its lectures deleted successfully').send(
      res
    );
  } catch (error) {
    console.error('Delete section error:', error);
    return ApiResponse.serverError('Failed to delete section').send(res);
  }
};

/**
 * Reorder sections (Instructor/Admin)
 */
export const reorderSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionIds } = z
      .object({
        sectionIds: z.array(z.string()).min(1, 'Section IDs array required'),
      })
      .parse(req.body);

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check authorization
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'Only the course instructor can reorder sections'
      ).send(res);
    }

    // Update order for each section
    const updatePromises = sectionIds.map((sectionId, index) =>
      Section.findByIdAndUpdate(sectionId, { order: index })
    );

    await Promise.all(updatePromises);

    const updatedSections = await Section.find({ course: courseId }).sort({ order: 1 });

    return ApiResponse.success(
      'Sections reordered successfully',
      updatedSections
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Reorder sections error:', error);
    return ApiResponse.serverError('Failed to reorder sections').send(res);
  }
};
