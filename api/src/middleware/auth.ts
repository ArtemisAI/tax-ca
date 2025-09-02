import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    const apiError: ApiError = {
      message: 'API key is required',
      code: 'MISSING_API_KEY',
      statusCode: 401
    };
    
    return res.status(401).json({
      success: false,
      error: apiError.message,
      code: apiError.code
    });
  }
  
  // In a real implementation, you would validate the API key against a database
  // For this example, we'll use a simple validation
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || ['demo-key-123'];
  
  if (!validApiKeys.includes(apiKey)) {
    const apiError: ApiError = {
      message: 'Invalid API key',
      code: 'INVALID_API_KEY',
      statusCode: 401
    };
    
    return res.status(401).json({
      success: false,
      error: apiError.message,
      code: apiError.code
    });
  }
  
  next();
};