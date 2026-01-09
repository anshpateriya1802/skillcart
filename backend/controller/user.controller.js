import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../model/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/sendEmail.js';
import { passwordResetTemplate } from '../utils/email-template/password-reset.js';
import { env } from '../utils/env.js';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters'),
});

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return ApiResponse.notFound('User not found').send(res);
    }

    return ApiResponse.success('Profile fetched successfully', user).send(res);
  } catch (error) {
    console.error('Get profile error:', error);
    return ApiResponse.serverError('Failed to fetch profile').send(res);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return ApiResponse.notFound('User not found').send(res);
    }

    return ApiResponse.success('Profile updated successfully', user).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Update profile error:', error);
    return ApiResponse.serverError('Failed to update profile').send(res);
  }
};

/**
 * Change password (requires current password)
 */
export const changePassword = async (req, res) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      return ApiResponse.notFound('User not found').send(res);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return ApiResponse.unauthorized('Current password is incorrect').send(
        res
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    user.passwordHash = hashedPassword;
    await user.save();

    return ApiResponse.success(
      'Password changed successfully',
      null
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Change password error:', error);
    return ApiResponse.serverError('Failed to change password').send(res);
  }
};

/**
 * Forgot password - send reset email
 */
export const forgotPassword = async (req, res) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });

    if (!user) {
      // Don't reveal if email exists
      return ApiResponse.success(
        'If the email exists, a password reset link has been sent',
        null
      ).send(res);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Create reset URL (adjust based on your frontend)
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - SkillCerts',
      html: passwordResetTemplate({
        userName: user.name,
        resetUrl,
        expiresIn: '1 hour',
      }),
    });

    return ApiResponse.success(
      'If the email exists, a password reset link has been sent',
      null
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Forgot password error:', error);
    return ApiResponse.serverError('Failed to process request').send(res);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);

    // Hash the provided token
    const hashedToken = crypto
      .createHash('sha256')
      .update(validatedData.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponse.badRequest(
        'Invalid or expired reset token'
      ).send(res);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password and clear reset token
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return ApiResponse.success(
      'Password reset successfully. You can now log in with your new password.',
      null
    ).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Reset password error:', error);
    return ApiResponse.serverError('Failed to reset password').send(res);
  }
};
