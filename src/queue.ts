/**
 * Queue System
 * Manages sequential and stacked modal display
 * Better control than SweetAlert2's queue
 */

import { modal, closeAll, getActiveModals } from './core/modal';
import type { ModalOptions, ModalResult, QueueConfig, QueueItem } from './core/types';

// ============================================================================
// Queue State
// ============================================================================

interface QueueState {
  items: QueueItem[];
  processing: boolean;
  currentItem: QueueItem | null;
  config: QueueConfig;
  paused: boolean;
}

const defaultConfig: QueueConfig = {
  mode: 'sequential',
  maxVisible: 3,
  delay: 100,
  allowSkip: true,
  showProgress: false,
};

const queues = new Map<string, QueueState>();
const DEFAULT_QUEUE = 'default';

// ============================================================================
// Queue Management
// ============================================================================

function getQueue(name: string = DEFAULT_QUEUE): QueueState {
  if (!queues.has(name)) {
    queues.set(name, {
      items: [],
      processing: false,
      currentItem: null,
      config: { ...defaultConfig },
      paused: false,
    });
  }
  return queues.get(name)!;
}

/**
 * Configure a queue
 */
export function configureQueue(name: string, config: Partial<QueueConfig>): void;
export function configureQueue(config: Partial<QueueConfig>): void;
export function configureQueue(
  nameOrConfig: string | Partial<QueueConfig>,
  maybeConfig?: Partial<QueueConfig>
): void {
  let name: string;
  let config: Partial<QueueConfig>;

  if (typeof nameOrConfig === 'string') {
    name = nameOrConfig;
    config = maybeConfig || {};
  } else {
    name = DEFAULT_QUEUE;
    config = nameOrConfig;
  }

  const queue = getQueue(name);
  queue.config = { ...queue.config, ...config };
}

// ============================================================================
// Queue Processing
// ============================================================================

async function processQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  if (queue.processing || queue.paused) return;
  if (queue.items.length === 0) return;

  queue.processing = true;

  while (queue.items.length > 0 && !queue.paused) {
    const item = queue.items.shift()!;
    queue.currentItem = item;

    try {
      // Add queue progress info if enabled
      if (queue.config.showProgress) {
        const totalInQueue = queue.items.length + 1;
        const currentIndex = totalInQueue - queue.items.length;
        item.options.footer = `${currentIndex} of ${totalInQueue}`;
      }

      const result = await modal(item.options);
      item.resolve(result);
    } catch (error) {
      item.reject(error as Error);
    }

    queue.currentItem = null;

    // Delay between modals
    if (queue.items.length > 0 && queue.config.delay && queue.config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, queue.config.delay));
    }
  }

  queue.processing = false;
}

async function processStackQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  if (queue.paused) return;

  const activeCount = getActiveModals().length;
  const maxVisible = queue.config.maxVisible || 3;

  // Show modals up to max visible
  while (queue.items.length > 0 && activeCount < maxVisible) {
    const item = queue.items.shift()!;

    // Don't await - let them stack
    modal(item.options)
      .then(item.resolve)
      .catch(item.reject);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Add a modal to the queue
 */
export function enqueue<T = any>(
  options: ModalOptions<T>,
  queueName: string = DEFAULT_QUEUE
): Promise<ModalResult<T>> {
  return new Promise((resolve, reject) => {
    const queue = getQueue(queueName);
    const id = `queue-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item: QueueItem<T> = {
      id,
      options,
      resolve,
      reject,
    };

    queue.items.push(item);

    if (queue.config.mode === 'stack') {
      processStackQueue(queueName);
    } else {
      processQueue(queueName);
    }
  });
}

/**
 * Add multiple modals to the queue
 * @returns Array of results in order
 */
export async function enqueueAll<T = any>(
  optionsArray: ModalOptions<T>[],
  queueName: string = DEFAULT_QUEUE
): Promise<ModalResult<T>[]> {
  const promises = optionsArray.map(options => enqueue(options, queueName));
  return Promise.all(promises);
}

/**
 * Clear all pending items from the queue
 */
export function clearQueue(queueName: string = DEFAULT_QUEUE): number {
  const queue = getQueue(queueName);
  const clearedCount = queue.items.length;

  // Reject all pending items
  queue.items.forEach(item => {
    item.reject(new Error('Queue cleared'));
  });

  queue.items = [];
  return clearedCount;
}

/**
 * Pause queue processing
 */
export function pauseQueue(queueName: string = DEFAULT_QUEUE): void {
  const queue = getQueue(queueName);
  queue.paused = true;
}

/**
 * Resume queue processing
 */
export function resumeQueue(queueName: string = DEFAULT_QUEUE): void {
  const queue = getQueue(queueName);
  queue.paused = false;

  if (queue.config.mode === 'stack') {
    processStackQueue(queueName);
  } else {
    processQueue(queueName);
  }
}

/**
 * Skip the current modal and move to next
 */
export async function skipCurrent(queueName: string = DEFAULT_QUEUE): Promise<boolean> {
  const queue = getQueue(queueName);

  if (!queue.config.allowSkip) {
    return false;
  }

  if (queue.currentItem) {
    await closeAll();
    return true;
  }

  return false;
}

/**
 * Get queue status
 */
export function getQueueStatus(queueName: string = DEFAULT_QUEUE): {
  pending: number;
  processing: boolean;
  paused: boolean;
  currentId: string | null;
} {
  const queue = getQueue(queueName);
  return {
    pending: queue.items.length,
    processing: queue.processing,
    paused: queue.paused,
    currentId: queue.currentItem?.id || null,
  };
}

/**
 * Delete a queue
 */
export function deleteQueue(queueName: string): boolean {
  if (queueName === DEFAULT_QUEUE) {
    // Reset default queue instead of deleting
    const queue = getQueue(queueName);
    clearQueue(queueName);
    queue.config = { ...defaultConfig };
    return true;
  }

  return queues.delete(queueName);
}

// ============================================================================
// Convenience: Queue Builder
// ============================================================================

export interface QueueBuilder {
  add: <T = any>(options: ModalOptions<T>) => QueueBuilder;
  configure: (config: Partial<QueueConfig>) => QueueBuilder;
  run: () => Promise<ModalResult[]>;
  clear: () => QueueBuilder;
}

/**
 * Create a queue builder for fluent API
 */
export function createQueue(name?: string): QueueBuilder {
  const queueName = name || `queue-${Date.now()}`;
  const pendingItems: ModalOptions[] = [];
  let queueConfig: Partial<QueueConfig> = {};

  const builder: QueueBuilder = {
    add(options) {
      pendingItems.push(options);
      return builder;
    },

    configure(config) {
      queueConfig = { ...queueConfig, ...config };
      return builder;
    },

    async run() {
      if (Object.keys(queueConfig).length > 0) {
        configureQueue(queueName, queueConfig);
      }

      const results = await enqueueAll(pendingItems, queueName);

      // Cleanup temporary queue
      if (!name) {
        deleteQueue(queueName);
      }

      return results;
    },

    clear() {
      pendingItems.length = 0;
      return builder;
    },
  };

  return builder;
}

// ============================================================================
// Export Queue Object
// ============================================================================

export const queue = {
  enqueue,
  enqueueAll,
  configure: configureQueue,
  clear: clearQueue,
  pause: pauseQueue,
  resume: resumeQueue,
  skip: skipCurrent,
  status: getQueueStatus,
  delete: deleteQueue,
  create: createQueue,
};
