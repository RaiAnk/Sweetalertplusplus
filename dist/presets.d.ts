/**
 * Preset Methods
 * Convenient shortcuts for common modal patterns
 * Simple API inspired by native browser dialogs
 */
import type { ModalOptions, ModalResult, InputType, FormSchema } from './core/types';
import { formPresets } from './form/form-renderer';
export interface AlertOptions extends Omit<ModalOptions, 'input' | 'buttons'> {
    /** Button text (default: "OK") */
    buttonText?: string;
}
/**
 * Display an alert modal
 * @example
 * await alert('Hello World');
 * await alert({ title: 'Success', text: 'Operation completed', icon: 'success' });
 */
export declare function alert(options: string | AlertOptions): Promise<void>;
export interface ConfirmOptions extends Omit<ModalOptions, 'input'> {
    /** Confirm button text (default: "Yes") */
    confirmText?: string;
    /** Cancel button text (default: "No") */
    cancelText?: string;
    /** Show deny button instead of cancel */
    showDeny?: boolean;
    /** Deny button text (default: "No") */
    denyText?: string;
}
/**
 * Display a confirmation modal
 * @returns true if confirmed, false if denied/cancelled
 * @example
 * const confirmed = await confirm('Are you sure?');
 * const result = await confirm({
 *   title: 'Delete item?',
 *   text: 'This action cannot be undone.',
 *   icon: 'warning',
 *   confirmText: 'Delete',
 *   cancelText: 'Keep',
 * });
 */
export declare function confirm(options: string | ConfirmOptions): Promise<boolean>;
export interface PromptOptions extends Omit<ModalOptions, 'input'> {
    /** Input type */
    inputType?: InputType;
    /** Input placeholder */
    placeholder?: string;
    /** Default value */
    defaultValue?: string | number;
    /** Input label */
    inputLabel?: string;
    /** Validation function */
    validate?: (value: any) => string | boolean | undefined | Promise<string | boolean | undefined>;
    /** Required field */
    required?: boolean;
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Options for select input */
    inputOptions?: Array<{
        value: string | number;
        label: string;
    }>;
}
/**
 * Display a prompt modal with input
 * @returns The input value, or undefined if cancelled
 * @example
 * const name = await prompt('What is your name?');
 * const email = await prompt({
 *   title: 'Subscribe',
 *   text: 'Enter your email address',
 *   inputType: 'email',
 *   placeholder: 'you@example.com',
 *   validate: (value) => value.includes('@') ? true : 'Please enter a valid email',
 * });
 */
export declare function prompt<T = string>(options: string | PromptOptions): Promise<T | undefined>;
export interface MessageOptions extends Omit<ModalOptions, 'icon'> {
    /** Auto-close after ms */
    timer?: number;
}
/**
 * Display a success message
 */
export declare function success(options: string | MessageOptions): Promise<ModalResult>;
/**
 * Display an error message
 */
export declare function error(options: string | MessageOptions): Promise<ModalResult>;
/**
 * Display a warning message
 */
export declare function warning(options: string | MessageOptions): Promise<ModalResult>;
/**
 * Display an info message
 */
export declare function info(options: string | MessageOptions): Promise<ModalResult>;
export interface LoadingOptions extends Omit<ModalOptions, 'icon' | 'buttons'> {
    /** Allow closing the loading modal */
    allowClose?: boolean;
}
/**
 * Display a loading modal
 * @returns Modal instance with close() method
 */
export declare function loading(options?: string | LoadingOptions): Promise<ModalResult<any>>;
export interface ImageOptions {
    /** Image URL */
    src: string;
    /** Alt text */
    alt?: string;
    /** Title/caption */
    title?: string;
    /** Description */
    text?: string;
    /** Max width */
    width?: number | string;
}
/**
 * Display an image modal
 */
export declare function image(options: string | ImageOptions): Promise<void>;
export interface WizardStep extends Omit<ModalOptions, 'buttons'> {
    /** Step ID */
    id?: string;
    /** Validation before proceeding */
    validate?: () => boolean | string | Promise<boolean | string>;
}
export interface WizardOptions {
    steps: WizardStep[];
    /** Show step indicator */
    showSteps?: boolean;
    /** Allow going back */
    allowBack?: boolean;
    /** Next button text */
    nextText?: string;
    /** Back button text */
    backText?: string;
    /** Finish button text */
    finishText?: string;
    /** Cancel button text */
    cancelText?: string;
}
export interface WizardResult {
    completed: boolean;
    cancelled: boolean;
    values: Record<string, any>;
    lastStep: number;
}
/**
 * Display a multi-step wizard
 */
export declare function wizard(options: WizardOptions): Promise<WizardResult>;
export interface FormModalOptions extends Omit<ModalOptions, 'form'> {
    /** Form schema or preset name */
    form: FormSchema | keyof typeof formPresets;
    /** Initial form data */
    initialData?: Record<string, any>;
    /** Submit button text */
    submitText?: string;
    /** Cancel button text */
    cancelText?: string;
}
/**
 * Display a form modal
 * @returns Form data if submitted, undefined if cancelled
 * @example
 * // Using preset
 * const data = await form({ form: 'login', title: 'Sign In' });
 *
 * // Using custom schema
 * const data = await form({
 *   title: 'User Details',
 *   form: {
 *     fields: [
 *       { name: 'name', type: 'text', label: 'Full Name', required: true },
 *       { name: 'email', type: 'email', label: 'Email', required: true },
 *       { name: 'age', type: 'number', label: 'Age', min: 0, max: 150 },
 *     ],
 *   },
 * });
 */
export declare function form<T = Record<string, any>>(options: FormModalOptions): Promise<T | undefined>;
export declare const presets: {
    alert: typeof alert;
    confirm: typeof confirm;
    prompt: typeof prompt;
    success: typeof success;
    error: typeof error;
    warning: typeof warning;
    info: typeof info;
    loading: typeof loading;
    image: typeof image;
    wizard: typeof wizard;
    form: typeof form;
};
//# sourceMappingURL=presets.d.ts.map