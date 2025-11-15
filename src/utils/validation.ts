import { z } from 'zod';

/**
 * Customer validation schema
 */
export const customerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Allow various phone formats
      return /^[\d\s\-\(\)\+\.]+$/.test(val);
    }, {
      message: 'Invalid phone number format',
    }),
  street: z.string()
    .min(1, 'Street address is required')
    .max(200, 'Street address must be less than 200 characters')
    .trim(),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z.string()
    .min(1, 'State is required')
    .max(50, 'State must be less than 50 characters')
    .trim(),
  zipCode: z.string()
    .min(1, 'ZIP code is required')
    .max(20, 'ZIP code must be less than 20 characters')
    .trim(),
  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),
});

/**
 * Item validation schema
 */
export const itemSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  unitPrice: z.string()
    .refine((val) => {
      if (!val || val.trim() === '') return false;
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num) && num >= 0 && num <= 999999999;
    }, {
      message: 'Price must be a valid number between 0 and 999,999,999',
    }),
});

/**
 * Line item validation schema
 */
export const lineItemSchema = z.object({
  name: z.string()
    .min(1, 'Item name is required')
    .max(200, 'Item name must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters'),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999, 'Quantity must be less than 1,000,000')
    .refine((val) => isFinite(val), {
      message: 'Quantity must be a valid number',
    }),
  unitPrice: z.number()
    .min(0, 'Price cannot be negative')
    .max(999999999, 'Price must be less than 1,000,000,000')
    .refine((val) => isFinite(val), {
      message: 'Price must be a valid number',
    }),
});

/**
 * Invoice validation schema
 */
export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  lineItems: z.array(lineItemSchema)
    .min(1, 'At least one line item is required')
    .max(100, 'Cannot have more than 100 line items'),
  taxRate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .refine((val) => isFinite(val), {
      message: 'Tax rate must be a valid number',
    }),
  issueDate: z.string()
    .min(1, 'Issue date is required')
    .refine((val) => {
      try {
        const date = new Date(val);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, {
      message: 'Invalid issue date',
    }),
  dueDate: z.string()
    .min(1, 'Due date is required')
    .refine((val) => {
      try {
        const date = new Date(val);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, {
      message: 'Invalid due date',
    }),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  notes: z.string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional(),
  templateId: z.string().min(1, 'Template is required'),
}).refine((data) => {
  // Due date should be after or equal to issue date
  const issueDate = new Date(data.issueDate);
  const dueDate = new Date(data.dueDate);
  return dueDate >= issueDate;
}, {
  message: 'Due date must be on or after issue date',
  path: ['dueDate'],
});

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return z.string().email().safeParse(email).success;
}

/**
 * Validates a phone number
 * @param phone - The phone number to validate
 * @returns True if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Optional field
  const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
  return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
}

/**
 * Validates that a string doesn't contain potentially harmful characters
 * @param text - The text to validate
 * @returns True if safe, false otherwise
 */
export function validateSafeText(text: string): boolean {
  if (!text) return true;
  // Check for script tags and other potentially harmful content
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+=/i, // Event handlers like onclick=
  ];
  return !dangerousPatterns.some(pattern => pattern.test(text));
}
