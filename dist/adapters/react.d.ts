/**
 * React Adapter
 * First-class React integration with hooks and components
 * SSR-safe with proper cleanup
 */
import * as React from 'react';
import type { ModalOptions, ModalResult, ToastOptions, GlobalConfig } from '../core/types';
interface ModalContextValue {
    modal: <T = any>(options: ModalOptions<T>) => Promise<ModalResult<T>>;
    toast: (options: ToastOptions | string) => {
        dismiss: () => void;
    };
    alert: (options: {
        title?: string;
        text?: string;
        icon?: string;
    }) => Promise<void>;
    confirm: (options: {
        title?: string;
        text?: string;
    }) => Promise<boolean>;
    prompt: <T = string>(options: {
        title?: string;
        text?: string;
        inputType?: string;
    }) => Promise<T | undefined>;
    success: (title?: string, text?: string) => Promise<void>;
    error: (title?: string, text?: string) => Promise<void>;
    warning: (title?: string, text?: string) => Promise<void>;
    info: (title?: string, text?: string) => Promise<void>;
    loading: (title?: string) => Promise<{
        close: () => Promise<void>;
    }>;
    closeAll: () => Promise<void>;
    dismissAllToasts: () => void;
}
export interface ModalProviderProps {
    children: React.ReactNode;
    config?: GlobalConfig;
}
export declare function ModalProvider({ children, config }: ModalProviderProps): JSX.Element;
/**
 * Access the modal context
 */
export declare function useModalContext(): ModalContextValue;
/**
 * Main modal hook
 */
export declare function useModal<T = any>(): {
    isOpen: any;
    result: any;
    open: any;
    close: any;
};
/**
 * Confirmation dialog hook
 */
export declare function useConfirm(): {
    isOpen: any;
    confirm: any;
};
/**
 * Prompt dialog hook
 */
export declare function usePrompt<T = string>(): {
    isOpen: any;
    value: any;
    prompt: any;
};
/**
 * Toast hook
 */
export declare function useToast(): {
    toast: any;
    success: any;
    error: any;
    warning: any;
    info: any;
    dismissAll: any;
};
/**
 * Loading state hook
 */
export declare function useLoading(): {
    isLoading: any;
    show: any;
    hide: any;
    wrap: any;
};
export interface ModalComponentProps extends ModalOptions {
    /** Control visibility */
    open?: boolean;
    /** Called when modal closes */
    onClose?: (result: ModalResult) => void;
    /** React children as content */
    children?: React.ReactNode;
}
export declare function Modal({ open, onClose, children, ...options }: ModalComponentProps): null;
export interface WithModalProps {
    modal: ModalContextValue;
}
export declare function withModal<P extends WithModalProps>(Component: React.ComponentType<P>): React.ComponentType<Omit<P, keyof WithModalProps>>;
export declare const ReactAdapter: {
    ModalProvider: typeof ModalProvider;
    useModal: typeof useModal;
    useConfirm: typeof useConfirm;
    usePrompt: typeof usePrompt;
    useToast: typeof useToast;
    useLoading: typeof useLoading;
    useModalContext: typeof useModalContext;
    Modal: typeof Modal;
    withModal: typeof withModal;
};
export {};
//# sourceMappingURL=react.d.ts.map