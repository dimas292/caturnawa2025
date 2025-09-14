import { useState } from 'react';

interface FileValidationOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface FileValidationError {
  code: 'file-too-large' | 'invalid-file-type';
  message: string;
}

export function useFileValidation(options: FileValidationOptions = {}) {
  const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;
  const [error, setError] = useState<FileValidationError | null>(null);

  const validateFile = (file: File | null | undefined): boolean => {
    setError(null);
    if (!file) {
      return true; // No file is not an invalid state
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError({
        code: 'file-too-large',
        message: `File terlalu besar. Ukuran maksimal adalah ${maxSize}MB.`,
      });
      return false;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError({
        code: 'invalid-file-type',
        message: `Tipe file tidak valid. Tipe yang didukung: ${allowedTypes.join(', ')}.`,
      });
      return false;
    }

    return true;
  };

  return { error, validateFile, setError };
}
