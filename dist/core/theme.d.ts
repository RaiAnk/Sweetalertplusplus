/**
 * Theme System
 * Provides dark/light mode support with system preference detection
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export interface ThemeConfig {
    /** Current theme mode */
    mode: ThemeMode;
    /** Primary color */
    primaryColor?: string;
    /** Border radius scale */
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Animation speed multiplier */
    animationSpeed?: number;
    /** Enable/disable animations */
    animations?: boolean;
    /** Custom CSS variables */
    customVariables?: Record<string, string>;
}
export interface ThemePreset {
    name: string;
    displayName: string;
    config: Partial<ThemeConfig>;
    variables: Record<string, string>;
}
/**
 * Initialize the theme system
 */
export declare function initTheme(): void;
/**
 * Set the theme mode
 */
export declare function setTheme(mode: ThemeMode): void;
/**
 * Get the current theme mode
 */
export declare function getTheme(): ThemeMode;
/**
 * Get the resolved theme (actual light/dark value, resolving 'system')
 */
export declare function getResolvedTheme(): 'light' | 'dark';
/**
 * Toggle between light and dark theme
 */
export declare function toggleTheme(): 'light' | 'dark';
/**
 * Set a custom CSS variable
 */
export declare function setVariable(name: string, value: string): void;
/**
 * Get a CSS variable value
 */
export declare function getVariable(name: string): string;
/**
 * Set multiple CSS variables at once
 */
export declare function setVariables(variables: Record<string, string>): void;
/**
 * Reset all custom variables
 */
export declare function resetVariables(): void;
/**
 * Set the primary color
 */
export declare function setPrimaryColor(color: string): void;
/**
 * Set border radius scale
 */
export declare function setBorderRadius(scale: ThemeConfig['borderRadius']): void;
/**
 * Set animation speed
 */
export declare function setAnimationSpeed(multiplier: number): void;
/**
 * Enable or disable animations
 */
export declare function setAnimations(enabled: boolean): void;
/**
 * Apply a theme configuration
 */
export declare function applyConfig(config: Partial<ThemeConfig>): void;
/**
 * Get the current theme configuration
 */
export declare function getConfig(): ThemeConfig;
/**
 * Export current theme as CSS
 */
export declare function exportThemeCSS(): string;
/**
 * Export current theme as JavaScript config
 */
export declare function exportThemeJS(): string;
export declare const themePresets: ThemePreset[];
/**
 * Apply a built-in theme preset
 */
export declare function applyPreset(presetName: string): void;
//# sourceMappingURL=theme.d.ts.map