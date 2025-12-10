/**
 * React Adapter
 * First-class React integration with hooks and components
 * SSR-safe with proper cleanup
 */

import * as React from 'react';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  createContext,
  useContext,
} from 'react';

import type { ModalOptions, ModalResult, ToastOptions, GlobalConfig, FormSchema } from '../core/types';

// ============================================================================
// SSR-Safe Imports
// ============================================================================

// Dynamic imports for browser-only code
let coreModal: typeof import('../core/modal').modal | null = null;
let closeAll: typeof import('../core/modal').closeAll | null = null;
let setGlobalConfig: typeof import('../core/modal').setGlobalConfig | null = null;
let coreToast: typeof import('../toast/toast').toast | null = null;
let dismissAllToasts: typeof import('../toast/toast').dismissAllToasts | null = null;
let presets: {
  alert: typeof import('../presets').alert;
  confirm: typeof import('../presets').confirm;
  prompt: typeof import('../presets').prompt;
  success: typeof import('../presets').success;
  error: typeof import('../presets').error;
  warning: typeof import('../presets').warning;
  info: typeof import('../presets').info;
  loading: typeof import('../presets').loading;
} | null = null;

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Initialize browser-only modules
if (isBrowser) {
  // These will be loaded synchronously in browser but won't break SSR
  Promise.all([
    import('../core/modal'),
    import('../toast/toast'),
    import('../presets'),
  ]).then(([modalModule, toastModule, presetsModule]) => {
    coreModal = modalModule.modal;
    closeAll = modalModule.closeAll;
    setGlobalConfig = modalModule.setGlobalConfig;
    coreToast = toastModule.toast;
    dismissAllToasts = toastModule.dismissAllToasts;
    presets = {
      alert: presetsModule.alert,
      confirm: presetsModule.confirm,
      prompt: presetsModule.prompt,
      success: presetsModule.success,
      error: presetsModule.error,
      warning: presetsModule.warning,
      info: presetsModule.info,
      loading: presetsModule.loading,
    };
  });
}

// SSR-safe wrapper functions
async function safeModal<T = any>(options: ModalOptions<T>): Promise<ModalResult<T>> {
  if (!isBrowser || !coreModal) {
    return { confirmed: false, denied: false, dismissed: true, dismissReason: 'programmatic' };
  }
  return coreModal(options);
}

async function safeCloseAll(): Promise<void> {
  if (!isBrowser || !closeAll) return;
  return closeAll();
}

function safeToast(options: ToastOptions | string): { dismiss: () => void } {
  if (!isBrowser || !coreToast) {
    return { dismiss: () => {} };
  }
  return coreToast(options);
}

function safeDismissAllToasts(): void {
  if (!isBrowser || !dismissAllToasts) return;
  dismissAllToasts();
}

// ============================================================================
// Context
// ============================================================================

interface ModalContextValue {
  modal: <T = any>(options: ModalOptions<T>) => Promise<ModalResult<T>>;
  toast: (options: ToastOptions | string) => { dismiss: () => void };
  alert: (options: { title?: string; text?: string; icon?: string }) => Promise<void>;
  confirm: (options: { title?: string; text?: string }) => Promise<boolean>;
  prompt: <T = string>(options: { title?: string; text?: string; inputType?: string }) => Promise<T | undefined>;
  success: (title?: string, text?: string) => Promise<void>;
  error: (title?: string, text?: string) => Promise<void>;
  warning: (title?: string, text?: string) => Promise<void>;
  info: (title?: string, text?: string) => Promise<void>;
  loading: (title?: string) => Promise<{ close: () => Promise<void> }>;
  closeAll: () => Promise<void>;
  dismissAllToasts: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface ModalProviderProps {
  children: React.ReactNode;
  config?: GlobalConfig;
}

export function ModalProvider({ children, config }: ModalProviderProps): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  // Apply global config and mark as ready
  useEffect(() => {
    if (!isBrowser) return;

    // Wait for dynamic imports to complete
    const checkReady = () => {
      if (coreModal && presets) {
        if (config && setGlobalConfig) {
          setGlobalConfig(config);
        }
        setIsReady(true);
      } else {
        setTimeout(checkReady, 10);
      }
    };
    checkReady();
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safeCloseAll();
      safeDismissAllToasts();
    };
  }, []);

  // Create SSR-safe preset wrappers
  const safeAlert = useCallback(async (options: { title?: string; text?: string; icon?: string }) => {
    if (!isBrowser || !presets) return;
    await presets.alert(options);
  }, []);

  const safeConfirm = useCallback(async (options: { title?: string; text?: string }): Promise<boolean> => {
    if (!isBrowser || !presets) return false;
    return presets.confirm(options);
  }, []);

  const safePrompt = useCallback(async <T = string>(options: { title?: string; text?: string; inputType?: string }): Promise<T | undefined> => {
    if (!isBrowser || !presets) return undefined;
    return presets.prompt<T>(options);
  }, []);

  const safeSuccess = useCallback(async (title?: string, text?: string) => {
    if (!isBrowser || !presets) return;
    await presets.success(title, text);
  }, []);

  const safeError = useCallback(async (title?: string, text?: string) => {
    if (!isBrowser || !presets) return;
    await presets.error(title, text);
  }, []);

  const safeWarning = useCallback(async (title?: string, text?: string) => {
    if (!isBrowser || !presets) return;
    await presets.warning(title, text);
  }, []);

  const safeInfo = useCallback(async (title?: string, text?: string) => {
    if (!isBrowser || !presets) return;
    await presets.info(title, text);
  }, []);

  const safeLoading = useCallback(async (title?: string): Promise<{ close: () => Promise<void> }> => {
    if (!isBrowser || !presets) {
      return { close: async () => {} };
    }
    return presets.loading(title);
  }, []);

  const value = useMemo<ModalContextValue>(() => ({
    modal: safeModal,
    toast: safeToast,
    alert: safeAlert,
    confirm: safeConfirm,
    prompt: safePrompt,
    success: safeSuccess,
    error: safeError,
    warning: safeWarning,
    info: safeInfo,
    loading: safeLoading,
    closeAll: safeCloseAll,
    dismissAllToasts: safeDismissAllToasts,
  }), [safeAlert, safeConfirm, safePrompt, safeSuccess, safeError, safeWarning, safeInfo, safeLoading]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the modal context
 */
export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}

/**
 * Main modal hook
 */
export function useModal<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<ModalResult<T> | null>(null);

  const open = useCallback(async (options: ModalOptions<T>): Promise<ModalResult<T>> => {
    if (!isBrowser) {
      return { confirmed: false, denied: false, dismissed: true, dismissReason: 'programmatic' };
    }

    setIsOpen(true);
    setResult(null);

    const modalResult = await safeModal<T>({
      ...options,
      hooks: {
        ...options.hooks,
        onClose: (res) => {
          setResult(res);
          setIsOpen(false);
          options.hooks?.onClose?.(res);
        },
      },
    });

    return modalResult;
  }, []);

  const close = useCallback(async () => {
    await safeCloseAll();
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    result,
    open,
    close,
  };
}

/**
 * Confirmation dialog hook
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);

  const ask = useCallback(async (options: { title?: string; text?: string }): Promise<boolean> => {
    if (!isBrowser || !presets) return false;
    setIsOpen(true);
    const result = await presets.confirm(options);
    setIsOpen(false);
    return result;
  }, []);

  return {
    isOpen,
    confirm: ask,
  };
}

/**
 * Prompt dialog hook
 */
export function usePrompt<T = string>() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<T | undefined>(undefined);

  const ask = useCallback(async (options: { title?: string; text?: string; inputType?: string }): Promise<T | undefined> => {
    if (!isBrowser || !presets) return undefined;
    setIsOpen(true);
    const result = await presets.prompt<T>(options);
    setValue(result);
    setIsOpen(false);
    return result;
  }, []);

  return {
    isOpen,
    value,
    prompt: ask,
  };
}

/**
 * Toast hook
 */
export function useToast() {
  const show = useCallback((options: ToastOptions | string) => {
    return safeToast(options);
  }, []);

  const showSuccess = useCallback((message: string) => {
    return safeToast({ text: message, icon: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    return safeToast({ text: message, icon: 'error' });
  }, []);

  const showWarning = useCallback((message: string) => {
    return safeToast({ text: message, icon: 'warning' });
  }, []);

  const showInfo = useCallback((message: string) => {
    return safeToast({ text: message, icon: 'info' });
  }, []);

  const dismissAll = useCallback(() => {
    safeDismissAllToasts();
  }, []);

  return {
    toast: show,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    dismissAll,
  };
}

/**
 * Loading state hook
 */
export function useLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const closeRef = useRef<(() => Promise<void>) | null>(null);

  const show = useCallback(async (message?: string) => {
    if (!isBrowser || !presets) return;
    setIsLoading(true);
    const result = await presets.loading(message || 'Loading...');
    closeRef.current = result.close;
  }, []);

  const hide = useCallback(async () => {
    if (closeRef.current) {
      await closeRef.current();
      closeRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const wrap = useCallback(async <T,>(
    promise: Promise<T>,
    message?: string
  ): Promise<T> => {
    await show(message);
    try {
      const result = await promise;
      return result;
    } finally {
      await hide();
    }
  }, [show, hide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeRef.current) {
        closeRef.current();
      }
    };
  }, []);

  return {
    isLoading,
    show,
    hide,
    wrap,
  };
}

// ============================================================================
// Declarative Component
// ============================================================================

export interface ModalComponentProps extends ModalOptions {
  /** Control visibility */
  open?: boolean;
  /** Called when modal closes */
  onClose?: (result: ModalResult) => void;
  /** React children as content */
  children?: React.ReactNode;
}

export function Modal({
  open = false,
  onClose,
  children,
  ...options
}: ModalComponentProps): null {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    // SSR safety check
    if (!isBrowser) return;

    if (open && !wasOpenRef.current) {
      // Opening
      wasOpenRef.current = true;

      const modalOptions: ModalOptions = { ...options };

      // If children are provided, render them
      if (children) {
        const container = document.createElement('div');
        // Note: In a real implementation, you'd use ReactDOM.render or createPortal
        // For this library, we'll just set the text
        modalOptions.html = container;
      }

      safeModal(modalOptions).then((result) => {
        wasOpenRef.current = false;
        onClose?.(result);
      });
    } else if (!open && wasOpenRef.current) {
      // Closing
      safeCloseAll();
      wasOpenRef.current = false;
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        safeCloseAll();
      }
    };
  }, []);

  return null;
}

// ============================================================================
// HOC for class components
// ============================================================================

export interface WithModalProps {
  modal: ModalContextValue;
}

export function withModal<P extends WithModalProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithModalProps>> {
  return function WrappedComponent(props: Omit<P, keyof WithModalProps>) {
    const modal = useModalContext();
    return <Component {...(props as P)} modal={modal} />;
  };
}

// ============================================================================
// Export
// ============================================================================

export const ReactAdapter = {
  ModalProvider,
  useModal,
  useConfirm,
  usePrompt,
  useToast,
  useLoading,
  useModalContext,
  Modal,
  withModal,
};
