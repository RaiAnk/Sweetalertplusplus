/**
 * Form Validation System
 * Comprehensive validation with built-in rules and custom validators
 */
import type { FormField, ValidatorFn } from '../core/types';
/**
 * Register a custom validator
 */
export declare function registerValidator(name: string, validator: ValidatorFn): void;
/**
 * Unregister a custom validator
 */
export declare function unregisterValidator(name: string): void;
/**
 * Validate a single field value
 */
export declare function validateField(value: any, field: FormField, formData: Record<string, any>): Promise<string | null>;
/**
 * Validate all fields in a form
 */
export declare function validateForm(formData: Record<string, any>, fields: FormField[], options?: {
    stopOnFirstError?: boolean;
}): Promise<{
    valid: boolean;
    errors: Record<string, string>;
}>;
export interface MaskOptions {
    pattern: string;
    placeholder?: string;
}
/**
 * Apply mask to input value
 */
export declare function applyMask(value: string, pattern: string, placeholder?: string): string;
/**
 * Remove mask from value (get raw value)
 */
export declare function unmask(value: string, pattern: string): string;
/**
 * Create a masked input handler
 */
export declare function createMaskedInput(input: HTMLInputElement, pattern: string, placeholder?: string): {
    destroy: () => void;
};
/**
 * Create a debounced validator
 */
export declare function createDebouncedValidator(validateFn: () => Promise<void>, delay: number): {
    validate: () => void;
    cancel: () => void;
};
//# sourceMappingURL=validation.d.ts.map