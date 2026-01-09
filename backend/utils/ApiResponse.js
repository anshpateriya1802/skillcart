import { z } from 'zod';

// Zod schema for validating API response structure
const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  statusCode: z.number(),
  timestamp: z.string(),
});

class ApiResponse {
  constructor(statusCode, success, message, data = null) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();

    if (data !== null && data !== undefined) {
      this.data = data;
    }

    // Validate response structure
    ApiResponseSchema.parse(this);
  }

  // Send response via Express
  send(res) {
    return res.status(this.statusCode).json(this);
  }

  // Success responses
  static success(message, data = null) {
    return new ApiResponse(200, true, message, data);
  }

  static created(message, data = null) {
    return new ApiResponse(201, true, message, data);
  }

  // Error responses
  static badRequest(message, data = null) {
    return new ApiResponse(400, false, message, data);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, false, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, false, message);
  }

  static notFound(message = 'Not found') {
    return new ApiResponse(404, false, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiResponse(409, false, message);
  }

  static serverError(message = 'Server error') {
    return new ApiResponse(500, false, message);
  }
}

export default ApiResponse;






/* 

import ApiResponse from './utils/ApiResponse.js';

// Success
ApiResponse.success('Courses fetched', courses).send(res);

// Created
ApiResponse.created('Course created', newCourse).send(res);

// Errors
ApiResponse.badRequest('Invalid input').send(res);
ApiResponse.unauthorized().send(res);
ApiResponse.notFound('Course not found').send(res);
ApiResponse.serverError().send(res);

*/