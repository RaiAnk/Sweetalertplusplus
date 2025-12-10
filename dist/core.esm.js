/*!
 * SweetAlert++ v1.0.0
 * Enterprise-grade, accessible, customizable modal and alert library with 30+ form field types, theme system, and advanced visual effects
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) 2025
 * Released under the MIT License
 */
/**
 * Focus Trap - Accessible focus management
 * Properly traps focus within modal with full keyboard navigation support
 */
const FOCUSABLE_SELECTORS = [
    'a[href]:not([disabled]):not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"]):not([type="hidden"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]:not([tabindex="-1"])',
].join(',');
function createFocusTrap(options) {
    let { container, initialFocus = 'first', returnFocusTo = document.activeElement, returnFocus = true, onEscape} = options;
    let active = false;
    let paused = false;
    let lastFocusedElement = null;
    // Sentinel elements to catch focus escaping
    let startSentinel = null;
    let endSentinel = null;
    function getFocusableElements() {
        const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
        return elements.filter(el => {
            // Check if visible and not hidden
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden')
                return false;
            if (el.offsetWidth === 0 && el.offsetHeight === 0)
                return false;
            return true;
        });
    }
    function getFirstFocusable() {
        const focusable = getFocusableElements();
        return focusable[0] || null;
    }
    function getLastFocusable() {
        const focusable = getFocusableElements();
        return focusable[focusable.length - 1] || null;
    }
    function getInitialFocusElement() {
        if (!initialFocus)
            return getFirstFocusable();
        if (initialFocus === 'first')
            return getFirstFocusable();
        if (initialFocus === 'last')
            return getLastFocusable();
        if (typeof initialFocus === 'string') {
            return container.querySelector(initialFocus);
        }
        return initialFocus;
    }
    function handleKeyDown(event) {
        if (!active || paused)
            return;
        // Handle Escape
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (onEscape) {
                onEscape();
            }
            return;
        }
        // Handle Tab
        if (event.key === 'Tab') {
            const focusable = getFocusableElements();
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const activeElement = document.activeElement;
            if (event.shiftKey) {
                // Shift + Tab: backwards
                if (activeElement === first || !container.contains(activeElement)) {
                    event.preventDefault();
                    last.focus();
                }
            }
            else {
                // Tab: forwards
                if (activeElement === last || !container.contains(activeElement)) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }
    }
    function handleFocusIn(event) {
        if (!active || paused)
            return;
        const target = event.target;
        // If focus went to a sentinel, wrap around
        if (target === startSentinel) {
            const last = getLastFocusable();
            if (last)
                last.focus();
            return;
        }
        if (target === endSentinel) {
            const first = getFirstFocusable();
            if (first)
                first.focus();
            return;
        }
        // If focus escaped the container, bring it back
        if (!container.contains(target)) {
            // Try to focus last known element, or first focusable
            if (lastFocusedElement && container.contains(lastFocusedElement)) {
                lastFocusedElement.focus();
            }
            else {
                const first = getFirstFocusable();
                if (first)
                    first.focus();
            }
            return;
        }
        // Track last focused element within container
        lastFocusedElement = target;
    }
    function createSentinels() {
        // Create invisible focus sentinels at the start and end
        startSentinel = document.createElement('div');
        startSentinel.setAttribute('tabindex', '0');
        startSentinel.setAttribute('aria-hidden', 'true');
        startSentinel.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        endSentinel = document.createElement('div');
        endSentinel.setAttribute('tabindex', '0');
        endSentinel.setAttribute('aria-hidden', 'true');
        endSentinel.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        container.insertBefore(startSentinel, container.firstChild);
        container.appendChild(endSentinel);
    }
    function removeSentinels() {
        if (startSentinel && startSentinel.parentNode) {
            startSentinel.parentNode.removeChild(startSentinel);
        }
        if (endSentinel && endSentinel.parentNode) {
            endSentinel.parentNode.removeChild(endSentinel);
        }
        startSentinel = null;
        endSentinel = null;
    }
    function activate() {
        if (active)
            return;
        active = true;
        paused = false;
        // Store the element to return focus to
        if (returnFocus && !returnFocusTo) {
            returnFocusTo = document.activeElement;
        }
        // Create sentinels for additional focus catching
        createSentinels();
        // Add event listeners
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('focusin', handleFocusIn, true);
        // Focus initial element
        requestAnimationFrame(() => {
            const initialEl = getInitialFocusElement();
            if (initialEl) {
                initialEl.focus();
                lastFocusedElement = initialEl;
            }
        });
    }
    function deactivate() {
        if (!active)
            return;
        active = false;
        paused = false;
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('focusin', handleFocusIn, true);
        // Remove sentinels
        removeSentinels();
        // Return focus
        if (returnFocus && returnFocusTo && typeof returnFocusTo.focus === 'function') {
            // Use setTimeout to ensure focus returns after modal closes
            setTimeout(() => {
                if (returnFocusTo && document.body.contains(returnFocusTo)) {
                    returnFocusTo.focus();
                }
            }, 0);
        }
        lastFocusedElement = null;
    }
    function pause() {
        paused = true;
    }
    function resume() {
        paused = false;
    }
    function updateContainer(newContainer) {
        if (active) {
            removeSentinels();
            container = newContainer;
            createSentinels();
        }
        else {
            container = newContainer;
        }
    }
    function isActive() {
        return active && !paused;
    }
    return {
        activate,
        deactivate,
        pause,
        resume,
        updateContainer,
        isActive,
    };
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
/**
 * Announce modal opening
 */
function announceModalOpen(options) {
    const parts = [];
    if (options.a11y?.announceOnOpen) {
        announce(options.a11y.announceOnOpen);
        return;
    }
    // Build announcement from modal content
    if (options.title) {
        const titleText = typeof options.title === 'string'
            ? options.title
            : options.title.textContent || '';
        parts.push(titleText);
    }
    if (options.text) {
        parts.push(options.text);
    }
    if (options.icon && options.icon !== 'none') {
        const iconAnnouncements = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            question: 'Question',
            loading: 'Loading',
        };
        if (typeof options.icon === 'string' && iconAnnouncements[options.icon]) {
            parts.unshift(iconAnnouncements[options.icon] + ':');
        }
    }
    if (parts.length > 0) {
        announce(parts.join('. '), { assertive: true });
    }
}
/**
 * Announce validation error
 */
function announceError(message) {
    announce(`Error: ${message}`, { assertive: true });
}
/**
 * Announce loading state
 */
function announceLoading(loading, text) {
    if (loading) {
        announce(text || 'Loading, please wait...', { assertive: false });
    }
    else {
        announce('Loading complete', { assertive: false });
    }
}
/**
 * Build ARIA attributes for modal
 */
function buildAriaAttributes(options, ids) {
    const a11y = options.a11y || {};
    const attrs = {
        role: a11y.role || (options.buttons?.confirm || options.buttons?.deny ? 'alertdialog' : 'dialog'),
        'aria-modal': 'true',
    };
    // Labeling
    if (a11y.ariaLabel) {
        attrs['aria-label'] = a11y.ariaLabel;
    }
    else if (a11y.ariaLabelledBy) {
        attrs['aria-labelledby'] = a11y.ariaLabelledBy;
    }
    else if (options.title) {
        attrs['aria-labelledby'] = ids.titleId;
    }
    // Description
    if (a11y.ariaDescribedBy) {
        attrs['aria-describedby'] = a11y.ariaDescribedBy;
    }
    else if (options.text || options.html) {
        attrs['aria-describedby'] = ids.contentId;
    }
    return attrs;
}
/**
 * Apply ARIA attributes to element
 */
function applyAriaAttributes(element, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined) {
            element.setAttribute(key, value);
        }
    });
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
// ============================================================================
// Scroll Lock
// ============================================================================
let scrollLockCount = 0;
let originalStyles = null;
/**
 * Lock body scroll
 */
function lockScroll() {
    scrollLockCount++;
    if (scrollLockCount === 1) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        originalStyles = {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
        };
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    }
}
/**
 * Unlock body scroll
 */
function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0 && originalStyles) {
        document.body.style.overflow = originalStyles.overflow;
        document.body.style.paddingRight = originalStyles.paddingRight;
        originalStyles = null;
    }
}
// ============================================================================
// Inert Management
// ============================================================================
const inertElements = new WeakMap();
/**
 * Make all siblings of modal inert
 */
function makeOthersInert(modalContainer) {
    const siblings = document.body.children;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        // Skip the modal container itself
        if (sibling === modalContainer || sibling.contains(modalContainer))
            continue;
        // Skip live regions
        if (sibling.getAttribute('aria-live'))
            continue;
        // Store original inert state
        if (!sibling.hasAttribute('inert')) {
            inertElements.set(sibling, false);
        }
        sibling.setAttribute('inert', '');
        sibling.setAttribute('aria-hidden', 'true');
    }
}
/**
 * Remove inert from siblings
 */
function removeInert(modalContainer) {
    const siblings = document.body.children;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === modalContainer)
            continue;
        // Only remove if we added it
        if (inertElements.has(sibling)) {
            sibling.removeAttribute('inert');
            sibling.removeAttribute('aria-hidden');
            inertElements.delete(sibling);
        }
    }
}

/**
 * Animation System
 * Lightweight, performant animations with reduced-motion support
 */
const ANIMATION_PRESETS = {
    fade: {
        enter: [
            { opacity: 0 },
            { opacity: 1 },
        ],
        exit: [
            { opacity: 1 },
            { opacity: 0 },
        ],
    },
    scale: {
        enter: [
            { opacity: 0, transform: 'scale(0.85)' },
            { opacity: 1, transform: 'scale(1)' },
        ],
        exit: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.85)' },
        ],
    },
    'slide-up': {
        enter: [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],
        exit: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(20px)' },
        ],
    },
    'slide-down': {
        enter: [
            { opacity: 0, transform: 'translateY(-20px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],
        exit: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-20px)' },
        ],
    },
    'slide-left': {
        enter: [
            { opacity: 0, transform: 'translateX(20px)' },
            { opacity: 1, transform: 'translateX(0)' },
        ],
        exit: [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(20px)' },
        ],
    },
    'slide-right': {
        enter: [
            { opacity: 0, transform: 'translateX(-20px)' },
            { opacity: 1, transform: 'translateX(0)' },
        ],
        exit: [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(-20px)' },
        ],
    },
    none: {
        enter: [],
        exit: [],
    },
};
// Backdrop animations
const BACKDROP_ANIMATIONS = {
    enter: [
        { opacity: 0 },
        { opacity: 1 },
    ],
    exit: [
        { opacity: 1 },
        { opacity: 0 },
    ],
};
/**
 * Resolve animation configuration to concrete values
 */
function resolveAnimation(config, defaultDuration = 200) {
    // No animation
    if (config === false || config === 'none') {
        return {
            enterKeyframes: [],
            exitKeyframes: [],
            duration: 0,
            easing: 'linear',
            respectReducedMotion: true,
        };
    }
    // String preset
    if (typeof config === 'string') {
        const preset = ANIMATION_PRESETS[config] || ANIMATION_PRESETS.scale;
        return {
            enterKeyframes: preset.enter,
            exitKeyframes: preset.exit,
            duration: defaultDuration,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Custom easeOut
            respectReducedMotion: true,
        };
    }
    // Full config object
    if (config && typeof config === 'object') {
        const enterPreset = typeof config.enter === 'string'
            ? ANIMATION_PRESETS[config.enter]?.enter || []
            : [];
        const exitPreset = typeof config.exit === 'string'
            ? ANIMATION_PRESETS[config.exit]?.exit || []
            : [];
        return {
            enterKeyframes: enterPreset,
            exitKeyframes: exitPreset,
            duration: config.duration ?? defaultDuration,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            respectReducedMotion: config.respectReducedMotion ?? true,
        };
    }
    // Default
    return {
        enterKeyframes: ANIMATION_PRESETS.scale.enter,
        exitKeyframes: ANIMATION_PRESETS.scale.exit,
        duration: defaultDuration,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        respectReducedMotion: true,
    };
}
/**
 * Animate an element
 */
function animate(element, keyframes, options = {}) {
    const { duration = 200, easing = 'cubic-bezier(0.16, 1, 0.3, 1)', fill = 'forwards', respectReducedMotion = true, } = options;
    // Check reduced motion
    const shouldAnimate = !respectReducedMotion || !prefersReducedMotion();
    const actualDuration = shouldAnimate ? duration : 0;
    const actualKeyframes = shouldAnimate && keyframes.length > 0 ? keyframes : [{ opacity: 1 }];
    let animation = null;
    let resolvePromise = null;
    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
    });
    function play() {
        try {
            animation = element.animate(actualKeyframes, {
                duration: actualDuration,
                easing: actualDuration > 0 ? easing : 'linear',
                fill,
            });
            animation.onfinish = () => {
                resolvePromise?.();
            };
            animation.oncancel = () => {
                resolvePromise?.();
            };
        }
        catch (error) {
            // Fallback for browsers without Web Animations API
            if (actualKeyframes.length > 0) {
                const finalFrame = actualKeyframes[actualKeyframes.length - 1];
                Object.assign(element.style, finalFrame);
            }
            resolvePromise?.();
        }
        return promise;
    }
    function cancel() {
        animation?.cancel();
    }
    function pause() {
        animation?.pause();
    }
    function resume() {
        animation?.play();
    }
    function finish() {
        animation?.finish();
    }
    return {
        play,
        cancel,
        pause,
        resume,
        finish,
    };
}
/**
 * Animate modal enter
 */
function animateEnter(modal, backdrop, config) {
    const promises = [];
    // Animate backdrop
    if (backdrop) {
        const backdropAnim = animate(backdrop, BACKDROP_ANIMATIONS.enter, {
            duration: config.duration,
            respectReducedMotion: config.respectReducedMotion,
        });
        promises.push(backdropAnim.play());
    }
    // Animate modal
    const modalAnim = animate(modal, config.enterKeyframes, {
        duration: config.duration,
        easing: config.easing,
        respectReducedMotion: config.respectReducedMotion,
    });
    promises.push(modalAnim.play());
    return Promise.all(promises).then(() => { });
}
/**
 * Animate modal exit
 */
function animateExit(modal, backdrop, config) {
    const promises = [];
    // Animate modal first
    const modalAnim = animate(modal, config.exitKeyframes, {
        duration: config.duration,
        easing: config.easing,
        respectReducedMotion: config.respectReducedMotion,
    });
    promises.push(modalAnim.play());
    // Animate backdrop
    if (backdrop) {
        const backdropAnim = animate(backdrop, BACKDROP_ANIMATIONS.exit, {
            duration: config.duration,
            respectReducedMotion: config.respectReducedMotion,
        });
        promises.push(backdropAnim.play());
    }
    return Promise.all(promises).then(() => { });
}
/**
 * Create a timer progress animation
 */
function createTimerAnimation(progressElement, duration, onComplete) {
    let startTime = 0;
    let pausedAt = 0;
    let elapsed = 0;
    let rafId = null;
    let paused = false;
    function updateProgress() {
        if (paused)
            return;
        const now = performance.now();
        elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        progressElement.style.transform = `scaleX(${1 - progress})`;
        if (progress < 1) {
            rafId = requestAnimationFrame(updateProgress);
        }
        else {
            onComplete?.();
        }
    }
    function start() {
        startTime = performance.now();
        elapsed = 0;
        paused = false;
        progressElement.style.transformOrigin = 'left';
        progressElement.style.transform = 'scaleX(1)';
        rafId = requestAnimationFrame(updateProgress);
    }
    function pause() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        paused = true;
        pausedAt = performance.now();
    }
    function resume() {
        if (!paused)
            return;
        paused = false;
        // Adjust start time to account for pause duration
        startTime += performance.now() - pausedAt;
        rafId = requestAnimationFrame(updateProgress);
    }
    function reset() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        elapsed = 0;
        paused = false;
        progressElement.style.transform = 'scaleX(1)';
    }
    function getProgress() {
        return elapsed / duration;
    }
    function destroy() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    }
    return {
        start,
        pause,
        resume,
        reset,
        getProgress,
        destroy,
    };
}

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
 * Modal Renderer
 * Builds modal DOM with proper structure and accessibility
 */
// ============================================================================
// ID Generation
// ============================================================================
let idCounter = 0;
function generateId(prefix = 'modal') {
    return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}
function getClassNames(prefix = 'modal') {
    return {
        root: `${prefix}-root`,
        container: `${prefix}-container`,
        backdrop: `${prefix}-backdrop`,
        modal: `${prefix}-dialog`,
        header: `${prefix}-header`,
        icon: `${prefix}-icon`,
        title: `${prefix}-title`,
        closeButton: `${prefix}-close`,
        body: `${prefix}-body`,
        content: `${prefix}-content`,
        image: `${prefix}-image`,
        input: `${prefix}-input`,
        inputLabel: `${prefix}-input-label`,
        inputError: `${prefix}-input-error`,
        footer: `${prefix}-footer`,
        actions: `${prefix}-actions`,
        button: `${prefix}-btn`,
        buttonConfirm: `${prefix}-btn-confirm`,
        buttonDeny: `${prefix}-btn-deny`,
        buttonCancel: `${prefix}-btn-cancel`,
        timerProgress: `${prefix}-timer-progress`,
        loading: `${prefix}-loading`,
        loadingSpinner: `${prefix}-spinner`,
    };
}
// ============================================================================
// Button Rendering
// ============================================================================
function normalizeButtonConfig(config, defaults) {
    if (config === false)
        return null;
    if (config === true)
        return defaults;
    if (typeof config === 'string')
        return { ...defaults, text: config };
    if (typeof config === 'object')
        return { ...defaults, ...config };
    return null;
}
function createButton(config, action, classes) {
    const button = document.createElement('button');
    button.type = action === 'confirm' ? 'submit' : 'button';
    button.className = `${classes.button} ${classes[`button${action.charAt(0).toUpperCase() + action.slice(1)}`] || ''}`;
    if (config.className) {
        button.className += ` ${config.className}`;
    }
    if (config.variant) {
        button.className += ` ${classes.button}--${config.variant}`;
    }
    button.textContent = config.text || '';
    button.dataset.action = action;
    if (config.disabled) {
        button.disabled = true;
    }
    if (config.ariaLabel) {
        button.setAttribute('aria-label', config.ariaLabel);
    }
    if (config.autoFocus) {
        button.dataset.autofocus = 'true';
    }
    return button;
}
function renderButtons(config, classes) {
    const container = document.createElement('div');
    container.className = classes.actions;
    const buttons = [];
    // Confirm button
    const confirmConfig = normalizeButtonConfig(config?.confirm, {
        text: 'OK',
        variant: 'primary',
        visible: true,
    });
    if (confirmConfig?.visible !== false) {
        buttons.push(createButton(confirmConfig, 'confirm', classes));
    }
    // Deny button
    const denyConfig = normalizeButtonConfig(config?.deny, {
        text: 'No',
        variant: 'danger',
        visible: false,
    });
    if (denyConfig?.visible !== false && config?.deny) {
        buttons.push(createButton(denyConfig, 'deny', classes));
    }
    // Cancel button
    const cancelConfig = normalizeButtonConfig(config?.cancel, {
        text: 'Cancel',
        variant: 'secondary',
        visible: false,
    });
    if (cancelConfig?.visible !== false && config?.cancel) {
        buttons.push(createButton(cancelConfig, 'cancel', classes));
    }
    // Custom buttons
    if (config?.custom) {
        config.custom.forEach(customBtn => {
            const btn = createButton(customBtn, customBtn.id, classes);
            btn.className += ' modal-btn-custom';
            buttons.push(btn);
        });
    }
    if (buttons.length === 0) {
        return null;
    }
    // Apply layout
    if (config?.layout === 'vertical') {
        container.classList.add(`${classes.actions}--vertical`);
    }
    else if (config?.layout === 'space-between') {
        container.classList.add(`${classes.actions}--space-between`);
    }
    // Reverse order if needed
    const orderedButtons = config?.reverseOrder ? buttons.reverse() : buttons;
    orderedButtons.forEach(btn => container.appendChild(btn));
    return container;
}
// ============================================================================
// Input Rendering
// ============================================================================
function renderInput(config, classes) {
    const wrapper = document.createElement('div');
    wrapper.className = classes.input;
    // Label
    if (config.label) {
        const label = document.createElement('label');
        label.className = classes.inputLabel;
        label.textContent = config.label;
        label.id = generateId('label');
        wrapper.appendChild(label);
    }
    let input;
    switch (config.type) {
        case 'textarea':
            input = document.createElement('textarea');
            if (config.rows)
                input.rows = config.rows;
            break;
        case 'select':
            input = document.createElement('select');
            if (config.options) {
                config.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = String(opt.value);
                    option.textContent = opt.label;
                    if (opt.disabled)
                        option.disabled = true;
                    if (config.value !== undefined && String(opt.value) === String(config.value)) {
                        option.selected = true;
                    }
                    input.appendChild(option);
                });
            }
            break;
        case 'checkbox':
        case 'radio':
            // Create group
            const group = document.createElement('div');
            group.className = `${classes.input}-group`;
            group.setAttribute('role', config.type === 'radio' ? 'radiogroup' : 'group');
            if (config.options) {
                const groupName = generateId(config.type);
                config.options.forEach((opt, index) => {
                    const itemWrapper = document.createElement('label');
                    itemWrapper.className = `${classes.input}-item`;
                    const itemInput = document.createElement('input');
                    itemInput.type = config.type;
                    itemInput.name = groupName;
                    itemInput.value = String(opt.value);
                    if (opt.disabled)
                        itemInput.disabled = true;
                    // Check if this option is selected
                    if (config.type === 'checkbox') {
                        if (Array.isArray(config.value) && config.value.includes(opt.value)) {
                            itemInput.checked = true;
                        }
                    }
                    else {
                        if (config.value !== undefined && String(opt.value) === String(config.value)) {
                            itemInput.checked = true;
                        }
                    }
                    const itemLabel = document.createElement('span');
                    itemLabel.textContent = opt.label;
                    itemWrapper.appendChild(itemInput);
                    itemWrapper.appendChild(itemLabel);
                    group.appendChild(itemWrapper);
                });
            }
            wrapper.appendChild(group);
            // Error container
            const errorDiv = document.createElement('div');
            errorDiv.className = classes.inputError;
            errorDiv.setAttribute('role', 'alert');
            errorDiv.setAttribute('aria-live', 'polite');
            wrapper.appendChild(errorDiv);
            return wrapper;
        default:
            input = document.createElement('input');
            input.type = config.type || 'text';
            break;
    }
    // Common input setup
    input.className = `${classes.input}-field`;
    input.id = generateId('input');
    if (config.placeholder) {
        input.placeholder = config.placeholder;
    }
    if (config.value !== undefined && config.type !== 'checkbox' && config.type !== 'radio') {
        input.value = String(config.value);
    }
    if (config.required) {
        input.required = true;
    }
    if (config.autocomplete) {
        input.autocomplete = config.autocomplete;
    }
    if (config.autoFocus) {
        input.dataset.autofocus = 'true';
    }
    // Number-specific attributes
    if (config.type === 'number' || config.type === 'range') {
        if (config.min !== undefined)
            input.min = String(config.min);
        if (config.max !== undefined)
            input.max = String(config.max);
        if (config.step !== undefined)
            input.step = String(config.step);
    }
    // File-specific attributes
    if (config.type === 'file') {
        if (config.accept)
            input.accept = config.accept;
        if (config.multiple)
            input.multiple = true;
    }
    // Additional attributes
    if (config.attributes) {
        Object.entries(config.attributes).forEach(([key, value]) => {
            input.setAttribute(key, String(value));
        });
    }
    // Link label to input
    const label = wrapper.querySelector('label');
    if (label) {
        label.setAttribute('for', input.id);
    }
    wrapper.appendChild(input);
    // Error container
    const errorDiv = document.createElement('div');
    errorDiv.className = classes.inputError;
    errorDiv.id = `${input.id}-error`;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', errorDiv.id);
    wrapper.appendChild(errorDiv);
    return wrapper;
}
function render(options, prefix = 'modal') {
    const classes = getClassNames(prefix);
    const ids = {
        titleId: generateId('title'),
        contentId: generateId('content'),
        modalId: options.id || generateId('modal'),
    };
    // Inject icon animation styles if needed
    if (options.icon) {
        injectIconAnimationStyles();
    }
    // Root container
    const root = document.createElement('div');
    root.className = classes.root;
    if (options.className) {
        root.className += ` ${options.className}`;
    }
    root.id = ids.modalId;
    // Backdrop
    let backdrop = null;
    if (options.backdrop !== false) {
        backdrop = document.createElement('div');
        backdrop.className = classes.backdrop;
        if (options.backdropClass) {
            backdrop.className += ` ${options.backdropClass}`;
        }
        if (options.backdropOpacity !== undefined) {
            backdrop.style.setProperty('--modal-backdrop-opacity', String(options.backdropOpacity));
        }
        backdrop.setAttribute('aria-hidden', 'true');
        root.appendChild(backdrop);
    }
    // Container (for centering)
    const container = document.createElement('div');
    container.className = classes.container;
    if (options.position) {
        container.dataset.position = options.position;
    }
    // Modal dialog
    const modal = document.createElement('div');
    modal.className = classes.modal;
    // Size
    if (options.size) {
        modal.dataset.size = options.size;
    }
    // Custom width
    if (options.width) {
        modal.style.width = typeof options.width === 'number' ? `${options.width}px` : options.width;
    }
    // Custom max-height
    if (options.maxHeight) {
        modal.style.maxHeight = typeof options.maxHeight === 'number' ? `${options.maxHeight}px` : options.maxHeight;
    }
    // Custom inline styles
    if (options.style) {
        Object.assign(modal.style, options.style);
    }
    // Data attributes
    if (options.data) {
        Object.entries(options.data).forEach(([key, value]) => {
            modal.dataset[key] = value;
        });
    }
    // Apply ARIA attributes
    const ariaAttrs = buildAriaAttributes(options, ids);
    applyAriaAttributes(modal, ariaAttrs);
    // Z-index
    if (options.zIndex !== undefined) {
        root.style.zIndex = String(options.zIndex);
    }
    // Header section
    const header = document.createElement('div');
    header.className = classes.header;
    let closeButton = null;
    let titleElement = null;
    // Close button
    if (options.showCloseButton !== false) {
        closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = classes.closeButton;
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.dataset.action = 'close';
        closeButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
        header.appendChild(closeButton);
    }
    // Icon
    if (options.icon && options.icon !== 'none') {
        const iconEl = createIcon({
            type: typeof options.icon === 'string' ? options.icon : 'info',
            color: options.iconColor,
        });
        if (iconEl) {
            header.appendChild(iconEl);
        }
    }
    // Title
    if (options.title) {
        titleElement = document.createElement('h2');
        titleElement.className = classes.title;
        titleElement.id = ids.titleId;
        if (typeof options.title === 'string') {
            titleElement.textContent = options.title;
        }
        else {
            titleElement.appendChild(options.title.cloneNode(true));
        }
        header.appendChild(titleElement);
    }
    // Only add header if it has content
    if (header.children.length > 0) {
        modal.appendChild(header);
    }
    // Body section
    const body = document.createElement('div');
    body.className = classes.body;
    let contentElement = null;
    // Image
    if (options.image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = classes.image;
        const img = document.createElement('img');
        img.src = options.image.src;
        img.alt = options.image.alt || '';
        if (options.image.width) {
            img.style.width = typeof options.image.width === 'number' ? `${options.image.width}px` : options.image.width;
        }
        if (options.image.height) {
            img.style.height = typeof options.image.height === 'number' ? `${options.image.height}px` : options.image.height;
        }
        imageWrapper.appendChild(img);
        body.appendChild(imageWrapper);
    }
    // Content (text or html)
    if (options.text || options.html) {
        contentElement = document.createElement('div');
        contentElement.className = classes.content;
        contentElement.id = ids.contentId;
        if (options.html) {
            if (typeof options.html === 'string') {
                if (options.allowUnsafeHtml) {
                    contentElement.innerHTML = options.html;
                }
                else {
                    contentElement.innerHTML = options.sanitizer
                        ? options.sanitizer(options.html)
                        : sanitize(options.html);
                }
            }
            else {
                contentElement.appendChild(options.html.cloneNode(true));
            }
        }
        else if (options.text) {
            contentElement.textContent = options.text;
        }
        body.appendChild(contentElement);
    }
    // Input
    let inputElement = null;
    let inputWrapper = null;
    if (options.input) {
        inputWrapper = renderInput(options.input, classes);
        body.appendChild(inputWrapper);
        // Find the actual input element
        inputElement = inputWrapper.querySelector('input, textarea, select');
    }
    // Only add body if it has content
    if (body.children.length > 0) {
        modal.appendChild(body);
    }
    // Timer progress bar
    let timerProgress = null;
    if (options.timer && options.timerProgressBar) {
        timerProgress = document.createElement('div');
        timerProgress.className = classes.timerProgress;
        modal.appendChild(timerProgress);
    }
    // Footer / Actions
    const actionsContainer = renderButtons(options.buttons, classes);
    if (actionsContainer) {
        modal.appendChild(actionsContainer);
    }
    // Custom footer
    if (options.footer) {
        const footer = document.createElement('div');
        footer.className = classes.footer;
        if (typeof options.footer === 'string') {
            footer.innerHTML = options.sanitizer
                ? options.sanitizer(options.footer)
                : sanitize(options.footer);
        }
        else {
            footer.appendChild(options.footer.cloneNode(true));
        }
        modal.appendChild(footer);
    }
    container.appendChild(modal);
    root.appendChild(container);
    return {
        root,
        backdrop,
        modal,
        closeButton,
        titleElement,
        contentElement,
        inputElement,
        inputWrapper,
        actionsContainer,
        timerProgress,
        ids,
    };
}
// ============================================================================
// Loading State
// ============================================================================
function showLoadingState(modal, text, prefix = 'modal') {
    const classes = getClassNames(prefix);
    // Create loading overlay
    const loading = document.createElement('div');
    loading.className = classes.loading;
    const spinner = document.createElement('div');
    spinner.className = classes.loadingSpinner;
    spinner.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  `;
    loading.appendChild(spinner);
    if (text) {
        const loadingText = document.createElement('div');
        loadingText.className = `${classes.loading}-text`;
        loadingText.textContent = text;
        loading.appendChild(loadingText);
    }
    modal.appendChild(loading);
    modal.classList.add(`${classes.modal}--loading`);
    return loading;
}
function hideLoadingState(modal, prefix = 'modal') {
    const classes = getClassNames(prefix);
    const loading = modal.querySelector(`.${classes.loading}`);
    if (loading) {
        loading.remove();
    }
    modal.classList.remove(`${classes.modal}--loading`);
}

/**
 * Form Validation System
 * Comprehensive validation with built-in rules and custom validators
 */
// ============================================================================
// Built-in Validators
// ============================================================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const CREDIT_CARD_REGEX = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;
const builtInValidators = {
    required: (value, rule) => {
        if (value === null || value === undefined || value === '')
            return rule.message || 'This field is required';
        if (Array.isArray(value) && value.length === 0)
            return rule.message || 'This field is required';
        return true;
    },
    email: (value, rule) => {
        if (!value)
            return true; // Let required handle empty
        return EMAIL_REGEX.test(value) || rule.message || 'Please enter a valid email address';
    },
    url: (value, rule) => {
        if (!value)
            return true;
        return URL_REGEX.test(value) || rule.message || 'Please enter a valid URL';
    },
    phone: (value, rule) => {
        if (!value)
            return true;
        const cleaned = value.replace(/\s/g, '');
        return PHONE_REGEX.test(cleaned) || rule.message || 'Please enter a valid phone number';
    },
    creditCard: (value, rule) => {
        if (!value)
            return true;
        const cleaned = value.replace(/[\s-]/g, '');
        return CREDIT_CARD_REGEX.test(cleaned) || rule.message || 'Please enter a valid credit card number';
    },
    min: (value, rule) => {
        if (value === null || value === undefined || value === '')
            return true;
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num))
            return true;
        return num >= rule.value || rule.message || `Value must be at least ${rule.value}`;
    },
    max: (value, rule) => {
        if (value === null || value === undefined || value === '')
            return true;
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num))
            return true;
        return num <= rule.value || rule.message || `Value must be at most ${rule.value}`;
    },
    minLength: (value, rule) => {
        if (!value)
            return true;
        const len = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
        return len >= rule.value || rule.message || `Must be at least ${rule.value} characters`;
    },
    maxLength: (value, rule) => {
        if (!value)
            return true;
        const len = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
        return len <= rule.value || rule.message || `Must be at most ${rule.value} characters`;
    },
    pattern: (value, rule) => {
        if (!value)
            return true;
        const regex = typeof rule.value === 'string' ? new RegExp(rule.value) : rule.value;
        return regex.test(value) || rule.message || 'Invalid format';
    },
    match: (value, rule, formData) => {
        if (!value)
            return true;
        const otherValue = formData[rule.value];
        return value === otherValue || rule.message || `Values do not match`;
    },
    date: (value, rule) => {
        if (!value)
            return true;
        const date = new Date(value);
        return !isNaN(date.getTime()) || rule.message || 'Please enter a valid date';
    },
    dateRange: (value, rule) => {
        if (!value)
            return true;
        const date = new Date(value);
        if (isNaN(date.getTime()))
            return rule.message || 'Please enter a valid date';
        const { min, max } = rule.value || {};
        if (min && date < new Date(min))
            return rule.message || `Date must be after ${min}`;
        if (max && date > new Date(max))
            return rule.message || `Date must be before ${max}`;
        return true;
    },
    fileSize: (value, rule) => {
        if (!value)
            return true;
        const files = Array.isArray(value) ? value : [value];
        const maxSize = rule.value;
        for (const file of files) {
            if (file instanceof File && file.size > maxSize) {
                const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
                return rule.message || `File size must be less than ${sizeMB}MB`;
            }
        }
        return true;
    },
    fileType: (value, rule) => {
        if (!value)
            return true;
        const files = Array.isArray(value) ? value : [value];
        const allowedTypes = Array.isArray(rule.value) ? rule.value : [rule.value];
        for (const file of files) {
            if (file instanceof File) {
                const ext = file.name.split('.').pop()?.toLowerCase();
                const type = file.type;
                const allowed = allowedTypes.some(t => {
                    if (t.startsWith('.'))
                        return ext === t.slice(1).toLowerCase();
                    if (t.includes('/'))
                        return type === t || (t.endsWith('/*') && type.startsWith(t.slice(0, -1)));
                    return ext === t.toLowerCase();
                });
                if (!allowed)
                    return rule.message || `File type not allowed. Allowed: ${allowedTypes.join(', ')}`;
            }
        }
        return true;
    },
    custom: async (value, rule, formData) => {
        if (rule.validator) {
            return await rule.validator(value, formData);
        }
        return true;
    },
};
// Custom validator registry
const customValidators = new Map();
// ============================================================================
// Validation Execution
// ============================================================================
/**
 * Validate a single field value
 */
async function validateField(value, field, formData) {
    // Check required first
    if (field.required) {
        const result = await runValidator('required', value, { type: 'required' }, formData);
        if (typeof result === 'string')
            return result;
    }
    // Check validation rules
    if (field.validation?.rules) {
        for (const rule of field.validation.rules) {
            const result = await runValidator(rule.type, value, rule, formData);
            if (typeof result === 'string')
                return result;
        }
    }
    return null;
}
/**
 * Run a single validator
 */
async function runValidator(type, value, rule, formData) {
    // Check custom validators first
    const customValidator = customValidators.get(type);
    if (customValidator) {
        return await customValidator(value, rule, formData);
    }
    // Check built-in validators
    const builtInValidator = builtInValidators[type];
    if (builtInValidator) {
        return await builtInValidator(value, rule, formData);
    }
    // Unknown validator type - skip
    console.warn(`Unknown validator type: ${type}`);
    return true;
}
/**
 * Validate all fields in a form
 */
async function validateForm(formData, fields, options) {
    const errors = {};
    let valid = true;
    for (const field of fields) {
        // Skip layout fields
        if (['divider', 'heading', 'paragraph'].includes(field.type))
            continue;
        // Check conditional visibility
        if (field.showWhen && !field.showWhen(formData))
            continue;
        const value = formData[field.name];
        const error = await validateField(value, field, formData);
        if (error) {
            errors[field.name] = error;
            valid = false;
            if (options?.stopOnFirstError)
                break;
        }
    }
    return { valid, errors };
}
const MASK_TOKENS = {
    '9': /[0-9]/,
    'a': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/,
    'A': /[A-Z]/,
};
/**
 * Apply mask to input value
 */
function applyMask(value, pattern, placeholder = '_') {
    if (!value || !pattern)
        return value;
    let result = '';
    let valueIndex = 0;
    for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
        const patternChar = pattern[i];
        const tokenRegex = MASK_TOKENS[patternChar];
        if (tokenRegex) {
            // Find next matching character from value
            while (valueIndex < value.length) {
                const valueChar = value[valueIndex++];
                if (tokenRegex.test(valueChar)) {
                    result += valueChar;
                    break;
                }
            }
        }
        else {
            // Literal character in pattern
            result += patternChar;
            // Skip if value has the same literal
            if (value[valueIndex] === patternChar) {
                valueIndex++;
            }
        }
    }
    return result;
}
/**
 * Remove mask from value (get raw value)
 */
function unmask(value, pattern) {
    if (!value || !pattern)
        return value;
    let result = '';
    let valueIndex = 0;
    for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
        const patternChar = pattern[i];
        const tokenRegex = MASK_TOKENS[patternChar];
        if (tokenRegex) {
            const valueChar = value[valueIndex++];
            if (tokenRegex.test(valueChar)) {
                result += valueChar;
            }
        }
        else {
            // Skip literal characters
            if (value[valueIndex] === patternChar) {
                valueIndex++;
            }
        }
    }
    return result;
}
/**
 * Create a masked input handler
 */
function createMaskedInput(input, pattern, placeholder = '_') {
    let previousValue = '';
    function handleInput(e) {
        const target = e.target;
        const rawValue = unmask(target.value, pattern);
        const maskedValue = applyMask(rawValue, pattern, placeholder);
        if (maskedValue !== target.value) {
            const cursorPos = target.selectionStart || 0;
            target.value = maskedValue;
            // Adjust cursor position
            let newPos = cursorPos;
            if (maskedValue.length > previousValue.length) {
                // Find next input position
                for (let i = cursorPos; i < pattern.length; i++) {
                    if (MASK_TOKENS[pattern[i]]) {
                        newPos = i + 1;
                        break;
                    }
                }
            }
            target.setSelectionRange(newPos, newPos);
        }
        previousValue = maskedValue;
    }
    function handleKeyDown(e) {
        const target = e.target;
        const pos = target.selectionStart || 0;
        // Handle backspace
        if (e.key === 'Backspace' && pos > 0) {
            let newPos = pos - 1;
            // Skip literal characters
            while (newPos > 0 && !MASK_TOKENS[pattern[newPos]]) {
                newPos--;
            }
            if (newPos !== pos - 1) {
                e.preventDefault();
                const value = target.value;
                target.value = value.slice(0, newPos) + placeholder + value.slice(pos);
                target.setSelectionRange(newPos, newPos);
            }
        }
    }
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    // Initialize with mask
    if (input.value) {
        input.value = applyMask(input.value, pattern, placeholder);
        previousValue = input.value;
    }
    return {
        destroy: () => {
            input.removeEventListener('input', handleInput);
            input.removeEventListener('keydown', handleKeyDown);
        },
    };
}

/**
 * Field Renderers
 * Individual field type rendering components
 */
const fieldRenderers = new Map();
/**
 * Get field renderer for a type
 */
function getFieldRenderer(type) {
    return fieldRenderers.get(type) || builtInRenderers[type];
}
// ============================================================================
// Helper Functions
// ============================================================================
function createFieldWrapper(field, error) {
    const wrapper = document.createElement('div');
    wrapper.className = `swal-field swal-field--${field.type}`;
    if (error)
        wrapper.classList.add('swal-field--error');
    if (field.disabled)
        wrapper.classList.add('swal-field--disabled');
    wrapper.dataset.fieldName = field.name;
    return wrapper;
}
function createLabel(field) {
    if (!field.label)
        return null;
    const label = document.createElement('label');
    label.className = 'swal-field__label';
    label.htmlFor = `swal-field-${field.name}`;
    label.textContent = field.label;
    if (field.required) {
        const asterisk = document.createElement('span');
        asterisk.className = 'swal-field__required';
        asterisk.textContent = ' *';
        asterisk.setAttribute('aria-hidden', 'true');
        label.appendChild(asterisk);
    }
    return label;
}
function createHint(field) {
    if (!field.hint)
        return null;
    const hint = document.createElement('div');
    hint.className = 'swal-field__hint';
    hint.id = `swal-field-${field.name}-hint`;
    hint.textContent = field.hint;
    return hint;
}
function createError(error) {
    if (!error)
        return null;
    const errorEl = document.createElement('div');
    errorEl.className = 'swal-field__error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = error;
    return errorEl;
}
function setCommonAttributes(input, field) {
    input.id = `swal-field-${field.name}`;
    input.name = field.name;
    if (field.disabled)
        input.disabled = true;
    if (field.placeholder)
        input.placeholder = field.placeholder;
    if (field.autocomplete)
        input.autocomplete = field.autocomplete;
    if (field.hint)
        input.setAttribute('aria-describedby', `swal-field-${field.name}-hint`);
}
// ============================================================================
// Built-in Field Renderers
// ============================================================================
const builtInRenderers = {
    // Text input
    text: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper';
        if (field.prefix) {
            const prefix = document.createElement('span');
            prefix.className = 'swal-field__prefix';
            prefix.textContent = field.prefix;
            inputWrapper.appendChild(prefix);
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'swal-input';
        input.value = value ?? field.defaultValue ?? '';
        setCommonAttributes(input, field);
        if (field.minLength)
            input.minLength = field.minLength;
        if (field.maxLength)
            input.maxLength = field.maxLength;
        // Apply mask if specified
        let maskHandler = null;
        if (field.mask) {
            maskHandler = createMaskedInput(input, field.mask);
        }
        input.addEventListener('input', () => onChange(input.value));
        input.addEventListener('blur', () => onChange(input.value));
        inputWrapper.appendChild(input);
        if (field.suffix) {
            const suffix = document.createElement('span');
            suffix.className = 'swal-field__suffix';
            suffix.textContent = field.suffix;
            inputWrapper.appendChild(suffix);
        }
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        // Store cleanup function
        wrapper.__cleanup = () => maskHandler?.destroy();
        return wrapper;
    },
    // Email input
    email: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--icon';
        const icon = document.createElement('span');
        icon.className = 'swal-field__icon';
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
        inputWrapper.appendChild(icon);
        const input = document.createElement('input');
        input.type = 'email';
        input.className = 'swal-input swal-input--with-icon';
        input.value = value ?? field.defaultValue ?? '';
        setCommonAttributes(input, field);
        input.addEventListener('input', () => onChange(input.value));
        inputWrapper.appendChild(input);
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Password input
    password: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--password';
        const input = document.createElement('input');
        input.type = 'password';
        input.className = 'swal-input';
        input.value = value ?? '';
        setCommonAttributes(input, field);
        if (field.minLength)
            input.minLength = field.minLength;
        if (field.maxLength)
            input.maxLength = field.maxLength;
        input.addEventListener('input', () => onChange(input.value));
        inputWrapper.appendChild(input);
        // Toggle visibility button
        if (field.showToggle !== false) {
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'swal-field__password-toggle';
            toggle.setAttribute('aria-label', 'Toggle password visibility');
            toggle.innerHTML = '<svg class="eye-open" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg><svg class="eye-closed" viewBox="0 0 24 24" width="18" height="18" style="display:none"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                toggle.querySelector('.eye-open').setAttribute('style', isPassword ? 'display:none' : '');
                toggle.querySelector('.eye-closed').setAttribute('style', isPassword ? '' : 'display:none');
            });
            inputWrapper.appendChild(toggle);
        }
        // Password strength indicator
        if (field.showStrength) {
            const strength = document.createElement('div');
            strength.className = 'swal-field__password-strength';
            strength.innerHTML = '<div class="swal-field__password-strength-bar"></div><span class="swal-field__password-strength-text"></span>';
            input.addEventListener('input', () => {
                const score = calculatePasswordStrength(input.value);
                const bar = strength.querySelector('.swal-field__password-strength-bar');
                const text = strength.querySelector('.swal-field__password-strength-text');
                bar.style.width = `${score * 25}%`;
                bar.className = `swal-field__password-strength-bar swal-field__password-strength-bar--${score}`;
                const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
                text.textContent = labels[score];
            });
            wrapper.appendChild(inputWrapper);
            wrapper.appendChild(strength);
        }
        else {
            wrapper.appendChild(inputWrapper);
        }
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Number input
    number: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--number';
        if (field.prefix) {
            const prefix = document.createElement('span');
            prefix.className = 'swal-field__prefix';
            prefix.textContent = field.prefix;
            inputWrapper.appendChild(prefix);
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'swal-input';
        input.value = value ?? field.defaultValue ?? '';
        setCommonAttributes(input, field);
        if (field.min !== undefined)
            input.min = String(field.min);
        if (field.max !== undefined)
            input.max = String(field.max);
        if (field.step !== undefined)
            input.step = String(field.step);
        input.addEventListener('input', () => {
            const num = parseFloat(input.value);
            onChange(isNaN(num) ? null : num);
        });
        inputWrapper.appendChild(input);
        // Stepper buttons
        if (field.showStepper !== false) {
            const stepper = document.createElement('div');
            stepper.className = 'swal-field__stepper';
            const decrement = document.createElement('button');
            decrement.type = 'button';
            decrement.className = 'swal-field__stepper-btn';
            decrement.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>';
            decrement.addEventListener('click', () => {
                const current = parseFloat(input.value) || 0;
                const step = field.step || 1;
                const min = field.min ?? -Infinity;
                const newValue = Math.max(min, current - step);
                input.value = String(newValue);
                onChange(newValue);
            });
            const increment = document.createElement('button');
            increment.type = 'button';
            increment.className = 'swal-field__stepper-btn';
            increment.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
            increment.addEventListener('click', () => {
                const current = parseFloat(input.value) || 0;
                const step = field.step || 1;
                const max = field.max ?? Infinity;
                const newValue = Math.min(max, current + step);
                input.value = String(newValue);
                onChange(newValue);
            });
            stepper.appendChild(decrement);
            stepper.appendChild(increment);
            inputWrapper.appendChild(stepper);
        }
        if (field.suffix) {
            const suffix = document.createElement('span');
            suffix.className = 'swal-field__suffix';
            suffix.textContent = field.suffix;
            inputWrapper.appendChild(suffix);
        }
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Currency input
    currency: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--currency';
        const symbol = document.createElement('span');
        symbol.className = 'swal-field__currency-symbol';
        symbol.textContent = field.currency || '$';
        inputWrapper.appendChild(symbol);
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'decimal';
        input.className = 'swal-input swal-input--currency';
        input.value = formatCurrency(value ?? field.defaultValue ?? '', field.decimals ?? 2);
        setCommonAttributes(input, field);
        input.addEventListener('input', () => {
            const raw = input.value.replace(/[^0-9.-]/g, '');
            const num = parseFloat(raw);
            onChange(isNaN(num) ? null : num);
        });
        input.addEventListener('blur', () => {
            const raw = input.value.replace(/[^0-9.-]/g, '');
            const num = parseFloat(raw);
            if (!isNaN(num)) {
                input.value = formatCurrency(num, field.decimals ?? 2);
            }
        });
        inputWrapper.appendChild(input);
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Textarea
    textarea: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const textarea = document.createElement('textarea');
        textarea.className = 'swal-textarea';
        textarea.value = value ?? field.defaultValue ?? '';
        setCommonAttributes(textarea, field);
        if (field.rows)
            textarea.rows = field.rows;
        if (field.minLength)
            textarea.minLength = field.minLength;
        if (field.maxLength)
            textarea.maxLength = field.maxLength;
        if (field.resize === false)
            textarea.style.resize = 'none';
        textarea.addEventListener('input', () => onChange(textarea.value));
        wrapper.appendChild(textarea);
        // Character counter
        if (field.showCounter && field.maxLength) {
            const counter = document.createElement('div');
            counter.className = 'swal-field__counter';
            counter.textContent = `0 / ${field.maxLength}`;
            textarea.addEventListener('input', () => {
                counter.textContent = `${textarea.value.length} / ${field.maxLength}`;
                if (textarea.value.length > field.maxLength * 0.9) {
                    counter.classList.add('swal-field__counter--warning');
                }
                else {
                    counter.classList.remove('swal-field__counter--warning');
                }
            });
            wrapper.appendChild(counter);
        }
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Select dropdown
    select: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const selectWrapper = document.createElement('div');
        selectWrapper.className = 'swal-field__select-wrapper';
        const select = document.createElement('select');
        select.className = 'swal-select';
        setCommonAttributes(select, field);
        // Add placeholder option
        if (field.placeholder) {
            const placeholderOpt = document.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.textContent = field.placeholder;
            placeholderOpt.disabled = true;
            placeholderOpt.selected = !value;
            select.appendChild(placeholderOpt);
        }
        // Add options
        const options = field.options || [];
        for (const opt of options) {
            if (typeof opt === 'object' && 'group' in opt) {
                // Option group
                const optgroup = document.createElement('optgroup');
                optgroup.label = opt.group;
                for (const groupOpt of opt.options) {
                    const option = document.createElement('option');
                    option.value = String(groupOpt.value);
                    option.textContent = groupOpt.label;
                    if (groupOpt.disabled)
                        option.disabled = true;
                    if (value === groupOpt.value)
                        option.selected = true;
                    optgroup.appendChild(option);
                }
                select.appendChild(optgroup);
            }
            else {
                const option = document.createElement('option');
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                option.value = String(optValue);
                option.textContent = String(optLabel);
                if (typeof opt === 'object' && opt.disabled)
                    option.disabled = true;
                if (value === optValue)
                    option.selected = true;
                select.appendChild(option);
            }
        }
        select.addEventListener('change', () => {
            const selectedValue = select.value;
            // Try to preserve original type
            const originalOpt = options.find(o => typeof o === 'object' && 'value' in o && String(o.value) === selectedValue);
            onChange(originalOpt && typeof originalOpt === 'object' ? originalOpt.value : selectedValue);
        });
        selectWrapper.appendChild(select);
        // Custom arrow
        const arrow = document.createElement('span');
        arrow.className = 'swal-field__select-arrow';
        arrow.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>';
        selectWrapper.appendChild(arrow);
        wrapper.appendChild(selectWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Radio group
    radio: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const group = document.createElement('div');
        group.className = `swal-field__radio-group swal-field__radio-group--${field.layout || 'vertical'}`;
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-labelledby', `swal-field-${field.name}-label`);
        const options = field.options || [];
        for (const opt of options) {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const optDescription = typeof opt === 'object' ? opt.description : undefined;
            const radioWrapper = document.createElement('label');
            radioWrapper.className = 'swal-radio';
            if (typeof opt === 'object' && opt.disabled)
                radioWrapper.classList.add('swal-radio--disabled');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = field.name;
            input.value = String(optValue);
            input.checked = value === optValue;
            if (typeof opt === 'object' && opt.disabled)
                input.disabled = true;
            input.addEventListener('change', () => {
                if (input.checked)
                    onChange(optValue);
            });
            const checkmark = document.createElement('span');
            checkmark.className = 'swal-radio__checkmark';
            const labelText = document.createElement('span');
            labelText.className = 'swal-radio__label';
            labelText.textContent = String(optLabel);
            radioWrapper.appendChild(input);
            radioWrapper.appendChild(checkmark);
            radioWrapper.appendChild(labelText);
            if (optDescription) {
                const desc = document.createElement('span');
                desc.className = 'swal-radio__description';
                desc.textContent = optDescription;
                radioWrapper.appendChild(desc);
            }
            group.appendChild(radioWrapper);
        }
        wrapper.appendChild(group);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Checkbox (single or group)
    checkbox: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        if (field.options && field.options.length > 0) {
            // Multiple checkboxes
            const label = createLabel(field);
            if (label)
                wrapper.appendChild(label);
            const group = document.createElement('div');
            group.className = `swal-field__checkbox-group swal-field__checkbox-group--${field.layout || 'vertical'}`;
            const currentValues = Array.isArray(value) ? [...value] : [];
            for (const opt of field.options) {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const checkboxWrapper = document.createElement('label');
                checkboxWrapper.className = 'swal-checkbox';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = String(optValue);
                input.checked = currentValues.includes(optValue);
                input.addEventListener('change', () => {
                    if (input.checked) {
                        currentValues.push(optValue);
                    }
                    else {
                        const idx = currentValues.indexOf(optValue);
                        if (idx > -1)
                            currentValues.splice(idx, 1);
                    }
                    onChange([...currentValues]);
                });
                const checkmark = document.createElement('span');
                checkmark.className = 'swal-checkbox__checkmark';
                checkmark.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                const labelText = document.createElement('span');
                labelText.className = 'swal-checkbox__label';
                labelText.textContent = String(optLabel);
                checkboxWrapper.appendChild(input);
                checkboxWrapper.appendChild(checkmark);
                checkboxWrapper.appendChild(labelText);
                group.appendChild(checkboxWrapper);
            }
            wrapper.appendChild(group);
        }
        else {
            // Single checkbox
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.className = 'swal-checkbox';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `swal-field-${field.name}`;
            input.name = field.name;
            input.checked = Boolean(value ?? field.defaultValue);
            if (field.disabled)
                input.disabled = true;
            input.addEventListener('change', () => onChange(input.checked));
            const checkmark = document.createElement('span');
            checkmark.className = 'swal-checkbox__checkmark';
            checkmark.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
            const labelText = document.createElement('span');
            labelText.className = 'swal-checkbox__label';
            labelText.textContent = field.label || '';
            checkboxWrapper.appendChild(input);
            checkboxWrapper.appendChild(checkmark);
            checkboxWrapper.appendChild(labelText);
            wrapper.appendChild(checkboxWrapper);
        }
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Switch/Toggle
    switch: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const switchWrapper = document.createElement('label');
        switchWrapper.className = 'swal-switch';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `swal-field-${field.name}`;
        input.name = field.name;
        input.checked = Boolean(value ?? field.defaultValue);
        if (field.disabled)
            input.disabled = true;
        input.addEventListener('change', () => onChange(input.checked));
        const slider = document.createElement('span');
        slider.className = 'swal-switch__slider';
        const labelText = document.createElement('span');
        labelText.className = 'swal-switch__label';
        labelText.textContent = field.label || '';
        switchWrapper.appendChild(input);
        switchWrapper.appendChild(slider);
        switchWrapper.appendChild(labelText);
        wrapper.appendChild(switchWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Range slider
    range: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const rangeWrapper = document.createElement('div');
        rangeWrapper.className = 'swal-field__range-wrapper';
        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'swal-range';
        input.id = `swal-field-${field.name}`;
        input.name = field.name;
        input.value = String(value ?? field.defaultValue ?? field.min ?? 0);
        if (field.min !== undefined)
            input.min = String(field.min);
        if (field.max !== undefined)
            input.max = String(field.max);
        if (field.step !== undefined)
            input.step = String(field.step);
        if (field.disabled)
            input.disabled = true;
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'swal-field__range-value';
        valueDisplay.textContent = input.value;
        input.addEventListener('input', () => {
            const num = parseFloat(input.value);
            valueDisplay.textContent = String(num);
            onChange(num);
        });
        rangeWrapper.appendChild(input);
        if (field.showValue !== false) {
            rangeWrapper.appendChild(valueDisplay);
        }
        // Min/max labels
        if (field.showLabels) {
            const labels = document.createElement('div');
            labels.className = 'swal-field__range-labels';
            labels.innerHTML = `<span>${field.min ?? 0}</span><span>${field.max ?? 100}</span>`;
            rangeWrapper.appendChild(labels);
        }
        wrapper.appendChild(rangeWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Rating (stars)
    rating: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const ratingWrapper = document.createElement('div');
        ratingWrapper.className = 'swal-rating';
        ratingWrapper.setAttribute('role', 'radiogroup');
        const maxRating = field.max || 5;
        let currentValue = value ?? field.defaultValue ?? 0;
        for (let i = 1; i <= maxRating; i++) {
            const star = document.createElement('button');
            star.type = 'button';
            star.className = 'swal-rating__star';
            star.dataset.value = String(i);
            star.setAttribute('role', 'radio');
            star.setAttribute('aria-checked', String(i <= currentValue));
            star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
            if (field.disabled)
                star.disabled = true;
            star.innerHTML = field.icon || '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
            if (i <= currentValue) {
                star.classList.add('swal-rating__star--active');
            }
            star.addEventListener('click', () => {
                currentValue = i;
                onChange(i);
                // Update all stars
                ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
                    const isActive = idx < i;
                    s.classList.toggle('swal-rating__star--active', isActive);
                    s.setAttribute('aria-checked', String(isActive));
                });
            });
            star.addEventListener('mouseenter', () => {
                if (field.disabled)
                    return;
                ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
                    s.classList.toggle('swal-rating__star--hover', idx < i);
                });
            });
            star.addEventListener('mouseleave', () => {
                ratingWrapper.querySelectorAll('.swal-rating__star').forEach((s, idx) => {
                    s.classList.remove('swal-rating__star--hover');
                });
            });
            ratingWrapper.appendChild(star);
        }
        wrapper.appendChild(ratingWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Date picker
    date: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--date';
        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'swal-input';
        if (value)
            input.value = formatDateForInput(value);
        setCommonAttributes(input, field);
        if (field.min)
            input.min = formatDateForInput(field.min);
        if (field.max)
            input.max = formatDateForInput(field.max);
        input.addEventListener('change', () => {
            onChange(input.value ? new Date(input.value) : null);
        });
        inputWrapper.appendChild(input);
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Time picker
    time: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'swal-field__input-wrapper swal-field__input-wrapper--time';
        const input = document.createElement('input');
        input.type = 'time';
        input.className = 'swal-input';
        input.value = value ?? field.defaultValue ?? '';
        setCommonAttributes(input, field);
        if (field.min)
            input.min = field.min;
        if (field.max)
            input.max = field.max;
        if (field.step)
            input.step = String(field.step);
        input.addEventListener('change', () => onChange(input.value));
        inputWrapper.appendChild(input);
        wrapper.appendChild(inputWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Color picker
    color: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const colorWrapper = document.createElement('div');
        colorWrapper.className = 'swal-field__color-wrapper';
        const input = document.createElement('input');
        input.type = 'color';
        input.className = 'swal-color';
        input.id = `swal-field-${field.name}`;
        input.name = field.name;
        input.value = value ?? field.defaultValue ?? '#000000';
        if (field.disabled)
            input.disabled = true;
        const valueText = document.createElement('span');
        valueText.className = 'swal-field__color-value';
        valueText.textContent = input.value.toUpperCase();
        input.addEventListener('input', () => {
            valueText.textContent = input.value.toUpperCase();
            onChange(input.value);
        });
        colorWrapper.appendChild(input);
        colorWrapper.appendChild(valueText);
        wrapper.appendChild(colorWrapper);
        // Preset colors
        if (field.presets && field.presets.length > 0) {
            const presets = document.createElement('div');
            presets.className = 'swal-field__color-presets';
            for (const preset of field.presets) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'swal-field__color-preset';
                btn.style.backgroundColor = preset;
                btn.setAttribute('aria-label', `Select color ${preset}`);
                btn.addEventListener('click', () => {
                    input.value = preset;
                    valueText.textContent = preset.toUpperCase();
                    onChange(preset);
                });
                presets.appendChild(btn);
            }
            wrapper.appendChild(presets);
        }
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // File upload
    file: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const dropzone = document.createElement('div');
        dropzone.className = 'swal-dropzone';
        if (field.disabled)
            dropzone.classList.add('swal-dropzone--disabled');
        const input = document.createElement('input');
        input.type = 'file';
        input.className = 'swal-dropzone__input';
        input.id = `swal-field-${field.name}`;
        input.name = field.name;
        if (field.multiple)
            input.multiple = true;
        if (field.accept)
            input.accept = field.accept.join(',');
        if (field.disabled)
            input.disabled = true;
        const content = document.createElement('div');
        content.className = 'swal-dropzone__content';
        content.innerHTML = `
      <svg viewBox="0 0 24 24" width="48" height="48" class="swal-dropzone__icon">
        <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
      <p class="swal-dropzone__text">${field.placeholder || 'Drop files here or click to upload'}</p>
      <p class="swal-dropzone__hint">${field.accept ? `Allowed: ${field.accept.join(', ')}` : ''}</p>
    `;
        const fileList = document.createElement('div');
        fileList.className = 'swal-dropzone__files';
        function updateFileList(files) {
            fileList.innerHTML = '';
            for (const file of files) {
                const item = document.createElement('div');
                item.className = 'swal-dropzone__file';
                item.innerHTML = `
          <span class="swal-dropzone__file-name">${file.name}</span>
          <span class="swal-dropzone__file-size">${formatFileSize(file.size)}</span>
          <button type="button" class="swal-dropzone__file-remove" aria-label="Remove file">×</button>
        `;
                item.querySelector('.swal-dropzone__file-remove').addEventListener('click', () => {
                    const newFiles = files.filter(f => f !== file);
                    onChange(field.multiple ? newFiles : null);
                    updateFileList(newFiles);
                });
                fileList.appendChild(item);
            }
        }
        input.addEventListener('change', () => {
            const files = Array.from(input.files || []);
            onChange(field.multiple ? files : files[0] || null);
            updateFileList(files);
        });
        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('swal-dropzone--dragover');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('swal-dropzone--dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('swal-dropzone--dragover');
            const files = Array.from(e.dataTransfer?.files || []);
            if (files.length > 0) {
                onChange(field.multiple ? files : files[0]);
                updateFileList(files);
            }
        });
        dropzone.appendChild(input);
        dropzone.appendChild(content);
        dropzone.appendChild(fileList);
        wrapper.appendChild(dropzone);
        // Show existing files
        if (value) {
            const files = Array.isArray(value) ? value : [value];
            updateFileList(files.filter(f => f instanceof File));
        }
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Tags input
    tags: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'swal-tags';
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'swal-tags__container';
        let tags = Array.isArray(value) ? [...value] : [];
        function renderTags() {
            tagsContainer.innerHTML = '';
            for (const tag of tags) {
                const tagEl = document.createElement('span');
                tagEl.className = 'swal-tags__tag';
                tagEl.innerHTML = `
          <span class="swal-tags__tag-text">${tag}</span>
          <button type="button" class="swal-tags__tag-remove" aria-label="Remove ${tag}">×</button>
        `;
                tagEl.querySelector('.swal-tags__tag-remove').addEventListener('click', () => {
                    tags = tags.filter(t => t !== tag);
                    onChange(tags);
                    renderTags();
                });
                tagsContainer.appendChild(tagEl);
            }
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'swal-tags__input';
        input.placeholder = field.placeholder || 'Type and press Enter';
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const newTag = input.value.trim();
                if (newTag && !tags.includes(newTag)) {
                    if (!field.max || tags.length < field.max) {
                        tags.push(newTag);
                        onChange(tags);
                        renderTags();
                    }
                }
                input.value = '';
            }
            else if (e.key === 'Backspace' && !input.value && tags.length > 0) {
                tags.pop();
                onChange(tags);
                renderTags();
            }
        });
        tagsWrapper.appendChild(tagsContainer);
        tagsWrapper.appendChild(input);
        wrapper.appendChild(tagsWrapper);
        renderTags();
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // OTP/PIN input
    otp: (field, value, onChange, error) => {
        const wrapper = createFieldWrapper(field, error);
        const label = createLabel(field);
        if (label)
            wrapper.appendChild(label);
        const otpWrapper = document.createElement('div');
        otpWrapper.className = 'swal-otp';
        const length = field.length || 6;
        const inputs = [];
        const currentValue = String(value || '').split('');
        for (let i = 0; i < length; i++) {
            const input = document.createElement('input');
            input.type = field.masked ? 'password' : 'text';
            input.className = 'swal-otp__input';
            input.maxLength = 1;
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.value = currentValue[i] || '';
            if (field.disabled)
                input.disabled = true;
            input.addEventListener('input', () => {
                const val = input.value.replace(/[^0-9]/g, '');
                input.value = val;
                if (val && i < length - 1) {
                    inputs[i + 1].focus();
                }
                const fullValue = inputs.map(inp => inp.value).join('');
                onChange(fullValue);
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && i > 0) {
                    inputs[i - 1].focus();
                }
                else if (e.key === 'ArrowLeft' && i > 0) {
                    inputs[i - 1].focus();
                }
                else if (e.key === 'ArrowRight' && i < length - 1) {
                    inputs[i + 1].focus();
                }
            });
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData?.getData('text').replace(/[^0-9]/g, '').slice(0, length);
                if (pastedData) {
                    for (let j = 0; j < pastedData.length; j++) {
                        if (inputs[j])
                            inputs[j].value = pastedData[j];
                    }
                    const lastIndex = Math.min(pastedData.length, length) - 1;
                    inputs[lastIndex].focus();
                    onChange(pastedData);
                }
            });
            inputs.push(input);
            otpWrapper.appendChild(input);
            // Add separator
            if (field.separator && i < length - 1 && (i + 1) % (field.groupSize || 3) === 0) {
                const sep = document.createElement('span');
                sep.className = 'swal-otp__separator';
                sep.textContent = field.separator;
                otpWrapper.appendChild(sep);
            }
        }
        wrapper.appendChild(otpWrapper);
        const hint = createHint(field);
        if (hint)
            wrapper.appendChild(hint);
        const errorEl = createError(error);
        if (errorEl)
            wrapper.appendChild(errorEl);
        return wrapper;
    },
    // Divider (layout element)
    divider: (field) => {
        const divider = document.createElement('hr');
        divider.className = 'swal-form__divider';
        if (field.label) {
            const wrapper = document.createElement('div');
            wrapper.className = 'swal-form__divider-wrapper';
            wrapper.innerHTML = `<span class="swal-form__divider-text">${field.label}</span>`;
            wrapper.insertBefore(divider.cloneNode(), wrapper.firstChild);
            wrapper.appendChild(divider);
            return wrapper;
        }
        return divider;
    },
    // Heading (layout element)
    heading: (field) => {
        const heading = document.createElement('h3');
        heading.className = 'swal-form__heading';
        heading.textContent = field.label || '';
        return heading;
    },
    // Paragraph (layout element)
    paragraph: (field) => {
        const p = document.createElement('p');
        p.className = 'swal-form__paragraph';
        p.textContent = field.label || '';
        return p;
    },
};
// Alias common types
builtInRenderers.toggle = builtInRenderers.switch;
builtInRenderers.pin = builtInRenderers.otp;
// ============================================================================
// Utility Functions
// ============================================================================
function calculatePasswordStrength(password) {
    let score = 0;
    if (!password)
        return score;
    if (password.length >= 8)
        score++;
    if (password.length >= 12)
        score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password))
        score++;
    if (/\d/.test(password))
        score++;
    if (/[^a-zA-Z0-9]/.test(password))
        score++;
    return Math.min(4, score);
}
function formatCurrency(value, decimals) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num))
        return '';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
function formatDateForInput(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime()))
        return '';
    return d.toISOString().split('T')[0];
}
function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Form Renderer
 * Renders complete forms from schema definitions
 */
// ============================================================================
// Form Renderer
// ============================================================================
function renderForm(schema, container, options) {
    const state = {
        data: { ...options?.initialData },
        errors: {},
        touched: new Set(),
        dirty: false,
        valid: true,
        submitting: false,
    };
    const fieldElements = new Map();
    const cleanupFunctions = [];
    // Initialize default values
    for (const field of schema.fields) {
        if (field.name && field.defaultValue !== undefined && state.data[field.name] === undefined) {
            state.data[field.name] = field.defaultValue;
        }
    }
    // Create form element
    const form = document.createElement('div');
    form.className = 'swal-form';
    form.setAttribute('role', 'form');
    // Apply layout settings
    if (schema.layout) {
        if (schema.layout.columns && schema.layout.columns > 1) {
            form.classList.add(`swal-form--columns-${schema.layout.columns}`);
        }
        if (schema.layout.gap) {
            form.classList.add(`swal-form--gap-${schema.layout.gap}`);
        }
        if (schema.layout.labelPosition) {
            form.classList.add(`swal-form--labels-${schema.layout.labelPosition}`);
        }
    }
    // Render sections or fields
    if (schema.sections && schema.sections.length > 0) {
        for (const section of schema.sections) {
            const sectionEl = document.createElement('fieldset');
            sectionEl.className = 'swal-form__section';
            if (section.title) {
                const legend = document.createElement('legend');
                legend.className = 'swal-form__section-title';
                legend.textContent = section.title;
                sectionEl.appendChild(legend);
            }
            if (section.description) {
                const desc = document.createElement('p');
                desc.className = 'swal-form__section-description';
                desc.textContent = section.description;
                sectionEl.appendChild(desc);
            }
            const sectionFields = section.fields
                .map(name => schema.fields.find(f => f.name === name))
                .filter((f) => f !== undefined);
            for (const field of sectionFields) {
                const fieldEl = renderField(field);
                if (fieldEl) {
                    sectionEl.appendChild(fieldEl);
                    fieldElements.set(field.name, fieldEl);
                }
            }
            // Apply collapsible
            if (section.collapsible) {
                sectionEl.classList.add('swal-form__section--collapsible');
                if (section.collapsed) {
                    sectionEl.classList.add('swal-form__section--collapsed');
                }
                const legend = sectionEl.querySelector('legend');
                if (legend) {
                    legend.style.cursor = 'pointer';
                    legend.addEventListener('click', () => {
                        sectionEl.classList.toggle('swal-form__section--collapsed');
                    });
                }
            }
            form.appendChild(sectionEl);
        }
    }
    else {
        // Render fields directly
        for (const field of schema.fields) {
            // Check conditional visibility
            if (field.showWhen && !field.showWhen(state.data)) {
                continue;
            }
            const fieldEl = renderField(field);
            if (fieldEl) {
                form.appendChild(fieldEl);
                fieldElements.set(field.name, fieldEl);
            }
        }
    }
    container.appendChild(form);
    // Field rendering helper
    function renderField(field) {
        const renderer = getFieldRenderer(field.type);
        if (!renderer) {
            console.warn(`No renderer for field type: ${field.type}`);
            return null;
        }
        const value = state.data[field.name];
        const error = state.errors[field.name];
        const element = renderer(field, value, (newValue) => handleFieldChange(field, newValue), error);
        // Store cleanup if available
        if (element.__cleanup) {
            cleanupFunctions.push(element.__cleanup);
        }
        return element;
    }
    // Handle field value changes
    async function handleFieldChange(field, value) {
        state.data[field.name] = value;
        state.dirty = true;
        state.touched.add(field.name);
        // Validate on change if configured
        if (schema.validation?.validateOnSubmit !== true) {
            const error = await validateField(value, field, state.data);
            if (error) {
                state.errors[field.name] = error;
            }
            else {
                delete state.errors[field.name];
            }
            // Update field error display
            updateFieldError(field.name, error);
        }
        // Re-render conditional fields
        updateConditionalFields();
        // Notify change
        options?.onChange?.(state.data);
        // Validate form state
        state.valid = Object.keys(state.errors).length === 0;
        options?.onValidate?.(state.valid, state.errors);
    }
    // Update field error display
    function updateFieldError(fieldName, error) {
        const fieldEl = fieldElements.get(fieldName);
        if (!fieldEl)
            return;
        fieldEl.classList.toggle('swal-field--error', !!error);
        // Update or create error element
        let errorEl = fieldEl.querySelector('.swal-field__error');
        if (error) {
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'swal-field__error';
                errorEl.setAttribute('role', 'alert');
                fieldEl.appendChild(errorEl);
            }
            errorEl.textContent = error;
        }
        else if (errorEl) {
            errorEl.remove();
        }
    }
    // Update conditional field visibility
    function updateConditionalFields() {
        for (const field of schema.fields) {
            if (!field.showWhen)
                continue;
            const shouldShow = field.showWhen(state.data);
            const existingEl = fieldElements.get(field.name);
            if (shouldShow && !existingEl) {
                // Add field
                const fieldEl = renderField(field);
                if (fieldEl) {
                    // Find correct position
                    const fieldIndex = schema.fields.indexOf(field);
                    let insertBefore = null;
                    for (let i = fieldIndex + 1; i < schema.fields.length; i++) {
                        const nextField = schema.fields[i];
                        const nextEl = fieldElements.get(nextField.name);
                        if (nextEl && nextEl.parentElement === form) {
                            insertBefore = nextEl;
                            break;
                        }
                    }
                    if (insertBefore) {
                        form.insertBefore(fieldEl, insertBefore);
                    }
                    else {
                        form.appendChild(fieldEl);
                    }
                    fieldElements.set(field.name, fieldEl);
                }
            }
            else if (!shouldShow && existingEl) {
                // Remove field
                existingEl.remove();
                fieldElements.delete(field.name);
                delete state.data[field.name];
                delete state.errors[field.name];
            }
        }
    }
    // Form controller
    const controller = {
        getState: () => ({ ...state }),
        getData: () => ({ ...state.data }),
        setData: (data) => {
            Object.assign(state.data, data);
            state.dirty = true;
            // Re-render all fields
            for (const [name, element] of fieldElements) {
                const field = schema.fields.find(f => f.name === name);
                if (field) {
                    const newElement = renderField(field);
                    if (newElement) {
                        element.replaceWith(newElement);
                        fieldElements.set(name, newElement);
                    }
                }
            }
            updateConditionalFields();
            options?.onChange?.(state.data);
        },
        setFieldValue: (name, value) => {
            const field = schema.fields.find(f => f.name === name);
            if (field) {
                handleFieldChange(field, value);
            }
        },
        getFieldValue: (name) => state.data[name],
        validate: async () => {
            const result = await validateForm(state.data, schema.fields, {
                stopOnFirstError: schema.validation?.stopOnFirstError,
            });
            state.errors = result.errors;
            state.valid = result.valid;
            // Update all field errors
            for (const field of schema.fields) {
                if (field.name) {
                    updateFieldError(field.name, result.errors[field.name] || null);
                }
            }
            // Scroll to first error if configured
            if (!result.valid && schema.validation?.scrollToError) {
                const firstErrorField = Object.keys(result.errors)[0];
                const errorEl = fieldElements.get(firstErrorField);
                if (errorEl) {
                    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const input = errorEl.querySelector('input, textarea, select');
                    input?.focus();
                }
            }
            options?.onValidate?.(result.valid, result.errors);
            return result;
        },
        validateField: async (name) => {
            const field = schema.fields.find(f => f.name === name);
            if (!field)
                return null;
            const value = state.data[name];
            const error = await validateField(value, field, state.data);
            if (error) {
                state.errors[name] = error;
            }
            else {
                delete state.errors[name];
            }
            updateFieldError(name, error);
            state.valid = Object.keys(state.errors).length === 0;
            return error;
        },
        reset: () => {
            state.data = { ...options?.initialData };
            state.errors = {};
            state.touched.clear();
            state.dirty = false;
            state.valid = true;
            // Re-render all fields
            for (const [name, element] of fieldElements) {
                const field = schema.fields.find(f => f.name === name);
                if (field) {
                    const newElement = renderField(field);
                    if (newElement) {
                        element.replaceWith(newElement);
                        fieldElements.set(name, newElement);
                    }
                }
            }
            updateConditionalFields();
            options?.onChange?.(state.data);
        },
        destroy: () => {
            // Run cleanup functions
            for (const cleanup of cleanupFunctions) {
                cleanup();
            }
            // Remove form element
            form.remove();
            fieldElements.clear();
        },
    };
    return controller;
}
// ============================================================================
// Quick Form Builder
// ============================================================================
/**
 * Create a form schema from a simple configuration
 */
function createFormSchema(config) {
    return {
        fields: config.fields.map(field => ({
            ...field,
            label: field.label ?? formatLabel(field.name),
        })),
        layout: config.layout,
        validation: config.validation,
    };
}
function formatLabel(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\s/, '')
        .replace(/\b\w/g, c => c.toUpperCase());
}
// ============================================================================
// Preset Form Schemas
// ============================================================================
({
    login: createFormSchema({
        fields: [
            { name: 'email', type: 'email', required: true, autocomplete: 'email' },
            { name: 'password', type: 'password', required: true, autocomplete: 'current-password' },
            { name: 'remember', type: 'checkbox', label: 'Remember me' },
        ],
        layout: { labelPosition: 'top' },
    }),
    register: createFormSchema({
        fields: [
            { name: 'name', type: 'text', required: true, autocomplete: 'name' },
            { name: 'email', type: 'email', required: true, autocomplete: 'email' },
            {
                name: 'password',
                type: 'password',
                required: true,
                showStrength: true,
                minLength: 8,
                autocomplete: 'new-password',
            },
            {
                name: 'confirmPassword',
                type: 'password',
                label: 'Confirm Password',
                required: true,
                autocomplete: 'new-password',
                validation: {
                    rules: [{ type: 'match', value: 'password', message: 'Passwords do not match' }],
                },
            },
            {
                name: 'terms',
                type: 'checkbox',
                label: 'I agree to the Terms of Service',
                required: true,
            },
        ],
        layout: { labelPosition: 'top' },
    }),
    contact: createFormSchema({
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'phone', type: 'text', mask: '(999) 999-9999' },
            {
                name: 'subject',
                type: 'select',
                options: [
                    'General Inquiry',
                    'Support',
                    'Sales',
                    'Partnership',
                    'Other',
                ],
            },
            {
                name: 'message',
                type: 'textarea',
                required: true,
                rows: 5,
                maxLength: 1000,
                showCounter: true,
            },
        ],
        layout: { labelPosition: 'top' },
    }),
    payment: createFormSchema({
        fields: [
            { name: 'cardName', type: 'text', label: 'Name on Card', required: true },
            {
                name: 'cardNumber',
                type: 'text',
                label: 'Card Number',
                required: true,
                mask: '9999 9999 9999 9999',
                validation: { rules: [{ type: 'creditCard' }] },
            },
            { name: 'expiry', type: 'text', label: 'Expiry Date', required: true, mask: '99/99' },
            { name: 'cvv', type: 'password', label: 'CVV', required: true, maxLength: 4, mask: '9999' },
        ],
        layout: { columns: 2, labelPosition: 'top' },
    }),
    address: createFormSchema({
        fields: [
            { name: 'street', type: 'text', label: 'Street Address', required: true },
            { name: 'street2', type: 'text', label: 'Apt/Suite/Unit' },
            { name: 'city', type: 'text', required: true },
            { name: 'state', type: 'text', required: true },
            { name: 'zipCode', type: 'text', label: 'ZIP Code', required: true },
            {
                name: 'country',
                type: 'select',
                required: true,
                options: [
                    { value: 'US', label: 'United States' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'AU', label: 'Australia' },
                ],
            },
        ],
        layout: { columns: 2, labelPosition: 'top' },
    }),
    feedback: createFormSchema({
        fields: [
            {
                name: 'rating',
                type: 'rating',
                label: 'How would you rate your experience?',
                required: true,
                max: 5,
            },
            {
                name: 'recommend',
                type: 'radio',
                label: 'Would you recommend us?',
                required: true,
                options: [
                    { value: 'yes', label: 'Yes, definitely!' },
                    { value: 'maybe', label: 'Maybe' },
                    { value: 'no', label: 'No' },
                ],
                layout: 'horizontal',
            },
            {
                name: 'improvements',
                type: 'checkbox',
                label: 'What could we improve?',
                options: [
                    'Speed',
                    'Quality',
                    'Price',
                    'Customer Service',
                    'User Experience',
                ],
            },
            {
                name: 'comments',
                type: 'textarea',
                label: 'Additional Comments',
                rows: 4,
            },
        ],
        layout: { labelPosition: 'top' },
    }),
    profile: createFormSchema({
        fields: [
            { name: 'avatar', type: 'file', label: 'Profile Picture', accept: ['image/*'] },
            { name: 'username', type: 'text', required: true },
            { name: 'displayName', type: 'text', label: 'Display Name' },
            { name: 'bio', type: 'textarea', rows: 3, maxLength: 160, showCounter: true },
            { name: 'website', type: 'text', validation: { rules: [{ type: 'url' }] } },
            { name: 'location', type: 'text' },
            { name: 'birthday', type: 'date' },
        ],
        layout: { labelPosition: 'top' },
    }),
});

/**
 * Modal Core
 * The main modal engine with proper lifecycle, events, and accessibility
 */
// ============================================================================
// Global State
// ============================================================================
const activeModals = new Map();
let globalConfig = {};
let baseZIndex = 10000;
/**
 * Set global configuration
 */
function setGlobalConfig(config) {
    globalConfig = { ...globalConfig, ...config };
    if (config.baseZIndex !== undefined) {
        baseZIndex = config.baseZIndex;
    }
}
/**
 * Get global configuration
 */
function getGlobalConfig() {
    return { ...globalConfig };
}
/**
 * Get next z-index for stacking
 */
function getNextZIndex() {
    const step = globalConfig.zIndexStep || 10;
    return baseZIndex + (activeModals.size * step);
}
// ============================================================================
// Core Modal Function
// ============================================================================
async function modal(options) {
    // Merge with global defaults
    const mergedOptions = {
        ...globalConfig.defaults,
        ...options,
        a11y: { ...globalConfig.a11y, ...options.a11y },
        animation: options.animation ?? globalConfig.animation,
    };
    // Determine container
    const containerSelector = mergedOptions.container || globalConfig.container || 'body';
    const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    if (!container) {
        throw new Error(`Modal container not found: ${containerSelector}`);
    }
    return new Promise((resolve, reject) => {
        // Render the modal
        const elements = render(mergedOptions, globalConfig.classPrefix);
        // Track event listeners for cleanup
        const eventListeners = [];
        function addEventListenerWithCleanup(target, type, handler) {
            target.addEventListener(type, handler);
            eventListeners.push({ target, type, handler });
        }
        // Track intervals for cleanup
        let tickIntervalId = null;
        // Set z-index
        const zIndex = mergedOptions.zIndex ?? getNextZIndex();
        elements.root.style.zIndex = String(zIndex);
        // Create result object
        const result = {
            confirmed: false,
            denied: false,
            dismissed: false,
        };
        // Create focus trap
        const focusTrap = createFocusTrap({
            container: elements.modal,
            initialFocus: mergedOptions.a11y?.autoFocus || 'first-focusable',
            returnFocus: mergedOptions.a11y?.returnFocus !== false,
            escapeDeactivates: mergedOptions.a11y?.closeOnEscape !== false,
            onEscape: () => {
                if (mergedOptions.a11y?.closeOnEscape !== false) {
                    closeModal('escape');
                }
            },
        });
        // Timer animation
        let timerAnimation = null;
        // Form controller
        let formController = null;
        // Create instance (will be updated with form methods after controller is created)
        const instance = {
            id: elements.ids.modalId,
            element: elements.modal,
            options: mergedOptions,
            isOpen: true,
            close: (customResult) => closeModal('programmatic', customResult),
            update: (newOptions) => {
                updateModal(newOptions);
            },
            getInputValue: () => {
                return getInputValue();
            },
            setInputValue: (value) => {
                setInputValue(value);
            },
            showValidationError: (message) => {
                showValidationMessage(message);
            },
            clearValidationError: () => {
                clearValidationMessage();
            },
            setButtonState: (button, state) => {
                setButtonState(button, state);
            },
            showLoading: (text) => {
                showLoading(text);
            },
            hideLoading: () => {
                hideLoading();
            },
            timer: {
                pause: () => timerAnimation?.pause(),
                resume: () => timerAnimation?.resume(),
                reset: () => timerAnimation?.reset(),
                getRemaining: () => {
                    if (!timerAnimation || !mergedOptions.timer)
                        return 0;
                    const progress = timerAnimation.getProgress();
                    return Math.max(0, mergedOptions.timer * (1 - progress));
                },
            },
            // Form methods
            getFormData: () => {
                return formController?.getData() ?? {};
            },
            setFormData: (data) => {
                formController?.setData(data);
            },
            validateForm: async () => {
                if (!formController)
                    return { valid: true, errors: {} };
                return formController.validate();
            },
        };
        // Cleanup function to remove all event listeners and intervals
        function cleanup() {
            // Remove all event listeners
            for (const { target, type, handler } of eventListeners) {
                target.removeEventListener(type, handler);
            }
            eventListeners.length = 0;
            // Clear tick interval
            if (tickIntervalId) {
                clearInterval(tickIntervalId);
                tickIntervalId = null;
            }
            // Destroy form controller
            if (formController) {
                formController.destroy();
                formController = null;
            }
        }
        // Create controller
        const controller = {
            instance,
            elements,
            focusTrap,
            timerAnimation,
            formController,
            result,
            resolve,
            reject,
            cleanup,
        };
        // Store in active modals
        activeModals.set(instance.id, controller);
        // ============================================================================
        // Event Handlers
        // ============================================================================
        function handleBackdropClick(event) {
            if (event.target === elements.backdrop || event.target === elements.root.querySelector('.modal-container')) {
                if (mergedOptions.backdrop === 'static') {
                    // Shake animation for static backdrop
                    elements.modal.classList.add('modal-dialog--shake');
                    setTimeout(() => elements.modal.classList.remove('modal-dialog--shake'), 300);
                    return;
                }
                if (mergedOptions.closeOnBackdrop !== false) {
                    closeModal('backdrop');
                }
            }
        }
        function handleButtonClick(event) {
            const target = event.target;
            const button = target.closest('[data-action]');
            if (!button)
                return;
            const action = button.dataset.action;
            switch (action) {
                case 'confirm':
                    handleConfirm();
                    break;
                case 'deny':
                    handleDeny();
                    break;
                case 'cancel':
                    closeModal('cancel');
                    break;
                case 'close':
                    closeModal('close');
                    break;
                default:
                    // Custom button
                    const customBtn = mergedOptions.buttons?.custom?.find(b => b.id === action);
                    if (customBtn?.onClick) {
                        customBtn.onClick();
                    }
            }
        }
        async function handleConfirm() {
            // Handle form validation if form is present
            if (formController) {
                const formValidation = await formController.validate();
                if (!formValidation.valid) {
                    return; // Form has errors, don't proceed
                }
            }
            const inputValue = formController ? formController.getData() : getInputValue();
            // Validate input if present (for legacy input support)
            if (mergedOptions.input?.validate) {
                const validationResult = await mergedOptions.input.validate(inputValue);
                if (typeof validationResult === 'string') {
                    showValidationMessage(validationResult);
                    return;
                }
                if (validationResult === false) {
                    return;
                }
            }
            // Call preConfirm hook
            let finalValue = inputValue;
            if (mergedOptions.hooks?.onBeforeConfirm) {
                try {
                    showLoading();
                    finalValue = await mergedOptions.hooks.onBeforeConfirm(inputValue);
                    hideLoading();
                }
                catch (error) {
                    hideLoading();
                    if (error instanceof Error) {
                        showValidationMessage(error.message);
                    }
                    return;
                }
            }
            result.confirmed = true;
            result.value = finalValue;
            await closeModal('programmatic');
        }
        function handleDeny() {
            result.denied = true;
            closeModal('programmatic');
        }
        function handleInputChange(event) {
            clearValidationMessage();
            if (mergedOptions.hooks?.onInputChange) {
                mergedOptions.hooks.onInputChange(getInputValue(), instance);
            }
        }
        // ============================================================================
        // Helper Functions
        // ============================================================================
        function getInputValue() {
            if (!elements.inputElement)
                return undefined;
            const input = elements.inputElement;
            if (input.tagName === 'SELECT') {
                return input.value;
            }
            if (input instanceof HTMLInputElement) {
                switch (input.type) {
                    case 'checkbox':
                        // Get all checked checkboxes in group
                        const checkboxes = elements.inputWrapper?.querySelectorAll('input[type="checkbox"]:checked');
                        return checkboxes ? Array.from(checkboxes).map(cb => cb.value) : [];
                    case 'radio':
                        const checked = elements.inputWrapper?.querySelector('input[type="radio"]:checked');
                        return checked ? checked.value : undefined;
                    case 'file':
                        return input.multiple ? Array.from(input.files || []) : input.files?.[0];
                    case 'number':
                    case 'range':
                        return input.valueAsNumber;
                    default:
                        return input.value;
                }
            }
            return input.value;
        }
        function setInputValue(value) {
            if (!elements.inputElement)
                return;
            const input = elements.inputElement;
            if (input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
                input.value = String(value);
            }
            else if (input instanceof HTMLInputElement) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    // Handle group
                    const inputs = elements.inputWrapper?.querySelectorAll('input');
                    inputs?.forEach(inp => {
                        const inputEl = inp;
                        if (input.type === 'checkbox') {
                            inputEl.checked = Array.isArray(value) && value.includes(inputEl.value);
                        }
                        else {
                            inputEl.checked = inputEl.value === String(value);
                        }
                    });
                }
                else {
                    input.value = String(value);
                }
            }
        }
        function showValidationMessage(message) {
            const errorEl = elements.inputWrapper?.querySelector('.modal-input-error');
            if (errorEl) {
                errorEl.textContent = message;
                elements.inputWrapper?.classList.add('modal-input--error');
                announceError(message);
            }
        }
        function clearValidationMessage() {
            const errorEl = elements.inputWrapper?.querySelector('.modal-input-error');
            if (errorEl) {
                errorEl.textContent = '';
                elements.inputWrapper?.classList.remove('modal-input--error');
            }
        }
        function setButtonState(button, state) {
            const btn = elements.modal.querySelector(`[data-action="${button}"]`);
            if (!btn)
                return;
            if (state.text !== undefined)
                btn.textContent = state.text;
            if (state.disabled !== undefined)
                btn.disabled = state.disabled;
            if (state.className !== undefined)
                btn.className = `modal-btn ${state.className}`;
        }
        function showLoading(text) {
            showLoadingState(elements.modal, text, globalConfig.classPrefix);
            announceLoading(true, text);
        }
        function hideLoading() {
            hideLoadingState(elements.modal, globalConfig.classPrefix);
            announceLoading(false);
        }
        function updateModal(newOptions) {
            // Update title
            if (newOptions.title !== undefined && elements.titleElement) {
                if (typeof newOptions.title === 'string') {
                    elements.titleElement.textContent = newOptions.title;
                }
                else {
                    elements.titleElement.innerHTML = '';
                    elements.titleElement.appendChild(newOptions.title.cloneNode(true));
                }
            }
            // Update content
            if ((newOptions.text !== undefined || newOptions.html !== undefined) && elements.contentElement) {
                if (newOptions.html) {
                    if (typeof newOptions.html === 'string') {
                        elements.contentElement.innerHTML = newOptions.html;
                    }
                    else {
                        elements.contentElement.innerHTML = '';
                        elements.contentElement.appendChild(newOptions.html.cloneNode(true));
                    }
                }
                else if (newOptions.text) {
                    elements.contentElement.textContent = newOptions.text;
                }
            }
            // Merge options
            Object.assign(mergedOptions, newOptions);
        }
        async function closeModal(reason, customResult) {
            if (!instance.isOpen)
                return;
            // Merge custom result
            if (customResult) {
                Object.assign(result, customResult);
            }
            // Set dismiss info if not confirmed/denied
            if (!result.confirmed && !result.denied) {
                result.dismissed = true;
                result.dismissReason = reason;
            }
            // Call onBeforeClose hook
            if (mergedOptions.hooks?.onBeforeClose) {
                const shouldClose = await mergedOptions.hooks.onBeforeClose(instance, result);
                if (shouldClose === false) {
                    return;
                }
            }
            instance.isOpen = false;
            // Clean up all event listeners and intervals
            cleanup();
            // Stop timer
            if (timerAnimation) {
                timerAnimation.destroy();
            }
            // Deactivate focus trap
            focusTrap.deactivate();
            // Animate out
            const animConfig = resolveAnimation(mergedOptions.animation);
            await animateExit(elements.modal, elements.backdrop, animConfig);
            // Remove from DOM
            elements.root.remove();
            // Remove from active modals
            activeModals.delete(instance.id);
            // Restore scroll and inert if this was the last modal
            if (activeModals.size === 0) {
                if (mergedOptions.scrollBehavior !== 'none') {
                    unlockScroll();
                }
                removeInert(elements.root);
            }
            // Call onClose hook
            if (mergedOptions.hooks?.onClose) {
                mergedOptions.hooks.onClose(result);
            }
            // Resolve promise
            resolve(result);
            // Call onAfterClose hook
            if (mergedOptions.hooks?.onAfterClose) {
                mergedOptions.hooks.onAfterClose(result);
            }
        }
        // ============================================================================
        // Initialize Modal
        // ============================================================================
        // Call onBeforeOpen hook (now that instance exists)
        (async () => {
            if (mergedOptions.hooks?.onBeforeOpen) {
                const shouldContinue = await mergedOptions.hooks.onBeforeOpen(instance);
                if (shouldContinue === false) {
                    cleanup();
                    elements.root.remove();
                    resolve({
                        confirmed: false,
                        denied: false,
                        dismissed: true,
                        dismissReason: 'programmatic',
                    });
                    return;
                }
            }
            // Continue with modal initialization after hook check
            initializeModal();
        })();
        function initializeModal() {
            // Add event listeners with cleanup tracking
            addEventListenerWithCleanup(elements.root, 'click', handleBackdropClick);
            addEventListenerWithCleanup(elements.modal, 'click', handleButtonClick);
            if (elements.inputElement) {
                addEventListenerWithCleanup(elements.inputElement, 'input', handleInputChange);
                addEventListenerWithCleanup(elements.inputElement, 'change', handleInputChange);
            }
            // Render form if provided
            if (mergedOptions.form) {
                const formContainer = document.createElement('div');
                formContainer.className = 'swal-form-container';
                formController = renderForm(mergedOptions.form, formContainer, {
                    initialData: mergedOptions.formData,
                    onChange: mergedOptions.onFormChange,
                    onValidate: mergedOptions.onFormValidate,
                });
                // Insert form into content area
                const contentArea = elements.contentElement || elements.modal.querySelector('.modal-content');
                if (contentArea) {
                    contentArea.appendChild(formContainer);
                }
            }
            // Add to DOM
            container.appendChild(elements.root);
            // Lock scroll (respecting scrollBehavior option)
            if (mergedOptions.scrollBehavior !== 'none') {
                lockScroll();
            }
            // Make others inert
            if (mergedOptions.a11y?.trapFocus !== false) {
                makeOthersInert(elements.root);
            }
            // Animate in
            const animConfig = resolveAnimation(mergedOptions.animation);
            animateEnter(elements.modal, elements.backdrop, animConfig).then(() => {
                // Call onAfterOpen hook
                if (mergedOptions.hooks?.onAfterOpen) {
                    mergedOptions.hooks.onAfterOpen(instance);
                }
            });
            // Activate focus trap
            focusTrap.activate();
            // Announce to screen readers
            announceModalOpen(mergedOptions);
            // Setup timer
            if (mergedOptions.timer && mergedOptions.timer > 0) {
                if (elements.timerProgress) {
                    timerAnimation = createTimerAnimation(elements.timerProgress, mergedOptions.timer, () => closeModal('timer'));
                    timerAnimation.start();
                    // Pause on hover if enabled
                    if (mergedOptions.pauseTimerOnHover) {
                        const handleMouseEnter = () => timerAnimation?.pause();
                        const handleMouseLeave = () => timerAnimation?.resume();
                        addEventListenerWithCleanup(elements.modal, 'mouseenter', handleMouseEnter);
                        addEventListenerWithCleanup(elements.modal, 'mouseleave', handleMouseLeave);
                    }
                }
                else {
                    const timerId = setTimeout(() => closeModal('timer'), mergedOptions.timer);
                    // Track timeout for cleanup (wrap in a listener style for consistency)
                    eventListeners.push({
                        target: window,
                        type: '__timer__',
                        handler: (() => clearTimeout(timerId)),
                    });
                }
                // Timer tick callback with proper cleanup
                if (mergedOptions.hooks?.onTimerTick && timerAnimation) {
                    tickIntervalId = setInterval(() => {
                        if (!instance.isOpen) {
                            if (tickIntervalId) {
                                clearInterval(tickIntervalId);
                                tickIntervalId = null;
                            }
                            return;
                        }
                        const remaining = instance.timer.getRemaining();
                        mergedOptions.hooks.onTimerTick(remaining);
                    }, 100);
                }
            }
            // Store timer animation in controller
            controller.timerAnimation = timerAnimation;
            // Call onOpen hook
            if (mergedOptions.hooks?.onOpen) {
                mergedOptions.hooks.onOpen(instance);
            }
        }
    });
}
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Close all open modals
 */
async function closeAll() {
    const promises = [];
    activeModals.forEach(controller => {
        promises.push(controller.instance.close());
    });
    await Promise.all(promises);
}
/**
 * Close a specific modal by ID
 */
async function close(id) {
    const controller = activeModals.get(id);
    if (!controller)
        return false;
    await controller.instance.close();
    return true;
}
/**
 * Get currently active modal (topmost)
 */
function getActiveModal() {
    if (activeModals.size === 0)
        return null;
    const controllers = Array.from(activeModals.values());
    return controllers[controllers.length - 1]?.instance || null;
}
/**
 * Get all active modals
 */
function getActiveModals() {
    return Array.from(activeModals.values()).map(c => c.instance);
}
/**
 * Check if any modal is open
 */
function isAnyOpen() {
    return activeModals.size > 0;
}
/**
 * Check if a specific modal is open
 */
function isOpen(id) {
    return activeModals.has(id);
}
/**
 * Update a modal by ID
 */
function update(id, options) {
    const controller = activeModals.get(id);
    if (!controller)
        return false;
    controller.instance.update(options);
    return true;
}
// ============================================================================
// MicroModal-like API
// ============================================================================
/**
 * Show a modal by ID (for declarative modals)
 */
function show(id, options) {
    const element = document.getElementById(id);
    if (!element) {
        return Promise.reject(new Error(`Modal element not found: ${id}`));
    }
    // Parse options from data attributes
    const dataOptions = parseDataAttributes(element);
    return modal({
        ...dataOptions,
        ...options,
        id,
    });
}
/**
 * Parse modal options from data attributes
 */
function parseDataAttributes(element) {
    const options = {};
    const dataset = element.dataset;
    if (dataset.title)
        options.title = dataset.title;
    if (dataset.closeOnBackdrop)
        options.closeOnBackdrop = dataset.closeOnBackdrop !== 'false';
    if (dataset.closeOnEscape)
        options.a11y = { closeOnEscape: dataset.closeOnEscape !== 'false' };
    if (dataset.animation)
        options.animation = dataset.animation;
    return options;
}
// ============================================================================
// Declarative Modal Support
// ============================================================================
/**
 * Initialize declarative modals (data-modal-trigger)
 */
function initDeclarativeModals() {
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-modal-trigger]');
        if (!trigger)
            return;
        const modalId = trigger.dataset.modalTrigger;
        if (modalId) {
            event.preventDefault();
            show(modalId);
        }
    });
}

export { close, closeAll, getActiveModal, getActiveModals, getGlobalConfig, initDeclarativeModals, isAnyOpen, isOpen, modal, setGlobalConfig, show, update };
//# sourceMappingURL=core.esm.js.map
