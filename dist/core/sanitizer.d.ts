/**
 * HTML Sanitizer
 * Secure by default, CSP-friendly HTML sanitization
 */
export interface SanitizerOptions {
    /** Additional allowed tags */
    allowedTags?: string[];
    /** Additional allowed attributes per tag */
    allowedAttributes?: Record<string, string[]>;
    /** Allow data: URLs (disabled by default for security) */
    allowDataUrls?: boolean;
    /** Custom URL validator */
    urlValidator?: (url: string) => boolean;
    /** Allow target="_blank" (adds rel="noopener noreferrer" automatically) */
    allowTargetBlank?: boolean;
}
/**
 * Sanitize HTML string
 */
export declare function sanitize(html: string, options?: SanitizerOptions): string;
/**
 * Escape HTML entities
 */
export declare function escapeHtml(str: string): string;
/**
 * Unescape HTML entities
 */
export declare function unescapeHtml(str: string): string;
/**
 * Check if a string contains HTML
 */
export declare function containsHtml(str: string): boolean;
/**
 * Strip all HTML tags
 */
export declare function stripTags(html: string): string;
/**
 * Create a sanitized element from HTML
 */
export declare function createSanitizedElement(html: string, options?: SanitizerOptions): HTMLElement;
//# sourceMappingURL=sanitizer.d.ts.map