/**
 * Animation System
 * Lightweight, performant animations with reduced-motion support
 */

import type { AnimationConfig, AnimationPreset } from './types';
import { prefersReducedMotion } from './a11y';

// ============================================================================
// Animation Presets
// ============================================================================

export interface AnimationKeyframes {
  enter: Keyframe[];
  exit: Keyframe[];
}

const ANIMATION_PRESETS: Record<AnimationPreset, AnimationKeyframes> = {
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
const BACKDROP_ANIMATIONS: AnimationKeyframes = {
  enter: [
    { opacity: 0 },
    { opacity: 1 },
  ],
  exit: [
    { opacity: 1 },
    { opacity: 0 },
  ],
};

// ============================================================================
// Animation Configuration
// ============================================================================

export interface ResolvedAnimation {
  enterKeyframes: Keyframe[];
  exitKeyframes: Keyframe[];
  duration: number;
  easing: string;
  respectReducedMotion: boolean;
}

/**
 * Resolve animation configuration to concrete values
 */
export function resolveAnimation(
  config: AnimationConfig | AnimationPreset | false | undefined,
  defaultDuration = 200
): ResolvedAnimation {
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
      ? ANIMATION_PRESETS[config.enter as AnimationPreset]?.enter || []
      : [];
    const exitPreset = typeof config.exit === 'string'
      ? ANIMATION_PRESETS[config.exit as AnimationPreset]?.exit || []
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

// ============================================================================
// Animation Execution
// ============================================================================

export interface AnimationController {
  play: () => Promise<void>;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
}

/**
 * Animate an element
 */
export function animate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: {
    duration?: number;
    easing?: string;
    fill?: FillMode;
    respectReducedMotion?: boolean;
  } = {}
): AnimationController {
  const {
    duration = 200,
    easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill = 'forwards',
    respectReducedMotion = true,
  } = options;

  // Check reduced motion
  const shouldAnimate = !respectReducedMotion || !prefersReducedMotion();
  const actualDuration = shouldAnimate ? duration : 0;
  const actualKeyframes = shouldAnimate && keyframes.length > 0 ? keyframes : [{ opacity: 1 }];

  let animation: Animation | null = null;
  let resolvePromise: (() => void) | null = null;
  let rejectPromise: ((err: Error) => void) | null = null;

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  function play(): Promise<void> {
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
    } catch (error) {
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
export function animateEnter(
  modal: HTMLElement,
  backdrop: HTMLElement | null,
  config: ResolvedAnimation
): Promise<void> {
  const promises: Promise<void>[] = [];

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

  return Promise.all(promises).then(() => {});
}

/**
 * Animate modal exit
 */
export function animateExit(
  modal: HTMLElement,
  backdrop: HTMLElement | null,
  config: ResolvedAnimation
): Promise<void> {
  const promises: Promise<void>[] = [];

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

  return Promise.all(promises).then(() => {});
}

// ============================================================================
// CSS Class-based Animations (alternative approach)
// ============================================================================

/**
 * Apply CSS class for animation and wait for completion
 */
export function animateWithClass(
  element: HTMLElement,
  className: string,
  duration: number
): Promise<void> {
  return new Promise(resolve => {
    element.classList.add(className);

    function onEnd(event: AnimationEvent | TransitionEvent) {
      if (event.target !== element) return;
      element.classList.remove(className);
      element.removeEventListener('animationend', onEnd);
      element.removeEventListener('transitionend', onEnd);
      resolve();
    }

    element.addEventListener('animationend', onEnd);
    element.addEventListener('transitionend', onEnd);

    // Fallback timeout
    setTimeout(() => {
      element.classList.remove(className);
      resolve();
    }, duration + 50);
  });
}

// ============================================================================
// Timer Progress Animation
// ============================================================================

export interface TimerAnimation {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getProgress: () => number;
  destroy: () => void;
}

/**
 * Create a timer progress animation
 */
export function createTimerAnimation(
  progressElement: HTMLElement,
  duration: number,
  onComplete?: () => void
): TimerAnimation {
  let startTime = 0;
  let pausedAt = 0;
  let elapsed = 0;
  let rafId: number | null = null;
  let paused = false;

  function updateProgress() {
    if (paused) return;

    const now = performance.now();
    elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    progressElement.style.transform = `scaleX(${1 - progress})`;

    if (progress < 1) {
      rafId = requestAnimationFrame(updateProgress);
    } else {
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
    if (!paused) return;
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

  function getProgress(): number {
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

// ============================================================================
// Loading Spinner Animation
// ============================================================================

/**
 * Create CSS keyframes for loading spinner
 */
export function getSpinnerKeyframes(): string {
  return `
    @keyframes modal-spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
}

/**
 * Create loading spinner SVG
 */
export function createSpinnerSVG(size = 40, color = 'currentColor'): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation: modal-spinner 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4" transform="rotate(-90 12 12)"/>
    </svg>
  `;
}
