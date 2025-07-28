import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { corsMiddleware } from '../../shared/middleware/cors.js';
import { authenticateToken } from '../../shared/middleware/auth.js';
import { sendSuccess, sendError } from '../../shared/utils/response.js';
import { createFunctionLogger } from '../../shared/utils/logger.js';
import { FileUploadResponse } from '../../shared/types/api.js';
import { PdfProcessingService } from '../../services/quiz/pdfProcessingService.js';

const app = express();
const logger = createFunctionLogger('file-processing-service');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', service: 'file-processing-service' });
});

// POST /api/upload/pdfs - Handle PDF file uploads
app.post('/api/upload/pdfs', authenticateToken, upload.array('pdfs', 5), async (req, res) => {
  const userId = req.user?.id;
  logger.info({ userId }, 'PDF upload request received');

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    logger.warn({ userId }, 'No PDF files were uploaded');
    sendError(res, 'No PDF files were uploaded', 400);
    return;
  }

  try {
    // Process uploaded PDFs
    const pdfFiles = (req.files as any[]).filter(
      file => file.mimetype === 'application/pdf' && file.buffer
    );

    if (pdfFiles.length === 0) {
      logger.warn({ userId }, 'No valid PDF files found in the upload');
      sendError(res, 'No valid PDF files found. Please upload PDF files only.', 400);
      return;
    }

    logger.info({ userId, fileCount: pdfFiles.length }, 'Processing PDF files');

    try {
      // Extract text from all PDFs with original filenames for better error reporting
      const combinedText = await PdfProcessingService.extractTextFromMultiplePdfs(
        pdfFiles.map(file => ({
          buffer: file.buffer,
          originalname: file.originalname
        }))
      );

      if (!combinedText) {
        logger.warn({ userId }, 'No text content could be extracted from the provided PDFs');
        sendError(res, 'The uploaded PDFs do not contain any extractable text. Please try different files.', 400);
        return;
      }

      logger.info({ userId, fileCount: pdfFiles.length, characterCount: combinedText.length }, 'PDF processing completed successfully');

      // Return the extracted text for quiz generation
      const response: FileUploadResponse = {
        success: true,
        source_type: 'pdf',
        source_data: combinedText,
        fileCount: pdfFiles.length,
        characterCount: combinedText.length,
        message: `Successfully processed ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''}`
      };

      sendSuccess(res, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF files';
      logger.error({ userId, error: errorMessage }, 'Error processing PDFs');
      sendError(res, errorMessage, 500);
    }
  } catch (error) {
    logger.error({ userId, error }, 'Error processing PDF uploads');
    sendError(res, 'Failed to process PDF files', 500);
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Unhandled error in file processing service', { error: err.message, stack: err.stack });
  sendError(res, 'Internal server error', 500);
});

// 404 handler
app.use('*', (_req, res) => {
  sendError(res, 'Route not found', 404);
});

export const handler = serverless(app); 