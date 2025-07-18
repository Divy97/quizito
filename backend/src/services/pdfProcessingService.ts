import { readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { writeFile, unlink } from 'fs/promises';

// We'll use dynamic import to avoid test file issues
let pdfParse: any;

const getPdfParser = async () => {
  if (!pdfParse) {
    try {
      // Use dynamic import to avoid test file issues
      const pdfModule = await import('pdf-parse/lib/pdf-parse.js');
      pdfParse = pdfModule.default;
    } catch (error) {
      console.error('Failed to load pdf-parse:', error);
      throw new Error('Failed to load PDF processing module');
    }
  }
  return pdfParse;
};

export class PdfProcessingService {
  /**
   * Extracts text from a single PDF file
   */
  static async extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
    const parser = await getPdfParser();
    
    try {
      // Create a temporary file to bypass the test file issue
      const tempFilePath = join(tmpdir(), `pdf-${randomBytes(8).toString('hex')}.pdf`);
      await writeFile(tempFilePath, fileBuffer);
      
      try {
        const data = await parser(fileBuffer);
        return data.text || ''; // Ensure we always return a string
      } finally {
        // Clean up the temporary file
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary PDF file:', cleanupError);
        }
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to process PDF file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Extracts and combines text from multiple PDF files
   * @param files Array of file objects containing buffer and optional filename for better error reporting
   * @returns Combined text from all PDFs
   */
  static async extractTextFromMultiplePdfs(files: Array<{ buffer: Buffer; originalname?: string }>): Promise<string> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No PDF files provided for processing');
      }

      const results = await Promise.allSettled(
        files.map((file, index) => 
          this.extractTextFromPdf(file.buffer)
            .then(text => ({
              success: true as const,
              text,
              filename: file.originalname || `file-${index + 1}.pdf`
            }))
            .catch(error => ({
              success: false as const,
              error,
              filename: file.originalname || `file-${index + 1}.pdf`
            }))
        )
      );

      // Process results
      const successfulExtractions = results.filter((r): r is PromiseFulfilledResult<{ success: true; text: string; filename: string }> => 
        r.status === 'fulfilled' && r.value.success
      );

      const failedExtractions = results.filter((r): r is PromiseFulfilledResult<{ success: false; error: Error; filename: string }> => 
        r.status === 'fulfilled' && !r.value.success
      );

      // Log any failed extractions
      if (failedExtractions.length > 0) {
        console.warn(`Failed to process ${failedExtractions.length} out of ${files.length} PDFs`);
        failedExtractions.forEach(({ value }) => {
          console.warn(`- ${value.filename}: ${value.error.message}`);
        });
      }

      if (successfulExtractions.length === 0) {
        throw new Error('Failed to extract text from any of the provided PDF files');
      }

      // Combine all successful extractions with document separation
      const combinedText = successfulExtractions
        .map((r: { value: { text: string } }) => r.value.text.trim())
        .filter(Boolean)
        .join('\n\n');

      if (!combinedText) {
        console.warn('PDFs were processed but no text content was extracted');
      }

      return combinedText;
    } catch (error) {
      console.error('Error in extractTextFromMultiplePdfs:', error);
      throw new Error('Failed to process PDF files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
