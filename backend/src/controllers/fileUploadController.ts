import { Request, Response } from 'express';
import { PdfProcessingService } from '../services/pdfProcessingService.js';

export class FileUploadController {
  /**
   * Handles multiple PDF file uploads
   */
  static async uploadPdfs(req: Request, res: Response) {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.warn('No PDF files were uploaded');
      return res.status(400).json({ error: 'No PDF files were uploaded' });
    }

    try {
      // Process uploaded PDFs
      const pdfFiles = (req.files as Express.Multer.File[]).filter(
        file => file.mimetype === 'application/pdf' && file.buffer
      );

      if (pdfFiles.length === 0) {
        console.warn('No valid PDF files found in the upload');
        return res.status(400).json({ 
          success: false,
          error: 'No valid PDF files found. Please upload PDF files only.' 
        });
      }

      console.log(`Processing ${pdfFiles.length} PDF files...`);
      
      try {
        // Extract text from all PDFs with original filenames for better error reporting
        const combinedText = await PdfProcessingService.extractTextFromMultiplePdfs(
          pdfFiles.map(file => ({
            buffer: file.buffer,
            originalname: file.originalname
          }))
        );
        
        if (!combinedText) {
          console.warn('No text content could be extracted from the provided PDFs');
          return res.status(400).json({
            success: false,
            error: 'The uploaded PDFs do not contain any extractable text. Please try different files.'
          });
        }
        
        console.log(`Successfully processed ${pdfFiles.length} PDF files with ${combinedText.length} characters of text`);
        
        // Return the extracted text for quiz generation
        return res.status(200).json({
          success: true,
          source_type: 'pdf',
          source_data: combinedText,
          fileCount: pdfFiles.length,
          characterCount: combinedText.length,
          message: `Successfully processed ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''}`
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF files';
        console.error('Error processing PDFs:', { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
        return res.status(500).json({
          success: false,
          error: errorMessage
        });
      }

    } catch (error) {
      console.error('Error processing PDF uploads:', error);
      res.status(500).json({ 
        error: 'Failed to process PDF files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
