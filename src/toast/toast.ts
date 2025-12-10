/**
 * Toast Notification System
 * Lightweight, accessible, stackable toasts
 */

import type { ToastOptions, ToastPosition, IconType } from '../core/types';
import { createIcon, injectIconAnimationStyles } from '../core/icons';
import { sanitize } from '../core/sanitizer';
import { announce } from '../core/a11y';
import { prefersReducedMotion } from '../core/a11y';

// ============================================================================
// Toast State
// ============================================================================

interface ToastInstance {
  id: string;
  element: HTMLElement;
  options: ToastOptions;
  timer: ReturnType<typeof setTimeout> | null;
  pausedAt: number | null;
  remainingTime: number;
  progressAnimation: Animation | null;
  onClose?: () => void;
}

interface ToastContainer {
  element: HTMLElement;
  position: ToastPosition;
  toasts: ToastInstance[];
}

const containers = new Map<ToastPosition, ToastContainer>();
const allToasts = new Map<string, ToastInstance>();

let toastIdCounter = 0;

// Default configuration
let defaultOptions: Partial<ToastOptions> = {
  position: 'top-end',
  duration: 5000,
  progressBar: true,
  pauseOnHover: true,
  pauseOnBlur: true,
  closeOnClick: true,
  draggable: true,
  dragDirection: 'x',
  showCloseButton: true,
};

// ============================================================================
// Configuration
// ============================================================================

export function setToastDefaults(options: Partial<ToastOptions>): void {
  defaultOptions = { ...defaultOptions, ...options };
}

export function getToastDefaults(): Partial<ToastOptions> {
  return { ...defaultOptions };
}

// ============================================================================
// Container Management
// ============================================================================

function getContainer(position: ToastPosition): ToastContainer {
  if (containers.has(position)) {
    return containers.get(position)!;
  }

  const element = document.createElement('div');
  element.className = 'toast-container';
  element.setAttribute('data-position', position);
  element.setAttribute('role', 'region');
  element.setAttribute('aria-label', 'Notifications');
  element.setAttribute('aria-live', 'polite');

  // Position styles
  const styles: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    zIndex: '10001',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    maxHeight: '100vh',
    overflowY: 'auto',
    pointerEvents: 'none',
  };

  // Position-specific styles
  switch (position) {
    case 'top-start':
      Object.assign(styles, { top: '0', left: '0', alignItems: 'flex-start' });
      break;
    case 'top-center':
      Object.assign(styles, { top: '0', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' });
      break;
    case 'top-end':
      Object.assign(styles, { top: '0', right: '0', alignItems: 'flex-end' });
      break;
    case 'bottom-start':
      Object.assign(styles, { bottom: '0', left: '0', alignItems: 'flex-start', flexDirection: 'column-reverse' });
      break;
    case 'bottom-center':
      Object.assign(styles, { bottom: '0', left: '50%', transform: 'translateX(-50%)', alignItems: 'center', flexDirection: 'column-reverse' });
      break;
    case 'bottom-end':
      Object.assign(styles, { bottom: '0', right: '0', alignItems: 'flex-end', flexDirection: 'column-reverse' });
      break;
  }

  Object.assign(element.style, styles);
  document.body.appendChild(element);

  const container: ToastContainer = {
    element,
    position,
    toasts: [],
  };

  containers.set(position, container);
  return container;
}

function removeContainerIfEmpty(position: ToastPosition): void {
  const container = containers.get(position);
  if (container && container.toasts.length === 0) {
    container.element.remove();
    containers.delete(position);
  }
}

// ============================================================================
// Toast Creation
// ============================================================================

function generateToastId(): string {
  return `toast-${Date.now().toString(36)}-${(toastIdCounter++).toString(36)}`;
}

function createToastElement(options: ToastOptions, id: string): HTMLElement {
  injectIconAnimationStyles();
  injectToastStyles();

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.style.pointerEvents = 'auto';

  if (options.className) {
    toast.className += ` ${options.className}`;
  }

  // Icon
  if (options.icon && options.icon !== 'none') {
    const iconEl = createIcon({
      type: typeof options.icon === 'string' ? options.icon : 'info',
      color: options.iconColor,
      size: 24,
    });
    if (iconEl) {
      iconEl.className = 'toast-icon';
      toast.appendChild(iconEl);
    }
  }

  // Content container
  const content = document.createElement('div');
  content.className = 'toast-content';

  // Title
  if (options.title) {
    const title = document.createElement('div');
    title.className = 'toast-title';
    if (typeof options.title === 'string') {
      title.textContent = options.title;
    } else {
      title.appendChild(options.title.cloneNode(true));
    }
    content.appendChild(title);
  }

  // Text/HTML
  if (options.text || options.html) {
    const body = document.createElement('div');
    body.className = 'toast-body';

    if (options.html) {
      if (typeof options.html === 'string') {
        body.innerHTML = options.allowUnsafeHtml
          ? options.html
          : (options.sanitizer ? options.sanitizer(options.html) : sanitize(options.html));
      } else {
        body.appendChild(options.html.cloneNode(true));
      }
    } else if (options.text) {
      body.textContent = options.text;
    }

    content.appendChild(body);
  }

  toast.appendChild(content);

  // Actions
  if (options.actions && options.actions.length > 0) {
    const actions = document.createElement('div');
    actions.className = 'toast-actions';

    options.actions.forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `toast-action ${action.className || ''}`;
      btn.textContent = action.text;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        action.onClick();
      });
      actions.appendChild(btn);
    });

    toast.appendChild(actions);
  }

  // Close button
  if (options.showCloseButton !== false) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    toast.appendChild(closeBtn);
  }

  // Progress bar
  if (options.progressBar && options.duration && options.duration > 0) {
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    toast.appendChild(progress);
  }

  return toast;
}

// ============================================================================
// Main Toast Function
// ============================================================================

export function toast(options: ToastOptions | string): ToastInstance {
  // Handle string shorthand
  const opts: ToastOptions = typeof options === 'string'
    ? { text: options }
    : options;

  // Merge with defaults
  const mergedOptions: ToastOptions = {
    ...defaultOptions,
    ...opts,
  };

  const id = mergedOptions.id || generateToastId();
  const position = mergedOptions.position || 'top-end';
  const container = getContainer(position);

  // Check max visible
  if (mergedOptions.maxVisible && container.toasts.length >= mergedOptions.maxVisible) {
    const oldest = container.toasts[0];
    if (oldest) {
      dismissToast(oldest.id);
    }
  }

  // Create element
  const element = createToastElement(mergedOptions, id);

  // Create instance
  const instance: ToastInstance = {
    id,
    element,
    options: mergedOptions,
    timer: null,
    pausedAt: null,
    remainingTime: mergedOptions.duration || 0,
    progressAnimation: null,
  };

  // Store instance
  allToasts.set(id, instance);
  container.toasts.push(instance);

  // Add to DOM
  container.element.appendChild(element);

  // Animate in
  animateIn(element, position);

  // Announce to screen readers
  const announcement = [mergedOptions.title, mergedOptions.text].filter(Boolean).join(': ');
  if (announcement) {
    announce(announcement, { assertive: false, delay: 100 });
  }

  // Setup timer
  if (mergedOptions.duration && mergedOptions.duration > 0) {
    startTimer(instance);
  }

  // Event listeners
  setupEventListeners(instance, container);

  return instance;
}

// ============================================================================
// Timer Management
// ============================================================================

function startTimer(instance: ToastInstance): void {
  const { options, element } = instance;
  const duration = instance.remainingTime;

  if (duration <= 0) return;

  // Progress bar animation
  if (options.progressBar) {
    const progressEl = element.querySelector('.toast-progress') as HTMLElement;
    if (progressEl && !prefersReducedMotion()) {
      instance.progressAnimation = progressEl.animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        { duration, fill: 'forwards' }
      );
    }
  }

  // Timer
  instance.timer = setTimeout(() => {
    dismissToast(instance.id);
  }, duration);
}

function pauseTimer(instance: ToastInstance): void {
  if (instance.timer) {
    clearTimeout(instance.timer);
    instance.timer = null;
  }

  if (instance.pausedAt === null) {
    instance.pausedAt = Date.now();
  }

  if (instance.progressAnimation) {
    instance.progressAnimation.pause();
  }
}

function resumeTimer(instance: ToastInstance): void {
  if (instance.pausedAt !== null) {
    const elapsed = Date.now() - instance.pausedAt;
    instance.remainingTime = Math.max(0, instance.remainingTime - elapsed);
    instance.pausedAt = null;
  }

  if (instance.progressAnimation) {
    instance.progressAnimation.play();
  }

  if (instance.remainingTime > 0) {
    instance.timer = setTimeout(() => {
      dismissToast(instance.id);
    }, instance.remainingTime);
  }
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners(instance: ToastInstance, container: ToastContainer): void {
  const { element, options } = instance;

  // Close button
  const closeBtn = element.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast(instance.id);
    });
  }

  // Click to dismiss
  if (options.closeOnClick) {
    element.addEventListener('click', () => {
      dismissToast(instance.id);
    });
  }

  // Pause on hover
  if (options.pauseOnHover && options.duration && options.duration > 0) {
    element.addEventListener('mouseenter', () => pauseTimer(instance));
    element.addEventListener('mouseleave', () => resumeTimer(instance));
  }

  // Pause on window blur
  if (options.pauseOnBlur && options.duration && options.duration > 0) {
    const handleVisibility = () => {
      if (document.hidden) {
        pauseTimer(instance);
      } else {
        resumeTimer(instance);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Store cleanup function
    (instance as any)._cleanupVisibility = () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }

  // Draggable
  if (options.draggable) {
    setupDraggable(instance);
  }
}

function setupDraggable(instance: ToastInstance): void {
  const { element, options } = instance;
  const direction = options.dragDirection || 'x';

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;

  function handleStart(e: MouseEvent | TouchEvent) {
    isDragging = true;
    const point = 'touches' in e ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    element.style.transition = 'none';
    pauseTimer(instance);
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;

    const point = 'touches' in e ? e.touches[0] : e;
    currentX = point.clientX - startX;
    currentY = point.clientY - startY;

    const translate = direction === 'x'
      ? `translateX(${currentX}px)`
      : `translateY(${currentY}px)`;

    const distance = direction === 'x' ? Math.abs(currentX) : Math.abs(currentY);
    const opacity = Math.max(0, 1 - distance / 200);

    element.style.transform = translate;
    element.style.opacity = String(opacity);
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    const distance = direction === 'x' ? Math.abs(currentX) : Math.abs(currentY);

    if (distance > 100) {
      // Dismiss
      const finalTranslate = direction === 'x'
        ? `translateX(${currentX > 0 ? '100%' : '-100%'})`
        : `translateY(${currentY > 0 ? '100%' : '-100%'})`;

      element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      element.style.transform = finalTranslate;
      element.style.opacity = '0';

      setTimeout(() => dismissToast(instance.id), 200);
    } else {
      // Snap back
      element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
      resumeTimer(instance);
    }

    currentX = 0;
    currentY = 0;
  }

  element.addEventListener('mousedown', handleStart);
  element.addEventListener('touchstart', handleStart, { passive: true });
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove, { passive: true });
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchend', handleEnd);

  // Store cleanup
  (instance as any)._cleanupDrag = () => {
    element.removeEventListener('mousedown', handleStart);
    element.removeEventListener('touchstart', handleStart);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
  };
}

// ============================================================================
// Animations
// ============================================================================

function animateIn(element: HTMLElement, position: ToastPosition): void {
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return;
  }

  const isTop = position.startsWith('top');
  const isStart = position.endsWith('start');
  const isEnd = position.endsWith('end');

  let transform: string;
  if (isStart) {
    transform = 'translateX(-100%)';
  } else if (isEnd) {
    transform = 'translateX(100%)';
  } else {
    transform = isTop ? 'translateY(-100%)' : 'translateY(100%)';
  }

  element.animate(
    [
      { opacity: 0, transform },
      { opacity: 1, transform: 'translate(0)' },
    ],
    {
      duration: 200,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    }
  );
}

function animateOut(element: HTMLElement, position: ToastPosition): Promise<void> {
  return new Promise(resolve => {
    if (prefersReducedMotion()) {
      element.style.opacity = '0';
      resolve();
      return;
    }

    const animation = element.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.9)' },
      ],
      {
        duration: 150,
        easing: 'ease-out',
        fill: 'forwards',
      }
    );

    animation.onfinish = () => resolve();
  });
}

// ============================================================================
// Dismiss
// ============================================================================

export async function dismissToast(id: string): Promise<void> {
  const instance = allToasts.get(id);
  if (!instance) return;

  // Clear timer
  if (instance.timer) {
    clearTimeout(instance.timer);
  }

  // Cancel progress animation
  if (instance.progressAnimation) {
    instance.progressAnimation.cancel();
  }

  // Cleanup event listeners
  if ((instance as any)._cleanupVisibility) {
    (instance as any)._cleanupVisibility();
  }
  if ((instance as any)._cleanupDrag) {
    (instance as any)._cleanupDrag();
  }

  // Animate out
  await animateOut(instance.element, instance.options.position || 'top-end');

  // Remove from DOM
  instance.element.remove();

  // Remove from container
  const position = instance.options.position || 'top-end';
  const container = containers.get(position);
  if (container) {
    const index = container.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      container.toasts.splice(index, 1);
    }
    removeContainerIfEmpty(position);
  }

  // Remove from global map
  allToasts.delete(id);

  // Callback
  if (instance.onClose) {
    instance.onClose();
  }
}

export function dismissAllToasts(): void {
  allToasts.forEach((_, id) => dismissToast(id));
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const success = (options: ToastOptions | string) =>
  toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'success' });

export const error = (options: ToastOptions | string) =>
  toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'error' });

export const warning = (options: ToastOptions | string) =>
  toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'warning' });

export const info = (options: ToastOptions | string) =>
  toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'info' });

export const loading = (options: ToastOptions | string) =>
  toast({
    ...(typeof options === 'string' ? { text: options } : options),
    icon: 'loading',
    duration: 0,
    closeOnClick: false,
  });

// ============================================================================
// Promise Toast
// ============================================================================

export interface PromiseToastOptions<T> {
  loading: string | ToastOptions;
  success: string | ((data: T) => string | ToastOptions);
  error: string | ((err: any) => string | ToastOptions);
}

export async function promise<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  options: PromiseToastOptions<T>
): Promise<T> {
  const loadingToast = loading(options.loading);
  const loadingId = loadingToast.id;

  try {
    const result = await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn);

    await dismissToast(loadingId);

    const successOpts = typeof options.success === 'function'
      ? options.success(result)
      : options.success;

    success(successOpts);

    return result;
  } catch (err) {
    await dismissToast(loadingId);

    const errorOpts = typeof options.error === 'function'
      ? options.error(err)
      : options.error;

    error(errorOpts);

    throw err;
  }
}

// ============================================================================
// Inject Toast Styles
// ============================================================================

function injectToastStyles(): void {
  const styleId = 'modal-toast-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .toast {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      min-width: 300px;
      max-width: 400px;
      padding: 1rem;
      background: var(--modal-bg, #fff);
      border-radius: var(--modal-radius-lg, 0.5rem);
      box-shadow: var(--modal-shadow-lg);
      font-family: var(--modal-font-family, system-ui, sans-serif);
      font-size: var(--modal-font-size-sm, 0.875rem);
      color: var(--modal-text, #111827);
      cursor: pointer;
      overflow: hidden;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: var(--modal-font-weight-semibold, 600);
      margin-bottom: 0.25rem;
    }

    .toast-body {
      color: var(--modal-text-muted, #6b7280);
    }

    .toast-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .toast-action {
      padding: 0.25rem 0.5rem;
      font-size: var(--modal-font-size-xs, 0.75rem);
      font-weight: var(--modal-font-weight-medium, 500);
      color: var(--modal-color-primary, #3b82f6);
      background: transparent;
      border: none;
      border-radius: var(--modal-radius-sm, 0.25rem);
      cursor: pointer;
    }

    .toast-action:hover {
      background: var(--modal-color-gray-100, #f3f4f6);
    }

    .toast-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--modal-radius-sm, 0.25rem);
      color: var(--modal-color-gray-400, #9ca3af);
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease, background 0.15s ease;
    }

    .toast:hover .toast-close {
      opacity: 1;
    }

    .toast-close:hover {
      background: var(--modal-color-gray-100, #f3f4f6);
      color: var(--modal-color-gray-600, #4b5563);
    }

    .toast-close svg {
      width: 0.875rem;
      height: 0.875rem;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--modal-color-primary, #3b82f6);
      transform-origin: left;
    }

    @media (prefers-color-scheme: dark) {
      .toast {
        background: var(--modal-color-gray-800, #1f2937);
        color: var(--modal-color-gray-100, #f3f4f6);
      }

      .toast-body {
        color: var(--modal-color-gray-400, #9ca3af);
      }

      .toast-close:hover {
        background: var(--modal-color-gray-700, #374151);
      }

      .toast-action:hover {
        background: var(--modal-color-gray-700, #374151);
      }
    }

    @media (max-width: 640px) {
      .toast {
        min-width: auto;
        max-width: calc(100vw - 2rem);
      }

      .toast-container {
        padding: 0.5rem !important;
      }
    }
  `;

  document.head.appendChild(style);
}
