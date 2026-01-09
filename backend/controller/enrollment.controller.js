import { z } from 'zod';
import { Enrollment } from '../model/enrollment.model.js';
import { Course } from '../model/course.model.js';
import { Progress } from '../model/progress.model.js';
import { Payment } from '../model/payment.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/sendEmail.js';
import { certificateIssuedTemplate } from '../utils/email-template/certificate-issued.js';
import { env } from '../utils/env.js';

// Validation schema
const enrollCourseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

/**
 * Enroll in a course (Student)
 */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = enrollCourseSchema.parse(req.body);

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    if (!course.published) {
      return ApiResponse.badRequest('Course is not published yet').send(res);
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return ApiResponse.conflict('Already enrolled in this course').send(res);
    }

    // For paid courses, check if payment is successful
    if (!course.isFree) {
      const successfulPayment = await Payment.findOne({
        user: req.user._id,
        course: courseId,
        status: 'success',
      });

      if (!successfulPayment) {
        return ApiResponse.badRequest(
          'Payment required. Please complete the payment first to enroll in this course'
        ).send(res);
      }
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
    });

    // Initialize progress
    await Progress.create({
      user: req.user._id,
      course: courseId,
      completedLectures: [],
      progressPercentage: 0,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title slug thumbnail price level')
      .populate('user', 'name email');

    return ApiResponse.created(
      'Enrolled successfully',
      populatedEnrollment
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Enroll course error:', error);
    return ApiResponse.serverError('Failed to enroll in course').send(res);
  }
};

/**
 * Get user's enrollments
 */
export const getMyEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { user: req.user._id };

    // Filter by completion status
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'ongoing') {
      query.completed = false;
    }

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title slug thumbnail price level instructor')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .sort({ enrolledAt: -1 });

    // Get progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await Progress.findOne({
          user: req.user._id,
          course: enrollment.course._id,
        });

        return {
          ...enrollment.toObject(),
          progress: progress
            ? {
                progressPercentage: progress.progressPercentage,
                completedLectures: progress.completedLectures.length,
              }
            : null,
        };
      })
    );

    return ApiResponse.success(
      'Enrollments fetched successfully',
      enrollmentsWithProgress
    ).send(res);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return ApiResponse.serverError('Failed to fetch enrollments').send(res);
  }
};

/**
 * Get single enrollment
 */
export const getEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    })
      .populate('course')
      .populate('user', 'name email avatar');

    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }

    // Get progress
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    const enrollmentData = {
      ...enrollment.toObject(),
      progress: progress || null,
    };

    return ApiResponse.success(
      'Enrollment fetched successfully',
      enrollmentData
    ).send(res);
  } catch (error) {
    console.error('Get enrollment error:', error);
    return ApiResponse.serverError('Failed to fetch enrollment').send(res);
  }
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    return ApiResponse.success('Enrollment status checked', {
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
    }).send(res);
  } catch (error) {
    console.error('Check enrollment error:', error);
    return ApiResponse.serverError('Failed to check enrollment').send(res);
  }
};

/**
 * Unenroll from course (Student)
 */
export const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }

    // Don't allow unenrolling if course is completed
    if (enrollment.completed) {
      return ApiResponse.badRequest(
        'Cannot unenroll from completed course'
      ).send(res);
    }

    // Delete enrollment and progress
    await Promise.all([
      Enrollment.findByIdAndDelete(enrollment._id),
      Progress.findOneAndDelete({ user: req.user._id, course: courseId }),
    ]);

    return ApiResponse.success('Unenrolled successfully').send(res);
  } catch (error) {
    console.error('Unenroll course error:', error);
    return ApiResponse.serverError('Failed to unenroll from course').send(res);
  }
};

/**
 * Get course enrollments (Instructor/Admin)
 */
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    // Check if user is the instructor or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return ApiResponse.forbidden(
        'You are not authorized to view these enrollments'
      ).send(res);
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('user', 'name email avatar')
      .sort({ enrolledAt: -1 });

    // Get progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await Progress.findOne({
          user: enrollment.user._id,
          course: courseId,
        });

        return {
          ...enrollment.toObject(),
          progress: progress
            ? {
                progressPercentage: progress.progressPercentage,
                completedLectures: progress.completedLectures.length,
              }
            : null,
        };
      })
    );

    return ApiResponse.success('Course enrollments fetched successfully', {
      totalEnrollments: enrollments.length,
      enrollments: enrollmentsWithProgress,
    }).send(res);
  } catch (error) {
    console.error('Get course enrollments error:', error);
    return ApiResponse.serverError(
      'Failed to fetch course enrollments'
    ).send(res);
  }
};

/**
 * Mark course as completed (Student)
 */
export const markCourseCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }

    if (enrollment.completed) {
      return ApiResponse.badRequest('Course already marked as completed').send(
        res
      );
    }

    enrollment.completed = true;
    await enrollment.save();

    // Auto-generate certificate record
    const { Certificate } = await import('../model/certificate.model.js');
    const { generateCertificateId } = await import(
      '../utils/certificateGenerator.js'
    );

    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    });

    let certificate = null;
    if (!existingCertificate) {
      const certificateId = generateCertificateId();

      try {
        certificate = await Certificate.create({
          user: req.user._id,
          course: courseId,
          certificateId,
          issuedAt: new Date(),
        });

        // Send certificate issued email (background)
        const course = await Course.findById(courseId);
        const certificateUrl = `${env.FRONTEND_URL}/certificates/${certificateId}`;
        
        sendEmail({
          to: req.user.email,
          subject: `🏆 Your Certificate is Ready - ${course.title}`,
          html: certificateIssuedTemplate({
            userName: req.user.name,
            courseTitle: course.title,
            certificateUrl,
            certificateId,
          }),
        }).catch((err) => console.error('Certificate email error:', err));
      } catch (certError) {
        console.error('Certificate record creation error:', certError);
      }
    }

    return ApiResponse.success('Course marked as completed', {
      enrollment,
      certificate: certificate || existingCertificate,
    }).send(res);
  } catch (error) {
    console.error('Mark course completed error:', error);
    return ApiResponse.serverError('Failed to mark course as completed').send(
      res
    );
  }
};
