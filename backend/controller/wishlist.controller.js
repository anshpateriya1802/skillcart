import { z } from 'zod';
import { Wishlist } from '../model/wishlist.model.js';
import { Course } from '../model/course.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schema
const addToWishlistSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * Get user's wishlist
 */
export const getMyWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'courses',
      select: 'title slug thumbnail price isFree level rating ratingCount instructor category',
      populate: [
        { path: 'instructor', select: 'name avatar' },
        { path: 'category', select: 'name slug' },
      ],
    });

    if (!wishlist) {
      wishlist = { user: req.user._id, courses: [] };
    }

    return ApiResponse.success('Wishlist fetched successfully', wishlist).send(
      res
    );
  } catch (error) {
    console.error('Get wishlist error:', error);
    return ApiResponse.serverError('Failed to fetch wishlist').send(res);
  }
};

/**
 * Add course to wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = addToWishlistSchema.parse(req.body);

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        courses: [courseId],
      });
    } else {
      // Check if already in wishlist
      if (wishlist.courses.includes(courseId)) {
        return ApiResponse.conflict('Course already in wishlist').send(res);
      }

      wishlist.courses.push(courseId);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'courses',
      select: 'title slug thumbnail price isFree level rating ratingCount',
      populate: { path: 'instructor', select: 'name avatar' },
    });

    return ApiResponse.created(
      'Course added to wishlist',
      populatedWishlist
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Add to wishlist error:', error);
    return ApiResponse.serverError('Failed to add to wishlist').send(res);
  }
};

/**
 * Remove course from wishlist
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist || !wishlist.courses.includes(courseId)) {
      return ApiResponse.notFound('Course not in wishlist').send(res);
    }

    wishlist.courses = wishlist.courses.filter(
      (id) => id.toString() !== courseId
    );
    await wishlist.save();

    return ApiResponse.success('Course removed from wishlist').send(res);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return ApiResponse.serverError('Failed to remove from wishlist').send(res);
  }
};

/**
 * Check if course is in wishlist
 */
export const checkWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist && wishlist.courses.includes(courseId);

    return ApiResponse.success('Wishlist status checked', {
      isInWishlist,
    }).send(res);
  } catch (error) {
    console.error('Check wishlist error:', error);
    return ApiResponse.serverError('Failed to check wishlist status').send(
      res
    );
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return ApiResponse.success('Wishlist is already empty').send(res);
    }

    const count = wishlist.courses.length;
    wishlist.courses = [];
    await wishlist.save();

    return ApiResponse.success(
      `Wishlist cleared (${count} items removed)`
    ).send(res);
  } catch (error) {
    console.error('Clear wishlist error:', error);
    return ApiResponse.serverError('Failed to clear wishlist').send(res);
  }
};

