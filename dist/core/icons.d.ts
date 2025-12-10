/**
 * Icon System
 * Lightweight, accessible SVG icons with customization support
 */
import type { IconType } from './types';
/**
 * Register a custom icon
 */
export declare function registerIcon(name: string, icon: string | HTMLElement): void;
/**
 * Unregister a custom icon
 */
export declare function unregisterIcon(name: string): void;
/**
 * Clear all custom icons
 */
export declare function clearCustomIcons(): void;
export interface IconOptions {
    type: IconType | string;
    color?: string;
    size?: number | string;
    className?: string;
    ariaLabel?: string;
}
/**
 * Create an icon element
 */
export declare function createIcon(options: IconOptions): HTMLElement | null;
/**
 * Get icon color for a type
 */
export declare function getIconColor(type: IconType): string | undefined;
/**
 * Create animated success checkmark
 */
export declare function createAnimatedSuccess(): HTMLElement;
/**
 * Create animated error X
 */
export declare function createAnimatedError(): HTMLElement;
/**
 * Inject icon animation styles
 */
export declare function injectIconAnimationStyles(): void;
//# sourceMappingURL=icons.d.ts.map