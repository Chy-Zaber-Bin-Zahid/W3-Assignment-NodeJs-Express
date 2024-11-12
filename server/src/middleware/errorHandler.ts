import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Check if the error is a Multer error and if it's due to file limit
  if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Too many files uploaded. Maximum allowed is 5.' });
  }

  // General error handling
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred' });
};
