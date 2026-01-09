import { Certificate } from '../model/certificate.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { Course } from '../model/course.model.js';
import { generateCertificateId } from '../utils/certificateGenerator.js';
import { generateCertificateHTML } from '../utils/certificateTemplate.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Verify certificate (Public endpoint - returns JSON)
 */
export const verifyCertificateJson = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'name')
      .populate('course', 'title instructor')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

    return res.json({
      success: true,
      certificate: {
        user: { name: certificate.user.name },
        course: {
          title: certificate.course.title,
          instructor: { name: certificate.course.instructor.name },
        },
        issuedAt: certificate.issuedAt,
        completionDate,
        certificateId: certificate.certificateId,
      },
    });
  } catch (error) {
    console.error('Verify certificate JSON error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to verify certificate' });
  }
};

/**
 * Generate certificate for completed course (only creates DB record)
 */
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if enrollment exists and is completed
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }

    if (!enrollment.completed) {
      return ApiResponse.badRequest(
        'Course must be completed to generate certificate'
      ).send(res);
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (certificate) {
      const populatedCertificate = await Certificate.findById(
        certificate._id
      ).populate('course', 'title');
      return ApiResponse.success(
        'Certificate already exists',
        populatedCertificate
      ).send(res);
    }

    // Generate certificate ID
    const certificateId = generateCertificateId();

    // Save certificate record (PDF generated on-demand)
    certificate = await Certificate.create({
      user: req.user._id,
      course: courseId,
      certificateId,
      issuedAt: new Date(),
    });

    const populatedCertificate = await Certificate.findById(
      certificate._id
    ).populate('course', 'title slug thumbnail');

    return ApiResponse.created(
      'Certificate generated successfully',
      populatedCertificate
    ).send(res);
  } catch (error) {
    console.error('Generate certificate error:', error);
    return ApiResponse.serverError('Failed to generate certificate').send(res);
  }
};

/**
 * Get all certificates for current user
 */
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title slug thumbnail instructor')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      })
      .sort({ issuedAt: -1 });

    return ApiResponse.success(
      'Certificates fetched successfully',
      certificates
    ).send(res);
  } catch (error) {
    console.error('Get certificates error:', error);
    return ApiResponse.serverError('Failed to fetch certificates').send(res);
  }
};

/**
 * Get single certificate
 */
export const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    }).populate('course', 'title slug thumbnail instructor');

    if (!certificate) {
      return ApiResponse.notFound('Certificate not found').send(res);
    }

    return ApiResponse.success(
      'Certificate fetched successfully',
      certificate
    ).send(res);
  } catch (error) {
    console.error('Get certificate error:', error);
    return ApiResponse.serverError('Failed to fetch certificate').send(res);
  }
};

/**
 * View certificate - returns JSON data for frontend rendering
 */
export const viewCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    })
      .populate('course', 'title instructor')
      .populate('user', 'name')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!certificate) {
      return ApiResponse.notFound('Certificate not found').send(res);
    }

    // Return certificate data as JSON for frontend rendering
    const certificateData = {
      userName: certificate.user.name,
      courseTitle: certificate.course.title,
      completionDate: certificate.issuedAt,
      certificateId: certificate.certificateId,
      instructorName: certificate.course.instructor.name,
    };

    return ApiResponse.success(
      'Certificate data fetched successfully',
      certificateData
    ).send(res);
  } catch (error) {
    console.error('View certificate error:', error);
    return ApiResponse.serverError('Failed to view certificate').send(res);
  }
};

/**
 * Verify certificate (Public endpoint - returns HTML)
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'name')
      .populate('course', 'title instructor')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!certificate) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .error { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; margin-bottom: 10px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Certificate Not Found</h1>
            <p>The certificate ID <strong>${certificateId}</strong> is not valid.</p>
          </div>
        </body>
        </html>
      `);
    }

    const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

    // Generate HTML certificate for public view
    const html = generateCertificateHTML({
      userName: certificate.user.name,
      courseTitle: certificate.course.title,
      completionDate,
      certificateId: certificate.certificateId,
      instructorName: certificate.course.instructor.name,
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Verify certificate error:', error);
    return res.status(500).send('Failed to verify certificate');
  }
};
