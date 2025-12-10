/**
 * Accessibility Module
 * Complete A11y support: ARIA, screen readers, announcements, reduced motion
 */
import type { ModalOptions, ModalRole } from './types';
/**
 * Announce a message to screen readers
 */
export declare function announce(message: string, options?: {
    assertive?: boolean;
    delay?: number;
}): void;
/**
 * Announce modal opening
 */
export declare function announceModalOpen(options: ModalOptions): void;
/**
 * Announce validation error
 */
export declare function announceError(message: string): void;
/**
 * Announce loading state
 */
export declare function announceLoading(loading: boolean, text?: string): void;
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
export declare function buildAriaAttributes(options: ModalOptions, ids: {
    titleId: string;
    contentId: string;
}): AriaAttributes;
/**
 * Apply ARIA attributes to element
 */
export declare function applyAriaAttributes(element: HTMLElement, attrs: AriaAttributes): void;
/**
 * Check if user prefers reduced motion
 */
export declare function prefersReducedMotion(): boolean;
/**
 * Watch for reduced motion preference changes
 */
export declare function watchReducedMotion(callback: (reduced: boolean) => void): () => void;
/**
 * Detect if a screen reader might be active
 * Note: This is unreliable and should only be used for enhancements
 */
export declare function mightHaveScreenReader(): boolean;
/**
 * Check if an element is focusable
 */
export declare function isFocusable(element: Element): boolean;
/**
 * Get all focusable elements within a container
 */
export declare function getFocusableElements(container: HTMLElement): HTMLElement[];
/**
 * Lock body scroll
 */
export declare function lockScroll(): void;
/**
 * Unlock body scroll
 */
export declare function unlockScroll(): void;
/**
 * Force unlock all scroll locks
 */
export declare function forceUnlockScroll(): void;
/**
 * Make all siblings of modal inert
 */
export declare function makeOthersInert(modalContainer: HTMLElement): void;
/**
 * Remove inert from siblings
 */
export declare function removeInert(modalContainer: HTMLElement): void;
/**
 * Calculate contrast ratio between two colors
 */
export declare function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number;
/**
 * Check if contrast meets WCAG AA standard
 */
export declare function meetsContrastAA(foreground: [number, number, number], background: [number, number, number], isLargeText?: boolean): boolean;
/**
 * Check if contrast meets WCAG AAA standard
 */
export declare function meetsContrastAAA(foreground: [number, number, number], background: [number, number, number], isLargeText?: boolean): boolean;
//# sourceMappingURL=a11y.d.ts.map