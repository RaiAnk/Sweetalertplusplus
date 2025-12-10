/**
 * Focus Trap - Accessible focus management
 * Properly traps focus within modal with full keyboard navigation support
 */
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
export declare function createFocusTrap(options: FocusTrapOptions): FocusTrap;
/**
 * Focus visible polyfill check
 * Helps manage :focus-visible styling
 */
export declare function supportsNativeFocusVisible(): boolean;
/**
 * Get the element that should receive focus when modal opens
 */
export declare function getAutoFocusTarget(container: HTMLElement, strategy: string): HTMLElement | null;
//# sourceMappingURL=focus-trap.d.ts.map