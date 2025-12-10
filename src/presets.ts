/**
 * Preset Methods
 * Convenient shortcuts for common modal patterns
 * Simple API inspired by native browser dialogs
 */

import { modal } from './core/modal';
import type { ModalOptions, ModalResult, IconType, InputType, ButtonsConfig, FormSchema } from './core/types';
import { formPresets } from './form/form-renderer';

// ============================================================================
// Alert
// ============================================================================

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
export async function alert(options: string | AlertOptions): Promise<void> {
  const opts: AlertOptions = typeof options === 'string'
    ? { text: options }
    : options;

  await modal({
    ...opts,
    buttons: {
      confirm: { text: opts.buttonText || 'OK', visible: true },
    },
  });
}

// ============================================================================
// Confirm
// ============================================================================

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
export async function confirm(options: string | ConfirmOptions): Promise<boolean> {
  const opts: ConfirmOptions = typeof options === 'string'
    ? { text: options }
    : options;

  const buttons: ButtonsConfig = {
    confirm: { text: opts.confirmText || 'Yes', visible: true },
  };

  if (opts.showDeny) {
    buttons.deny = { text: opts.denyText || 'No', visible: true };
  } else {
    buttons.cancel = { text: opts.cancelText || 'No', visible: true };
  }

  const result = await modal({
    icon: 'question',
    ...opts,
    buttons,
  });

  return result.confirmed;
}

// ============================================================================
// Prompt
// ============================================================================

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
  inputOptions?: Array<{ value: string | number; label: string }>;
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
export async function prompt<T = string>(options: string | PromptOptions): Promise<T | undefined> {
  const opts: PromptOptions = typeof options === 'string'
    ? { text: options }
    : options;

  const result = await modal<T>({
    ...opts,
    input: {
      type: opts.inputType || 'text',
      placeholder: opts.placeholder,
      value: opts.defaultValue,
      label: opts.inputLabel,
      validate: opts.validate,
      required: opts.required,
      options: opts.inputOptions,
      autoFocus: true,
    },
    buttons: {
      confirm: { text: opts.confirmText || 'OK', visible: true },
      cancel: { text: opts.cancelText || 'Cancel', visible: true },
    },
  });

  return result.confirmed ? result.value : undefined;
}

// ============================================================================
// Success / Error / Warning / Info
// ============================================================================

export interface MessageOptions extends Omit<ModalOptions, 'icon'> {
  /** Auto-close after ms */
  timer?: number;
}

/**
 * Display a success message
 */
export async function success(options: string | MessageOptions): Promise<ModalResult> {
  const opts = typeof options === 'string' ? { text: options } : options;
  return modal({
    icon: 'success',
    timer: 2000,
    timerProgressBar: true,
    ...opts,
    buttons: {
      confirm: { text: 'OK', visible: true },
    },
  });
}

/**
 * Display an error message
 */
export async function error(options: string | MessageOptions): Promise<ModalResult> {
  const opts = typeof options === 'string' ? { text: options } : options;
  return modal({
    icon: 'error',
    ...opts,
    buttons: {
      confirm: { text: 'OK', visible: true },
    },
  });
}

/**
 * Display a warning message
 */
export async function warning(options: string | MessageOptions): Promise<ModalResult> {
  const opts = typeof options === 'string' ? { text: options } : options;
  return modal({
    icon: 'warning',
    ...opts,
    buttons: {
      confirm: { text: 'OK', visible: true },
    },
  });
}

/**
 * Display an info message
 */
export async function info(options: string | MessageOptions): Promise<ModalResult> {
  const opts = typeof options === 'string' ? { text: options } : options;
  return modal({
    icon: 'info',
    ...opts,
    buttons: {
      confirm: { text: 'OK', visible: true },
    },
  });
}

// ============================================================================
// Loading
// ============================================================================

export interface LoadingOptions extends Omit<ModalOptions, 'icon' | 'buttons'> {
  /** Allow closing the loading modal */
  allowClose?: boolean;
}

/**
 * Display a loading modal
 * @returns Modal instance with close() method
 */
export function loading(options: string | LoadingOptions = 'Loading...') {
  const opts = typeof options === 'string' ? { text: options } : options;

  return modal({
    icon: 'loading',
    ...opts,
    showCloseButton: opts.allowClose ?? false,
    backdrop: 'static',
    a11y: {
      closeOnEscape: opts.allowClose ?? false,
      ...opts.a11y,
    },
    buttons: opts.allowClose ? {
      cancel: { text: 'Cancel', visible: true },
    } : undefined,
  });
}

// ============================================================================
// Image Modal
// ============================================================================

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
export async function image(options: string | ImageOptions): Promise<void> {
  const opts = typeof options === 'string' ? { src: options } : options;

  await modal({
    title: opts.title,
    text: opts.text,
    image: {
      src: opts.src,
      alt: opts.alt || '',
      width: opts.width,
    },
    size: 'auto',
    buttons: {
      confirm: false,
    },
  });
}

// ============================================================================
// Multi-step / Wizard
// ============================================================================

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
export async function wizard(options: WizardOptions): Promise<WizardResult> {
  const {
    steps,
    showSteps = true,
    allowBack = true,
    nextText = 'Next',
    backText = 'Back',
    finishText = 'Finish',
    cancelText = 'Cancel',
  } = options;

  const values: Record<string, any> = {};
  let currentStep = 0;

  while (currentStep < steps.length) {
    const step = steps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    // Build step indicator
    let stepIndicator = '';
    if (showSteps) {
      stepIndicator = `Step ${currentStep + 1} of ${steps.length}`;
    }

    const buttons: ButtonsConfig = {
      custom: [],
      layout: 'space-between',
    };

    // Back button
    if (allowBack && !isFirst) {
      buttons.custom!.push({
        id: 'back',
        text: backText,
        variant: 'ghost',
      });
    }

    // Cancel button
    buttons.cancel = {
      text: cancelText,
      visible: true,
      variant: 'ghost',
    };

    // Next/Finish button
    buttons.confirm = {
      text: isLast ? finishText : nextText,
      visible: true,
    };

    const result = await modal({
      ...step,
      footer: stepIndicator || step.footer,
      buttons,
      hooks: {
        ...step.hooks,
        onBeforeConfirm: async (value) => {
          // Run step validation
          if (step.validate) {
            const validationResult = await step.validate();
            if (typeof validationResult === 'string') {
              throw new Error(validationResult);
            }
            if (validationResult === false) {
              throw new Error('Validation failed');
            }
          }

          // Store value
          const stepId = step.id || `step-${currentStep}`;
          if (value !== undefined) {
            values[stepId] = value;
          }

          return value;
        },
      },
    });

    if (result.dismissed) {
      if (result.dismissReason === 'cancel') {
        return {
          completed: false,
          cancelled: true,
          values,
          lastStep: currentStep,
        };
      }

      // Check for back button
      const clickedBack = result.dismissReason === 'programmatic' &&
                          (result as any).customAction === 'back';

      if (clickedBack && currentStep > 0) {
        currentStep--;
        continue;
      }
    }

    if (result.confirmed) {
      currentStep++;
    }
  }

  return {
    completed: true,
    cancelled: false,
    values,
    lastStep: steps.length - 1,
  };
}

// ============================================================================
// Form Modal
// ============================================================================

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
export async function form<T = Record<string, any>>(options: FormModalOptions): Promise<T | undefined> {
  const {
    form: formSchemaOrPreset,
    initialData,
    submitText = 'Submit',
    cancelText = 'Cancel',
    ...rest
  } = options;

  // Resolve form schema
  const formSchema: FormSchema = typeof formSchemaOrPreset === 'string'
    ? formPresets[formSchemaOrPreset]
    : formSchemaOrPreset;

  if (!formSchema) {
    throw new Error(`Unknown form preset: ${formSchemaOrPreset}`);
  }

  const result = await modal<T>({
    ...rest,
    form: formSchema,
    formData: initialData,
    buttons: {
      confirm: { text: submitText, visible: true },
      cancel: { text: cancelText, visible: true },
    },
  });

  return result.confirmed ? result.value : undefined;
}

// ============================================================================
// Presets Object (for namespaced access)
// ============================================================================

export const presets = {
  alert,
  confirm,
  prompt,
  success,
  error,
  warning,
  info,
  loading,
  image,
  wizard,
  form,
};
