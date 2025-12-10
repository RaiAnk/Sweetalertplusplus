/**
 * Plugin System
 * Extensible plugin architecture for custom functionality
 */
import type { ModalOptions, ModalResult, ModalInstance, FormField, ValidationRule } from '../core/types';
export interface PluginContext {
    /** Register a custom field type renderer */
    registerFieldType: (type: string, renderer: FieldRenderer) => void;
    /** Register a custom validator */
    registerValidator: (name: string, validator: ValidatorFn) => void;
    /** Unregister a validator */
    unregisterValidator: (name: string) => void;
    /** Register a hook that runs before modal opens */
    registerBeforeOpen: (hook: BeforeOpenHook) => () => void;
    /** Register a hook that runs after modal opens */
    registerAfterOpen: (hook: AfterOpenHook) => () => void;
    /** Register a hook that runs before modal closes */
    registerBeforeClose: (hook: BeforeCloseHook) => () => void;
    /** Register a hook that runs after modal closes */
    registerAfterClose: (hook: AfterCloseHook) => () => void;
    /** Register a custom preset */
    registerPreset: (name: string, preset: PresetConfig) => void;
    /** Unregister a preset */
    unregisterPreset: (name: string) => void;
    /** Get global configuration */
    getConfig: () => Record<string, any>;
    /** Set global configuration */
    setConfig: (config: Record<string, any>) => void;
}
export type FieldRenderer = (field: FormField, value: any, onChange: (value: any) => void, error?: string) => HTMLElement;
export type ValidatorFn = (value: any, rule: ValidationRule, formData: Record<string, any>) => boolean | string | Promise<boolean | string>;
export type BeforeOpenHook = (options: ModalOptions) => ModalOptions | false | Promise<ModalOptions | false>;
export type AfterOpenHook = (instance: ModalInstance) => void;
export type BeforeCloseHook = (instance: ModalInstance, result: ModalResult) => boolean | Promise<boolean>;
export type AfterCloseHook = (result: ModalResult) => void;
export interface PresetConfig {
    /** Base options for this preset */
    options: Partial<ModalOptions>;
    /** Transform function for customizing options */
    transform?: (input: any) => Partial<ModalOptions>;
}
export interface Plugin {
    /** Unique plugin name */
    name: string;
    /** Plugin version */
    version?: string;
    /** Initialize plugin with context */
    install: (context: PluginContext) => void | Promise<void>;
    /** Cleanup when plugin is uninstalled */
    uninstall?: () => void | Promise<void>;
}
/**
 * Install a plugin
 */
export declare function use(plugin: Plugin): Promise<void>;
/**
 * Uninstall a plugin
 */
export declare function unuse(pluginName: string): Promise<boolean>;
/**
 * Check if a plugin is installed
 */
export declare function isPluginInstalled(pluginName: string): boolean;
/**
 * Get all installed plugins
 */
export declare function getInstalledPlugins(): string[];
/**
 * Get a custom preset by name
 */
export declare function getPreset(name: string): PresetConfig | undefined;
/**
 * Execute all beforeOpen hooks
 */
export declare function executeBeforeOpenHooks(options: ModalOptions): Promise<ModalOptions | false>;
/**
 * Execute all afterOpen hooks
 */
export declare function executeAfterOpenHooks(instance: ModalInstance): void;
/**
 * Execute all beforeClose hooks
 */
export declare function executeBeforeCloseHooks(instance: ModalInstance, result: ModalResult): Promise<boolean>;
/**
 * Execute all afterClose hooks
 */
export declare function executeAfterCloseHooks(result: ModalResult): void;
/**
 * Analytics plugin - tracks modal usage
 */
export declare const analyticsPlugin: Plugin;
/**
 * Sound effects plugin
 */
export declare const soundPlugin: Plugin;
/**
 * Confirm on close plugin - prompts before dismissing
 */
export declare const confirmOnClosePlugin: Plugin;
/**
 * Dark mode plugin - auto-applies dark theme based on system preference
 */
export declare const darkModePlugin: Plugin;
/**
 * Keyboard shortcuts plugin
 */
export declare const keyboardPlugin: Plugin;
export declare const plugins: {
    use: typeof use;
    unuse: typeof unuse;
    isPluginInstalled: typeof isPluginInstalled;
    getInstalledPlugins: typeof getInstalledPlugins;
    getPreset: typeof getPreset;
    analytics: Plugin;
    sound: Plugin;
    confirmOnClose: Plugin;
    darkMode: Plugin;
    keyboard: Plugin;
};
//# sourceMappingURL=plugin-system.d.ts.map