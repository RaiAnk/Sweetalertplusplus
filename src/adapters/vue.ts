/**
 * Vue 3 Adapter
 * Composition API hooks and plugin for Vue 3
 * SSR-safe with proper cleanup
 */

import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  inject,
  provide,
  App,
  Plugin,
} from 'vue';

import { modal as coreModal, closeAll, getActiveModals, setGlobalConfig } from '../core/modal';
import { toast as coreToast, dismissAllToasts } from '../toast/toast';
import { alert, confirm, prompt, success, error, warning, info, loading } from '../presets';
import type { ModalOptions, ModalResult, ToastOptions, GlobalConfig } from '../core/types';

// ============================================================================
// Injection Key
// ============================================================================

const MODAL_INJECTION_KEY = Symbol('modal');

// ============================================================================
// Composables
// ============================================================================

/**
 * Main modal composable
 */
export function useModal<T = any>() {
  const isOpen = ref(false);
  const result = ref<ModalResult<T> | null>(null);

  async function open(options: ModalOptions<T>): Promise<ModalResult<T>> {
    isOpen.value = true;
    result.value = null;

    const modalResult = await coreModal<T>({
      ...options,
      hooks: {
        ...options.hooks,
        onClose: (res) => {
          result.value = res;
          isOpen.value = false;
          options.hooks?.onClose?.(res);
        },
      },
    });

    return modalResult;
  }

  async function close() {
    await closeAll();
    isOpen.value = false;
  }

  onUnmounted(() => {
    if (isOpen.value) {
      closeAll();
    }
  });

  return {
    isOpen: computed(() => isOpen.value),
    result: computed(() => result.value),
    open,
    close,
  };
}

/**
 * Confirmation dialog composable
 */
export function useConfirm() {
  const isOpen = ref(false);

  async function ask(options: Parameters<typeof confirm>[0]): Promise<boolean> {
    isOpen.value = true;
    const result = await confirm(options);
    isOpen.value = false;
    return result;
  }

  return {
    isOpen: computed(() => isOpen.value),
    confirm: ask,
  };
}

/**
 * Prompt dialog composable
 */
export function usePrompt<T = string>() {
  const isOpen = ref(false);
  const value = ref<T | undefined>(undefined);

  async function ask(options: Parameters<typeof prompt>[0]): Promise<T | undefined> {
    isOpen.value = true;
    const result = await prompt<T>(options);
    value.value = result as T;
    isOpen.value = false;
    return result;
  }

  return {
    isOpen: computed(() => isOpen.value),
    value: computed(() => value.value),
    prompt: ask,
  };
}

/**
 * Toast composable
 */
export function useToast() {
  function show(options: ToastOptions | string) {
    return coreToast(options);
  }

  function showSuccess(message: string) {
    return coreToast({ text: message, icon: 'success' });
  }

  function showError(message: string) {
    return coreToast({ text: message, icon: 'error' });
  }

  function showWarning(message: string) {
    return coreToast({ text: message, icon: 'warning' });
  }

  function showInfo(message: string) {
    return coreToast({ text: message, icon: 'info' });
  }

  function dismissAll() {
    dismissAllToasts();
  }

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
 * Loading state composable
 */
export function useLoading() {
  const isLoading = ref(false);
  let closeLoading: (() => Promise<void>) | null = null;

  async function show(message?: string) {
    isLoading.value = true;
    const result = await loading(message || 'Loading...');
    closeLoading = result.close;
  }

  async function hide() {
    if (closeLoading) {
      await closeLoading();
      closeLoading = null;
    }
    isLoading.value = false;
  }

  async function wrap<T>(promise: Promise<T>, message?: string): Promise<T> {
    await show(message);
    try {
      return await promise;
    } finally {
      await hide();
    }
  }

  onUnmounted(() => {
    if (closeLoading) {
      closeLoading();
    }
  });

  return {
    isLoading: computed(() => isLoading.value),
    show,
    hide,
    wrap,
  };
}

// ============================================================================
// Plugin
// ============================================================================

export interface ModalPluginOptions extends GlobalConfig {
  // Additional plugin-specific options
}

export interface ModalInstance {
  modal: typeof coreModal;
  toast: typeof coreToast;
  alert: typeof alert;
  confirm: typeof confirm;
  prompt: typeof prompt;
  success: typeof success;
  error: typeof error;
  warning: typeof warning;
  info: typeof info;
  loading: typeof loading;
  closeAll: typeof closeAll;
  dismissAllToasts: typeof dismissAllToasts;
}

export function createModalPlugin(options?: ModalPluginOptions): Plugin {
  return {
    install(app: App) {
      // Apply global config
      if (options) {
        setGlobalConfig(options);
      }

      // Create modal instance
      const modalInstance: ModalInstance = {
        modal: coreModal,
        toast: coreToast,
        alert,
        confirm,
        prompt,
        success,
        error,
        warning,
        info,
        loading,
        closeAll,
        dismissAllToasts,
      };

      // Provide for injection
      app.provide(MODAL_INJECTION_KEY, modalInstance);

      // Add global property
      app.config.globalProperties.$modal = modalInstance;
    },
  };
}

/**
 * Inject modal instance from plugin
 */
export function useModalPlugin(): ModalInstance {
  const modal = inject<ModalInstance>(MODAL_INJECTION_KEY);
  if (!modal) {
    throw new Error('Modal plugin not installed. Did you forget to use createModalPlugin()?');
  }
  return modal;
}

// ============================================================================
// Directive
// ============================================================================

export const vModal = {
  mounted(el: HTMLElement, binding: { value: ModalOptions }) {
    el.addEventListener('click', () => {
      coreModal(binding.value);
    });
  },
};

export const vConfirm = {
  mounted(el: HTMLElement, binding: { value: Parameters<typeof confirm>[0] | (() => void) }) {
    el.addEventListener('click', async (event) => {
      event.preventDefault();

      const options = typeof binding.value === 'function'
        ? { text: 'Are you sure?' }
        : binding.value;

      const confirmed = await confirm(options);

      if (confirmed && typeof binding.value === 'function') {
        binding.value();
      }
    });
  },
};

// ============================================================================
// Type Augmentation
// ============================================================================

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $modal: ModalInstance;
  }
}

// ============================================================================
// Export
// ============================================================================

export const VueAdapter = {
  useModal,
  useConfirm,
  usePrompt,
  useToast,
  useLoading,
  useModalPlugin,
  createModalPlugin,
  vModal,
  vConfirm,
};
