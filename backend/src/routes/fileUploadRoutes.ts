import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { FileUploadController } from '../controllers/fileUploadController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Extend the Express.Multer.File type to include buffer
interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Protected route - requires authentication
router.post(
  '/upload/pdfs',
  authenticateToken,
  upload.array('pdfs', 5), // Max 5 files
  FileUploadController.uploadPdfs
);

export default router;
