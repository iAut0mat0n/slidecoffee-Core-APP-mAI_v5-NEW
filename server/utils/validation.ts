/**
 * Input validation utilities
 * Prevents vulnerabilities from excessive text input
 */

export const MAX_LENGTHS = {
  // User fields
  USER_NAME: 100,
  USER_EMAIL: 254, // RFC 5321 max
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72, // bcrypt max
  
  // Workspace fields
  WORKSPACE_NAME: 100,
  
  // Brand fields
  BRAND_NAME: 100,
  
  // Presentation fields
  PRESENTATION_TITLE: 255,
  PRESENTATION_DESCRIPTION: 1000,
  SLIDE_TITLE: 255,
  SLIDE_CONTENT: 10000,
  
  // Support ticket fields
  TICKET_SUBJECT: 200,
  TICKET_MESSAGE: 5000,
  TICKET_REPLY: 2000,
  
  // General
  SHORT_TEXT: 255,
  MEDIUM_TEXT: 1000,
  LONG_TEXT: 10000,
};

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate text field length
 */
export function validateLength(
  value: string | null | undefined,
  fieldName: string,
  maxLength: number,
  minLength: number = 0,
  required: boolean = true
): ValidationError | null {
  if (!value || value.trim() === '') {
    if (required) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return null;
}

/**
 * Validate email format and length
 */
export function validateEmail(email: string | null | undefined): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }

  if (email.length > MAX_LENGTHS.USER_EMAIL) {
    return {
      field: 'email',
      message: `Email must not exceed ${MAX_LENGTHS.USER_EMAIL} characters`,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format' };
  }

  return null;
}

/**
 * Validate password strength and length
 */
export function validatePassword(password: string | null | undefined): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < MAX_LENGTHS.PASSWORD_MIN) {
    return {
      field: 'password',
      message: `Password must be at least ${MAX_LENGTHS.PASSWORD_MIN} characters`,
    };
  }

  if (password.length > MAX_LENGTHS.PASSWORD_MAX) {
    return {
      field: 'password',
      message: `Password must not exceed ${MAX_LENGTHS.PASSWORD_MAX} characters`,
    };
  }

  return null;
}

/**
 * Sanitize text input (basic XSS prevention)
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .slice(0, MAX_LENGTHS.LONG_TEXT); // Hard cap
}

/**
 * Validate multiple fields at once
 */
export function validateFields(
  fields: Array<{
    value: string | null | undefined;
    name: string;
    maxLength: number;
    minLength?: number;
    required?: boolean;
  }>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const error = validateLength(
      field.value,
      field.name,
      field.maxLength,
      field.minLength,
      field.required
    );
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}
