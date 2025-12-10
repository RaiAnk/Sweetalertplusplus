/**
 * Modal Core
 * The main modal engine with proper lifecycle, events, and accessibility
 */

import type {
  ModalOptions,
  ModalResult,
  ModalInstance,
  DismissReason,
  GlobalConfig,
  ButtonConfig,
  FormSchema,
} from './types';

import { createFocusTrap, FocusTrap } from './focus-trap';
import {
  lockScroll,
  unlockScroll,
  makeOthersInert,
  removeInert,
  announceModalOpen,
  announceError,
  announceLoading,
} from './a11y';
import { resolveAnimation, animateEnter, animateExit, createTimerAnimation, TimerAnimation } from './animation';
import { render, RenderedModal, showLoadingState, hideLoadingState } from './renderer';
import { renderForm, FormController } from '../form/form-renderer';

// ============================================================================
// Global State
// ============================================================================

const activeModals: Map<string, ModalController> = new Map();
let globalConfig: GlobalConfig = {};
let baseZIndex = 10000;

/**
 * Set global configuration
 */
export function setGlobalConfig(config: GlobalConfig): void {
  globalConfig = { ...globalConfig, ...config };
  if (config.baseZIndex !== undefined) {
    baseZIndex = config.baseZIndex;
  }
}

/**
 * Get global configuration
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * Get next z-index for stacking
 */
function getNextZIndex(): number {
  const step = globalConfig.zIndexStep || 10;
  return baseZIndex + (activeModals.size * step);
}

// ============================================================================
// Modal Controller
// ============================================================================

interface ModalController {
  instance: ModalInstance;
  elements: RenderedModal;
  focusTrap: FocusTrap;
  timerAnimation: TimerAnimation | null;
  formController: FormController | null;
  result: ModalResult;
  resolve: (result: ModalResult) => void;
  reject: (error: Error) => void;
  cleanup: () => void;
}

// ============================================================================
// Core Modal Function
// ============================================================================

export async function modal<T = any>(options: ModalOptions<T>): Promise<ModalResult<T>> {
  // Merge with global defaults
  const mergedOptions: ModalOptions<T> = {
    ...globalConfig.defaults,
    ...options,
    a11y: { ...globalConfig.a11y, ...options.a11y },
    animation: options.animation ?? globalConfig.animation,
  };

  // Determine container
  const containerSelector = mergedOptions.container || globalConfig.container || 'body';
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector) as HTMLElement
    : containerSelector;

  if (!container) {
    throw new Error(`Modal container not found: ${containerSelector}`);
  }

  return new Promise((resolve, reject) => {
    // Render the modal
    const elements = render(mergedOptions, globalConfig.classPrefix);

    // Track event listeners for cleanup
    const eventListeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = [];

    function addEventListenerWithCleanup(target: EventTarget, type: string, handler: EventListener): void {
      target.addEventListener(type, handler);
      eventListeners.push({ target, type, handler });
    }

    // Track intervals for cleanup
    let tickIntervalId: ReturnType<typeof setInterval> | null = null;

    // Set z-index
    const zIndex = mergedOptions.zIndex ?? getNextZIndex();
    elements.root.style.zIndex = String(zIndex);

    // Create result object
    const result: ModalResult<T> = {
      confirmed: false,
      denied: false,
      dismissed: false,
    };

    // Create focus trap
    const focusTrap = createFocusTrap({
      container: elements.modal,
      initialFocus: mergedOptions.a11y?.autoFocus || 'first-focusable',
      returnFocus: mergedOptions.a11y?.returnFocus !== false,
      escapeDeactivates: mergedOptions.a11y?.closeOnEscape !== false,
      onEscape: () => {
        if (mergedOptions.a11y?.closeOnEscape !== false) {
          closeModal('escape');
        }
      },
    });

    // Timer animation
    let timerAnimation: TimerAnimation | null = null;

    // Form controller
    let formController: FormController | null = null;

    // Create instance (will be updated with form methods after controller is created)
    const instance: ModalInstance = {
      id: elements.ids.modalId,
      element: elements.modal,
      options: mergedOptions,
      isOpen: true,

      close: (customResult) => closeModal('programmatic', customResult),

      update: (newOptions) => {
        updateModal(newOptions);
      },

      getInputValue: () => {
        return getInputValue();
      },

      setInputValue: (value) => {
        setInputValue(value);
      },

      showValidationError: (message) => {
        showValidationMessage(message);
      },

      clearValidationError: () => {
        clearValidationMessage();
      },

      setButtonState: (button, state) => {
        setButtonState(button, state);
      },

      showLoading: (text) => {
        showLoading(text);
      },

      hideLoading: () => {
        hideLoading();
      },

      timer: {
        pause: () => timerAnimation?.pause(),
        resume: () => timerAnimation?.resume(),
        reset: () => timerAnimation?.reset(),
        getRemaining: () => {
          if (!timerAnimation || !mergedOptions.timer) return 0;
          const progress = timerAnimation.getProgress();
          return Math.max(0, mergedOptions.timer * (1 - progress));
        },
      },

      // Form methods
      getFormData: () => {
        return formController?.getData() ?? {};
      },

      setFormData: (data) => {
        formController?.setData(data);
      },

      validateForm: async () => {
        if (!formController) return { valid: true, errors: {} };
        return formController.validate();
      },
    };

    // Cleanup function to remove all event listeners and intervals
    function cleanup(): void {
      // Remove all event listeners
      for (const { target, type, handler } of eventListeners) {
        target.removeEventListener(type, handler);
      }
      eventListeners.length = 0;

      // Clear tick interval
      if (tickIntervalId) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
      }

      // Destroy form controller
      if (formController) {
        formController.destroy();
        formController = null;
      }
    }

    // Create controller
    const controller: ModalController = {
      instance,
      elements,
      focusTrap,
      timerAnimation,
      formController,
      result,
      resolve,
      reject,
      cleanup,
    };

    // Store in active modals
    activeModals.set(instance.id, controller);

    // ============================================================================
    // Event Handlers
    // ============================================================================

    function handleBackdropClick(event: MouseEvent) {
      if (event.target === elements.backdrop || event.target === elements.root.querySelector('.modal-container')) {
        if (mergedOptions.backdrop === 'static') {
          // Shake animation for static backdrop
          elements.modal.classList.add('modal-dialog--shake');
          setTimeout(() => elements.modal.classList.remove('modal-dialog--shake'), 300);
          return;
        }
        if (mergedOptions.closeOnBackdrop !== false) {
          closeModal('backdrop');
        }
      }
    }

    function handleButtonClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const button = target.closest('[data-action]') as HTMLElement;
      if (!button) return;

      const action = button.dataset.action;

      switch (action) {
        case 'confirm':
          handleConfirm();
          break;
        case 'deny':
          handleDeny();
          break;
        case 'cancel':
          closeModal('cancel');
          break;
        case 'close':
          closeModal('close');
          break;
        default:
          // Custom button
          const customBtn = mergedOptions.buttons?.custom?.find(b => b.id === action);
          if (customBtn?.onClick) {
            customBtn.onClick();
          }
      }
    }

    async function handleConfirm() {
      // Handle form validation if form is present
      if (formController) {
        const formValidation = await formController.validate();
        if (!formValidation.valid) {
          return; // Form has errors, don't proceed
        }
      }

      const inputValue = formController ? formController.getData() : getInputValue();

      // Validate input if present (for legacy input support)
      if (mergedOptions.input?.validate) {
        const validationResult = await mergedOptions.input.validate(inputValue);
        if (typeof validationResult === 'string') {
          showValidationMessage(validationResult);
          return;
        }
        if (validationResult === false) {
          return;
        }
      }

      // Call preConfirm hook
      let finalValue = inputValue;
      if (mergedOptions.hooks?.onBeforeConfirm) {
        try {
          showLoading();
          finalValue = await mergedOptions.hooks.onBeforeConfirm(inputValue);
          hideLoading();
        } catch (error) {
          hideLoading();
          if (error instanceof Error) {
            showValidationMessage(error.message);
          }
          return;
        }
      }

      result.confirmed = true;
      result.value = finalValue;
      await closeModal('programmatic');
    }

    function handleDeny() {
      result.denied = true;
      closeModal('programmatic');
    }

    function handleInputChange(event: Event) {
      clearValidationMessage();
      if (mergedOptions.hooks?.onInputChange) {
        mergedOptions.hooks.onInputChange(getInputValue(), instance);
      }
    }

    // ============================================================================
    // Helper Functions
    // ============================================================================

    function getInputValue(): any {
      if (!elements.inputElement) return undefined;

      const input = elements.inputElement;

      if (input.tagName === 'SELECT') {
        return (input as HTMLSelectElement).value;
      }

      if (input instanceof HTMLInputElement) {
        switch (input.type) {
          case 'checkbox':
            // Get all checked checkboxes in group
            const checkboxes = elements.inputWrapper?.querySelectorAll('input[type="checkbox"]:checked');
            return checkboxes ? Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value) : [];

          case 'radio':
            const checked = elements.inputWrapper?.querySelector('input[type="radio"]:checked');
            return checked ? (checked as HTMLInputElement).value : undefined;

          case 'file':
            return input.multiple ? Array.from(input.files || []) : input.files?.[0];

          case 'number':
          case 'range':
            return input.valueAsNumber;

          default:
            return input.value;
        }
      }

      return (input as HTMLTextAreaElement).value;
    }

    function setInputValue(value: any): void {
      if (!elements.inputElement) return;

      const input = elements.inputElement;

      if (input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
        input.value = String(value);
      } else if (input instanceof HTMLInputElement) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          // Handle group
          const inputs = elements.inputWrapper?.querySelectorAll('input');
          inputs?.forEach(inp => {
            const inputEl = inp as HTMLInputElement;
            if (input.type === 'checkbox') {
              inputEl.checked = Array.isArray(value) && value.includes(inputEl.value);
            } else {
              inputEl.checked = inputEl.value === String(value);
            }
          });
        } else {
          input.value = String(value);
        }
      }
    }

    function showValidationMessage(message: string): void {
      const errorEl = elements.inputWrapper?.querySelector('.modal-input-error');
      if (errorEl) {
        errorEl.textContent = message;
        elements.inputWrapper?.classList.add('modal-input--error');
        announceError(message);
      }
    }

    function clearValidationMessage(): void {
      const errorEl = elements.inputWrapper?.querySelector('.modal-input-error');
      if (errorEl) {
        errorEl.textContent = '';
        elements.inputWrapper?.classList.remove('modal-input--error');
      }
    }

    function setButtonState(button: 'confirm' | 'deny' | 'cancel', state: Partial<ButtonConfig>): void {
      const btn = elements.modal.querySelector(`[data-action="${button}"]`) as HTMLButtonElement;
      if (!btn) return;

      if (state.text !== undefined) btn.textContent = state.text;
      if (state.disabled !== undefined) btn.disabled = state.disabled;
      if (state.className !== undefined) btn.className = `modal-btn ${state.className}`;
    }

    function showLoading(text?: string): void {
      showLoadingState(elements.modal, text, globalConfig.classPrefix);
      announceLoading(true, text);
    }

    function hideLoading(): void {
      hideLoadingState(elements.modal, globalConfig.classPrefix);
      announceLoading(false);
    }

    function updateModal(newOptions: Partial<ModalOptions>): void {
      // Update title
      if (newOptions.title !== undefined && elements.titleElement) {
        if (typeof newOptions.title === 'string') {
          elements.titleElement.textContent = newOptions.title;
        } else {
          elements.titleElement.innerHTML = '';
          elements.titleElement.appendChild(newOptions.title.cloneNode(true));
        }
      }

      // Update content
      if ((newOptions.text !== undefined || newOptions.html !== undefined) && elements.contentElement) {
        if (newOptions.html) {
          if (typeof newOptions.html === 'string') {
            elements.contentElement.innerHTML = newOptions.html;
          } else {
            elements.contentElement.innerHTML = '';
            elements.contentElement.appendChild(newOptions.html.cloneNode(true));
          }
        } else if (newOptions.text) {
          elements.contentElement.textContent = newOptions.text;
        }
      }

      // Merge options
      Object.assign(mergedOptions, newOptions);
    }

    async function closeModal(reason: DismissReason, customResult?: Partial<ModalResult>): Promise<void> {
      if (!instance.isOpen) return;

      // Merge custom result
      if (customResult) {
        Object.assign(result, customResult);
      }

      // Set dismiss info if not confirmed/denied
      if (!result.confirmed && !result.denied) {
        result.dismissed = true;
        result.dismissReason = reason;
      }

      // Call onBeforeClose hook
      if (mergedOptions.hooks?.onBeforeClose) {
        const shouldClose = await mergedOptions.hooks.onBeforeClose(instance, result);
        if (shouldClose === false) {
          return;
        }
      }

      instance.isOpen = false;

      // Clean up all event listeners and intervals
      cleanup();

      // Stop timer
      if (timerAnimation) {
        timerAnimation.destroy();
      }

      // Deactivate focus trap
      focusTrap.deactivate();

      // Animate out
      const animConfig = resolveAnimation(mergedOptions.animation);
      await animateExit(elements.modal, elements.backdrop, animConfig);

      // Remove from DOM
      elements.root.remove();

      // Remove from active modals
      activeModals.delete(instance.id);

      // Restore scroll and inert if this was the last modal
      if (activeModals.size === 0) {
        if (mergedOptions.scrollBehavior !== 'none') {
          unlockScroll();
        }
        removeInert(elements.root);
      }

      // Call onClose hook
      if (mergedOptions.hooks?.onClose) {
        mergedOptions.hooks.onClose(result);
      }

      // Resolve promise
      resolve(result);

      // Call onAfterClose hook
      if (mergedOptions.hooks?.onAfterClose) {
        mergedOptions.hooks.onAfterClose(result);
      }
    }

    // ============================================================================
    // Initialize Modal
    // ============================================================================

    // Call onBeforeOpen hook (now that instance exists)
    (async () => {
      if (mergedOptions.hooks?.onBeforeOpen) {
        const shouldContinue = await mergedOptions.hooks.onBeforeOpen(instance);
        if (shouldContinue === false) {
          cleanup();
          elements.root.remove();
          resolve({
            confirmed: false,
            denied: false,
            dismissed: true,
            dismissReason: 'programmatic',
          });
          return;
        }
      }

      // Continue with modal initialization after hook check
      initializeModal();
    })();

    function initializeModal(): void {
      // Add event listeners with cleanup tracking
      addEventListenerWithCleanup(elements.root, 'click', handleBackdropClick as EventListener);
      addEventListenerWithCleanup(elements.modal, 'click', handleButtonClick as EventListener);

      if (elements.inputElement) {
        addEventListenerWithCleanup(elements.inputElement, 'input', handleInputChange as EventListener);
        addEventListenerWithCleanup(elements.inputElement, 'change', handleInputChange as EventListener);
      }

      // Render form if provided
      if (mergedOptions.form) {
        const formContainer = document.createElement('div');
        formContainer.className = 'swal-form-container';

        formController = renderForm(mergedOptions.form, formContainer, {
          initialData: mergedOptions.formData,
          onChange: mergedOptions.onFormChange,
          onValidate: mergedOptions.onFormValidate,
        });

        // Insert form into content area
        const contentArea = elements.contentElement || elements.modal.querySelector('.modal-content');
        if (contentArea) {
          contentArea.appendChild(formContainer);
        }
      }

      // Add to DOM
      container.appendChild(elements.root);

      // Lock scroll (respecting scrollBehavior option)
      if (mergedOptions.scrollBehavior !== 'none') {
        lockScroll();
      }

      // Make others inert
      if (mergedOptions.a11y?.trapFocus !== false) {
        makeOthersInert(elements.root);
      }

      // Animate in
      const animConfig = resolveAnimation(mergedOptions.animation);
      animateEnter(elements.modal, elements.backdrop, animConfig).then(() => {
        // Call onAfterOpen hook
        if (mergedOptions.hooks?.onAfterOpen) {
          mergedOptions.hooks.onAfterOpen(instance);
        }
      });

      // Activate focus trap
      focusTrap.activate();

      // Announce to screen readers
      announceModalOpen(mergedOptions);

      // Setup timer
      if (mergedOptions.timer && mergedOptions.timer > 0) {
        if (elements.timerProgress) {
          timerAnimation = createTimerAnimation(
            elements.timerProgress,
            mergedOptions.timer,
            () => closeModal('timer')
          );
          timerAnimation.start();

          // Pause on hover if enabled
          if (mergedOptions.pauseTimerOnHover) {
            const handleMouseEnter = () => timerAnimation?.pause();
            const handleMouseLeave = () => timerAnimation?.resume();
            addEventListenerWithCleanup(elements.modal, 'mouseenter', handleMouseEnter);
            addEventListenerWithCleanup(elements.modal, 'mouseleave', handleMouseLeave);
          }
        } else {
          const timerId = setTimeout(() => closeModal('timer'), mergedOptions.timer);
          // Track timeout for cleanup (wrap in a listener style for consistency)
          eventListeners.push({
            target: window,
            type: '__timer__',
            handler: (() => clearTimeout(timerId)) as EventListener,
          });
        }

        // Timer tick callback with proper cleanup
        if (mergedOptions.hooks?.onTimerTick && timerAnimation) {
          tickIntervalId = setInterval(() => {
            if (!instance.isOpen) {
              if (tickIntervalId) {
                clearInterval(tickIntervalId);
                tickIntervalId = null;
              }
              return;
            }
            const remaining = instance.timer.getRemaining();
            mergedOptions.hooks!.onTimerTick!(remaining);
          }, 100);
        }
      }

      // Store timer animation in controller
      controller.timerAnimation = timerAnimation;

      // Call onOpen hook
      if (mergedOptions.hooks?.onOpen) {
        mergedOptions.hooks.onOpen(instance);
      }
    }
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Close all open modals
 */
export async function closeAll(): Promise<void> {
  const promises: Promise<void>[] = [];

  activeModals.forEach(controller => {
    promises.push(controller.instance.close());
  });

  await Promise.all(promises);
}

/**
 * Close a specific modal by ID
 */
export async function close(id: string): Promise<boolean> {
  const controller = activeModals.get(id);
  if (!controller) return false;

  await controller.instance.close();
  return true;
}

/**
 * Get currently active modal (topmost)
 */
export function getActiveModal(): ModalInstance | null {
  if (activeModals.size === 0) return null;

  const controllers = Array.from(activeModals.values());
  return controllers[controllers.length - 1]?.instance || null;
}

/**
 * Get all active modals
 */
export function getActiveModals(): ModalInstance[] {
  return Array.from(activeModals.values()).map(c => c.instance);
}

/**
 * Check if any modal is open
 */
export function isAnyOpen(): boolean {
  return activeModals.size > 0;
}

/**
 * Check if a specific modal is open
 */
export function isOpen(id: string): boolean {
  return activeModals.has(id);
}

/**
 * Update a modal by ID
 */
export function update(id: string, options: Partial<ModalOptions>): boolean {
  const controller = activeModals.get(id);
  if (!controller) return false;

  controller.instance.update(options);
  return true;
}

// ============================================================================
// MicroModal-like API
// ============================================================================

/**
 * Show a modal by ID (for declarative modals)
 */
export function show(id: string, options?: Partial<ModalOptions>): Promise<ModalResult> {
  const element = document.getElementById(id);
  if (!element) {
    return Promise.reject(new Error(`Modal element not found: ${id}`));
  }

  // Parse options from data attributes
  const dataOptions = parseDataAttributes(element);

  return modal({
    ...dataOptions,
    ...options,
    id,
  });
}

/**
 * Parse modal options from data attributes
 */
function parseDataAttributes(element: HTMLElement): Partial<ModalOptions> {
  const options: Partial<ModalOptions> = {};
  const dataset = element.dataset;

  if (dataset.title) options.title = dataset.title;
  if (dataset.closeOnBackdrop) options.closeOnBackdrop = dataset.closeOnBackdrop !== 'false';
  if (dataset.closeOnEscape) options.a11y = { closeOnEscape: dataset.closeOnEscape !== 'false' };
  if (dataset.animation) options.animation = dataset.animation as any;

  return options;
}

// ============================================================================
// Declarative Modal Support
// ============================================================================

/**
 * Initialize declarative modals (data-modal-trigger)
 */
export function initDeclarativeModals(): void {
  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest('[data-modal-trigger]') as HTMLElement;
    if (!trigger) return;

    const modalId = trigger.dataset.modalTrigger;
    if (modalId) {
      event.preventDefault();
      show(modalId);
    }
  });
}
