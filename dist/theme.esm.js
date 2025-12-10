/*!
 * SweetAlert++ v1.0.0
 * Enterprise-grade, accessible, customizable modal and alert library with 30+ form field types, theme system, and advanced visual effects
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) 2025
 * Released under the MIT License
 */
/**
 * Theme System
 * Provides dark/light mode support with system preference detection
 */
// Storage key for theme persistence
const THEME_STORAGE_KEY = 'swal-theme';
const THEME_CONFIG_STORAGE_KEY = 'swal-theme-config';
// Current theme state
let currentTheme = 'system';
let currentConfig = { mode: 'system' };
// Media query for system preference
let mediaQuery = null;
/**
 * Initialize the theme system
 */
function initTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedConfig = localStorage.getItem(THEME_CONFIG_STORAGE_KEY);
    if (savedConfig) {
        try {
            currentConfig = JSON.parse(savedConfig);
        }
        catch {
            // Ignore parse errors
        }
    }
    if (savedTheme) {
        setTheme(savedTheme);
    }
    else {
        setTheme('system');
    }
    // Listen for system preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
}
/**
 * Handle system theme preference changes
 */
function handleSystemThemeChange(e) {
    if (currentTheme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
    }
}
/**
 * Apply theme to the document
 */
function applyTheme(resolvedTheme) {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        // Dispatch custom event for theme change
        const event = new CustomEvent('swal-theme-change', {
            detail: { theme: resolvedTheme, mode: currentTheme }
        });
        document.dispatchEvent(event);
    }
}
/**
 * Set the theme mode
 */
function setTheme(mode) {
    currentTheme = mode;
    currentConfig.mode = mode;
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    // Resolve and apply theme
    if (mode === 'system') {
        const prefersDark = typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
    else {
        applyTheme(mode);
    }
}
/**
 * Get the current theme mode
 */
function getTheme() {
    return currentTheme;
}
/**
 * Get the resolved theme (actual light/dark value, resolving 'system')
 */
function getResolvedTheme() {
    if (currentTheme === 'system') {
        const prefersDark = typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }
    return currentTheme;
}
/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const resolved = getResolvedTheme();
    const newTheme = resolved === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}
/**
 * Set a custom CSS variable
 */
function setVariable(name, value) {
    if (typeof document !== 'undefined') {
        // Ensure variable name starts with --swal-
        const varName = name.startsWith('--') ? name : `--swal-${name}`;
        document.documentElement.style.setProperty(varName, value);
        // Store in config
        if (!currentConfig.customVariables) {
            currentConfig.customVariables = {};
        }
        currentConfig.customVariables[varName] = value;
        saveConfig();
    }
}
/**
 * Get a CSS variable value
 */
function getVariable(name) {
    if (typeof document !== 'undefined') {
        const varName = name.startsWith('--') ? name : `--swal-${name}`;
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return '';
}
/**
 * Set multiple CSS variables at once
 */
function setVariables(variables) {
    Object.entries(variables).forEach(([name, value]) => {
        setVariable(name, value);
    });
}
/**
 * Reset all custom variables
 */
function resetVariables() {
    if (typeof document !== 'undefined' && currentConfig.customVariables) {
        Object.keys(currentConfig.customVariables).forEach(name => {
            document.documentElement.style.removeProperty(name);
        });
        currentConfig.customVariables = {};
        saveConfig();
    }
}
/**
 * Set the primary color
 */
function setPrimaryColor(color) {
    currentConfig.primaryColor = color;
    // Generate color shades
    const shades = generateColorShades(color);
    setVariables({
        'primary': color,
        'primary-50': shades[50],
        'primary-100': shades[100],
        'primary-200': shades[200],
        'primary-300': shades[300],
        'primary-400': shades[400],
        'primary-500': shades[500],
        'primary-600': shades[600],
        'primary-700': shades[700],
        'primary-800': shades[800],
        'primary-900': shades[900],
        'primary-rgb': hexToRgb(color),
    });
    saveConfig();
}
/**
 * Set border radius scale
 */
function setBorderRadius(scale) {
    currentConfig.borderRadius = scale;
    const radiusMap = {
        none: {
            'radius-sm': '0',
            'radius': '0',
            'radius-md': '0',
            'radius-lg': '0',
            'radius-xl': '0',
            'radius-2xl': '0',
            'radius-3xl': '0',
        },
        sm: {
            'radius-sm': '0.25rem',
            'radius': '0.375rem',
            'radius-md': '0.5rem',
            'radius-lg': '0.625rem',
            'radius-xl': '0.75rem',
            'radius-2xl': '1rem',
            'radius-3xl': '1.25rem',
        },
        md: {
            'radius-sm': '0.5rem',
            'radius': '0.75rem',
            'radius-md': '1rem',
            'radius-lg': '1.25rem',
            'radius-xl': '1.5rem',
            'radius-2xl': '2rem',
            'radius-3xl': '2.5rem',
        },
        lg: {
            'radius-sm': '0.75rem',
            'radius': '1rem',
            'radius-md': '1.5rem',
            'radius-lg': '2rem',
            'radius-xl': '2.5rem',
            'radius-2xl': '3rem',
            'radius-3xl': '4rem',
        },
        xl: {
            'radius-sm': '1rem',
            'radius': '1.5rem',
            'radius-md': '2rem',
            'radius-lg': '2.5rem',
            'radius-xl': '3rem',
            'radius-2xl': '4rem',
            'radius-3xl': '5rem',
        },
        full: {
            'radius-sm': '9999px',
            'radius': '9999px',
            'radius-md': '9999px',
            'radius-lg': '9999px',
            'radius-xl': '9999px',
            'radius-2xl': '9999px',
            'radius-3xl': '9999px',
        },
    };
    if (scale && radiusMap[scale]) {
        setVariables(radiusMap[scale]);
    }
    saveConfig();
}
/**
 * Set animation speed
 */
function setAnimationSpeed(multiplier) {
    currentConfig.animationSpeed = multiplier;
    setVariables({
        'duration-fast': `${Math.round(150 * multiplier)}ms`,
        'duration-normal': `${Math.round(250 * multiplier)}ms`,
        'duration-slow': `${Math.round(400 * multiplier)}ms`,
        'duration-slower': `${Math.round(600 * multiplier)}ms`,
    });
    saveConfig();
}
/**
 * Enable or disable animations
 */
function setAnimations(enabled) {
    currentConfig.animations = enabled;
    if (typeof document !== 'undefined') {
        if (enabled) {
            document.documentElement.classList.remove('swal-no-animations');
        }
        else {
            document.documentElement.classList.add('swal-no-animations');
        }
    }
    saveConfig();
}
/**
 * Apply a theme configuration
 */
function applyConfig(config) {
    if (config.mode) {
        setTheme(config.mode);
    }
    if (config.primaryColor) {
        setPrimaryColor(config.primaryColor);
    }
    if (config.borderRadius) {
        setBorderRadius(config.borderRadius);
    }
    if (config.animationSpeed !== undefined) {
        setAnimationSpeed(config.animationSpeed);
    }
    if (config.animations !== undefined) {
        setAnimations(config.animations);
    }
    if (config.customVariables) {
        setVariables(config.customVariables);
    }
}
/**
 * Get the current theme configuration
 */
function getConfig() {
    return { ...currentConfig };
}
/**
 * Save config to localStorage
 */
function saveConfig() {
    localStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(currentConfig));
}
/**
 * Export current theme as CSS
 */
function exportThemeCSS() {
    const vars = currentConfig.customVariables || {};
    const theme = getResolvedTheme();
    let css = `/* SweetAlert++ Custom Theme */\n`;
    css += `/* Generated: ${new Date().toISOString()} */\n\n`;
    css += `:root {\n`;
    Object.entries(vars).forEach(([name, value]) => {
        css += `  ${name}: ${value};\n`;
    });
    css += `}\n\n`;
    css += `/* Apply ${theme} theme */\n`;
    css += `html { data-theme: "${theme}"; }\n`;
    return css;
}
/**
 * Export current theme as JavaScript config
 */
function exportThemeJS() {
    const config = getConfig();
    return `// SweetAlert++ Theme Configuration
// Generated: ${new Date().toISOString()}

import { applyConfig } from 'sweetalert-plus-plus';

applyConfig(${JSON.stringify(config, null, 2)});
`;
}
// Built-in theme presets
const themePresets = [
    {
        name: 'default',
        displayName: 'Default',
        config: { mode: 'system' },
        variables: {},
    },
    {
        name: 'midnight',
        displayName: 'Midnight',
        config: { mode: 'dark' },
        variables: {
            '--swal-primary': '#8b5cf6',
            '--swal-primary-rgb': '139, 92, 246',
            '--swal-bg': '#0a0a1a',
            '--swal-bg-secondary': '#12122a',
            '--swal-bg-tertiary': '#1a1a3a',
        },
    },
    {
        name: 'ocean',
        displayName: 'Ocean',
        config: { mode: 'dark' },
        variables: {
            '--swal-primary': '#0ea5e9',
            '--swal-primary-rgb': '14, 165, 233',
            '--swal-bg': '#0c1929',
            '--swal-bg-secondary': '#132337',
            '--swal-bg-tertiary': '#1a2d45',
        },
    },
    {
        name: 'forest',
        displayName: 'Forest',
        config: { mode: 'dark' },
        variables: {
            '--swal-primary': '#22c55e',
            '--swal-primary-rgb': '34, 197, 94',
            '--swal-bg': '#0a1a0f',
            '--swal-bg-secondary': '#122a18',
            '--swal-bg-tertiary': '#1a3a22',
        },
    },
    {
        name: 'sunset',
        displayName: 'Sunset',
        config: { mode: 'light' },
        variables: {
            '--swal-primary': '#f97316',
            '--swal-primary-rgb': '249, 115, 22',
        },
    },
    {
        name: 'rose',
        displayName: 'Rose',
        config: { mode: 'light' },
        variables: {
            '--swal-primary': '#e11d48',
            '--swal-primary-rgb': '225, 29, 72',
        },
    },
];
/**
 * Apply a built-in theme preset
 */
function applyPreset(presetName) {
    const preset = themePresets.find(p => p.name === presetName);
    if (preset) {
        applyConfig(preset.config);
        setVariables(preset.variables);
    }
}
// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '79, 70, 229'; // Default primary color RGB
}
function generateColorShades(hex) {
    // Simple shade generation based on HSL manipulation
    const rgb = hexToRgbArray(hex);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const shades = {};
    const lightnesses = {
        50: 0.97,
        100: 0.94,
        200: 0.86,
        300: 0.74,
        400: 0.60,
        500: 0.48,
        600: 0.40,
        700: 0.33,
        800: 0.26,
        900: 0.20,
    };
    Object.entries(lightnesses).forEach(([shade, lightness]) => {
        const [r, g, b] = hslToRgb(hsl[0], hsl[1], lightness);
        shades[parseInt(shade)] = rgbToHex(r, g, b);
    });
    return shades;
}
function hexToRgbArray(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ];
    }
    return [79, 70, 229];
}
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    return [h, s, l];
}
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Initialize on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    }
    else {
        initTheme();
    }
}

export { applyConfig, applyPreset, exportThemeCSS, exportThemeJS, getConfig, getResolvedTheme, getTheme, getVariable, initTheme, resetVariables, setAnimationSpeed, setAnimations, setBorderRadius, setPrimaryColor, setTheme, setVariable, setVariables, themePresets, toggleTheme };
//# sourceMappingURL=theme.esm.js.map
