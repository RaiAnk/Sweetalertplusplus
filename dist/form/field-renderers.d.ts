/**
 * Field Renderers
 * Individual field type rendering components
 */
import type { FormField } from '../core/types';
type FieldRenderer = (field: FormField, value: any, onChange: (value: any) => void, error?: string) => HTMLElement;
/**
 * Register a custom field renderer
 */
export declare function registerFieldRenderer(type: string, renderer: FieldRenderer): void;
/**
 * Get field renderer for a type
 */
export declare function getFieldRenderer(type: string): FieldRenderer | undefined;
declare const builtInRenderers: Record<string, FieldRenderer>;
export { builtInRenderers };
//# sourceMappingURL=field-renderers.d.ts.map