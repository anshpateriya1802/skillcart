import { z } from 'zod';
import { Review } from '../model/review.model.js';
import { Course } from '../model/course.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Validation schemas
const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be at most 1000 characters').optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * Create or update review (Student - must be enrolled)
 */
export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = createReviewSchema.parse(req.body);

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.forbidden(
        'You must be enrolled in this course to leave a review'
      ).send(res);
    }

    // Check if user is the instructor
    if (course.instructor.toString() === req.user._id.toString()) {
      return ApiResponse.badRequest(
        'Instructors cannot review their own courses'
      ).send(res);
    }

    // Check if review already exists
    let review = await Review.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (review) {
      return ApiResponse.conflict(
        'Review already exists. Use update endpoint to modify it'
      ).send(res);
    }

    // Create review
    review = await Review.create({
      user: req.user._id,
      course: courseId,
      rating,
      comment,
    });

    // Update course rating
    await updateCourseRating(courseId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('course', 'title slug');

    return ApiResponse.created(
      'Review created successfully',
      populatedReview
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create review error:', error);
    return ApiResponse.serverError('Failed to create review').send(res);
  }
};

/**
 * Update review
 */
export const updateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = updateReviewSchema.parse(req.body);

    // Find review
    const review = await Review.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!review) {
      return ApiResponse.notFound(
        'Review not found. Create a review first'
      ).send(res);
    }

    // Update fields
    if (updates.rating !== undefined) review.rating = updates.rating;
    if (updates.comment !== undefined) review.comment = updates.comment;

    await review.save();

    // Update course rating
    await updateCourseRating(courseId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('course', 'title slug');

    return ApiResponse.success(
      'Review updated successfully',
      populatedReview
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Update review error:', error);
    return ApiResponse.serverError('Failed to update review').send(res);
  }
};

/**
 * Delete review
 */
export const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;

    const review = await Review.findOneAndDelete({
      user: req.user._id,
      course: courseId,
    });

    if (!review) {
      return ApiResponse.notFound('Review not found').send(res);
    }

    // Update course rating
    await updateCourseRating(courseId);

    return ApiResponse.success('Review deleted successfully').send(res);
  } catch (error) {
    console.error('Delete review error:', error);
    return ApiResponse.serverError('Failed to delete review').send(res);
  }
};

/**
 * Get reviews for a course (Public)
 */
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const query = { course: courseId };

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return ApiResponse.success('Reviews fetched successfully', {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      ratingDistribution,
    }).send(res);
  } catch (error) {
    console.error('Get course reviews error:', error);
    return ApiResponse.serverError('Failed to fetch reviews').send(res);
  }
};

/**
 * Get user's review for a course
 */
export const getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;

    const review = await Review.findOne({
      user: req.user._id,
      course: courseId,
    })
      .populate('user', 'name avatar')
      .populate('course', 'title slug');

    if (!review) {
      return ApiResponse.notFound('Review not found').send(res);
    }

    return ApiResponse.success('Review fetched successfully', review).send(
      res
    );
  } catch (error) {
    console.error('Get my review error:', error);
    return ApiResponse.serverError('Failed to fetch review').send(res);
  }
};

/**
 * Get all reviews by current user
 */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('course', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      'Your reviews fetched successfully',
      reviews
    ).send(res);
  } catch (error) {
    console.error('Get my reviews error:', error);
    return ApiResponse.serverError('Failed to fetch reviews').send(res);
  }
};

/**
 * Helper function to update course rating
 */
async function updateCourseRating(courseId) {
  const stats = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      ratingCount: stats[0].count,
    });
  } else {
    // No reviews, reset rating
    await Course.findByIdAndUpdate(courseId, {
      rating: 0,
      ratingCount: 0,
    });
  }
}

// Fix mongoose import
import mongoose from 'mongoose';
