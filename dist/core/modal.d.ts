/**
 * Modal Core
 * The main modal engine with proper lifecycle, events, and accessibility
 */
import type { ModalOptions, ModalResult, ModalInstance, GlobalConfig } from './types';
/**
 * Set global configuration
 */
export declare function setGlobalConfig(config: GlobalConfig): void;
/**
 * Get global configuration
 */
export declare function getGlobalConfig(): GlobalConfig;
export declare function modal<T = any>(options: ModalOptions<T>): Promise<ModalResult<T>>;
/**
 * Close all open modals
 */
export declare function closeAll(): Promise<void>;
/**
 * Close a specific modal by ID
 */
export declare function close(id: string): Promise<boolean>;
/**
 * Get currently active modal (topmost)
 */
export declare function getActiveModal(): ModalInstance | null;
/**
 * Get all active modals
 */
export declare function getActiveModals(): ModalInstance[];
/**
 * Check if any modal is open
 */
export declare function isAnyOpen(): boolean;
/**
 * Check if a specific modal is open
 */
export declare function isOpen(id: string): boolean;
/**
 * Update a modal by ID
 */
export declare function update(id: string, options: Partial<ModalOptions>): boolean;
/**
 * Show a modal by ID (for declarative modals)
 */
export declare function show(id: string, options?: Partial<ModalOptions>): Promise<ModalResult>;
/**
 * Initialize declarative modals (data-modal-trigger)
 */
export declare function initDeclarativeModals(): void;
//# sourceMappingURL=modal.d.ts.map