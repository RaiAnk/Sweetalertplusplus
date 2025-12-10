/**
 * Animation System
 * Lightweight, performant animations with reduced-motion support
 */
import type { AnimationConfig, AnimationPreset } from './types';
export interface AnimationKeyframes {
    enter: Keyframe[];
    exit: Keyframe[];
}
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
export declare function resolveAnimation(config: AnimationConfig | AnimationPreset | false | undefined, defaultDuration?: number): ResolvedAnimation;
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
export declare function animate(element: HTMLElement, keyframes: Keyframe[], options?: {
    duration?: number;
    easing?: string;
    fill?: FillMode;
    respectReducedMotion?: boolean;
}): AnimationController;
/**
 * Animate modal enter
 */
export declare function animateEnter(modal: HTMLElement, backdrop: HTMLElement | null, config: ResolvedAnimation): Promise<void>;
/**
 * Animate modal exit
 */
export declare function animateExit(modal: HTMLElement, backdrop: HTMLElement | null, config: ResolvedAnimation): Promise<void>;
/**
 * Apply CSS class for animation and wait for completion
 */
export declare function animateWithClass(element: HTMLElement, className: string, duration: number): Promise<void>;
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
export declare function createTimerAnimation(progressElement: HTMLElement, duration: number, onComplete?: () => void): TimerAnimation;
/**
 * Create CSS keyframes for loading spinner
 */
export declare function getSpinnerKeyframes(): string;
/**
 * Create loading spinner SVG
 */
export declare function createSpinnerSVG(size?: number, color?: string): string;
//# sourceMappingURL=animation.d.ts.map