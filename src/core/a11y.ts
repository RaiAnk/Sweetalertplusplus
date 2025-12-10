/**
 * Accessibility Module
 * Complete A11y support: ARIA, screen readers, announcements, reduced motion
 */

import type { ModalOptions, A11yConfig, ModalRole } from './types';

// ============================================================================
// Live Region Announcements
// ============================================================================

let liveRegion: HTMLElement | null = null;
let politeRegion: HTMLElement | null = null;

function createLiveRegion(assertive = true): HTMLElement {
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.className = 'modal-live-region';
  region.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(region);
  return region;
}

function getLiveRegion(polite = false): HTMLElement {
  if (polite) {
    if (!politeRegion) {
      politeRegion = createLiveRegion(false);
    }
    return politeRegion;
  }

  if (!liveRegion) {
    liveRegion = createLiveRegion(true);
  }
  return liveRegion;
}

/**
 * Announce a message to screen readers
 */
export function announce(
  message: string,
  options: { assertive?: boolean; delay?: number } = {}
): void {
  const { assertive = true, delay = 100 } = options;
  const region = getLiveRegion(!assertive);

  // Clear first to ensure re-announcement of same message
  region.textContent = '';

  // Small delay ensures screen readers catch the change
  setTimeout(() => {
    region.textContent = message;
  }, delay);

  // Clear after announcement
  setTimeout(() => {
    region.textContent = '';
  }, delay + 3000);
}

/**
 * Announce modal opening
 */
export function announceModalOpen(options: ModalOptions): void {
  const parts: string[] = [];

  if (options.a11y?.announceOnOpen) {
    announce(options.a11y.announceOnOpen);
    return;
  }

  // Build announcement from modal content
  if (options.title) {
    const titleText = typeof options.title === 'string'
      ? options.title
      : options.title.textContent || '';
    parts.push(titleText);
  }

  if (options.text) {
    parts.push(options.text);
  }

  if (options.icon && options.icon !== 'none') {
    const iconAnnouncements: Record<string, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      question: 'Question',
      loading: 'Loading',
    };
    if (typeof options.icon === 'string' && iconAnnouncements[options.icon]) {
      parts.unshift(iconAnnouncements[options.icon] + ':');
    }
  }

  if (parts.length > 0) {
    announce(parts.join('. '), { assertive: true });
  }
}

/**
 * Announce validation error
 */
export function announceError(message: string): void {
  announce(`Error: ${message}`, { assertive: true });
}

/**
 * Announce loading state
 */
export function announceLoading(loading: boolean, text?: string): void {
  if (loading) {
    announce(text || 'Loading, please wait...', { assertive: false });
  } else {
    announce('Loading complete', { assertive: false });
  }
}

// ============================================================================
// ARIA Attribute Management
// ============================================================================

export interface AriaAttributes {
  role: ModalRole;
  'aria-modal': 'true';
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

/**
 * Build ARIA attributes for modal
 */
export function buildAriaAttributes(
  options: ModalOptions,
  ids: { titleId: string; contentId: string }
): AriaAttributes {
  const a11y = options.a11y || {};
  const attrs: AriaAttributes = {
    role: a11y.role || (options.buttons?.confirm || options.buttons?.deny ? 'alertdialog' : 'dialog'),
    'aria-modal': 'true',
  };

  // Labeling
  if (a11y.ariaLabel) {
    attrs['aria-label'] = a11y.ariaLabel;
  } else if (a11y.ariaLabelledBy) {
    attrs['aria-labelledby'] = a11y.ariaLabelledBy;
  } else if (options.title) {
    attrs['aria-labelledby'] = ids.titleId;
  }

  // Description
  if (a11y.ariaDescribedBy) {
    attrs['aria-describedby'] = a11y.ariaDescribedBy;
  } else if (options.text || options.html) {
    attrs['aria-describedby'] = ids.contentId;
  }

  return attrs;
}

/**
 * Apply ARIA attributes to element
 */
export function applyAriaAttributes(
  element: HTMLElement,
  attrs: AriaAttributes
): void {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined) {
      element.setAttribute(key, value);
    }
  });
}

// ============================================================================
// Reduced Motion
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  return query?.matches ?? false;
}

/**
 * Watch for reduced motion preference changes
 */
export function watchReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!query) return () => {};

  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  // Modern browsers
  if (query.addEventListener) {
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }

  // Legacy support
  query.addListener?.(handler);
  return () => query.removeListener?.(handler);
}

// ============================================================================
// Screen Reader Detection (best effort)
// ============================================================================

/**
 * Detect if a screen reader might be active
 * Note: This is unreliable and should only be used for enhancements
 */
export function mightHaveScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common indicators
  const html = document.documentElement;

  // Some screen readers add data attributes
  if (html.dataset.acsb || html.dataset.jaws) return true;

  // NVDA detection
  if ((window as any).nvdaController) return true;

  // VoiceOver on Mac - check for accessibility features
  if (navigator.userAgent.includes('Mac') && (window as any).speechSynthesis) {
    // Rough heuristic, not reliable
  }

  return false;
}

// ============================================================================
// Focus Management Helpers
// ============================================================================

/**
 * Check if an element is focusable
 */
export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;

  // Check if disabled
  if ((element as HTMLButtonElement).disabled) return false;

  // Check tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex === '-1') return false;

  // Check visibility
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  // Check if naturally focusable
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) {
    if (element.tagName === 'A' && !element.hasAttribute('href')) return false;
    return true;
  }

  // Check contenteditable
  if (element.contentEditable === 'true') return true;

  // Check tabindex
  return tabindex !== null && parseInt(tabindex, 10) >= 0;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const all = container.querySelectorAll<HTMLElement>('*');
  return Array.from(all).filter(isFocusable);
}

// ============================================================================
// Scroll Lock
// ============================================================================

let scrollLockCount = 0;
let originalStyles: { overflow: string; paddingRight: string } | null = null;

/**
 * Lock body scroll
 */
export function lockScroll(): void {
  scrollLockCount++;

  if (scrollLockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
}

/**
 * Unlock body scroll
 */
export function unlockScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0 && originalStyles) {
    document.body.style.overflow = originalStyles.overflow;
    document.body.style.paddingRight = originalStyles.paddingRight;
    originalStyles = null;
  }
}

/**
 * Force unlock all scroll locks
 */
export function forceUnlockScroll(): void {
  scrollLockCount = 0;
  if (originalStyles) {
    document.body.style.overflow = originalStyles.overflow;
    document.body.style.paddingRight = originalStyles.paddingRight;
    originalStyles = null;
  }
}

// ============================================================================
// Inert Management
// ============================================================================

const inertElements = new WeakMap<HTMLElement, boolean>();

/**
 * Make all siblings of modal inert
 */
export function makeOthersInert(modalContainer: HTMLElement): void {
  const siblings = document.body.children;

  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i] as HTMLElement;

    // Skip the modal container itself
    if (sibling === modalContainer || sibling.contains(modalContainer)) continue;

    // Skip live regions
    if (sibling.getAttribute('aria-live')) continue;

    // Store original inert state
    if (!sibling.hasAttribute('inert')) {
      inertElements.set(sibling, false);
    }

    sibling.setAttribute('inert', '');
    sibling.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Remove inert from siblings
 */
export function removeInert(modalContainer: HTMLElement): void {
  const siblings = document.body.children;

  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i] as HTMLElement;

    if (sibling === modalContainer) continue;

    // Only remove if we added it
    if (inertElements.has(sibling)) {
      sibling.removeAttribute('inert');
      sibling.removeAttribute('aria-hidden');
      inertElements.delete(sibling);
    }
  }
}

// ============================================================================
// Color Contrast Check
// ============================================================================

/**
 * Calculate relative luminance
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard
 */
export function meetsContrastAA(
  foreground: [number, number, number],
  background: [number, number, number],
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard
 */
export function meetsContrastAAA(
  foreground: [number, number, number],
  background: [number, number, number],
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}
