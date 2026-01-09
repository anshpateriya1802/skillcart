import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../model/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { welcomeTemplate } from '../utils/email-template/welcome.js';

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']).optional(),
});

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Sign up new user
 */
export const signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return ApiResponse.conflict('Email already registered').send(res);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash: hashedPassword,
      role: validatedData.role || 'student',
    });

    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    // Send welcome email (don't await, send in background)
    sendEmail({
      to: user.email,
      subject: 'Welcome to SkillCerts! 🎓',
      html: welcomeTemplate({
        userName: user.name,
        userEmail: user.email,
      }),
    }).catch((err) => console.error('Welcome email error:', err));

    return ApiResponse.created('User registered successfully', {
      user: userResponse,
      token,
    }).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Signup error:', error);
    return ApiResponse.serverError('Failed to register user').send(res);
  }
};

/**
 * Sign in existing user
 */
export const signin = async (req, res) => {
  try {
    const validatedData = signinSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return ApiResponse.unauthorized('Invalid email or password').send(res);
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return ApiResponse.unauthorized('Invalid email or password').send(res);
    }

    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
    };

    return ApiResponse.success('Login successful', {
      user: userResponse,
      token,
    }).send(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest('Validation failed', error.errors).send(
        res
      );
    }
    console.error('Signin error:', error);
    return ApiResponse.serverError('Failed to login').send(res);
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req, res) => {
  try {
    const userResponse = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      bio: req.user.bio,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    };

    return ApiResponse.success('User profile fetched', userResponse).send(res);
  } catch (error) {
    console.error('Get me error:', error);
    return ApiResponse.serverError('Failed to fetch user profile').send(res);
  }
};
