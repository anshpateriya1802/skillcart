import { z } from 'zod';
import { Course } from '../model/course.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  previewVideo: z.string().url().optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.string().optional(),
  category: z.string().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  previewVideo: z.string().url().optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.string().optional(),
  category: z.string().optional(),
  totalDuration: z.number().optional(),
});

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

/**
 * Create a new course (Instructor only)
 */
export const createCourse = async (req, res) => {
  try {
    const validatedData = createCourseSchema.parse(req.body);

    const slug = generateSlug(validatedData.title);

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return ApiResponse.conflict(
        'Course with this title already exists'
      ).send(res);
    }

    const course = await Course.create({
      ...validatedData,
      slug,
      instructor: req.user._id,
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar')
      .populate('category', 'name slug');

    return ApiResponse.created(
      'Course created successfully',
      populatedCourse
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create course error:', error);
    return ApiResponse.serverError('Failed to create course').send(res);
  }
};

/**
 * Get all courses with filters
 */
export const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      level,
      category,
      isFree,
      search,
      instructor,
    } = req.query;

    const query = { published: true };

    if (level) query.level = level;
    if (category) query.category = category;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(query),
    ]);

    return ApiResponse.success('Courses fetched successfully', {
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }).send(res);
  } catch (error) {
    console.error('Get courses error:', error);
    return ApiResponse.serverError('Failed to fetch courses').send(res);
  }
};

/**
 * Get course by ID or slug
 */
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { slug: id };

    const course = await Course.findOne(query)
      .populate('instructor', 'name email avatar bio')
      .populate('category', 'name slug');

    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Only allow unpublished courses to be viewed by instructor or admin
    if (!course.published) {
      if (!req.user || course.instructor._id.toString() !== req.user._id.toString()) {
        if (!req.user || req.user.role !== 'admin') {
          return ApiResponse.forbidden('Course not published').send(res);
        }
      }
    }

    return ApiResponse.success('Course fetched successfully', course).send(res);
  } catch (error) {
    console.error('Get course error:', error);
    return ApiResponse.serverError('Failed to fetch course').send(res);
  }
};

/**
 * Get instructor's courses
 */
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      'Instructor courses fetched successfully',
      courses
    ).send(res);
  } catch (error) {
    console.error('Get instructor courses error:', error);
    return ApiResponse.serverError('Failed to fetch courses').send(res);
  }
};

/**
 * Update course (Instructor/owner only)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateCourseSchema.parse(req.body);

    const course = await Course.findById(id);

    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden('You are not authorized to update this course').send(res);
    }

    // Update slug if title changes
    if (validatedData.title) {
      const newSlug = generateSlug(validatedData.title);
      const existingCourse = await Course.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingCourse) {
        return ApiResponse.conflict('Course with this title already exists').send(res);
      }
      validatedData.slug = newSlug;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )
      .populate('instructor', 'name email avatar')
      .populate('category', 'name slug');

    return ApiResponse.success('Course updated successfully', updatedCourse).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(res);
    }
    console.error('Update course error:', error);
    return ApiResponse.serverError('Failed to update course').send(res);
  }
};

/**
 * Delete course (Instructor/owner only)
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden('You are not authorized to delete this course').send(res);
    }

    await Course.findByIdAndDelete(id);

    return ApiResponse.success('Course deleted successfully').send(res);
  } catch (error) {
    console.error('Delete course error:', error);
    return ApiResponse.serverError('Failed to delete course').send(res);
  }
};

/**
 * Publish/Unpublish course
 */
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return ApiResponse.forbidden('You are not authorized to publish this course').send(res);
    }

    course.published = !course.published;
    await course.save();

    return ApiResponse.success(
      `Course ${course.published ? 'published' : 'unpublished'} successfully`,
      { published: course.published }
    ).send(res);
  } catch (error) {
    console.error('Toggle publish error:', error);
    return ApiResponse.serverError('Failed to update course status').send(res);
  }
};
