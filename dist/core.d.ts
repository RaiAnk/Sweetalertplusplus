/**
 * Core-only Entry Point
 * Minimal bundle with just the modal engine
 * ~5KB minified+gzipped
 */
export { modal, closeAll, close, getActiveModal, getActiveModals, isAnyOpen, isOpen, update, show, setGlobalConfig, getGlobalConfig, initDeclarativeModals, } from './core/modal';
export type { ModalOptions, ModalResult, ModalInstance, DismissReason, GlobalConfig, ButtonConfig, ButtonsConfig, InputConfig, AnimationConfig, AnimationPreset, A11yConfig, LifecycleHooks, ModalRole, ModalSize, Position, IconType, InputType, } from './core/types';
export { sanitize, escapeHtml } from './core/sanitizer';
export { announce, prefersReducedMotion } from './core/a11y';
export { createFocusTrap } from './core/focus-trap';
//# sourceMappingURL=core.d.ts.map