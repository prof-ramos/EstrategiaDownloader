/**
 * Estratégia Downloader - Download Manager Module
 *
 * Manages the download queue with concurrency control.
 */

import { CONFIG, MAX_CONCURRENT_DOWNLOADS, DELAY_BETWEEN_DOWNLOADS } from './config.js';
import { log, logError, logSuccess, delay } from './utils.js';

// ==================== DOWNLOAD QUEUE CLASS ====================

/**
 * Manages a queue of downloads with concurrency control
 */
export class DownloadManager {
    constructor(options = {}) {
        this.maxConcurrent = options.maxConcurrent || MAX_CONCURRENT_DOWNLOADS;
        this.delayBetweenDownloads = options.delay || DELAY_BETWEEN_DOWNLOADS;

        this.queue = [];
        this.activeDownloads = 0;
        this.completed = 0;
        this.failed = 0;
        this.isPaused = false;
        this.isStopped = false;

        // Callbacks
        this.onProgress = options.onProgress || null;
        this.onComplete = options.onComplete || null;
        this.onError = options.onError || null;
        this.onItemComplete = options.onItemComplete || null;
    }

    /**
     * Downloads a single file
     * @param {string} url - File URL
     * @param {string} filename - Filename to save as
     * @returns {Promise<void>}
     */
    async downloadFile(url, filename) {
        return new Promise((resolve, reject) => {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';

                document.body.appendChild(a);
                a.click();

                // Clean up after a short delay
                setTimeout(() => {
                    document.body.removeChild(a);
                    resolve();
                }, 100);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Adds items to the download queue
     * @param {Array<DownloadItem>} items - Items to download
     */
    addToQueue(items) {
        this.queue.push(...items);
        log(`Added ${items.length} items to queue. Total: ${this.queue.length}`);
    }

    /**
     * Starts the download process
     * @returns {Promise<Object>} Result with completed and failed counts
     */
    async start() {
        if (this.queue.length === 0) {
            logError('Queue is empty');
            return { completed: 0, failed: 0 };
        }

        log(`Starting downloads: ${this.queue.length} items, max ${this.maxConcurrent} concurrent`);

        this.completed = 0;
        this.failed = 0;
        this.isPaused = false;
        this.isStopped = false;

        const total = this.queue.length;

        // Start concurrent workers
        const workers = [];
        for (let i = 0; i < this.maxConcurrent; i++) {
            workers.push(this.processQueue());
        }

        // Wait for all workers to complete
        await Promise.all(workers);

        // Notify completion
        if (this.onComplete) {
            this.onComplete({
                total,
                completed: this.completed,
                failed: this.failed
            });
        }

        logSuccess(`Downloads complete: ${this.completed} succeeded, ${this.failed} failed`);

        return {
            completed: this.completed,
            failed: this.failed
        };
    }

    /**
     * Worker that processes items from the queue
     * @returns {Promise<void>}
     */
    async processQueue() {
        while (this.queue.length > 0 && !this.isStopped) {
            // Wait if paused
            while (this.isPaused && !this.isStopped) {
                await delay(100);
            }

            if (this.isStopped) break;

            const item = this.queue.shift();
            if (!item) break;

            this.activeDownloads++;

            try {
                await this.downloadFile(item.url, item.getFileName());

                item.downloaded = true;
                this.completed++;

                log(`✅ Downloaded: ${item.getFileName()}`);

                // Notify item completion
                if (this.onItemComplete) {
                    this.onItemComplete(item, null);
                }

            } catch (error) {
                item.failed = true;
                this.failed++;

                logError(`Failed to download: ${item.getFileName()}`, error);

                // Notify error
                if (this.onError) {
                    this.onError(item, error);
                }

                if (this.onItemComplete) {
                    this.onItemComplete(item, error);
                }
            }

            this.activeDownloads--;

            // Notify progress
            if (this.onProgress) {
                this.onProgress({
                    completed: this.completed,
                    failed: this.failed,
                    remaining: this.queue.length,
                    active: this.activeDownloads
                });
            }

            // Delay before next download
            if (this.queue.length > 0) {
                await delay(this.delayBetweenDownloads);
            }
        }
    }

    /**
     * Pauses the download process
     */
    pause() {
        this.isPaused = true;
        log('Downloads paused');
    }

    /**
     * Resumes the download process
     */
    resume() {
        this.isPaused = false;
        log('Downloads resumed');
    }

    /**
     * Stops the download process
     */
    stop() {
        this.isStopped = true;
        this.queue = [];
        log('Downloads stopped');
    }

    /**
     * Resets the manager state
     */
    reset() {
        this.queue = [];
        this.activeDownloads = 0;
        this.completed = 0;
        this.failed = 0;
        this.isPaused = false;
        this.isStopped = false;
    }

    /**
     * Gets current status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            activeDownloads: this.activeDownloads,
            completed: this.completed,
            failed: this.failed,
            isPaused: this.isPaused,
            isStopped: this.isStopped
        };
    }
}

// ==================== BATCH DOWNLOAD HELPER ====================

/**
 * Helper function to perform batch downloads
 * @param {Array<DownloadItem>} items - Items to download
 * @param {Object} options - Options (onProgress, onComplete, etc.)
 * @returns {Promise<Object>} Result with completed and failed counts
 */
export async function batchDownload(items, options = {}) {
    const manager = new DownloadManager(options);
    manager.addToQueue(items);
    return await manager.start();
}

// ==================== EXPORTS ====================

export default DownloadManager;
