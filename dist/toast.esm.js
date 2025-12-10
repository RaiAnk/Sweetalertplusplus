/*!
 * SweetAlert++ v1.0.0
 * Enterprise-grade, accessible, customizable modal and alert library with 30+ form field types, theme system, and advanced visual effects
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) 2025
 * Released under the MIT License
 */
/**
 * Icon System
 * Lightweight, accessible SVG icons with customization support
 */
// ============================================================================
// Default Icon SVGs
// ============================================================================
const ICONS = {
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
const ICON_COLORS = {
    success: 'var(--modal-icon-success, #10b981)',
    error: 'var(--modal-icon-error, #ef4444)',
    warning: 'var(--modal-icon-warning, #f59e0b)',
    info: 'var(--modal-icon-info, #3b82f6)',
    question: 'var(--modal-icon-question, #8b5cf6)',
};
// ============================================================================
// Icon Registry (for customization)
// ============================================================================
const customIcons = new Map();
/**
 * Create an icon element
 */
function createIcon(options) {
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
    let iconContent;
    // Check for custom icon first
    if (customIcons.has(type)) {
        iconContent = customIcons.get(type);
    }
    else if (type in ICONS) {
        iconContent = ICONS[type];
    }
    else if (typeof type === 'string' && type.startsWith('<')) {
        // Raw SVG string
        iconContent = type;
    }
    else {
        // Unknown icon type
        return null;
    }
    // Set content
    if (typeof iconContent === 'string') {
        container.innerHTML = iconContent;
    }
    else if (iconContent instanceof HTMLElement) {
        container.appendChild(iconContent.cloneNode(true));
    }
    // Apply color
    const iconColor = color || (type in ICON_COLORS ? ICON_COLORS[type] : undefined);
    if (iconColor) {
        container.style.color = iconColor;
    }
    // Accessibility
    if (ariaLabel) {
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', ariaLabel);
    }
    else {
        container.setAttribute('aria-hidden', 'true');
    }
    return container;
}
/**
 * Inject icon animation styles
 */
function injectIconAnimationStyles() {
    const styleId = 'modal-icon-animations';
    if (document.getElementById(styleId))
        return;
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

/**
 * HTML Sanitizer
 * Secure by default, CSP-friendly HTML sanitization
 */
// ============================================================================
// Allowed Elements and Attributes
// ============================================================================
const ALLOWED_TAGS = new Set([
    'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong',
    'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
    'mark', 'small', 'del', 'ins', 'figure', 'figcaption', 'kbd', 'var', 'samp',
]);
const ALLOWED_ATTRIBUTES = {
    '*': new Set(['class', 'id', 'title', 'lang', 'dir', 'data-*']),
    'a': new Set(['href', 'target', 'rel']),
    'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
    'td': new Set(['colspan', 'rowspan']),
    'th': new Set(['colspan', 'rowspan', 'scope']),
    'ol': new Set(['start', 'type', 'reversed']),
    'li': new Set(['value']),
    'blockquote': new Set(['cite']),
};
// Protocols allowed in URLs
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'data:']);
// Dangerous patterns
const DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
];
/**
 * Check if an attribute value is safe
 */
function isAttributeSafe(name, value, options) {
    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(value)) {
            return false;
        }
    }
    // Check URL attributes
    if (name === 'href' || name === 'src') {
        try {
            const url = new URL(value, window.location.origin);
            // Custom validator
            if (options.urlValidator) {
                return options.urlValidator(value);
            }
            // Check protocol
            if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
                return false;
            }
            // Block data: URLs unless explicitly allowed
            if (url.protocol === 'data:' && !options.allowDataUrls) {
                return false;
            }
            return true;
        }
        catch {
            // Relative URLs are OK
            return !value.includes(':') || value.startsWith('/');
        }
    }
    return true;
}
/**
 * Check if an attribute is allowed for a tag
 */
function isAttributeAllowed(tagName, attrName, options) {
    const globalAllowed = ALLOWED_ATTRIBUTES['*'];
    const tagAllowed = ALLOWED_ATTRIBUTES[tagName.toLowerCase()];
    const customAllowed = options.allowedAttributes?.[tagName.toLowerCase()];
    // Check global allowed
    if (globalAllowed?.has(attrName))
        return true;
    if (globalAllowed?.has('data-*') && attrName.startsWith('data-'))
        return true;
    // Check tag-specific allowed
    if (tagAllowed?.has(attrName))
        return true;
    // Check custom allowed
    if (customAllowed?.includes(attrName))
        return true;
    return false;
}
/**
 * Sanitize HTML string
 */
function sanitize(html, options = {}) {
    // Fast path for empty or plaintext
    if (!html || !html.includes('<')) {
        return escapeHtml(html);
    }
    // Build allowed tags set
    const allowedTags = new Set(ALLOWED_TAGS);
    if (options.allowedTags) {
        options.allowedTags.forEach(tag => allowedTags.add(tag.toLowerCase()));
    }
    // Use DOMParser for parsing (safer than innerHTML)
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
    const body = doc.body;
    // Walk and sanitize
    sanitizeNode(body, allowedTags, options);
    return body.innerHTML;
}
/**
 * Recursively sanitize a node
 */
function sanitizeNode(node, allowedTags, options) {
    const nodesToRemove = [];
    node.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child;
            const tagName = el.tagName.toLowerCase();
            if (!allowedTags.has(tagName)) {
                // Remove tag but keep content
                nodesToRemove.push(child);
                // We'll handle the children after
            }
            else {
                // Sanitize attributes
                const attrsToRemove = [];
                for (let i = 0; i < el.attributes.length; i++) {
                    const attr = el.attributes[i];
                    const attrName = attr.name.toLowerCase();
                    if (!isAttributeAllowed(tagName, attrName, options)) {
                        attrsToRemove.push(attr.name);
                    }
                    else if (!isAttributeSafe(attrName, attr.value, options)) {
                        attrsToRemove.push(attr.name);
                    }
                }
                // Remove unsafe attributes
                attrsToRemove.forEach(name => el.removeAttribute(name));
                // Add security attributes for links
                if (tagName === 'a') {
                    const target = el.getAttribute('target');
                    if (target === '_blank' && options.allowTargetBlank !== false) {
                        // Prevent tabnabbing
                        el.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                // Recurse into children
                sanitizeNode(el, allowedTags, options);
            }
        }
        else if (child.nodeType === Node.COMMENT_NODE) {
            // Remove comments
            nodesToRemove.push(child);
        }
    });
    // Remove disallowed nodes (but keep their text content for block elements)
    nodesToRemove.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child;
            // Move children before removing
            while (el.firstChild) {
                el.parentNode?.insertBefore(el.firstChild, el);
            }
        }
        child.parentNode?.removeChild(child);
    });
}
/**
 * Escape HTML entities
 */
function escapeHtml(str) {
    if (!str)
        return '';
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;',
    };
    return str.replace(/[&<>"'`]/g, char => escapeMap[char] || char);
}

/**
 * Accessibility Module
 * Complete A11y support: ARIA, screen readers, announcements, reduced motion
 */
// ============================================================================
// Live Region Announcements
// ============================================================================
let liveRegion = null;
let politeRegion = null;
function createLiveRegion(assertive = true) {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'modal-live-region';
    region.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
    document.body.appendChild(region);
    return region;
}
function getLiveRegion(polite = false) {
    if (polite) {
        if (!politeRegion) {
            politeRegion = createLiveRegion(false);
        }
        return politeRegion;
    }
    if (!liveRegion) {
        liveRegion = createLiveRegion(true);
    }
    return liveRegion;
}
/**
 * Announce a message to screen readers
 */
function announce(message, options = {}) {
    const { assertive = true, delay = 100 } = options;
    const region = getLiveRegion(!assertive);
    // Clear first to ensure re-announcement of same message
    region.textContent = '';
    // Small delay ensures screen readers catch the change
    setTimeout(() => {
        region.textContent = message;
    }, delay);
    // Clear after announcement
    setTimeout(() => {
        region.textContent = '';
    }, delay + 3000);
}
// ============================================================================
// Reduced Motion
// ============================================================================
/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    if (typeof window === 'undefined')
        return false;
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    return query?.matches ?? false;
}

/**
 * Toast Notification System
 * Lightweight, accessible, stackable toasts
 */
const containers = new Map();
const allToasts = new Map();
let toastIdCounter = 0;
// Default configuration
let defaultOptions = {
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
function setToastDefaults(options) {
    defaultOptions = { ...defaultOptions, ...options };
}
function getToastDefaults() {
    return { ...defaultOptions };
}
// ============================================================================
// Container Management
// ============================================================================
function getContainer(position) {
    if (containers.has(position)) {
        return containers.get(position);
    }
    const element = document.createElement('div');
    element.className = 'toast-container';
    element.setAttribute('data-position', position);
    element.setAttribute('role', 'region');
    element.setAttribute('aria-label', 'Notifications');
    element.setAttribute('aria-live', 'polite');
    // Position styles
    const styles = {
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
    const container = {
        element,
        position,
        toasts: [],
    };
    containers.set(position, container);
    return container;
}
function removeContainerIfEmpty(position) {
    const container = containers.get(position);
    if (container && container.toasts.length === 0) {
        container.element.remove();
        containers.delete(position);
    }
}
// ============================================================================
// Toast Creation
// ============================================================================
function generateToastId() {
    return `toast-${Date.now().toString(36)}-${(toastIdCounter++).toString(36)}`;
}
function createToastElement(options, id) {
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
        }
        else {
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
            }
            else {
                body.appendChild(options.html.cloneNode(true));
            }
        }
        else if (options.text) {
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
function toast(options) {
    // Handle string shorthand
    const opts = typeof options === 'string'
        ? { text: options }
        : options;
    // Merge with defaults
    const mergedOptions = {
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
    const instance = {
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
    setupEventListeners(instance);
    return instance;
}
// ============================================================================
// Timer Management
// ============================================================================
function startTimer(instance) {
    const { options, element } = instance;
    const duration = instance.remainingTime;
    if (duration <= 0)
        return;
    // Progress bar animation
    if (options.progressBar) {
        const progressEl = element.querySelector('.toast-progress');
        if (progressEl && !prefersReducedMotion()) {
            instance.progressAnimation = progressEl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration, fill: 'forwards' });
        }
    }
    // Timer
    instance.timer = setTimeout(() => {
        dismissToast(instance.id);
    }, duration);
}
function pauseTimer(instance) {
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
function resumeTimer(instance) {
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
function setupEventListeners(instance, container) {
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
            }
            else {
                resumeTimer(instance);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        // Store cleanup function
        instance._cleanupVisibility = () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }
    // Draggable
    if (options.draggable) {
        setupDraggable(instance);
    }
}
function setupDraggable(instance) {
    const { element, options } = instance;
    const direction = options.dragDirection || 'x';
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    function handleStart(e) {
        isDragging = true;
        const point = 'touches' in e ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        element.style.transition = 'none';
        pauseTimer(instance);
    }
    function handleMove(e) {
        if (!isDragging)
            return;
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
        if (!isDragging)
            return;
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
        }
        else {
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
    instance._cleanupDrag = () => {
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
function animateIn(element, position) {
    if (prefersReducedMotion()) {
        element.style.opacity = '1';
        return;
    }
    const isTop = position.startsWith('top');
    const isStart = position.endsWith('start');
    const isEnd = position.endsWith('end');
    let transform;
    if (isStart) {
        transform = 'translateX(-100%)';
    }
    else if (isEnd) {
        transform = 'translateX(100%)';
    }
    else {
        transform = isTop ? 'translateY(-100%)' : 'translateY(100%)';
    }
    element.animate([
        { opacity: 0, transform },
        { opacity: 1, transform: 'translate(0)' },
    ], {
        duration: 200,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
    });
}
function animateOut(element, position) {
    return new Promise(resolve => {
        if (prefersReducedMotion()) {
            element.style.opacity = '0';
            resolve();
            return;
        }
        const animation = element.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.9)' },
        ], {
            duration: 150,
            easing: 'ease-out',
            fill: 'forwards',
        });
        animation.onfinish = () => resolve();
    });
}
// ============================================================================
// Dismiss
// ============================================================================
async function dismissToast(id) {
    const instance = allToasts.get(id);
    if (!instance)
        return;
    // Clear timer
    if (instance.timer) {
        clearTimeout(instance.timer);
    }
    // Cancel progress animation
    if (instance.progressAnimation) {
        instance.progressAnimation.cancel();
    }
    // Cleanup event listeners
    if (instance._cleanupVisibility) {
        instance._cleanupVisibility();
    }
    if (instance._cleanupDrag) {
        instance._cleanupDrag();
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
function dismissAllToasts() {
    allToasts.forEach((_, id) => dismissToast(id));
}
// ============================================================================
// Convenience Methods
// ============================================================================
const success = (options) => toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'success' });
const error = (options) => toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'error' });
const warning = (options) => toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'warning' });
const info = (options) => toast({ ...(typeof options === 'string' ? { text: options } : options), icon: 'info' });
const loading = (options) => toast({
    ...(typeof options === 'string' ? { text: options } : options),
    icon: 'loading',
    duration: 0,
    closeOnClick: false,
});
async function promise(promiseOrFn, options) {
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
    }
    catch (err) {
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
function injectToastStyles() {
    const styleId = 'modal-toast-styles';
    if (document.getElementById(styleId))
        return;
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

export { dismissAllToasts, dismissToast, error, getToastDefaults, info, loading, promise, setToastDefaults, success, toast, warning };
//# sourceMappingURL=toast.esm.js.map
