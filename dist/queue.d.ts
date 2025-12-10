/**
 * Queue System
 * Manages sequential and stacked modal display
 * Better control than SweetAlert2's queue
 */
import type { ModalOptions, ModalResult, QueueConfig } from './core/types';
/**
 * Configure a queue
 */
export declare function configureQueue(name: string, config: Partial<QueueConfig>): void;
export declare function configureQueue(config: Partial<QueueConfig>): void;
/**
 * Add a modal to the queue
 */
export declare function enqueue<T = any>(options: ModalOptions<T>, queueName?: string): Promise<ModalResult<T>>;
/**
 * Add multiple modals to the queue
 * @returns Array of results in order
 */
export declare function enqueueAll<T = any>(optionsArray: ModalOptions<T>[], queueName?: string): Promise<ModalResult<T>[]>;
/**
 * Clear all pending items from the queue
 */
export declare function clearQueue(queueName?: string): number;
/**
 * Pause queue processing
 */
export declare function pauseQueue(queueName?: string): void;
/**
 * Resume queue processing
 */
export declare function resumeQueue(queueName?: string): void;
/**
 * Skip the current modal and move to next
 */
export declare function skipCurrent(queueName?: string): Promise<boolean>;
/**
 * Get queue status
 */
export declare function getQueueStatus(queueName?: string): {
    pending: number;
    processing: boolean;
    paused: boolean;
    currentId: string | null;
};
/**
 * Delete a queue
 */
export declare function deleteQueue(queueName: string): boolean;
export interface QueueBuilder {
    add: <T = any>(options: ModalOptions<T>) => QueueBuilder;
    configure: (config: Partial<QueueConfig>) => QueueBuilder;
    run: () => Promise<ModalResult[]>;
    clear: () => QueueBuilder;
}
/**
 * Create a queue builder for fluent API
 */
export declare function createQueue(name?: string): QueueBuilder;
export declare const queue: {
    enqueue: typeof enqueue;
    enqueueAll: typeof enqueueAll;
    configure: typeof configureQueue;
    clear: typeof clearQueue;
    pause: typeof pauseQueue;
    resume: typeof resumeQueue;
    skip: typeof skipCurrent;
    status: typeof getQueueStatus;
    delete: typeof deleteQueue;
    create: typeof createQueue;
};
//# sourceMappingURL=queue.d.ts.map