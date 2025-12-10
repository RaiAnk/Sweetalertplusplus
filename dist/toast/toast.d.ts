/**
 * Toast Notification System
 * Lightweight, accessible, stackable toasts
 */
import type { ToastOptions } from '../core/types';
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
export declare function setToastDefaults(options: Partial<ToastOptions>): void;
export declare function getToastDefaults(): Partial<ToastOptions>;
export declare function toast(options: ToastOptions | string): ToastInstance;
export declare function dismissToast(id: string): Promise<void>;
export declare function dismissAllToasts(): void;
export declare const success: (options: ToastOptions | string) => ToastInstance;
export declare const error: (options: ToastOptions | string) => ToastInstance;
export declare const warning: (options: ToastOptions | string) => ToastInstance;
export declare const info: (options: ToastOptions | string) => ToastInstance;
export declare const loading: (options: ToastOptions | string) => ToastInstance;
export interface PromiseToastOptions<T> {
    loading: string | ToastOptions;
    success: string | ((data: T) => string | ToastOptions);
    error: string | ((err: any) => string | ToastOptions);
}
export declare function promise<T>(promiseOrFn: Promise<T> | (() => Promise<T>), options: PromiseToastOptions<T>): Promise<T>;
export {};
//# sourceMappingURL=toast.d.ts.map