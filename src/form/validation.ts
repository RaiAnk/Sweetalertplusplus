/**
 * Form Validation System
 * Comprehensive validation with built-in rules and custom validators
 */

import type { ValidationRule, FormField, FieldValidation, ValidatorFn } from '../core/types';

// ============================================================================
// Built-in Validators
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const CREDIT_CARD_REGEX = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;

const builtInValidators: Record<string, ValidatorFn> = {
  required: (value, rule) => {
    if (value === null || value === undefined || value === '') return rule.message || 'This field is required';
    if (Array.isArray(value) && value.length === 0) return rule.message || 'This field is required';
    return true;
  },

  email: (value, rule) => {
    if (!value) return true; // Let required handle empty
    return EMAIL_REGEX.test(value) || rule.message || 'Please enter a valid email address';
  },

  url: (value, rule) => {
    if (!value) return true;
    return URL_REGEX.test(value) || rule.message || 'Please enter a valid URL';
  },

  phone: (value, rule) => {
    if (!value) return true;
    const cleaned = value.replace(/\s/g, '');
    return PHONE_REGEX.test(cleaned) || rule.message || 'Please enter a valid phone number';
  },

  creditCard: (value, rule) => {
    if (!value) return true;
    const cleaned = value.replace(/[\s-]/g, '');
    return CREDIT_CARD_REGEX.test(cleaned) || rule.message || 'Please enter a valid credit card number';
  },

  min: (value, rule) => {
    if (value === null || value === undefined || value === '') return true;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return true;
    return num >= rule.value || rule.message || `Value must be at least ${rule.value}`;
  },

  max: (value, rule) => {
    if (value === null || value === undefined || value === '') return true;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return true;
    return num <= rule.value || rule.message || `Value must be at most ${rule.value}`;
  },

  minLength: (value, rule) => {
    if (!value) return true;
    const len = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
    return len >= rule.value || rule.message || `Must be at least ${rule.value} characters`;
  },

  maxLength: (value, rule) => {
    if (!value) return true;
    const len = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
    return len <= rule.value || rule.message || `Must be at most ${rule.value} characters`;
  },

  pattern: (value, rule) => {
    if (!value) return true;
    const regex = typeof rule.value === 'string' ? new RegExp(rule.value) : rule.value;
    return regex.test(value) || rule.message || 'Invalid format';
  },

  match: (value, rule, formData) => {
    if (!value) return true;
    const otherValue = formData[rule.value];
    return value === otherValue || rule.message || `Values do not match`;
  },

  date: (value, rule) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime()) || rule.message || 'Please enter a valid date';
  },

  dateRange: (value, rule) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return rule.message || 'Please enter a valid date';

    const { min, max } = rule.value || {};
    if (min && date < new Date(min)) return rule.message || `Date must be after ${min}`;
    if (max && date > new Date(max)) return rule.message || `Date must be before ${max}`;
    return true;
  },

  fileSize: (value, rule) => {
    if (!value) return true;
    const files = Array.isArray(value) ? value : [value];
    const maxSize = rule.value;

    for (const file of files) {
      if (file instanceof File && file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return rule.message || `File size must be less than ${sizeMB}MB`;
      }
    }
    return true;
  },

  fileType: (value, rule) => {
    if (!value) return true;
    const files = Array.isArray(value) ? value : [value];
    const allowedTypes: string[] = Array.isArray(rule.value) ? rule.value : [rule.value];

    for (const file of files) {
      if (file instanceof File) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const type = file.type;

        const allowed = allowedTypes.some(t => {
          if (t.startsWith('.')) return ext === t.slice(1).toLowerCase();
          if (t.includes('/')) return type === t || (t.endsWith('/*') && type.startsWith(t.slice(0, -1)));
          return ext === t.toLowerCase();
        });

        if (!allowed) return rule.message || `File type not allowed. Allowed: ${allowedTypes.join(', ')}`;
      }
    }
    return true;
  },

  custom: async (value, rule, formData) => {
    if (rule.validator) {
      return await rule.validator(value, formData);
    }
    return true;
  },
};

// Custom validator registry
const customValidators = new Map<string, ValidatorFn>();

/**
 * Register a custom validator
 */
export function registerValidator(name: string, validator: ValidatorFn): void {
  customValidators.set(name, validator);
}

/**
 * Unregister a custom validator
 */
export function unregisterValidator(name: string): void {
  customValidators.delete(name);
}

// ============================================================================
// Validation Execution
// ============================================================================

/**
 * Validate a single field value
 */
export async function validateField(
  value: any,
  field: FormField,
  formData: Record<string, any>
): Promise<string | null> {
  // Check required first
  if (field.required) {
    const result = await runValidator('required', value, { type: 'required' }, formData);
    if (typeof result === 'string') return result;
  }

  // Check validation rules
  if (field.validation?.rules) {
    for (const rule of field.validation.rules) {
      const result = await runValidator(rule.type, value, rule, formData);
      if (typeof result === 'string') return result;
    }
  }

  return null;
}

/**
 * Run a single validator
 */
async function runValidator(
  type: string,
  value: any,
  rule: ValidationRule,
  formData: Record<string, any>
): Promise<boolean | string> {
  // Check custom validators first
  const customValidator = customValidators.get(type);
  if (customValidator) {
    return await customValidator(value, rule, formData);
  }

  // Check built-in validators
  const builtInValidator = builtInValidators[type];
  if (builtInValidator) {
    return await builtInValidator(value, rule, formData);
  }

  // Unknown validator type - skip
  console.warn(`Unknown validator type: ${type}`);
  return true;
}

/**
 * Validate all fields in a form
 */
export async function validateForm(
  formData: Record<string, any>,
  fields: FormField[],
  options?: { stopOnFirstError?: boolean }
): Promise<{ valid: boolean; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const field of fields) {
    // Skip layout fields
    if (['divider', 'heading', 'paragraph'].includes(field.type)) continue;

    // Check conditional visibility
    if (field.showWhen && !field.showWhen(formData)) continue;

    const value = formData[field.name];
    const error = await validateField(value, field, formData);

    if (error) {
      errors[field.name] = error;
      valid = false;

      if (options?.stopOnFirstError) break;
    }
  }

  return { valid, errors };
}

// ============================================================================
// Input Masking
// ============================================================================

export interface MaskOptions {
  pattern: string;
  placeholder?: string;
}

const MASK_TOKENS: Record<string, RegExp> = {
  '9': /[0-9]/,
  'a': /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
  'A': /[A-Z]/,
};

/**
 * Apply mask to input value
 */
export function applyMask(value: string, pattern: string, placeholder = '_'): string {
  if (!value || !pattern) return value;

  let result = '';
  let valueIndex = 0;

  for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
    const patternChar = pattern[i];
    const tokenRegex = MASK_TOKENS[patternChar];

    if (tokenRegex) {
      // Find next matching character from value
      while (valueIndex < value.length) {
        const valueChar = value[valueIndex++];
        if (tokenRegex.test(valueChar)) {
          result += valueChar;
          break;
        }
      }
    } else {
      // Literal character in pattern
      result += patternChar;
      // Skip if value has the same literal
      if (value[valueIndex] === patternChar) {
        valueIndex++;
      }
    }
  }

  return result;
}

/**
 * Remove mask from value (get raw value)
 */
export function unmask(value: string, pattern: string): string {
  if (!value || !pattern) return value;

  let result = '';
  let valueIndex = 0;

  for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
    const patternChar = pattern[i];
    const tokenRegex = MASK_TOKENS[patternChar];

    if (tokenRegex) {
      const valueChar = value[valueIndex++];
      if (tokenRegex.test(valueChar)) {
        result += valueChar;
      }
    } else {
      // Skip literal characters
      if (value[valueIndex] === patternChar) {
        valueIndex++;
      }
    }
  }

  return result;
}

/**
 * Create a masked input handler
 */
export function createMaskedInput(
  input: HTMLInputElement,
  pattern: string,
  placeholder = '_'
): { destroy: () => void } {
  let previousValue = '';

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawValue = unmask(target.value, pattern);
    const maskedValue = applyMask(rawValue, pattern, placeholder);

    if (maskedValue !== target.value) {
      const cursorPos = target.selectionStart || 0;
      target.value = maskedValue;

      // Adjust cursor position
      let newPos = cursorPos;
      if (maskedValue.length > previousValue.length) {
        // Find next input position
        for (let i = cursorPos; i < pattern.length; i++) {
          if (MASK_TOKENS[pattern[i]]) {
            newPos = i + 1;
            break;
          }
        }
      }

      target.setSelectionRange(newPos, newPos);
    }

    previousValue = maskedValue;
  }

  function handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    const pos = target.selectionStart || 0;

    // Handle backspace
    if (e.key === 'Backspace' && pos > 0) {
      let newPos = pos - 1;
      // Skip literal characters
      while (newPos > 0 && !MASK_TOKENS[pattern[newPos]]) {
        newPos--;
      }
      if (newPos !== pos - 1) {
        e.preventDefault();
        const value = target.value;
        target.value = value.slice(0, newPos) + placeholder + value.slice(pos);
        target.setSelectionRange(newPos, newPos);
      }
    }
  }

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeyDown);

  // Initialize with mask
  if (input.value) {
    input.value = applyMask(input.value, pattern, placeholder);
    previousValue = input.value;
  }

  return {
    destroy: () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeyDown);
    },
  };
}

// ============================================================================
// Debounced Validation
// ============================================================================

/**
 * Create a debounced validator
 */
export function createDebouncedValidator(
  validateFn: () => Promise<void>,
  delay: number
): { validate: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    validate: () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        validateFn();
        timeoutId = null;
      }, delay);
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
