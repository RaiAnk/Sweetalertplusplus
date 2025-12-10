/**
 * Form Renderer
 * Renders complete forms from schema definitions
 */

import type { FormSchema, FormField, ModalOptions } from '../core/types';
import { getFieldRenderer, registerFieldRenderer } from './field-renderers';
import { validateField, validateForm } from './validation';

// ============================================================================
// Form State Management
// ============================================================================

export interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Set<string>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
}

export interface FormController {
  getState(): FormState;
  getData(): Record<string, any>;
  setData(data: Record<string, any>): void;
  setFieldValue(name: string, value: any): void;
  getFieldValue(name: string): any;
  validate(): Promise<{ valid: boolean; errors: Record<string, string> }>;
  validateField(name: string): Promise<string | null>;
  reset(): void;
  destroy(): void;
}

// ============================================================================
// Form Renderer
// ============================================================================

export function renderForm(
  schema: FormSchema,
  container: HTMLElement,
  options?: {
    initialData?: Record<string, any>;
    onChange?: (data: Record<string, any>) => void;
    onValidate?: (valid: boolean, errors: Record<string, string>) => void;
  }
): FormController {
  const state: FormState = {
    data: { ...options?.initialData },
    errors: {},
    touched: new Set(),
    dirty: false,
    valid: true,
    submitting: false,
  };

  const fieldElements = new Map<string, HTMLElement>();
  const cleanupFunctions: (() => void)[] = [];

  // Initialize default values
  for (const field of schema.fields) {
    if (field.name && field.defaultValue !== undefined && state.data[field.name] === undefined) {
      state.data[field.name] = field.defaultValue;
    }
  }

  // Create form element
  const form = document.createElement('div');
  form.className = 'swal-form';
  form.setAttribute('role', 'form');

  // Apply layout settings
  if (schema.layout) {
    if (schema.layout.columns && schema.layout.columns > 1) {
      form.classList.add(`swal-form--columns-${schema.layout.columns}`);
    }
    if (schema.layout.gap) {
      form.classList.add(`swal-form--gap-${schema.layout.gap}`);
    }
    if (schema.layout.labelPosition) {
      form.classList.add(`swal-form--labels-${schema.layout.labelPosition}`);
    }
  }

  // Render sections or fields
  if (schema.sections && schema.sections.length > 0) {
    for (const section of schema.sections) {
      const sectionEl = document.createElement('fieldset');
      sectionEl.className = 'swal-form__section';

      if (section.title) {
        const legend = document.createElement('legend');
        legend.className = 'swal-form__section-title';
        legend.textContent = section.title;
        sectionEl.appendChild(legend);
      }

      if (section.description) {
        const desc = document.createElement('p');
        desc.className = 'swal-form__section-description';
        desc.textContent = section.description;
        sectionEl.appendChild(desc);
      }

      const sectionFields = section.fields
        .map(name => schema.fields.find(f => f.name === name))
        .filter((f): f is FormField => f !== undefined);

      for (const field of sectionFields) {
        const fieldEl = renderField(field);
        if (fieldEl) {
          sectionEl.appendChild(fieldEl);
          fieldElements.set(field.name, fieldEl);
        }
      }

      // Apply collapsible
      if (section.collapsible) {
        sectionEl.classList.add('swal-form__section--collapsible');
        if (section.collapsed) {
          sectionEl.classList.add('swal-form__section--collapsed');
        }

        const legend = sectionEl.querySelector('legend');
        if (legend) {
          legend.style.cursor = 'pointer';
          legend.addEventListener('click', () => {
            sectionEl.classList.toggle('swal-form__section--collapsed');
          });
        }
      }

      form.appendChild(sectionEl);
    }
  } else {
    // Render fields directly
    for (const field of schema.fields) {
      // Check conditional visibility
      if (field.showWhen && !field.showWhen(state.data)) {
        continue;
      }

      const fieldEl = renderField(field);
      if (fieldEl) {
        form.appendChild(fieldEl);
        fieldElements.set(field.name, fieldEl);
      }
    }
  }

  container.appendChild(form);

  // Field rendering helper
  function renderField(field: FormField): HTMLElement | null {
    const renderer = getFieldRenderer(field.type);
    if (!renderer) {
      console.warn(`No renderer for field type: ${field.type}`);
      return null;
    }

    const value = state.data[field.name];
    const error = state.errors[field.name];

    const element = renderer(
      field,
      value,
      (newValue) => handleFieldChange(field, newValue),
      error
    );

    // Store cleanup if available
    if ((element as any).__cleanup) {
      cleanupFunctions.push((element as any).__cleanup);
    }

    return element;
  }

  // Handle field value changes
  async function handleFieldChange(field: FormField, value: any): Promise<void> {
    state.data[field.name] = value;
    state.dirty = true;
    state.touched.add(field.name);

    // Validate on change if configured
    if (schema.validation?.validateOnSubmit !== true) {
      const error = await validateField(value, field, state.data);
      if (error) {
        state.errors[field.name] = error;
      } else {
        delete state.errors[field.name];
      }

      // Update field error display
      updateFieldError(field.name, error);
    }

    // Re-render conditional fields
    updateConditionalFields();

    // Notify change
    options?.onChange?.(state.data);

    // Validate form state
    state.valid = Object.keys(state.errors).length === 0;
    options?.onValidate?.(state.valid, state.errors);
  }

  // Update field error display
  function updateFieldError(fieldName: string, error: string | null): void {
    const fieldEl = fieldElements.get(fieldName);
    if (!fieldEl) return;

    fieldEl.classList.toggle('swal-field--error', !!error);

    // Update or create error element
    let errorEl = fieldEl.querySelector('.swal-field__error') as HTMLElement;
    if (error) {
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'swal-field__error';
        errorEl.setAttribute('role', 'alert');
        fieldEl.appendChild(errorEl);
      }
      errorEl.textContent = error;
    } else if (errorEl) {
      errorEl.remove();
    }
  }

  // Update conditional field visibility
  function updateConditionalFields(): void {
    for (const field of schema.fields) {
      if (!field.showWhen) continue;

      const shouldShow = field.showWhen(state.data);
      const existingEl = fieldElements.get(field.name);

      if (shouldShow && !existingEl) {
        // Add field
        const fieldEl = renderField(field);
        if (fieldEl) {
          // Find correct position
          const fieldIndex = schema.fields.indexOf(field);
          let insertBefore: HTMLElement | null = null;

          for (let i = fieldIndex + 1; i < schema.fields.length; i++) {
            const nextField = schema.fields[i];
            const nextEl = fieldElements.get(nextField.name);
            if (nextEl && nextEl.parentElement === form) {
              insertBefore = nextEl;
              break;
            }
          }

          if (insertBefore) {
            form.insertBefore(fieldEl, insertBefore);
          } else {
            form.appendChild(fieldEl);
          }

          fieldElements.set(field.name, fieldEl);
        }
      } else if (!shouldShow && existingEl) {
        // Remove field
        existingEl.remove();
        fieldElements.delete(field.name);
        delete state.data[field.name];
        delete state.errors[field.name];
      }
    }
  }

  // Form controller
  const controller: FormController = {
    getState: () => ({ ...state }),

    getData: () => ({ ...state.data }),

    setData: (data) => {
      Object.assign(state.data, data);
      state.dirty = true;

      // Re-render all fields
      for (const [name, element] of fieldElements) {
        const field = schema.fields.find(f => f.name === name);
        if (field) {
          const newElement = renderField(field);
          if (newElement) {
            element.replaceWith(newElement);
            fieldElements.set(name, newElement);
          }
        }
      }

      updateConditionalFields();
      options?.onChange?.(state.data);
    },

    setFieldValue: (name, value) => {
      const field = schema.fields.find(f => f.name === name);
      if (field) {
        handleFieldChange(field, value);
      }
    },

    getFieldValue: (name) => state.data[name],

    validate: async () => {
      const result = await validateForm(state.data, schema.fields, {
        stopOnFirstError: schema.validation?.stopOnFirstError,
      });

      state.errors = result.errors;
      state.valid = result.valid;

      // Update all field errors
      for (const field of schema.fields) {
        if (field.name) {
          updateFieldError(field.name, result.errors[field.name] || null);
        }
      }

      // Scroll to first error if configured
      if (!result.valid && schema.validation?.scrollToError) {
        const firstErrorField = Object.keys(result.errors)[0];
        const errorEl = fieldElements.get(firstErrorField);
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = errorEl.querySelector('input, textarea, select') as HTMLElement;
          input?.focus();
        }
      }

      options?.onValidate?.(result.valid, result.errors);
      return result;
    },

    validateField: async (name) => {
      const field = schema.fields.find(f => f.name === name);
      if (!field) return null;

      const value = state.data[name];
      const error = await validateField(value, field, state.data);

      if (error) {
        state.errors[name] = error;
      } else {
        delete state.errors[name];
      }

      updateFieldError(name, error);
      state.valid = Object.keys(state.errors).length === 0;

      return error;
    },

    reset: () => {
      state.data = { ...options?.initialData };
      state.errors = {};
      state.touched.clear();
      state.dirty = false;
      state.valid = true;

      // Re-render all fields
      for (const [name, element] of fieldElements) {
        const field = schema.fields.find(f => f.name === name);
        if (field) {
          const newElement = renderField(field);
          if (newElement) {
            element.replaceWith(newElement);
            fieldElements.set(name, newElement);
          }
        }
      }

      updateConditionalFields();
      options?.onChange?.(state.data);
    },

    destroy: () => {
      // Run cleanup functions
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }

      // Remove form element
      form.remove();
      fieldElements.clear();
    },
  };

  return controller;
}

// ============================================================================
// Quick Form Builder
// ============================================================================

/**
 * Create a form schema from a simple configuration
 */
export function createFormSchema(config: {
  fields: Array<Partial<FormField> & { name: string; type: FormField['type'] }>;
  layout?: FormSchema['layout'];
  validation?: FormSchema['validation'];
}): FormSchema {
  return {
    fields: config.fields.map(field => ({
      ...field,
      label: field.label ?? formatLabel(field.name),
    })) as FormField[],
    layout: config.layout,
    validation: config.validation,
  };
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================================================
// Preset Form Schemas
// ============================================================================

export const formPresets = {
  login: createFormSchema({
    fields: [
      { name: 'email', type: 'email', required: true, autocomplete: 'email' },
      { name: 'password', type: 'password', required: true, autocomplete: 'current-password' },
      { name: 'remember', type: 'checkbox', label: 'Remember me' },
    ],
    layout: { labelPosition: 'top' },
  }),

  register: createFormSchema({
    fields: [
      { name: 'name', type: 'text', required: true, autocomplete: 'name' },
      { name: 'email', type: 'email', required: true, autocomplete: 'email' },
      {
        name: 'password',
        type: 'password',
        required: true,
        showStrength: true,
        minLength: 8,
        autocomplete: 'new-password',
      },
      {
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        required: true,
        autocomplete: 'new-password',
        validation: {
          rules: [{ type: 'match', value: 'password', message: 'Passwords do not match' }],
        },
      },
      {
        name: 'terms',
        type: 'checkbox',
        label: 'I agree to the Terms of Service',
        required: true,
      },
    ],
    layout: { labelPosition: 'top' },
  }),

  contact: createFormSchema({
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'text', mask: '(999) 999-9999' },
      {
        name: 'subject',
        type: 'select',
        options: [
          'General Inquiry',
          'Support',
          'Sales',
          'Partnership',
          'Other',
        ],
      },
      {
        name: 'message',
        type: 'textarea',
        required: true,
        rows: 5,
        maxLength: 1000,
        showCounter: true,
      },
    ],
    layout: { labelPosition: 'top' },
  }),

  payment: createFormSchema({
    fields: [
      { name: 'cardName', type: 'text', label: 'Name on Card', required: true },
      {
        name: 'cardNumber',
        type: 'text',
        label: 'Card Number',
        required: true,
        mask: '9999 9999 9999 9999',
        validation: { rules: [{ type: 'creditCard' }] },
      },
      { name: 'expiry', type: 'text', label: 'Expiry Date', required: true, mask: '99/99' },
      { name: 'cvv', type: 'password', label: 'CVV', required: true, maxLength: 4, mask: '9999' },
    ],
    layout: { columns: 2, labelPosition: 'top' },
  }),

  address: createFormSchema({
    fields: [
      { name: 'street', type: 'text', label: 'Street Address', required: true },
      { name: 'street2', type: 'text', label: 'Apt/Suite/Unit' },
      { name: 'city', type: 'text', required: true },
      { name: 'state', type: 'text', required: true },
      { name: 'zipCode', type: 'text', label: 'ZIP Code', required: true },
      {
        name: 'country',
        type: 'select',
        required: true,
        options: [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'UK', label: 'United Kingdom' },
          { value: 'AU', label: 'Australia' },
        ],
      },
    ],
    layout: { columns: 2, labelPosition: 'top' },
  }),

  feedback: createFormSchema({
    fields: [
      {
        name: 'rating',
        type: 'rating',
        label: 'How would you rate your experience?',
        required: true,
        max: 5,
      },
      {
        name: 'recommend',
        type: 'radio',
        label: 'Would you recommend us?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes, definitely!' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'no', label: 'No' },
        ],
        layout: 'horizontal',
      },
      {
        name: 'improvements',
        type: 'checkbox',
        label: 'What could we improve?',
        options: [
          'Speed',
          'Quality',
          'Price',
          'Customer Service',
          'User Experience',
        ],
      },
      {
        name: 'comments',
        type: 'textarea',
        label: 'Additional Comments',
        rows: 4,
      },
    ],
    layout: { labelPosition: 'top' },
  }),

  profile: createFormSchema({
    fields: [
      { name: 'avatar', type: 'file', label: 'Profile Picture', accept: ['image/*'] },
      { name: 'username', type: 'text', required: true },
      { name: 'displayName', type: 'text', label: 'Display Name' },
      { name: 'bio', type: 'textarea', rows: 3, maxLength: 160, showCounter: true },
      { name: 'website', type: 'text', validation: { rules: [{ type: 'url' }] } },
      { name: 'location', type: 'text' },
      { name: 'birthday', type: 'date' },
    ],
    layout: { labelPosition: 'top' },
  }),
};

// ============================================================================
// Integration with Modal
// ============================================================================

/**
 * Extend modal options with form handling
 */
export function processFormOptions(options: ModalOptions): {
  formController: FormController | null;
  contentElement: HTMLElement | null;
} {
  if (!options.form) {
    return { formController: null, contentElement: null };
  }

  const container = document.createElement('div');
  container.className = 'swal-form-container';

  const formController = renderForm(options.form, container, {
    initialData: options.formData,
    onChange: options.onFormChange,
    onValidate: options.onFormValidate,
  });

  return { formController, contentElement: container };
}

// Re-export
export { registerFieldRenderer };
