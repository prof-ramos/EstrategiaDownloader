/**
 * Estratégia Downloader - Utilities Module
 *
 * Common utility functions used across the application.
 */

import { CONFIG, DEBUG, PATTERNS } from './config.js';

// ==================== LOGGING ====================

/**
 * Logs a message to console if DEBUG is enabled
 * @param {string} msg - Message to log
 * @param {*} data - Optional data to log
 */
export const log = (msg, data = null) => {
    if (DEBUG) {
        console.log(`[EstrategiaDownloader] ${msg}`, data || '');
    }
};

/**
 * Logs an error message to console
 * @param {string} msg - Error message
 * @param {Error} error - Error object
 */
export const logError = (msg, error = null) => {
    console.error(`[EstrategiaDownloader] ❌ ${msg}`, error || '');
};

/**
 * Logs success message to console
 * @param {string} msg - Success message
 * @param {*} data - Optional data to log
 */
export const logSuccess = (msg, data = null) => {
    console.log(`[EstrategiaDownloader] ✅ ${msg}`, data || '');
};

// ==================== ASYNC UTILITIES ====================

/**
 * Creates a promise that resolves after specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retries an async function on failure
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delayMs - Delay between retries in ms
 * @returns {Promise<*>}
 */
export const retry = async (fn, maxAttempts = 3, delayMs = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            logError(`Attempt ${attempt}/${maxAttempts} failed`, error);

            if (attempt < maxAttempts) {
                await delay(delayMs);
            }
        }
    }

    throw lastError;
};

// ==================== URL PARSING ====================

/**
 * Extracts course ID from URL
 * @param {string} url - URL to parse
 * @returns {string|null} Course ID or null if not found
 */
export const extractCourseId = (url) => {
    const match = url.match(PATTERNS.COURSE_ID);
    return match ? match[1] : null;
};

/**
 * Extracts aula ID from URL
 * @param {string} url - URL to parse
 * @returns {string|null} Aula ID or null if not found
 */
export const extractAulaId = (url) => {
    const match = url.match(PATTERNS.AULA_ID);
    return match ? match[1] : null;
};

/**
 * Extracts video ID from URL
 * @param {string} url - URL to parse
 * @returns {string|null} Video ID or null if not found
 */
export const extractVideoId = (url) => {
    const match = url.match(PATTERNS.VIDEO_ID);
    return match ? match[1] : null;
};

// ==================== STRING UTILITIES ====================

/**
 * Pads a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} length - Desired length
 * @returns {string} Zero-padded string
 */
export const padZero = (num, length = 2) => {
    return String(num).padStart(length, '0');
};

/**
 * Sanitizes filename by removing invalid characters
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
    return filename.replace(/[<>:"/\\|?*]/g, '_');
};

// ==================== ARRAY UTILITIES ====================

/**
 * Removes duplicate items from array
 * @param {Array} arr - Array to deduplicate
 * @returns {Array} Array with unique items
 */
export const unique = (arr) => {
    return [...new Set(arr)];
};

/**
 * Groups array items by a key
 * @param {Array} arr - Array to group
 * @param {Function} keyFn - Function to extract key from item
 * @returns {Object} Object with grouped items
 */
export const groupBy = (arr, keyFn) => {
    return arr.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
};

/**
 * Chunks array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array<Array>} Array of chunks
 */
export const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

// ==================== VALIDATION ====================

/**
 * Checks if a URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Checks if a string is a valid course ID
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
export const isValidCourseId = (id) => {
    return /^\d+$/.test(String(id).trim());
};

// ==================== DOM UTILITIES ====================

/**
 * Creates a DOM parser instance
 * @returns {DOMParser}
 */
export const createParser = () => {
    return new DOMParser();
};

/**
 * Parses HTML string to DOM document
 * @param {string} html - HTML string
 * @returns {Document} Parsed document
 */
export const parseHTML = (html) => {
    const parser = createParser();
    return parser.parseFromString(html, 'text/html');
};

/**
 * Safely queries DOM for elements
 * @param {Document|Element} root - Root element to query from
 * @param {string} selector - CSS selector
 * @returns {Array<Element>} Array of matching elements
 */
export const querySelectorSafe = (root, selector) => {
    try {
        return Array.from(root.querySelectorAll(selector));
    } catch (error) {
        logError(`Invalid selector: ${selector}`, error);
        return [];
    }
};

// ==================== STORAGE UTILITIES ====================

/**
 * Gets item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        logError(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
};

/**
 * Sets item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        logError(`Error writing to localStorage: ${key}`, error);
        return false;
    }
};

/**
 * Removes item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        logError(`Error removing from localStorage: ${key}`, error);
        return false;
    }
};

// ==================== DATE/TIME UTILITIES ====================

/**
 * Formats current date/time for filenames
 * @returns {string} Formatted date string (YYYYMMDD_HHMMSS)
 */
export const getTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

/**
 * Formats duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2m 30s")
 */
export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

// ==================== EXPORT ALL ====================

export default {
    log,
    logError,
    logSuccess,
    delay,
    retry,
    extractCourseId,
    extractAulaId,
    extractVideoId,
    padZero,
    sanitizeFilename,
    unique,
    groupBy,
    chunk,
    isValidUrl,
    isValidCourseId,
    createParser,
    parseHTML,
    querySelectorSafe,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    getTimestamp,
    formatDuration
};
