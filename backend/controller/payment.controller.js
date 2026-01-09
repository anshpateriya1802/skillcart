import { z } from 'zod';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../model/payment.model.js';
import { Course } from '../model/course.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { Progress } from '../model/progress.model.js';
import { env } from '../utils/env.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/sendEmail.js';
import { coursePurchasedTemplate } from '../utils/email-template/payment-done.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: env.RZP_KEY,
  key_secret: env.RZP_SECRET,
});

console.log('Razorpay initialized with key:', env.RZP_KEY ? 'Key is set' : 'Key is MISSING');

// Validation schemas
const createOrderSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

/**
 * Create Razorpay order (Step 1)
 * Backend fetches course, validates, creates order
 */
export const createOrder = async (req, res) => {
  try {
    const { courseId } = createOrderSchema.parse(req.body);

    // Fetch course from DB (don't trust frontend data)
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found').send(res);
    }

    if (!course.published) {
      return ApiResponse.badRequest('Course is not available for purchase').send(
        res
      );
    }

    // Check if it's a free course
    if (course.isFree) {
      return ApiResponse.badRequest(
        'This is a free course, no payment required'
      ).send(res);
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return ApiResponse.conflict('Already enrolled in this course').send(res);
    }

    // Check if payment already successful
    const existingPayment = await Payment.findOne({
      user: req.user._id,
      course: courseId,
      status: 'success',
    });

    if (existingPayment) {
      return ApiResponse.conflict(
        'Payment already completed for this course'
      ).send(res);
    }

    // Calculate amount from backend (don't trust frontend)
    const amount = Math.round(course.price * 100); // Convert to paise
    const currency = 'INR';
    // Receipt must be max 40 chars - use shortened format
    const receipt = `rcpt_${Date.now()}_${req.user._id.toString().slice(-8)}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
        courseTitle: course.title,
      },
    });

    // Store payment as pending in DB
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount: course.price, // Store in rupees
      currency,
      status: 'pending',
      orderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      metadata: {
        courseTitle: course.title,
        userName: req.user.name,
      },
    });

    // Return order details to frontend
    return ApiResponse.success('Order created successfully', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      courseTitle: course.title,
      // Send Razorpay key to frontend
      key: env.RZP_KEY,
    }).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return ApiResponse.serverError('Failed to create order', {
      error: error.message,
    }).send(res);
  }
};

/**
 * Verify payment signature (Step 2)
 * Backend verifies Razorpay signature - NEVER trust frontend
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verifyPaymentSchema.parse(req.body);

    // Find payment by orderId
    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return ApiResponse.notFound('Payment record not found').send(res);
    }

    // Verify user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden('Unauthorized payment verification').send(
        res
      );
    }

    // Check if already verified
    if (payment.status === 'success') {
      return ApiResponse.conflict('Payment already verified').send(res);
    }

    // Generate expected signature on backend
    const generatedSignature = crypto
      .createHmac('sha256', env.RZP_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature matches
    if (generatedSignature !== razorpay_signature) {
      // Mark payment as failed
      payment.status = 'failed';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      return ApiResponse.badRequest('Payment verification failed').send(res);
    }

    // Signature verified - update payment status
    payment.status = 'success';
    payment.transactionId = razorpay_payment_id;
    await payment.save();

    // Auto-enroll user in course
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: payment.course,
    });

    // Initialize progress tracking
    await Progress.create({
      user: req.user._id,
      course: payment.course,
      completedLectures: [],
      progressPercentage: 0,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title slug thumbnail price level')
      .populate('user', 'name email');

    // Send course purchased email (background)
    const courseUrl = `${env.FRONTEND_URL}/courses/${populatedEnrollment.course.slug}`;
    
    sendEmail({
      to: req.user.email,
      subject: `Payment Successful - ${populatedEnrollment.course.title} 🎉`,
      html: coursePurchasedTemplate({
        userName: req.user.name,
        courseTitle: populatedEnrollment.course.title,
        courseUrl,
        amount: payment.amount,
        currency: payment.currency,
      }),
    }).catch((err) => console.error('Course purchased email error:', err));

    return ApiResponse.success('Payment verified and enrolled successfully', {
      payment: {
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
      },
      enrollment: populatedEnrollment,
    }).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.issues).send(
        res
      );
    }
    console.error('Verify payment error:', error);
    return ApiResponse.serverError('Failed to verify payment').send(res);
  }
};

/**
 * Get user's payment history
 */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('course', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      'Payments fetched successfully',
      payments
    ).send(res);
  } catch (error) {
    console.error('Get payments error:', error);
    return ApiResponse.serverError('Failed to fetch payments').send(res);
  }
};

/**
 * Get single payment
 */
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate(
      'course',
      'title slug thumbnail price'
    );

    if (!payment) {
      return ApiResponse.notFound('Payment not found').send(res);
    }

    // Verify user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden('Unauthorized access').send(res);
    }

    return ApiResponse.success('Payment fetched successfully', payment).send(
      res
    );
  } catch (error) {
    console.error('Get payment error:', error);
    return ApiResponse.serverError('Failed to fetch payment').send(res);
  }
};

/**
 * Get course payments (Instructor/Admin)
 */
export const getCoursePayments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Fetch course
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
        'Not authorized to view these payments'
      ).send(res);
    }

    const payments = await Payment.find({
      course: courseId,
      status: 'success',
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return ApiResponse.success('Course payments fetched successfully', {
      totalPayments: payments.length,
      totalRevenue,
      payments,
    }).send(res);
  } catch (error) {
    console.error('Get course payments error:', error);
    return ApiResponse.serverError('Failed to fetch course payments').send(
      res
    );
  }
};
