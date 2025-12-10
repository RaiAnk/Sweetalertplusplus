/**
 * Main Entry Point
 * Tree-shakeable exports for full library
 */

// ============================================================================
// Core
// ============================================================================

export {
  modal,
  closeAll,
  close,
  getActiveModal,
  getActiveModals,
  isAnyOpen,
  isOpen,
  update,
  show,
  setGlobalConfig,
  getGlobalConfig,
  initDeclarativeModals,
} from './core/modal';

// ============================================================================
// Types
// ============================================================================

export type {
  ModalOptions,
  ModalResult,
  ModalInstance,
  DismissReason,
  GlobalConfig,
  ButtonConfig,
  ButtonsConfig,
  InputConfig,
  AnimationConfig,
  AnimationPreset,
  A11yConfig,
  LifecycleHooks,
  ModalRole,
  ModalSize,
  Position,
  IconType,
  InputType,
  ToastOptions,
  ToastPosition,
  QueueConfig,
  FormSchema,
  FormField,
  FieldType,
  SelectOption,
  ValidationRule,
  FieldValidation,
  ValidatorFn,
} from './core/types';

// ============================================================================
// Presets
// ============================================================================

export {
  alert,
  confirm,
  prompt,
  success,
  error,
  warning,
  info,
  loading,
  image,
  wizard,
  form,
  presets,
} from './presets';

export type {
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
  MessageOptions,
  LoadingOptions,
  ImageOptions,
  WizardStep,
  WizardOptions,
  WizardResult,
  FormModalOptions,
} from './presets';

// ============================================================================
// Toast
// ============================================================================

export {
  toast,
  dismissToast,
  dismissAllToasts,
  setToastDefaults,
  getToastDefaults,
  success as toastSuccess,
  error as toastError,
  warning as toastWarning,
  info as toastInfo,
  loading as toastLoading,
  promise as toastPromise,
} from './toast/toast';

// ============================================================================
// Queue
// ============================================================================

export {
  queue,
  enqueue,
  enqueueAll,
  configureQueue,
  clearQueue,
  pauseQueue,
  resumeQueue,
  skipCurrent,
  getQueueStatus,
  deleteQueue,
  createQueue,
} from './queue';

// ============================================================================
// Form System
// ============================================================================

export {
  renderForm,
  createFormSchema,
  formPresets,
  registerFieldRenderer,
} from './form/form-renderer';

export {
  validateField,
  validateForm,
  registerValidator,
  unregisterValidator,
  applyMask,
  unmask,
  createMaskedInput,
  createDebouncedValidator,
} from './form/validation';

export type {
  FormState,
  FormController,
} from './form/form-renderer';

// ============================================================================
// Plugin System
// ============================================================================

export {
  use as usePlugin,
  unuse as unusePlugin,
  isPluginInstalled,
  getInstalledPlugins,
  plugins,
  analyticsPlugin,
  soundPlugin,
  confirmOnClosePlugin,
  darkModePlugin,
  keyboardPlugin,
} from './plugins/plugin-system';

export type {
  Plugin,
  PluginContext,
  BeforeOpenHook,
  AfterOpenHook,
  BeforeCloseHook,
  AfterCloseHook,
  PresetConfig,
} from './plugins/plugin-system';

// ============================================================================
// Theme System
// ============================================================================

export {
  initTheme,
  setTheme,
  getTheme,
  getResolvedTheme,
  toggleTheme,
  setVariable,
  getVariable,
  setVariables,
  resetVariables,
  setPrimaryColor,
  setBorderRadius,
  setAnimationSpeed,
  setAnimations,
  applyConfig,
  getConfig,
  exportThemeCSS,
  exportThemeJS,
  themePresets,
  applyPreset,
} from './core/theme';

export type {
  ThemeMode,
  ThemeConfig,
  ThemePreset,
} from './core/theme';

// ============================================================================
// Utilities
// ============================================================================

export { sanitize, escapeHtml, stripTags } from './core/sanitizer';
export { announce, prefersReducedMotion } from './core/a11y';
export { createIcon, registerIcon, unregisterIcon } from './core/icons';
export { createFocusTrap } from './core/focus-trap';

// ============================================================================
// Default Export (for simple usage)
// ============================================================================

import { modal } from './core/modal';
import { toast } from './toast/toast';
import { alert, confirm, prompt, success, error, warning, info, loading, form } from './presets';
import { queue } from './queue';
import { use as usePlugin, plugins } from './plugins/plugin-system';
import { formPresets } from './form/form-renderer';
import {
  setTheme,
  getTheme,
  toggleTheme,
  setVariable,
  setVariables,
  setPrimaryColor,
  applyConfig,
  getConfig,
  exportThemeCSS,
  exportThemeJS,
  themePresets,
  applyPreset,
} from './core/theme';

const SweetAlertPlusPlus = {
  // Core
  fire: modal,
  modal,

  // Toast
  toast,

  // Presets
  alert,
  confirm,
  prompt,
  success,
  error,
  warning,
  info,
  loading,
  form,

  // Queue
  queue,

  // Plugins
  use: usePlugin,
  plugins,

  // Form presets
  forms: formPresets,

  // Theme
  theme: {
    set: setTheme,
    get: getTheme,
    toggle: toggleTheme,
    setVariable,
    setVariables,
    setPrimaryColor,
    applyConfig,
    getConfig,
    exportCSS: exportThemeCSS,
    exportJS: exportThemeJS,
    presets: themePresets,
    applyPreset,
  },
};

export default SweetAlertPlusPlus;
