import multer, { FileFilterCallback, MulterError } from 'multer';
import path from 'path';
import express from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'Only JPG, PNG, SVG, and JPEG images are allowed')); // Reject the file
  }
};

export const upload = multer({ storage, fileFilter });
