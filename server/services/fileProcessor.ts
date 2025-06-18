import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Simple text extraction for demonstration
// In production, you would use libraries like pdf-parse or pdfminer.six
export async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();
  
  if (extension === 'txt') {
    return buffer.toString('utf-8');
  }
  
  if (extension === 'pdf') {
    // For demonstration, we'll return a simple text conversion
    // In production, integrate with pdf-parse or similar library
    try {
      // This is a placeholder - in real implementation use pdf-parse
      const text = buffer.toString('utf-8');
      // Extract readable text from PDF buffer (basic implementation)
      return text.replace(/[^\x20-\x7E\n\r]/g, ' ').trim();
    } catch (error) {
      throw new Error('Failed to extract text from PDF');
    }
  }
  
  throw new Error('Unsupported file type. Please upload PDF or TXT files.');
}

export function validateFileType(filename: string): boolean {
  const allowedExtensions = ['pdf', 'txt'];
  const extension = filename.toLowerCase().split('.').pop();
  return allowedExtensions.includes(extension || '');
}

export function validateFileSize(size: number): boolean {
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  return size <= maxSizeInBytes;
}
