import { Knex } from 'knex';

/**
 * Validation utilities for database operations
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class DatabaseValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    this.name = 'DatabaseValidationError';
    this.errors = errors;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate phone number format (US format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validate currency code (3-letter ISO code)
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Validate file MIME type for photos
 */
export function isValidPhotoMimeType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp'
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
}

/**
 * Validate photographer data
 */
export function validatePhotographer(data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  website?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  if (data.first_name && data.first_name.trim().length < 2) {
    errors.push({
      field: 'first_name',
      message: 'First name must be at least 2 characters',
      code: 'INVALID_FIRST_NAME'
    });
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    errors.push({
      field: 'last_name',
      message: 'Last name must be at least 2 characters',
      code: 'INVALID_LAST_NAME'
    });
  }

  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      code: 'INVALID_PHONE'
    });
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push({
      field: 'website',
      message: 'Invalid website URL',
      code: 'INVALID_URL'
    });
  }

  return errors;
}

/**
 * Validate client data
 */
export function validateClient(data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_contact_method?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  if (data.first_name && data.first_name.trim().length < 2) {
    errors.push({
      field: 'first_name',
      message: 'First name must be at least 2 characters',
      code: 'INVALID_FIRST_NAME'
    });
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    errors.push({
      field: 'last_name',
      message: 'Last name must be at least 2 characters',
      code: 'INVALID_LAST_NAME'
    });
  }

  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      code: 'INVALID_PHONE'
    });
  }

  if (data.preferred_contact_method && !['email', 'phone', 'text'].includes(data.preferred_contact_method)) {
    errors.push({
      field: 'preferred_contact_method',
      message: 'Invalid contact method',
      code: 'INVALID_CONTACT_METHOD'
    });
  }

  return errors;
}

/**
 * Validate session data
 */
export function validateSession(data: {
  title?: string;
  scheduled_date?: Date | string;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  session_type?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.title && data.title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 3 characters',
      code: 'INVALID_TITLE'
    });
  }

  if (data.scheduled_date) {
    const date = new Date(data.scheduled_date);
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'scheduled_date',
        message: 'Invalid date format',
        code: 'INVALID_DATE'
      });
    } else if (date < new Date()) {
      errors.push({
        field: 'scheduled_date',
        message: 'Scheduled date cannot be in the past',
        code: 'PAST_DATE'
      });
    }
  }

  if (data.duration_minutes !== undefined && (data.duration_minutes < 15 || data.duration_minutes > 1440)) {
    errors.push({
      field: 'duration_minutes',
      message: 'Duration must be between 15 minutes and 24 hours',
      code: 'INVALID_DURATION'
    });
  }

  if (data.price !== undefined && data.price < 0) {
    errors.push({
      field: 'price',
      message: 'Price cannot be negative',
      code: 'INVALID_PRICE'
    });
  }

  if (data.currency && !isValidCurrency(data.currency)) {
    errors.push({
      field: 'currency',
      message: 'Invalid currency code',
      code: 'INVALID_CURRENCY'
    });
  }

  if (data.session_type && !['wedding', 'portrait', 'event', 'commercial', 'other'].includes(data.session_type)) {
    errors.push({
      field: 'session_type',
      message: 'Invalid session type',
      code: 'INVALID_SESSION_TYPE'
    });
  }

  return errors;
}

/**
 * Validate photo data
 */
export function validatePhoto(data: {
  filename?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  url?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.filename && data.filename.trim().length < 1) {
    errors.push({
      field: 'filename',
      message: 'Filename is required',
      code: 'INVALID_FILENAME'
    });
  }

  if (data.file_size !== undefined && !isValidFileSize(data.file_size)) {
    errors.push({
      field: 'file_size',
      message: 'File size must be between 1 byte and 50MB',
      code: 'INVALID_FILE_SIZE'
    });
  }

  if (data.mime_type && !isValidPhotoMimeType(data.mime_type)) {
    errors.push({
      field: 'mime_type',
      message: 'Invalid photo file type',
      code: 'INVALID_MIME_TYPE'
    });
  }

  if (data.width !== undefined && (data.width < 1 || data.width > 20000)) {
    errors.push({
      field: 'width',
      message: 'Width must be between 1 and 20000 pixels',
      code: 'INVALID_WIDTH'
    });
  }

  if (data.height !== undefined && (data.height < 1 || data.height > 20000)) {
    errors.push({
      field: 'height',
      message: 'Height must be between 1 and 20000 pixels',
      code: 'INVALID_HEIGHT'
    });
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.push({
      field: 'url',
      message: 'Invalid URL format',
      code: 'INVALID_URL'
    });
  }

  return errors;
}

/**
 * Validate payment data
 */
export function validatePayment(data: {
  amount?: number;
  currency?: string;
  payment_method?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.amount !== undefined && data.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
      code: 'INVALID_AMOUNT'
    });
  }

  if (data.currency && !isValidCurrency(data.currency)) {
    errors.push({
      field: 'currency',
      message: 'Invalid currency code',
      code: 'INVALID_CURRENCY'
    });
  }

  if (data.payment_method && !['stripe', 'paypal', 'bank_transfer', 'cash', 'check'].includes(data.payment_method)) {
    errors.push({
      field: 'payment_method',
      message: 'Invalid payment method',
      code: 'INVALID_PAYMENT_METHOD'
    });
  }

  return errors;
}

/**
 * Check if a record exists by ID
 */
export async function recordExists(
  db: Knex,
  table: string,
  id: string,
  tenantId?: string
): Promise<boolean> {
  const query = db(table).where({ id });

  if (tenantId) {
    query.where({ tenant_id: tenantId });
  }

  const result = await query.first();
  return !!result;
}

/**
 * Check if a value is unique in a table
 */
export async function isUnique(
  db: Knex,
  table: string,
  field: string,
  value: string,
  excludeId?: string,
  tenantId?: string
): Promise<boolean> {
  const query = db(table).where(field, value);

  if (excludeId) {
    query.whereNot('id', excludeId);
  }

  if (tenantId) {
    query.where('tenant_id', tenantId);
  }

  const result = await query.first();
  return !result;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}