/**
 * Plugin System
 * Extensible plugin architecture for custom functionality
 */

import type { ModalOptions, ModalResult, ModalInstance, FormField, ValidationRule } from '../core/types';
import { registerValidator, unregisterValidator } from '../form/validation';
import { registerFieldRenderer } from '../form/field-renderers';

// ============================================================================
// Plugin Types
// ============================================================================

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

export type FieldRenderer = (
  field: FormField,
  value: any,
  onChange: (value: any) => void,
  error?: string
) => HTMLElement;

export type ValidatorFn = (
  value: any,
  rule: ValidationRule,
  formData: Record<string, any>
) => boolean | string | Promise<boolean | string>;

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

// ============================================================================
// Plugin Registry
// ============================================================================

const installedPlugins = new Map<string, Plugin>();
const beforeOpenHooks: BeforeOpenHook[] = [];
const afterOpenHooks: AfterOpenHook[] = [];
const beforeCloseHooks: BeforeCloseHook[] = [];
const afterCloseHooks: AfterCloseHook[] = [];
const customPresets = new Map<string, PresetConfig>();
let globalPluginConfig: Record<string, any> = {};

/**
 * Create the plugin context
 */
function createPluginContext(): PluginContext {
  return {
    registerFieldType: (type, renderer) => {
      registerFieldRenderer(type, renderer);
    },

    registerValidator: (name, validator) => {
      registerValidator(name, validator);
    },

    unregisterValidator: (name) => {
      unregisterValidator(name);
    },

    registerBeforeOpen: (hook) => {
      beforeOpenHooks.push(hook);
      return () => {
        const index = beforeOpenHooks.indexOf(hook);
        if (index > -1) beforeOpenHooks.splice(index, 1);
      };
    },

    registerAfterOpen: (hook) => {
      afterOpenHooks.push(hook);
      return () => {
        const index = afterOpenHooks.indexOf(hook);
        if (index > -1) afterOpenHooks.splice(index, 1);
      };
    },

    registerBeforeClose: (hook) => {
      beforeCloseHooks.push(hook);
      return () => {
        const index = beforeCloseHooks.indexOf(hook);
        if (index > -1) beforeCloseHooks.splice(index, 1);
      };
    },

    registerAfterClose: (hook) => {
      afterCloseHooks.push(hook);
      return () => {
        const index = afterCloseHooks.indexOf(hook);
        if (index > -1) afterCloseHooks.splice(index, 1);
      };
    },

    registerPreset: (name, preset) => {
      customPresets.set(name, preset);
    },

    unregisterPreset: (name) => {
      customPresets.delete(name);
    },

    getConfig: () => ({ ...globalPluginConfig }),

    setConfig: (config) => {
      globalPluginConfig = { ...globalPluginConfig, ...config };
    },
  };
}

// ============================================================================
// Plugin API
// ============================================================================

/**
 * Install a plugin
 */
export async function use(plugin: Plugin): Promise<void> {
  if (installedPlugins.has(plugin.name)) {
    console.warn(`Plugin "${plugin.name}" is already installed`);
    return;
  }

  const context = createPluginContext();
  await plugin.install(context);
  installedPlugins.set(plugin.name, plugin);
}

/**
 * Uninstall a plugin
 */
export async function unuse(pluginName: string): Promise<boolean> {
  const plugin = installedPlugins.get(pluginName);
  if (!plugin) return false;

  if (plugin.uninstall) {
    await plugin.uninstall();
  }

  installedPlugins.delete(pluginName);
  return true;
}

/**
 * Check if a plugin is installed
 */
export function isPluginInstalled(pluginName: string): boolean {
  return installedPlugins.has(pluginName);
}

/**
 * Get all installed plugins
 */
export function getInstalledPlugins(): string[] {
  return Array.from(installedPlugins.keys());
}

/**
 * Get a custom preset by name
 */
export function getPreset(name: string): PresetConfig | undefined {
  return customPresets.get(name);
}

// ============================================================================
// Hook Execution (used internally by modal)
// ============================================================================

/**
 * Execute all beforeOpen hooks
 */
export async function executeBeforeOpenHooks(options: ModalOptions): Promise<ModalOptions | false> {
  let currentOptions = options;

  for (const hook of beforeOpenHooks) {
    const result = await hook(currentOptions);
    if (result === false) return false;
    if (result) currentOptions = result;
  }

  return currentOptions;
}

/**
 * Execute all afterOpen hooks
 */
export function executeAfterOpenHooks(instance: ModalInstance): void {
  for (const hook of afterOpenHooks) {
    hook(instance);
  }
}

/**
 * Execute all beforeClose hooks
 */
export async function executeBeforeCloseHooks(instance: ModalInstance, result: ModalResult): Promise<boolean> {
  for (const hook of beforeCloseHooks) {
    const shouldClose = await hook(instance, result);
    if (shouldClose === false) return false;
  }
  return true;
}

/**
 * Execute all afterClose hooks
 */
export function executeAfterCloseHooks(result: ModalResult): void {
  for (const hook of afterCloseHooks) {
    hook(result);
  }
}

// ============================================================================
// Built-in Plugins
// ============================================================================

/**
 * Analytics plugin - tracks modal usage
 */
export const analyticsPlugin: Plugin = {
  name: 'analytics',
  version: '1.0.0',
  install: (context) => {
    let openCount = 0;
    let confirmCount = 0;
    let dismissCount = 0;

    context.registerAfterOpen(() => {
      openCount++;
    });

    context.registerAfterClose((result) => {
      if (result.confirmed) confirmCount++;
      else dismissCount++;
    });

    // Expose stats through config
    context.setConfig({
      getAnalytics: () => ({ openCount, confirmCount, dismissCount }),
    });
  },
};

/**
 * Sound effects plugin
 */
export const soundPlugin: Plugin = {
  name: 'sound',
  version: '1.0.0',
  install: (context) => {
    const config = context.getConfig();
    const sounds: Record<string, string> = config.sounds || {};

    context.registerAfterOpen((instance) => {
      const soundUrl = sounds.open || sounds[instance.options.icon || 'default'];
      if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.volume = config.soundVolume || 0.5;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
      }
    });

    context.registerAfterClose((result) => {
      if (result.confirmed && sounds.confirm) {
        const audio = new Audio(sounds.confirm);
        audio.volume = config.soundVolume || 0.5;
        audio.play().catch(() => {});
      }
    });
  },
};

/**
 * Confirm on close plugin - prompts before dismissing
 */
export const confirmOnClosePlugin: Plugin = {
  name: 'confirmOnClose',
  version: '1.0.0',
  install: (context) => {
    context.registerBeforeClose(async (instance, result) => {
      // Only prompt for dismissed (not confirmed/denied)
      if (!result.dismissed) return true;

      const config = context.getConfig();
      if (!config.confirmOnClose) return true;

      // Use native confirm to avoid infinite loop
      return window.confirm(config.confirmOnCloseMessage || 'Are you sure you want to close?');
    });
  },
};

/**
 * Dark mode plugin - auto-applies dark theme based on system preference
 */
export const darkModePlugin: Plugin = {
  name: 'darkMode',
  version: '1.0.0',
  install: (context) => {
    const applyTheme = (isDark: boolean) => {
      document.documentElement.setAttribute('data-swal-theme', isDark ? 'dark' : 'light');
    };

    // Check initial preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(prefersDark.matches);

    // Listen for changes
    prefersDark.addEventListener('change', (e) => {
      applyTheme(e.matches);
    });
  },
};

/**
 * Keyboard shortcuts plugin
 */
export const keyboardPlugin: Plugin = {
  name: 'keyboard',
  version: '1.0.0',
  install: (context) => {
    const shortcuts: Record<string, () => void> = {};
    let currentInstance: ModalInstance | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentInstance) return;

      const key = [
        e.ctrlKey && 'Ctrl',
        e.shiftKey && 'Shift',
        e.altKey && 'Alt',
        e.key,
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    context.registerAfterOpen((instance) => {
      currentInstance = instance;
      document.addEventListener('keydown', handleKeyDown);

      // Default shortcuts
      shortcuts['Ctrl+Enter'] = () => {
        const confirmBtn = instance.element.querySelector('[data-action="confirm"]') as HTMLButtonElement;
        confirmBtn?.click();
      };
    });

    context.registerAfterClose(() => {
      currentInstance = null;
      document.removeEventListener('keydown', handleKeyDown);
    });

    // Allow adding custom shortcuts
    context.setConfig({
      addShortcut: (key: string, handler: () => void) => {
        shortcuts[key] = handler;
      },
      removeShortcut: (key: string) => {
        delete shortcuts[key];
      },
    });
  },
};

// ============================================================================
// Export
// ============================================================================

export const plugins = {
  use,
  unuse,
  isPluginInstalled,
  getInstalledPlugins,
  getPreset,
  // Built-in plugins
  analytics: analyticsPlugin,
  sound: soundPlugin,
  confirmOnClose: confirmOnClosePlugin,
  darkMode: darkModePlugin,
  keyboard: keyboardPlugin,
};
