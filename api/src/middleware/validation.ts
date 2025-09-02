import { Request, Response, NextFunction } from 'express';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ApiError } from '../types';

const ajv = new Ajv({ allErrors: true, removeAdditional: true });
addFormats(ajv);

export const validateRequest = (schema: object) => {
  const validate = ajv.compile(schema);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.body);
    
    if (!valid) {
      const errors = validate.errors?.map(error => 
        `${error.instancePath || 'root'} ${error.message}`
      ).join(', ');
      
      const apiError: ApiError = {
        message: `Validation failed: ${errors}`,
        code: 'VALIDATION_ERROR',
        statusCode: 400
      };
      
      return res.status(400).json({
        success: false,
        error: apiError.message,
        code: apiError.code
      });
    }
    
    next();
  };
};