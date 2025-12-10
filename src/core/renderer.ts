/**
 * Modal Renderer
 * Builds modal DOM with proper structure and accessibility
 */

import type { ModalOptions, ButtonConfig, InputConfig, ButtonsConfig } from './types';
import { createIcon, injectIconAnimationStyles } from './icons';
import { sanitize, escapeHtml } from './sanitizer';
import { buildAriaAttributes, applyAriaAttributes } from './a11y';

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

export function generateId(prefix = 'modal'): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

// ============================================================================
// Class Names
// ============================================================================

export interface ClassNames {
  root: string;
  container: string;
  backdrop: string;
  modal: string;
  header: string;
  icon: string;
  title: string;
  closeButton: string;
  body: string;
  content: string;
  image: string;
  input: string;
  inputLabel: string;
  inputError: string;
  footer: string;
  actions: string;
  button: string;
  buttonConfirm: string;
  buttonDeny: string;
  buttonCancel: string;
  timerProgress: string;
  loading: string;
  loadingSpinner: string;
}

export function getClassNames(prefix = 'modal'): ClassNames {
  return {
    root: `${prefix}-root`,
    container: `${prefix}-container`,
    backdrop: `${prefix}-backdrop`,
    modal: `${prefix}-dialog`,
    header: `${prefix}-header`,
    icon: `${prefix}-icon`,
    title: `${prefix}-title`,
    closeButton: `${prefix}-close`,
    body: `${prefix}-body`,
    content: `${prefix}-content`,
    image: `${prefix}-image`,
    input: `${prefix}-input`,
    inputLabel: `${prefix}-input-label`,
    inputError: `${prefix}-input-error`,
    footer: `${prefix}-footer`,
    actions: `${prefix}-actions`,
    button: `${prefix}-btn`,
    buttonConfirm: `${prefix}-btn-confirm`,
    buttonDeny: `${prefix}-btn-deny`,
    buttonCancel: `${prefix}-btn-cancel`,
    timerProgress: `${prefix}-timer-progress`,
    loading: `${prefix}-loading`,
    loadingSpinner: `${prefix}-spinner`,
  };
}

// ============================================================================
// Button Rendering
// ============================================================================

function normalizeButtonConfig(
  config: ButtonConfig | string | boolean | undefined,
  defaults: ButtonConfig
): ButtonConfig | null {
  if (config === false) return null;
  if (config === true) return defaults;
  if (typeof config === 'string') return { ...defaults, text: config };
  if (typeof config === 'object') return { ...defaults, ...config };
  return null;
}

function createButton(
  config: ButtonConfig,
  action: string,
  classes: ClassNames
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = action === 'confirm' ? 'submit' : 'button';
  button.className = `${classes.button} ${classes[`button${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ClassNames] || ''}`;

  if (config.className) {
    button.className += ` ${config.className}`;
  }

  if (config.variant) {
    button.className += ` ${classes.button}--${config.variant}`;
  }

  button.textContent = config.text || '';
  button.dataset.action = action;

  if (config.disabled) {
    button.disabled = true;
  }

  if (config.ariaLabel) {
    button.setAttribute('aria-label', config.ariaLabel);
  }

  if (config.autoFocus) {
    button.dataset.autofocus = 'true';
  }

  return button;
}

function renderButtons(
  config: ButtonsConfig | undefined,
  classes: ClassNames
): HTMLElement | null {
  const container = document.createElement('div');
  container.className = classes.actions;

  const buttons: HTMLButtonElement[] = [];

  // Confirm button
  const confirmConfig = normalizeButtonConfig(config?.confirm, {
    text: 'OK',
    variant: 'primary',
    visible: true,
  });
  if (confirmConfig?.visible !== false) {
    buttons.push(createButton(confirmConfig!, 'confirm', classes));
  }

  // Deny button
  const denyConfig = normalizeButtonConfig(config?.deny, {
    text: 'No',
    variant: 'danger',
    visible: false,
  });
  if (denyConfig?.visible !== false && config?.deny) {
    buttons.push(createButton(denyConfig!, 'deny', classes));
  }

  // Cancel button
  const cancelConfig = normalizeButtonConfig(config?.cancel, {
    text: 'Cancel',
    variant: 'secondary',
    visible: false,
  });
  if (cancelConfig?.visible !== false && config?.cancel) {
    buttons.push(createButton(cancelConfig!, 'cancel', classes));
  }

  // Custom buttons
  if (config?.custom) {
    config.custom.forEach(customBtn => {
      const btn = createButton(customBtn, customBtn.id, classes);
      btn.className += ' modal-btn-custom';
      buttons.push(btn);
    });
  }

  if (buttons.length === 0) {
    return null;
  }

  // Apply layout
  if (config?.layout === 'vertical') {
    container.classList.add(`${classes.actions}--vertical`);
  } else if (config?.layout === 'space-between') {
    container.classList.add(`${classes.actions}--space-between`);
  }

  // Reverse order if needed
  const orderedButtons = config?.reverseOrder ? buttons.reverse() : buttons;
  orderedButtons.forEach(btn => container.appendChild(btn));

  return container;
}

// ============================================================================
// Input Rendering
// ============================================================================

function renderInput(config: InputConfig, classes: ClassNames): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = classes.input;

  // Label
  if (config.label) {
    const label = document.createElement('label');
    label.className = classes.inputLabel;
    label.textContent = config.label;
    label.id = generateId('label');
    wrapper.appendChild(label);
  }

  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  switch (config.type) {
    case 'textarea':
      input = document.createElement('textarea');
      if (config.rows) (input as HTMLTextAreaElement).rows = config.rows;
      break;

    case 'select':
      input = document.createElement('select');
      if (config.options) {
        config.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = String(opt.value);
          option.textContent = opt.label;
          if (opt.disabled) option.disabled = true;
          if (config.value !== undefined && String(opt.value) === String(config.value)) {
            option.selected = true;
          }
          input.appendChild(option);
        });
      }
      break;

    case 'checkbox':
    case 'radio':
      // Create group
      const group = document.createElement('div');
      group.className = `${classes.input}-group`;
      group.setAttribute('role', config.type === 'radio' ? 'radiogroup' : 'group');

      if (config.options) {
        const groupName = generateId(config.type);
        config.options.forEach((opt, index) => {
          const itemWrapper = document.createElement('label');
          itemWrapper.className = `${classes.input}-item`;

          const itemInput = document.createElement('input');
          itemInput.type = config.type;
          itemInput.name = groupName;
          itemInput.value = String(opt.value);
          if (opt.disabled) itemInput.disabled = true;

          // Check if this option is selected
          if (config.type === 'checkbox') {
            if (Array.isArray(config.value) && config.value.includes(opt.value)) {
              itemInput.checked = true;
            }
          } else {
            if (config.value !== undefined && String(opt.value) === String(config.value)) {
              itemInput.checked = true;
            }
          }

          const itemLabel = document.createElement('span');
          itemLabel.textContent = opt.label;

          itemWrapper.appendChild(itemInput);
          itemWrapper.appendChild(itemLabel);
          group.appendChild(itemWrapper);
        });
      }

      wrapper.appendChild(group);

      // Error container
      const errorDiv = document.createElement('div');
      errorDiv.className = classes.inputError;
      errorDiv.setAttribute('role', 'alert');
      errorDiv.setAttribute('aria-live', 'polite');
      wrapper.appendChild(errorDiv);

      return wrapper;

    default:
      input = document.createElement('input');
      input.type = config.type || 'text';
      break;
  }

  // Common input setup
  input.className = `${classes.input}-field`;
  input.id = generateId('input');

  if (config.placeholder) {
    (input as HTMLInputElement).placeholder = config.placeholder;
  }

  if (config.value !== undefined && config.type !== 'checkbox' && config.type !== 'radio') {
    input.value = String(config.value);
  }

  if (config.required) {
    input.required = true;
  }

  if (config.autocomplete) {
    (input as HTMLInputElement).autocomplete = config.autocomplete;
  }

  if (config.autoFocus) {
    input.dataset.autofocus = 'true';
  }

  // Number-specific attributes
  if (config.type === 'number' || config.type === 'range') {
    if (config.min !== undefined) (input as HTMLInputElement).min = String(config.min);
    if (config.max !== undefined) (input as HTMLInputElement).max = String(config.max);
    if (config.step !== undefined) (input as HTMLInputElement).step = String(config.step);
  }

  // File-specific attributes
  if (config.type === 'file') {
    if (config.accept) (input as HTMLInputElement).accept = config.accept;
    if (config.multiple) (input as HTMLInputElement).multiple = true;
  }

  // Additional attributes
  if (config.attributes) {
    Object.entries(config.attributes).forEach(([key, value]) => {
      input.setAttribute(key, String(value));
    });
  }

  // Link label to input
  const label = wrapper.querySelector('label');
  if (label) {
    label.setAttribute('for', input.id);
  }

  wrapper.appendChild(input);

  // Error container
  const errorDiv = document.createElement('div');
  errorDiv.className = classes.inputError;
  errorDiv.id = `${input.id}-error`;
  errorDiv.setAttribute('role', 'alert');
  errorDiv.setAttribute('aria-live', 'polite');
  input.setAttribute('aria-describedby', errorDiv.id);
  wrapper.appendChild(errorDiv);

  return wrapper;
}

// ============================================================================
// Main Renderer
// ============================================================================

export interface RenderedModal {
  root: HTMLElement;
  backdrop: HTMLElement | null;
  modal: HTMLElement;
  closeButton: HTMLButtonElement | null;
  titleElement: HTMLElement | null;
  contentElement: HTMLElement | null;
  inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  inputWrapper: HTMLElement | null;
  actionsContainer: HTMLElement | null;
  timerProgress: HTMLElement | null;
  ids: {
    titleId: string;
    contentId: string;
    modalId: string;
  };
}

export function render(options: ModalOptions, prefix = 'modal'): RenderedModal {
  const classes = getClassNames(prefix);
  const ids = {
    titleId: generateId('title'),
    contentId: generateId('content'),
    modalId: options.id || generateId('modal'),
  };

  // Inject icon animation styles if needed
  if (options.icon) {
    injectIconAnimationStyles();
  }

  // Root container
  const root = document.createElement('div');
  root.className = classes.root;
  if (options.className) {
    root.className += ` ${options.className}`;
  }
  root.id = ids.modalId;

  // Backdrop
  let backdrop: HTMLElement | null = null;
  if (options.backdrop !== false) {
    backdrop = document.createElement('div');
    backdrop.className = classes.backdrop;
    if (options.backdropClass) {
      backdrop.className += ` ${options.backdropClass}`;
    }
    if (options.backdropOpacity !== undefined) {
      backdrop.style.setProperty('--modal-backdrop-opacity', String(options.backdropOpacity));
    }
    backdrop.setAttribute('aria-hidden', 'true');
    root.appendChild(backdrop);
  }

  // Container (for centering)
  const container = document.createElement('div');
  container.className = classes.container;
  if (options.position) {
    container.dataset.position = options.position;
  }

  // Modal dialog
  const modal = document.createElement('div');
  modal.className = classes.modal;

  // Size
  if (options.size) {
    modal.dataset.size = options.size;
  }

  // Custom width
  if (options.width) {
    modal.style.width = typeof options.width === 'number' ? `${options.width}px` : options.width;
  }

  // Custom max-height
  if (options.maxHeight) {
    modal.style.maxHeight = typeof options.maxHeight === 'number' ? `${options.maxHeight}px` : options.maxHeight;
  }

  // Custom inline styles
  if (options.style) {
    Object.assign(modal.style, options.style);
  }

  // Data attributes
  if (options.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      modal.dataset[key] = value;
    });
  }

  // Apply ARIA attributes
  const ariaAttrs = buildAriaAttributes(options, ids);
  applyAriaAttributes(modal, ariaAttrs);

  // Z-index
  if (options.zIndex !== undefined) {
    root.style.zIndex = String(options.zIndex);
  }

  // Header section
  const header = document.createElement('div');
  header.className = classes.header;

  let closeButton: HTMLButtonElement | null = null;
  let titleElement: HTMLElement | null = null;

  // Close button
  if (options.showCloseButton !== false) {
    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = classes.closeButton;
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.dataset.action = 'close';
    closeButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    header.appendChild(closeButton);
  }

  // Icon
  if (options.icon && options.icon !== 'none') {
    const iconEl = createIcon({
      type: typeof options.icon === 'string' ? options.icon : 'info',
      color: options.iconColor,
    });
    if (iconEl) {
      header.appendChild(iconEl);
    }
  }

  // Title
  if (options.title) {
    titleElement = document.createElement('h2');
    titleElement.className = classes.title;
    titleElement.id = ids.titleId;

    if (typeof options.title === 'string') {
      titleElement.textContent = options.title;
    } else {
      titleElement.appendChild(options.title.cloneNode(true));
    }

    header.appendChild(titleElement);
  }

  // Only add header if it has content
  if (header.children.length > 0) {
    modal.appendChild(header);
  }

  // Body section
  const body = document.createElement('div');
  body.className = classes.body;

  let contentElement: HTMLElement | null = null;

  // Image
  if (options.image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = classes.image;

    const img = document.createElement('img');
    img.src = options.image.src;
    img.alt = options.image.alt || '';
    if (options.image.width) {
      img.style.width = typeof options.image.width === 'number' ? `${options.image.width}px` : options.image.width;
    }
    if (options.image.height) {
      img.style.height = typeof options.image.height === 'number' ? `${options.image.height}px` : options.image.height;
    }

    imageWrapper.appendChild(img);
    body.appendChild(imageWrapper);
  }

  // Content (text or html)
  if (options.text || options.html) {
    contentElement = document.createElement('div');
    contentElement.className = classes.content;
    contentElement.id = ids.contentId;

    if (options.html) {
      if (typeof options.html === 'string') {
        if (options.allowUnsafeHtml) {
          contentElement.innerHTML = options.html;
        } else {
          contentElement.innerHTML = options.sanitizer
            ? options.sanitizer(options.html)
            : sanitize(options.html);
        }
      } else {
        contentElement.appendChild(options.html.cloneNode(true));
      }
    } else if (options.text) {
      contentElement.textContent = options.text;
    }

    body.appendChild(contentElement);
  }

  // Input
  let inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
  let inputWrapper: HTMLElement | null = null;

  if (options.input) {
    inputWrapper = renderInput(options.input, classes);
    body.appendChild(inputWrapper);

    // Find the actual input element
    inputElement = inputWrapper.querySelector('input, textarea, select');
  }

  // Only add body if it has content
  if (body.children.length > 0) {
    modal.appendChild(body);
  }

  // Timer progress bar
  let timerProgress: HTMLElement | null = null;
  if (options.timer && options.timerProgressBar) {
    timerProgress = document.createElement('div');
    timerProgress.className = classes.timerProgress;
    modal.appendChild(timerProgress);
  }

  // Footer / Actions
  const actionsContainer = renderButtons(options.buttons, classes);
  if (actionsContainer) {
    modal.appendChild(actionsContainer);
  }

  // Custom footer
  if (options.footer) {
    const footer = document.createElement('div');
    footer.className = classes.footer;

    if (typeof options.footer === 'string') {
      footer.innerHTML = options.sanitizer
        ? options.sanitizer(options.footer)
        : sanitize(options.footer);
    } else {
      footer.appendChild(options.footer.cloneNode(true));
    }

    modal.appendChild(footer);
  }

  container.appendChild(modal);
  root.appendChild(container);

  return {
    root,
    backdrop,
    modal,
    closeButton,
    titleElement,
    contentElement,
    inputElement,
    inputWrapper,
    actionsContainer,
    timerProgress,
    ids,
  };
}

// ============================================================================
// Loading State
// ============================================================================

export function showLoadingState(
  modal: HTMLElement,
  text?: string,
  prefix = 'modal'
): HTMLElement {
  const classes = getClassNames(prefix);

  // Create loading overlay
  const loading = document.createElement('div');
  loading.className = classes.loading;

  const spinner = document.createElement('div');
  spinner.className = classes.loadingSpinner;
  spinner.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  `;
  loading.appendChild(spinner);

  if (text) {
    const loadingText = document.createElement('div');
    loadingText.className = `${classes.loading}-text`;
    loadingText.textContent = text;
    loading.appendChild(loadingText);
  }

  modal.appendChild(loading);
  modal.classList.add(`${classes.modal}--loading`);

  return loading;
}

export function hideLoadingState(modal: HTMLElement, prefix = 'modal'): void {
  const classes = getClassNames(prefix);
  const loading = modal.querySelector(`.${classes.loading}`);
  if (loading) {
    loading.remove();
  }
  modal.classList.remove(`${classes.modal}--loading`);
}
