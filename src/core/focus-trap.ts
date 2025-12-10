/**
 * Focus Trap - Accessible focus management
 * Properly traps focus within modal with full keyboard navigation support
 */

const FOCUSABLE_SELECTORS = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"]):not([type="hidden"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(',');

export interface FocusTrapOptions {
  /** Element to trap focus within */
  container: HTMLElement;
  /** Element to focus first (or selector) */
  initialFocus?: HTMLElement | string | 'first' | 'last';
  /** Element to return focus to on deactivate */
  returnFocusTo?: HTMLElement | null;
  /** Whether to return focus on deactivate */
  returnFocus?: boolean;
  /** Callback when ESC is pressed */
  onEscape?: () => void;
  /** Allow ESC to close */
  escapeDeactivates?: boolean;
  /** Callback when focus escapes (for edge cases) */
  onFocusEscape?: () => void;
}

export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
  pause: () => void;
  resume: () => void;
  updateContainer: (container: HTMLElement) => void;
  isActive: () => boolean;
}

export function createFocusTrap(options: FocusTrapOptions): FocusTrap {
  let {
    container,
    initialFocus = 'first',
    returnFocusTo = document.activeElement as HTMLElement,
    returnFocus = true,
    onEscape,
    escapeDeactivates = true,
  } = options;

  let active = false;
  let paused = false;
  let lastFocusedElement: HTMLElement | null = null;

  // Sentinel elements to catch focus escaping
  let startSentinel: HTMLElement | null = null;
  let endSentinel: HTMLElement | null = null;

  function getFocusableElements(): HTMLElement[] {
    const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    return elements.filter(el => {
      // Check if visible and not hidden
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
      return true;
    });
  }

  function getFirstFocusable(): HTMLElement | null {
    const focusable = getFocusableElements();
    return focusable[0] || null;
  }

  function getLastFocusable(): HTMLElement | null {
    const focusable = getFocusableElements();
    return focusable[focusable.length - 1] || null;
  }

  function getInitialFocusElement(): HTMLElement | null {
    if (!initialFocus) return getFirstFocusable();

    if (initialFocus === 'first') return getFirstFocusable();
    if (initialFocus === 'last') return getLastFocusable();

    if (typeof initialFocus === 'string') {
      return container.querySelector<HTMLElement>(initialFocus);
    }

    return initialFocus;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!active || paused) return;

    // Handle Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();

      if (onEscape) {
        onEscape();
      }

      if (escapeDeactivates) {
        // Don't deactivate here - let the modal handle it
      }
      return;
    }

    // Handle Tab
    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift + Tab: backwards
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab: forwards
        if (activeElement === last || !container.contains(activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  function handleFocusIn(event: FocusEvent) {
    if (!active || paused) return;

    const target = event.target as HTMLElement;

    // If focus went to a sentinel, wrap around
    if (target === startSentinel) {
      const last = getLastFocusable();
      if (last) last.focus();
      return;
    }

    if (target === endSentinel) {
      const first = getFirstFocusable();
      if (first) first.focus();
      return;
    }

    // If focus escaped the container, bring it back
    if (!container.contains(target)) {
      // Try to focus last known element, or first focusable
      if (lastFocusedElement && container.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
      } else {
        const first = getFirstFocusable();
        if (first) first.focus();
      }
      return;
    }

    // Track last focused element within container
    lastFocusedElement = target;
  }

  function createSentinels() {
    // Create invisible focus sentinels at the start and end
    startSentinel = document.createElement('div');
    startSentinel.setAttribute('tabindex', '0');
    startSentinel.setAttribute('aria-hidden', 'true');
    startSentinel.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

    endSentinel = document.createElement('div');
    endSentinel.setAttribute('tabindex', '0');
    endSentinel.setAttribute('aria-hidden', 'true');
    endSentinel.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

    container.insertBefore(startSentinel, container.firstChild);
    container.appendChild(endSentinel);
  }

  function removeSentinels() {
    if (startSentinel && startSentinel.parentNode) {
      startSentinel.parentNode.removeChild(startSentinel);
    }
    if (endSentinel && endSentinel.parentNode) {
      endSentinel.parentNode.removeChild(endSentinel);
    }
    startSentinel = null;
    endSentinel = null;
  }

  function activate() {
    if (active) return;
    active = true;
    paused = false;

    // Store the element to return focus to
    if (returnFocus && !returnFocusTo) {
      returnFocusTo = document.activeElement as HTMLElement;
    }

    // Create sentinels for additional focus catching
    createSentinels();

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    // Focus initial element
    requestAnimationFrame(() => {
      const initialEl = getInitialFocusElement();
      if (initialEl) {
        initialEl.focus();
        lastFocusedElement = initialEl;
      }
    });
  }

  function deactivate() {
    if (!active) return;
    active = false;
    paused = false;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocusIn, true);

    // Remove sentinels
    removeSentinels();

    // Return focus
    if (returnFocus && returnFocusTo && typeof returnFocusTo.focus === 'function') {
      // Use setTimeout to ensure focus returns after modal closes
      setTimeout(() => {
        if (returnFocusTo && document.body.contains(returnFocusTo)) {
          returnFocusTo.focus();
        }
      }, 0);
    }

    lastFocusedElement = null;
  }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
  }

  function updateContainer(newContainer: HTMLElement) {
    if (active) {
      removeSentinels();
      container = newContainer;
      createSentinels();
    } else {
      container = newContainer;
    }
  }

  function isActive() {
    return active && !paused;
  }

  return {
    activate,
    deactivate,
    pause,
    resume,
    updateContainer,
    isActive,
  };
}

/**
 * Focus visible polyfill check
 * Helps manage :focus-visible styling
 */
export function supportsNativeFocusVisible(): boolean {
  try {
    document.querySelector(':focus-visible');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the element that should receive focus when modal opens
 */
export function getAutoFocusTarget(
  container: HTMLElement,
  strategy: string
): HTMLElement | null {
  switch (strategy) {
    case 'first-focusable':
      return container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);

    case 'confirm':
      return container.querySelector<HTMLElement>('[data-action="confirm"]') ||
             container.querySelector<HTMLElement>('button[type="submit"]');

    case 'cancel':
      return container.querySelector<HTMLElement>('[data-action="cancel"]');

    case 'input':
      return container.querySelector<HTMLElement>('input, textarea, select');

    case 'none':
      return null;

    default:
      // Treat as selector
      if (strategy) {
        return container.querySelector<HTMLElement>(strategy);
      }
      return container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
  }
}
