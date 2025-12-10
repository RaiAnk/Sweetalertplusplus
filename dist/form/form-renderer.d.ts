/**
 * Form Renderer
 * Renders complete forms from schema definitions
 */
import type { FormSchema, FormField, ModalOptions } from '../core/types';
import { registerFieldRenderer } from './field-renderers';
export interface FormState {
    data: Record<string, any>;
    errors: Record<string, string>;
    touched: Set<string>;
    dirty: boolean;
    valid: boolean;
    submitting: boolean;
}
export interface FormController {
    getState(): FormState;
    getData(): Record<string, any>;
    setData(data: Record<string, any>): void;
    setFieldValue(name: string, value: any): void;
    getFieldValue(name: string): any;
    validate(): Promise<{
        valid: boolean;
        errors: Record<string, string>;
    }>;
    validateField(name: string): Promise<string | null>;
    reset(): void;
    destroy(): void;
}
export declare function renderForm(schema: FormSchema, container: HTMLElement, options?: {
    initialData?: Record<string, any>;
    onChange?: (data: Record<string, any>) => void;
    onValidate?: (valid: boolean, errors: Record<string, string>) => void;
}): FormController;
/**
 * Create a form schema from a simple configuration
 */
export declare function createFormSchema(config: {
    fields: Array<Partial<FormField> & {
        name: string;
        type: FormField['type'];
    }>;
    layout?: FormSchema['layout'];
    validation?: FormSchema['validation'];
}): FormSchema;
export declare const formPresets: {
    login: FormSchema;
    register: FormSchema;
    contact: FormSchema;
    payment: FormSchema;
    address: FormSchema;
    feedback: FormSchema;
    profile: FormSchema;
};
/**
 * Extend modal options with form handling
 */
export declare function processFormOptions(options: ModalOptions): {
    formController: FormController | null;
    contentElement: HTMLElement | null;
};
export { registerFieldRenderer };
//# sourceMappingURL=form-renderer.d.ts.map