import { z } from 'zod';
import type { UUID, Email, URL } from '@focusflow/types';

/**
 * Validation utilities - NO any types
 */

// UUID validation
export const uuidSchema = z.string().uuid();
export const isValidUUID = (value: string): value is UUID => {
  return uuidSchema.safeParse(value).success;
};

// Email validation
export const emailSchema = z.string().email();
export const isValidEmail = (value: string): value is Email => {
  return emailSchema.safeParse(value).success;
};

// URL validation
export const urlSchema = z.string().url();
export const isValidURL = (value: string): value is URL => {
  return urlSchema.safeParse(value).success;
};

// Phone validation
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
export const isValidPhone = (value: string): boolean => {
  return phoneSchema.safeParse(value).success;
};

// Credit card validation
export const creditCardSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
  expMonth: z.number().min(1).max(12),
  expYear: z.number().min(new Date().getFullYear())
});

export const isValidCreditCard = (number: string): boolean => {
  // Luhn algorithm
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const isStrongPassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

// File validation
export interface FileValidationOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[]; // mime types
  allowedExtensions?: string[]; // file extensions
}

export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } => {
  const { maxSize, allowedTypes, allowedExtensions } = options;

  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${formatBytes(maxSize)}`
    };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  if (allowedExtensions) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension .${ext} is not allowed`
      };
    }
  }

  return { valid: true };
};

// Format bytes for display
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// JSON validation
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const d = date instanceof Date ? date : new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Range validation
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Array validation
export const isNonEmptyArray = <T>(arr: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

// Object validation
export const isNonEmptyObject = (obj: Record<string, unknown>): boolean => {
  return obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0;
};

// Custom validators
export const validators = {
  uuid: uuidSchema,
  email: emailSchema,
  url: urlSchema,
  phone: phoneSchema,
  password: passwordSchema,
  creditCard: creditCardSchema,
} as const;