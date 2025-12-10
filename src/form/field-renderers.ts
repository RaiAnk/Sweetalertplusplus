/**
 * Field Renderers
 * Individual field type rendering components
 */

import type { FormField } from '../core/types';
import { createMaskedInput, applyMask } from './validation';

// ============================================================================
// Field Renderer Registry
// ============================================================================

type FieldRenderer = (
  field: FormField,
  value: any,
  onChange: (value: any) => void,
  error?: string
) => HTMLElement;

const fieldRenderers = new Map<string, FieldRenderer>();

/**
 * Register a custom field renderer
 */
export function registerFieldRenderer(type: string, renderer: FieldRenderer): void {
  fieldRenderers.set(type, renderer);
}

/**
 * Get field renderer for a type
 */
export function getFieldRenderer(type: string): FieldRenderer | undefined {
  return fieldRenderers.get(type) || builtInRenderers[type];
}

// ============================================================================
// Helper Functions
// ============================================================================

function createFieldWrapper(field: FormField, error?: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `swal-field swal-field--${field.type}`;
  if (error) wrapper.classList.add('swal-field--error');
  if (field.disabled) wrapper.classList.add('swal-field--disabled');
  wrapper.dataset.fieldName = field.name;
  return wrapper;
}

function createLabel(field: FormField): HTMLLabelElement | null {
  if (!field.label) return null;

  const label = document.createElement('label');
  label.className = 'swal-field__label';
  label.htmlFor = `swal-field-${field.name}`;
  label.textContent = field.label;

  if (field.required) {
    const asterisk = document.createElement('span');
    asterisk.className = 'swal-field__required';
    asterisk.textContent = ' *';
    asterisk.setAttribute('aria-hidden', 'true');
    label.appendChild(asterisk);
  }

  return label;
}

function createHint(field: FormField): HTMLElement | null {
  if (!field.hint) return null;

  const hint = document.createElement('div');
  hint.className = 'swal-field__hint';
  hint.id = `swal-field-${field.name}-hint`;
  hint.textContent = field.hint;
  return hint;
}

function createError(error?: string): HTMLElement | null {
  if (!error) return null;

  const errorEl = document.createElement('div');
  errorEl.className = 'swal-field__error';
  errorEl.setAttribute('role', 'alert');
  errorEl.textContent = error;
  return errorEl;
}

function setCommonAttributes(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, field: FormField): void {
  input.id = `swal-field-${field.name}`;
  input.name = field.name;
  if (field.disabled) input.disabled = true;
  if (field.placeholder) input.placeholder = field.placeholder;
  if (field.autocomplete) input.autocomplete = field.autocomplete;
  if (field.hint) input.setAttribute('aria-describedby', `swal-field-${field.name}-hint`);
}

// ============================================================================
// Built-in Field Renderers
// ============================================================================

const builtInRenderers: Record<string, FieldRenderer> = {
  // Text input
  text: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper';

    if (field.prefix) {
      const prefix = document.createElement('span');
      prefix.className = 'swal-field__prefix';
      prefix.textContent = field.prefix;
      inputWrapper.appendChild(prefix);
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'swal-input';
    input.value = value ?? field.defaultValue ?? '';
    setCommonAttributes(input, field);

    if (field.minLength) input.minLength = field.minLength;
    if (field.maxLength) input.maxLength = field.maxLength;

    // Apply mask if specified
    let maskHandler: { destroy: () => void } | null = null;
    if (field.mask) {
      maskHandler = createMaskedInput(input, field.mask);
    }

    input.addEventListener('input', () => onChange(input.value));
    input.addEventListener('blur', () => onChange(input.value));

    inputWrapper.appendChild(input);

    if (field.suffix) {
      const suffix = document.createElement('span');
      suffix.className = 'swal-field__suffix';
      suffix.textContent = field.suffix;
      inputWrapper.appendChild(suffix);
    }

    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);

    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    // Store cleanup function
    (wrapper as any).__cleanup = () => maskHandler?.destroy();

    return wrapper;
  },

  // Email input
  email: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--icon';

    const icon = document.createElement('span');
    icon.className = 'swal-field__icon';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
    inputWrapper.appendChild(icon);

    const input = document.createElement('input');
    input.type = 'email';
    input.className = 'swal-input swal-input--with-icon';
    input.value = value ?? field.defaultValue ?? '';
    setCommonAttributes(input, field);

    input.addEventListener('input', () => onChange(input.value));

    inputWrapper.appendChild(input);
    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Password input
  password: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--password';

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'swal-input';
    input.value = value ?? '';
    setCommonAttributes(input, field);

    if (field.minLength) input.minLength = field.minLength;
    if (field.maxLength) input.maxLength = field.maxLength;

    input.addEventListener('input', () => onChange(input.value));

    inputWrapper.appendChild(input);

    // Toggle visibility button
    if (field.showToggle !== false) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'swal-field__password-toggle';
      toggle.setAttribute('aria-label', 'Toggle password visibility');
      toggle.innerHTML = '<svg class="eye-open" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg><svg class="eye-closed" viewBox="0 0 24 24" width="18" height="18" style="display:none"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';

      toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.querySelector('.eye-open')!.setAttribute('style', isPassword ? 'display:none' : '');
        toggle.querySelector('.eye-closed')!.setAttribute('style', isPassword ? '' : 'display:none');
      });

      inputWrapper.appendChild(toggle);
    }

    // Password strength indicator
    if (field.showStrength) {
      const strength = document.createElement('div');
      strength.className = 'swal-field__password-strength';
      strength.innerHTML = '<div class="swal-field__password-strength-bar"></div><span class="swal-field__password-strength-text"></span>';

      input.addEventListener('input', () => {
        const score = calculatePasswordStrength(input.value);
        const bar = strength.querySelector('.swal-field__password-strength-bar') as HTMLElement;
        const text = strength.querySelector('.swal-field__password-strength-text') as HTMLElement;

        bar.style.width = `${score * 25}%`;
        bar.className = `swal-field__password-strength-bar swal-field__password-strength-bar--${score}`;

        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        text.textContent = labels[score];
      });

      wrapper.appendChild(inputWrapper);
      wrapper.appendChild(strength);
    } else {
      wrapper.appendChild(inputWrapper);
    }

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Number input
  number: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--number';

    if (field.prefix) {
      const prefix = document.createElement('span');
      prefix.className = 'swal-field__prefix';
      prefix.textContent = field.prefix;
      inputWrapper.appendChild(prefix);
    }

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'swal-input';
    input.value = value ?? field.defaultValue ?? '';
    setCommonAttributes(input, field);

    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    if (field.step !== undefined) input.step = String(field.step);

    input.addEventListener('input', () => {
      const num = parseFloat(input.value);
      onChange(isNaN(num) ? null : num);
    });

    inputWrapper.appendChild(input);

    // Stepper buttons
    if (field.showStepper !== false) {
      const stepper = document.createElement('div');
      stepper.className = 'swal-field__stepper';

      const decrement = document.createElement('button');
      decrement.type = 'button';
      decrement.className = 'swal-field__stepper-btn';
      decrement.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>';
      decrement.addEventListener('click', () => {
        const current = parseFloat(input.value) || 0;
        const step = field.step || 1;
        const min = field.min ?? -Infinity;
        const newValue = Math.max(min, current - step);
        input.value = String(newValue);
        onChange(newValue);
      });

      const increment = document.createElement('button');
      increment.type = 'button';
      increment.className = 'swal-field__stepper-btn';
      increment.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
      increment.addEventListener('click', () => {
        const current = parseFloat(input.value) || 0;
        const step = field.step || 1;
        const max = field.max ?? Infinity;
        const newValue = Math.min(max, current + step);
        input.value = String(newValue);
        onChange(newValue);
      });

      stepper.appendChild(decrement);
      stepper.appendChild(increment);
      inputWrapper.appendChild(stepper);
    }

    if (field.suffix) {
      const suffix = document.createElement('span');
      suffix.className = 'swal-field__suffix';
      suffix.textContent = field.suffix;
      inputWrapper.appendChild(suffix);
    }

    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Currency input
  currency: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--currency';

    const symbol = document.createElement('span');
    symbol.className = 'swal-field__currency-symbol';
    symbol.textContent = field.currency || '$';
    inputWrapper.appendChild(symbol);

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'swal-input swal-input--currency';
    input.value = formatCurrency(value ?? field.defaultValue ?? '', field.decimals ?? 2);
    setCommonAttributes(input, field);

    input.addEventListener('input', () => {
      const raw = input.value.replace(/[^0-9.-]/g, '');
      const num = parseFloat(raw);
      onChange(isNaN(num) ? null : num);
    });

    input.addEventListener('blur', () => {
      const raw = input.value.replace(/[^0-9.-]/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        input.value = formatCurrency(num, field.decimals ?? 2);
      }
    });

    inputWrapper.appendChild(input);
    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Textarea
  textarea: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.className = 'swal-textarea';
    textarea.value = value ?? field.defaultValue ?? '';
    setCommonAttributes(textarea, field);

    if (field.rows) textarea.rows = field.rows;
    if (field.minLength) textarea.minLength = field.minLength;
    if (field.maxLength) textarea.maxLength = field.maxLength;
    if (field.resize === false) textarea.style.resize = 'none';

    textarea.addEventListener('input', () => onChange(textarea.value));

    wrapper.appendChild(textarea);

    // Character counter
    if (field.showCounter && field.maxLength) {
      const counter = document.createElement('div');
      counter.className = 'swal-field__counter';
      counter.textContent = `0 / ${field.maxLength}`;

      textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} / ${field.maxLength}`;
        if (textarea.value.length > field.maxLength! * 0.9) {
          counter.classList.add('swal-field__counter--warning');
        } else {
          counter.classList.remove('swal-field__counter--warning');
        }
      });

      wrapper.appendChild(counter);
    }

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Select dropdown
  select: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'swal-field__select-wrapper';

    const select = document.createElement('select');
    select.className = 'swal-select';
    setCommonAttributes(select, field);

    // Add placeholder option
    if (field.placeholder) {
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = field.placeholder;
      placeholderOpt.disabled = true;
      placeholderOpt.selected = !value;
      select.appendChild(placeholderOpt);
    }

    // Add options
    const options = field.options || [];
    for (const opt of options) {
      if (typeof opt === 'object' && 'group' in opt) {
        // Option group
        const optgroup = document.createElement('optgroup');
        optgroup.label = opt.group;
        for (const groupOpt of opt.options) {
          const option = document.createElement('option');
          option.value = String(groupOpt.value);
          option.textContent = groupOpt.label;
          if (groupOpt.disabled) option.disabled = true;
          if (value === groupOpt.value) option.selected = true;
          optgroup.appendChild(option);
        }
        select.appendChild(optgroup);
      } else {
        const option = document.createElement('option');
        const optValue = typeof opt === 'object' ? opt.value : opt;
        const optLabel = typeof opt === 'object' ? opt.label : opt;
        option.value = String(optValue);
        option.textContent = String(optLabel);
        if (typeof opt === 'object' && opt.disabled) option.disabled = true;
        if (value === optValue) option.selected = true;
        select.appendChild(option);
      }
    }

    select.addEventListener('change', () => {
      const selectedValue = select.value;
      // Try to preserve original type
      const originalOpt = options.find(o =>
        typeof o === 'object' && 'value' in o && String(o.value) === selectedValue
      );
      onChange(originalOpt && typeof originalOpt === 'object' ? originalOpt.value : selectedValue);
    });

    selectWrapper.appendChild(select);

    // Custom arrow
    const arrow = document.createElement('span');
    arrow.className = 'swal-field__select-arrow';
    arrow.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>';
    selectWrapper.appendChild(arrow);

    wrapper.appendChild(selectWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Radio group
  radio: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const group = document.createElement('div');
    group.className = `swal-field__radio-group swal-field__radio-group--${field.layout || 'vertical'}`;
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-labelledby', `swal-field-${field.name}-label`);

    const options = field.options || [];
    for (const opt of options) {
      const optValue = typeof opt === 'object' ? opt.value : opt;
      const optLabel = typeof opt === 'object' ? opt.label : opt;
      const optDescription = typeof opt === 'object' ? opt.description : undefined;

      const radioWrapper = document.createElement('label');
      radioWrapper.className = 'swal-radio';
      if (typeof opt === 'object' && opt.disabled) radioWrapper.classList.add('swal-radio--disabled');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = field.name;
      input.value = String(optValue);
      input.checked = value === optValue;
      if (typeof opt === 'object' && opt.disabled) input.disabled = true;

      input.addEventListener('change', () => {
        if (input.checked) onChange(optValue);
      });

      const checkmark = document.createElement('span');
      checkmark.className = 'swal-radio__checkmark';

      const labelText = document.createElement('span');
      labelText.className = 'swal-radio__label';
      labelText.textContent = String(optLabel);

      radioWrapper.appendChild(input);
      radioWrapper.appendChild(checkmark);
      radioWrapper.appendChild(labelText);

      if (optDescription) {
        const desc = document.createElement('span');
        desc.className = 'swal-radio__description';
        desc.textContent = optDescription;
        radioWrapper.appendChild(desc);
      }

      group.appendChild(radioWrapper);
    }

    wrapper.appendChild(group);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Checkbox (single or group)
  checkbox: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);

    if (field.options && field.options.length > 0) {
      // Multiple checkboxes
      const label = createLabel(field);
      if (label) wrapper.appendChild(label);

      const group = document.createElement('div');
      group.className = `swal-field__checkbox-group swal-field__checkbox-group--${field.layout || 'vertical'}`;

      const currentValues: any[] = Array.isArray(value) ? [...value] : [];

      for (const opt of field.options) {
        const optValue = typeof opt === 'object' ? opt.value : opt;
        const optLabel = typeof opt === 'object' ? opt.label : opt;

        const checkboxWrapper = document.createElement('label');
        checkboxWrapper.className = 'swal-checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = String(optValue);
        input.checked = currentValues.includes(optValue);

        input.addEventListener('change', () => {
          if (input.checked) {
            currentValues.push(optValue);
          } else {
            const idx = currentValues.indexOf(optValue);
            if (idx > -1) currentValues.splice(idx, 1);
          }
          onChange([...currentValues]);
        });

        const checkmark = document.createElement('span');
        checkmark.className = 'swal-checkbox__checkmark';
        checkmark.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

        const labelText = document.createElement('span');
        labelText.className = 'swal-checkbox__label';
        labelText.textContent = String(optLabel);

        checkboxWrapper.appendChild(input);
        checkboxWrapper.appendChild(checkmark);
        checkboxWrapper.appendChild(labelText);
        group.appendChild(checkboxWrapper);
      }

      wrapper.appendChild(group);
    } else {
      // Single checkbox
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.className = 'swal-checkbox';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `swal-field-${field.name}`;
      input.name = field.name;
      input.checked = Boolean(value ?? field.defaultValue);
      if (field.disabled) input.disabled = true;

      input.addEventListener('change', () => onChange(input.checked));

      const checkmark = document.createElement('span');
      checkmark.className = 'swal-checkbox__checkmark';
      checkmark.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

      const labelText = document.createElement('span');
      labelText.className = 'swal-checkbox__label';
      labelText.textContent = field.label || '';

      checkboxWrapper.appendChild(input);
      checkboxWrapper.appendChild(checkmark);
      checkboxWrapper.appendChild(labelText);
      wrapper.appendChild(checkboxWrapper);
    }

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Switch/Toggle
  switch: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);

    const switchWrapper = document.createElement('label');
    switchWrapper.className = 'swal-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `swal-field-${field.name}`;
    input.name = field.name;
    input.checked = Boolean(value ?? field.defaultValue);
    if (field.disabled) input.disabled = true;

    input.addEventListener('change', () => onChange(input.checked));

    const slider = document.createElement('span');
    slider.className = 'swal-switch__slider';

    const labelText = document.createElement('span');
    labelText.className = 'swal-switch__label';
    labelText.textContent = field.label || '';

    switchWrapper.appendChild(input);
    switchWrapper.appendChild(slider);
    switchWrapper.appendChild(labelText);
    wrapper.appendChild(switchWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Range slider
  range: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const rangeWrapper = document.createElement('div');
    rangeWrapper.className = 'swal-field__range-wrapper';

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'swal-range';
    input.id = `swal-field-${field.name}`;
    input.name = field.name;
    input.value = String(value ?? field.defaultValue ?? field.min ?? 0);
    if (field.min !== undefined) input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    if (field.step !== undefined) input.step = String(field.step);
    if (field.disabled) input.disabled = true;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'swal-field__range-value';
    valueDisplay.textContent = input.value;

    input.addEventListener('input', () => {
      const num = parseFloat(input.value);
      valueDisplay.textContent = String(num);
      onChange(num);
    });

    rangeWrapper.appendChild(input);

    if (field.showValue !== false) {
      rangeWrapper.appendChild(valueDisplay);
    }

    // Min/max labels
    if (field.showLabels) {
      const labels = document.createElement('div');
      labels.className = 'swal-field__range-labels';
      labels.innerHTML = `<span>${field.min ?? 0}</span><span>${field.max ?? 100}</span>`;
      rangeWrapper.appendChild(labels);
    }

    wrapper.appendChild(rangeWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Rating (stars)
  rating: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'swal-rating';
    ratingWrapper.setAttribute('role', 'radiogroup');

    const maxRating = field.max || 5;
    let currentValue = value ?? field.defaultValue ?? 0;

    for (let i = 1; i <= maxRating; i++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'swal-rating__star';
      star.dataset.value = String(i);
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-checked', String(i <= currentValue));
      star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
      if (field.disabled) star.disabled = true;

      star.innerHTML = field.icon || '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

      if (i <= currentValue) {
        star.classList.add('swal-rating__star--active');
      }

      star.addEventListener('click', () => {
        currentValue = i;
        onChange(i);

        // Update all stars
        ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
          const isActive = idx < i;
          s.classList.toggle('swal-rating__star--active', isActive);
          s.setAttribute('aria-checked', String(isActive));
        });
      });

      star.addEventListener('mouseenter', () => {
        if (field.disabled) return;
        ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
          s.classList.toggle('swal-rating__star--hover', idx < i);
        });
      });

      star.addEventListener('mouseleave', () => {
        ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
          s.classList.remove('swal-rating__star--hover');
        });
      });

      ratingWrapper.appendChild(star);
    }

    wrapper.appendChild(ratingWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Date picker
  date: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--date';

    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'swal-input';
    if (value) input.value = formatDateForInput(value);
    setCommonAttributes(input, field);

    if (field.min) input.min = formatDateForInput(field.min);
    if (field.max) input.max = formatDateForInput(field.max);

    input.addEventListener('change', () => {
      onChange(input.value ? new Date(input.value) : null);
    });

    inputWrapper.appendChild(input);
    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Time picker
  time: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--time';

    const input = document.createElement('input');
    input.type = 'time';
    input.className = 'swal-input';
    input.value = value ?? field.defaultValue ?? '';
    setCommonAttributes(input, field);

    if (field.min) input.min = field.min;
    if (field.max) input.max = field.max;
    if (field.step) input.step = String(field.step);

    input.addEventListener('change', () => onChange(input.value));

    inputWrapper.appendChild(input);
    wrapper.appendChild(inputWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Color picker
  color: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const colorWrapper = document.createElement('div');
    colorWrapper.className = 'swal-field__color-wrapper';

    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'swal-color';
    input.id = `swal-field-${field.name}`;
    input.name = field.name;
    input.value = value ?? field.defaultValue ?? '#000000';
    if (field.disabled) input.disabled = true;

    const valueText = document.createElement('span');
    valueText.className = 'swal-field__color-value';
    valueText.textContent = input.value.toUpperCase();

    input.addEventListener('input', () => {
      valueText.textContent = input.value.toUpperCase();
      onChange(input.value);
    });

    colorWrapper.appendChild(input);
    colorWrapper.appendChild(valueText);
    wrapper.appendChild(colorWrapper);

    // Preset colors
    if (field.presets && field.presets.length > 0) {
      const presets = document.createElement('div');
      presets.className = 'swal-field__color-presets';

      for (const preset of field.presets) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swal-field__color-preset';
        btn.style.backgroundColor = preset;
        btn.setAttribute('aria-label', `Select color ${preset}`);

        btn.addEventListener('click', () => {
          input.value = preset;
          valueText.textContent = preset.toUpperCase();
          onChange(preset);
        });

        presets.appendChild(btn);
      }

      wrapper.appendChild(presets);
    }

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // File upload
  file: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const dropzone = document.createElement('div');
    dropzone.className = 'swal-dropzone';
    if (field.disabled) dropzone.classList.add('swal-dropzone--disabled');

    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'swal-dropzone__input';
    input.id = `swal-field-${field.name}`;
    input.name = field.name;
    if (field.multiple) input.multiple = true;
    if (field.accept) input.accept = field.accept.join(',');
    if (field.disabled) input.disabled = true;

    const content = document.createElement('div');
    content.className = 'swal-dropzone__content';
    content.innerHTML = `
      <svg viewBox="0 0 24 24" width="48" height="48" class="swal-dropzone__icon">
        <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
      <p class="swal-dropzone__text">${field.placeholder || 'Drop files here or click to upload'}</p>
      <p class="swal-dropzone__hint">${field.accept ? `Allowed: ${field.accept.join(', ')}` : ''}</p>
    `;

    const fileList = document.createElement('div');
    fileList.className = 'swal-dropzone__files';

    function updateFileList(files: File[]) {
      fileList.innerHTML = '';
      for (const file of files) {
        const item = document.createElement('div');
        item.className = 'swal-dropzone__file';
        item.innerHTML = `
          <span class="swal-dropzone__file-name">${file.name}</span>
          <span class="swal-dropzone__file-size">${formatFileSize(file.size)}</span>
          <button type="button" class="swal-dropzone__file-remove" aria-label="Remove file">×</button>
        `;

        item.querySelector('.swal-dropzone__file-remove')!.addEventListener('click', () => {
          const newFiles = files.filter(f => f !== file);
          onChange(field.multiple ? newFiles : null);
          updateFileList(newFiles);
        });

        fileList.appendChild(item);
      }
    }

    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      onChange(field.multiple ? files : files[0] || null);
      updateFileList(files);
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('swal-dropzone--dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('swal-dropzone--dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('swal-dropzone--dragover');

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        onChange(field.multiple ? files : files[0]);
        updateFileList(files);
      }
    });

    dropzone.appendChild(input);
    dropzone.appendChild(content);
    dropzone.appendChild(fileList);
    wrapper.appendChild(dropzone);

    // Show existing files
    if (value) {
      const files = Array.isArray(value) ? value : [value];
      updateFileList(files.filter(f => f instanceof File));
    }

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Tags input
  tags: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const tagsWrapper = document.createElement('div');
    tagsWrapper.className = 'swal-tags';

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'swal-tags__container';

    let tags: string[] = Array.isArray(value) ? [...value] : [];

    function renderTags() {
      tagsContainer.innerHTML = '';
      for (const tag of tags) {
        const tagEl = document.createElement('span');
        tagEl.className = 'swal-tags__tag';
        tagEl.innerHTML = `
          <span class="swal-tags__tag-text">${tag}</span>
          <button type="button" class="swal-tags__tag-remove" aria-label="Remove ${tag}">×</button>
        `;

        tagEl.querySelector('.swal-tags__tag-remove')!.addEventListener('click', () => {
          tags = tags.filter(t => t !== tag);
          onChange(tags);
          renderTags();
        });

        tagsContainer.appendChild(tagEl);
      }
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'swal-tags__input';
    input.placeholder = field.placeholder || 'Type and press Enter';

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = input.value.trim();
        if (newTag && !tags.includes(newTag)) {
          if (!field.max || tags.length < field.max) {
            tags.push(newTag);
            onChange(tags);
            renderTags();
          }
        }
        input.value = '';
      } else if (e.key === 'Backspace' && !input.value && tags.length > 0) {
        tags.pop();
        onChange(tags);
        renderTags();
      }
    });

    tagsWrapper.appendChild(tagsContainer);
    tagsWrapper.appendChild(input);
    wrapper.appendChild(tagsWrapper);

    renderTags();

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // OTP/PIN input
  otp: (field, value, onChange, error) => {
    const wrapper = createFieldWrapper(field, error);
    const label = createLabel(field);
    if (label) wrapper.appendChild(label);

    const otpWrapper = document.createElement('div');
    otpWrapper.className = 'swal-otp';

    const length = field.length || 6;
    const inputs: HTMLInputElement[] = [];
    const currentValue = String(value || '').split('');

    for (let i = 0; i < length; i++) {
      const input = document.createElement('input');
      input.type = field.masked ? 'password' : 'text';
      input.className = 'swal-otp__input';
      input.maxLength = 1;
      input.inputMode = 'numeric';
      input.pattern = '[0-9]*';
      input.value = currentValue[i] || '';
      if (field.disabled) input.disabled = true;

      input.addEventListener('input', () => {
        const val = input.value.replace(/[^0-9]/g, '');
        input.value = val;

        if (val && i < length - 1) {
          inputs[i + 1].focus();
        }

        const fullValue = inputs.map(inp => inp.value).join('');
        onChange(fullValue);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          inputs[i - 1].focus();
        } else if (e.key === 'ArrowLeft' && i > 0) {
          inputs[i - 1].focus();
        } else if (e.key === 'ArrowRight' && i < length - 1) {
          inputs[i + 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData?.getData('text').replace(/[^0-9]/g, '').slice(0, length);
        if (pastedData) {
          for (let j = 0; j < pastedData.length; j++) {
            if (inputs[j]) inputs[j].value = pastedData[j];
          }
          const lastIndex = Math.min(pastedData.length, length) - 1;
          inputs[lastIndex].focus();
          onChange(pastedData);
        }
      });

      inputs.push(input);
      otpWrapper.appendChild(input);

      // Add separator
      if (field.separator && i < length - 1 && (i + 1) % (field.groupSize || 3) === 0) {
        const sep = document.createElement('span');
        sep.className = 'swal-otp__separator';
        sep.textContent = field.separator;
        otpWrapper.appendChild(sep);
      }
    }

    wrapper.appendChild(otpWrapper);

    const hint = createHint(field);
    if (hint) wrapper.appendChild(hint);
    const errorEl = createError(error);
    if (errorEl) wrapper.appendChild(errorEl);

    return wrapper;
  },

  // Divider (layout element)
  divider: (field) => {
    const divider = document.createElement('hr');
    divider.className = 'swal-form__divider';
    if (field.label) {
      const wrapper = document.createElement('div');
      wrapper.className = 'swal-form__divider-wrapper';
      wrapper.innerHTML = `<span class="swal-form__divider-text">${field.label}</span>`;
      wrapper.insertBefore(divider.cloneNode(), wrapper.firstChild);
      wrapper.appendChild(divider);
      return wrapper;
    }
    return divider;
  },

  // Heading (layout element)
  heading: (field) => {
    const heading = document.createElement('h3');
    heading.className = 'swal-form__heading';
    heading.textContent = field.label || '';
    return heading;
  },

  // Paragraph (layout element)
  paragraph: (field) => {
    const p = document.createElement('p');
    p.className = 'swal-form__paragraph';
    p.textContent = field.label || '';
    return p;
  },
};

// Alias common types
builtInRenderers.toggle = builtInRenderers.switch;
builtInRenderers.pin = builtInRenderers.otp;

// ============================================================================
// Utility Functions
// ============================================================================

function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (!password) return score;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return Math.min(4, score);
}

function formatCurrency(value: number | string, decimals: number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatDateForInput(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { builtInRenderers };
