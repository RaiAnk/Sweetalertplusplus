/**
 * Modal Renderer
 * Builds modal DOM with proper structure and accessibility
 */
import type { ModalOptions } from './types';
export declare function generateId(prefix?: string): string;
export interface ClassNames {
    root: string;
    container: string;
    backdrop: string;
    modal: string;
    header: string;
    icon: string;
    title: string;
    closeButton: string;
    body: string;
    content: string;
    image: string;
    input: string;
    inputLabel: string;
    inputError: string;
    footer: string;
    actions: string;
    button: string;
    buttonConfirm: string;
    buttonDeny: string;
    buttonCancel: string;
    timerProgress: string;
    loading: string;
    loadingSpinner: string;
}
export declare function getClassNames(prefix?: string): ClassNames;
export interface RenderedModal {
    root: HTMLElement;
    backdrop: HTMLElement | null;
    modal: HTMLElement;
    closeButton: HTMLButtonElement | null;
    titleElement: HTMLElement | null;
    contentElement: HTMLElement | null;
    inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    inputWrapper: HTMLElement | null;
    actionsContainer: HTMLElement | null;
    timerProgress: HTMLElement | null;
    ids: {
        titleId: string;
        contentId: string;
        modalId: string;
    };
}
export declare function render(options: ModalOptions, prefix?: string): RenderedModal;
export declare function showLoadingState(modal: HTMLElement, text?: string, prefix?: string): HTMLElement;
export declare function hideLoadingState(modal: HTMLElement, prefix?: string): void;
//# sourceMappingURL=renderer.d.ts.map