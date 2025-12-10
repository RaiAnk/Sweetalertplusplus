/**
 * Main Entry Point
 * Tree-shakeable exports for full library
 */
export { modal, closeAll, close, getActiveModal, getActiveModals, isAnyOpen, isOpen, update, show, setGlobalConfig, getGlobalConfig, initDeclarativeModals, } from './core/modal';
export type { ModalOptions, ModalResult, ModalInstance, DismissReason, GlobalConfig, ButtonConfig, ButtonsConfig, InputConfig, AnimationConfig, AnimationPreset, A11yConfig, LifecycleHooks, ModalRole, ModalSize, Position, IconType, InputType, ToastOptions, ToastPosition, QueueConfig, FormSchema, FormField, FieldType, SelectOption, ValidationRule, FieldValidation, ValidatorFn, } from './core/types';
export { alert, confirm, prompt, success, error, warning, info, loading, image, wizard, form, presets, } from './presets';
export type { AlertOptions, ConfirmOptions, PromptOptions, MessageOptions, LoadingOptions, ImageOptions, WizardStep, WizardOptions, WizardResult, FormModalOptions, } from './presets';
export { toast, dismissToast, dismissAllToasts, setToastDefaults, getToastDefaults, success as toastSuccess, error as toastError, warning as toastWarning, info as toastInfo, loading as toastLoading, promise as toastPromise, } from './toast/toast';
export { queue, enqueue, enqueueAll, configureQueue, clearQueue, pauseQueue, resumeQueue, skipCurrent, getQueueStatus, deleteQueue, createQueue, } from './queue';
export { renderForm, createFormSchema, formPresets, registerFieldRenderer, } from './form/form-renderer';
export { validateField, validateForm, registerValidator, unregisterValidator, applyMask, unmask, createMaskedInput, createDebouncedValidator, } from './form/validation';
export type { FormState, FormController, } from './form/form-renderer';
export { use as usePlugin, unuse as unusePlugin, isPluginInstalled, getInstalledPlugins, plugins, analyticsPlugin, soundPlugin, confirmOnClosePlugin, darkModePlugin, keyboardPlugin, } from './plugins/plugin-system';
export type { Plugin, PluginContext, BeforeOpenHook, AfterOpenHook, BeforeCloseHook, AfterCloseHook, PresetConfig, } from './plugins/plugin-system';
export { initTheme, setTheme, getTheme, getResolvedTheme, toggleTheme, setVariable, getVariable, setVariables, resetVariables, setPrimaryColor, setBorderRadius, setAnimationSpeed, setAnimations, applyConfig, getConfig, exportThemeCSS, exportThemeJS, themePresets, applyPreset, } from './core/theme';
export type { ThemeMode, ThemeConfig, ThemePreset, } from './core/theme';
export { sanitize, escapeHtml, stripTags } from './core/sanitizer';
export { announce, prefersReducedMotion } from './core/a11y';
export { createIcon, registerIcon, unregisterIcon } from './core/icons';
export { createFocusTrap } from './core/focus-trap';
import { modal } from './core/modal';
import { toast } from './toast/toast';
import { alert, confirm, prompt, success, error, warning, info, loading, form } from './presets';
import { use as usePlugin } from './plugins/plugin-system';
import { setTheme, getTheme, toggleTheme, setVariable, setVariables, setPrimaryColor, applyConfig, getConfig, exportThemeCSS, exportThemeJS, applyPreset } from './core/theme';
declare const SweetAlertPlusPlus: {
    fire: typeof modal;
    modal: typeof modal;
    toast: typeof toast;
    alert: typeof alert;
    confirm: typeof confirm;
    prompt: typeof prompt;
    success: typeof success;
    error: typeof error;
    warning: typeof warning;
    info: typeof info;
    loading: typeof loading;
    form: typeof form;
    queue: {
        enqueue: typeof import("./queue").enqueue;
        enqueueAll: typeof import("./queue").enqueueAll;
        configure: typeof import("./queue").configureQueue;
        clear: typeof import("./queue").clearQueue;
        pause: typeof import("./queue").pauseQueue;
        resume: typeof import("./queue").resumeQueue;
        skip: typeof import("./queue").skipCurrent;
        status: typeof import("./queue").getQueueStatus;
        delete: typeof import("./queue").deleteQueue;
        create: typeof import("./queue").createQueue;
    };
    use: typeof usePlugin;
    plugins: {
        use: typeof usePlugin;
        unuse: typeof import("./plugins/plugin-system").unuse;
        isPluginInstalled: typeof import("./plugins/plugin-system").isPluginInstalled;
        getInstalledPlugins: typeof import("./plugins/plugin-system").getInstalledPlugins;
        getPreset: typeof import("./plugins/plugin-system").getPreset;
        analytics: import("./plugins/plugin-system").Plugin;
        sound: import("./plugins/plugin-system").Plugin;
        confirmOnClose: import("./plugins/plugin-system").Plugin;
        darkMode: import("./plugins/plugin-system").Plugin;
        keyboard: import("./plugins/plugin-system").Plugin;
    };
    forms: {
        login: import("./core/types").FormSchema;
        register: import("./core/types").FormSchema;
        contact: import("./core/types").FormSchema;
        payment: import("./core/types").FormSchema;
        address: import("./core/types").FormSchema;
        feedback: import("./core/types").FormSchema;
        profile: import("./core/types").FormSchema;
    };
    theme: {
        set: typeof setTheme;
        get: typeof getTheme;
        toggle: typeof toggleTheme;
        setVariable: typeof setVariable;
        setVariables: typeof setVariables;
        setPrimaryColor: typeof setPrimaryColor;
        applyConfig: typeof applyConfig;
        getConfig: typeof getConfig;
        exportCSS: typeof exportThemeCSS;
        exportJS: typeof exportThemeJS;
        presets: import("./core/theme").ThemePreset[];
        applyPreset: typeof applyPreset;
    };
};
export default SweetAlertPlusPlus;
//# sourceMappingURL=index.d.ts.map