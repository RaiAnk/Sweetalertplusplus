/**
 * Icon System
 * Lightweight, accessible SVG icons with customization support
 */

import type { IconType } from './types';

// ============================================================================
// Default Icon SVGs
// ============================================================================

const ICONS: Record<Exclude<IconType, 'none'>, string> = {
  success: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  `,

  error: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  `,

  warning: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `,

  info: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  `,

  question: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `,

  loading: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="modal-icon-loading">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  `,
};

// ============================================================================
// Icon Colors
// ============================================================================

const ICON_COLORS: Record<Exclude<IconType, 'none' | 'loading'>, string> = {
  success: 'var(--modal-icon-success, #10b981)',
  error: 'var(--modal-icon-error, #ef4444)',
  warning: 'var(--modal-icon-warning, #f59e0b)',
  info: 'var(--modal-icon-info, #3b82f6)',
  question: 'var(--modal-icon-question, #8b5cf6)',
};

// ============================================================================
// Icon Registry (for customization)
// ============================================================================

const customIcons = new Map<string, string | HTMLElement>();

/**
 * Register a custom icon
 */
export function registerIcon(name: string, icon: string | HTMLElement): void {
  customIcons.set(name, icon);
}

/**
 * Unregister a custom icon
 */
export function unregisterIcon(name: string): void {
  customIcons.delete(name);
}

/**
 * Clear all custom icons
 */
export function clearCustomIcons(): void {
  customIcons.clear();
}

// ============================================================================
// Icon Rendering
// ============================================================================

export interface IconOptions {
  type: IconType | string;
  color?: string;
  size?: number | string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Create an icon element
 */
export function createIcon(options: IconOptions): HTMLElement | null {
  const { type, color, size = 64, className = '', ariaLabel } = options;

  if (type === 'none') {
    return null;
  }

  const container = document.createElement('div');
  container.className = `modal-icon modal-icon-${type} ${className}`.trim();

  // Set size
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  container.style.width = sizeValue;
  container.style.height = sizeValue;

  // Determine icon content
  let iconContent: string | HTMLElement;

  // Check for custom icon first
  if (customIcons.has(type)) {
    iconContent = customIcons.get(type)!;
  } else if (type in ICONS) {
    iconContent = ICONS[type as Exclude<IconType, 'none'>];
  } else if (typeof type === 'string' && type.startsWith('<')) {
    // Raw SVG string
    iconContent = type;
  } else {
    // Unknown icon type
    return null;
  }

  // Set content
  if (typeof iconContent === 'string') {
    container.innerHTML = iconContent;
  } else if (iconContent instanceof HTMLElement) {
    container.appendChild(iconContent.cloneNode(true));
  }

  // Apply color
  const iconColor = color || (type in ICON_COLORS ? ICON_COLORS[type as keyof typeof ICON_COLORS] : undefined);
  if (iconColor) {
    container.style.color = iconColor;
  }

  // Accessibility
  if (ariaLabel) {
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', ariaLabel);
  } else {
    container.setAttribute('aria-hidden', 'true');
  }

  return container;
}

/**
 * Get icon color for a type
 */
export function getIconColor(type: IconType): string | undefined {
  if (type === 'none' || type === 'loading') return undefined;
  return ICON_COLORS[type];
}

/**
 * Create animated success checkmark
 */
export function createAnimatedSuccess(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'modal-icon modal-icon-success modal-icon-animated';
  container.innerHTML = `
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <circle class="modal-icon-circle" cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2"/>
      <path class="modal-icon-check" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 27l8 8 16-16"/>
    </svg>
  `;
  return container;
}

/**
 * Create animated error X
 */
export function createAnimatedError(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'modal-icon modal-icon-error modal-icon-animated';
  container.innerHTML = `
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <circle class="modal-icon-circle" cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2"/>
      <path class="modal-icon-x" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M16 16l20 20M36 16l-20 20"/>
    </svg>
  `;
  return container;
}

/**
 * Inject icon animation styles
 */
export function injectIconAnimationStyles(): void {
  const styleId = 'modal-icon-animations';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .modal-icon-animated .modal-icon-circle {
      stroke-dasharray: 151;
      stroke-dashoffset: 151;
      animation: modal-icon-circle 0.4s ease-out forwards;
    }

    .modal-icon-animated .modal-icon-check {
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      animation: modal-icon-check 0.3s ease-out 0.4s forwards;
    }

    .modal-icon-animated .modal-icon-x {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
      animation: modal-icon-x 0.3s ease-out 0.4s forwards;
    }

    @keyframes modal-icon-circle {
      to { stroke-dashoffset: 0; }
    }

    @keyframes modal-icon-check {
      to { stroke-dashoffset: 0; }
    }

    @keyframes modal-icon-x {
      to { stroke-dashoffset: 0; }
    }

    .modal-icon-loading svg {
      animation: modal-icon-spin 1s linear infinite;
    }

    @keyframes modal-icon-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-icon-animated .modal-icon-circle,
      .modal-icon-animated .modal-icon-check,
      .modal-icon-animated .modal-icon-x {
        animation: none;
        stroke-dashoffset: 0;
      }

      .modal-icon-loading svg {
        animation-duration: 2s;
      }
    }
  `;

  document.head.appendChild(style);
}
