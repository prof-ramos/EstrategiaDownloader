/**
 * Estratégia Downloader - Scanner Module
 *
 * Responsible for scanning course pages and extracting download links.
 */

import { CONFIG, DELAY_BETWEEN_FETCHES, BASE_URL, SELECTORS } from './config.js';
import {
    log,
    logError,
    logSuccess,
    delay,
    parseHTML,
    querySelectorSafe,
    extractCourseId,
    extractVideoId,
    unique
} from './utils.js';

// ==================== DOWNLOAD ITEM CLASS ====================

/**
 * Represents a downloadable item
 */
export class DownloadItem {
    /**
     * Creates a new DownloadItem
     * @param {string} type - Type of item (livro_original, livro_grifado, resumo, slides, mapa_mental)
     * @param {string} url - Download URL
     * @param {string} title - Item title
     * @param {number} aulaNumber - Aula number
     * @param {number|null} videoNumber - Video number (optional)
     * @param {string|null} videoTitle - Video title (optional)
     */
    constructor(type, url, title, aulaNumber, videoNumber = null, videoTitle = null) {
        this.type = type;
        this.url = url;
        this.title = title;
        this.aulaNumber = aulaNumber;
        this.videoNumber = videoNumber;
        this.videoTitle = videoTitle;
        this.downloaded = false;
        this.failed = false;
    }

    /**
     * Generates filename for this item
     * @returns {string} Filename with format: AulaXX_[VYY_]Type.ext
     */
    getFileName() {
        const aulaPrefix = `Aula${String(this.aulaNumber).padStart(2, '0')}`;
        const videoPrefix = this.videoNumber ? `V${String(this.videoNumber).padStart(2, '0')}_` : '';

        const extension = CONFIG.FILE_PATTERNS[this.type] || `${this.type}.pdf`;

        return `${aulaPrefix}_${videoPrefix}${extension}`;
    }

    /**
     * Returns a JSON representation of this item
     * @returns {Object}
     */
    toJSON() {
        return {
            type: this.type,
            url: this.url,
            title: this.title,
            aula: this.aulaNumber,
            video: this.videoNumber,
            fileName: this.getFileName(),
            downloaded: this.downloaded,
            failed: this.failed
        };
    }
}

// ==================== SCANNER CLASS ====================

/**
 * Main scanner class for discovering course materials
 */
export class CourseScanner {
    constructor() {
        this.visitedAulas = new Set();
        this.items = [];
    }

    /**
     * Fetches a page with credentials
     * @param {string} url - URL to fetch
     * @returns {Promise<string|null>} HTML content or null on error
     */
    async fetchPage(url) {
        try {
            log(`Fetching: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'text/html' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        } catch (error) {
            logError(`Failed to fetch ${url}`, error);
            return null;
        }
    }

    /**
     * Extracts aula links from HTML
     * @param {string} html - HTML content
     * @returns {Array<string>} Array of aula URLs
     */
    extractAulaLinks(html) {
        const doc = parseHTML(html);
        const links = [];
        const seen = new Set();

        const elements = querySelectorSafe(doc, SELECTORS.AULA_LINKS);

        elements.forEach(link => {
            const href = link.getAttribute('href');

            // Filter: must match /aulas/\d+ pattern and not include 'videos'
            if (href && href.match(/\/aulas\/\d+$/) && !href.includes('videos') && !seen.has(href)) {
                seen.add(href);
                links.push(href);
            }
        });

        return links;
    }

    /**
     * Parses an aula page and extracts download items
     * @param {string} html - HTML content
     * @param {number} aulaNumber - Aula number
     * @returns {Array<DownloadItem>} Array of download items
     */
    parseAulaPage(html, aulaNumber) {
        const doc = parseHTML(html);
        const downloads = [];
        let videoCounter = 1;

        // 1. Extract PDF book links
        const pdfLinks = querySelectorSafe(doc, SELECTORS.PDF_LINKS);

        pdfLinks.forEach(link => {
            const href = link.getAttribute('href');

            if (href.includes('pdfGrifado')) {
                downloads.push(
                    new DownloadItem(
                        'livro_grifado',
                        href,
                        'Livro Eletrônico (Grifado)',
                        aulaNumber
                    )
                );
            } else if (href.includes('pdf/download')) {
                downloads.push(
                    new DownloadItem(
                        'livro_original',
                        href,
                        'Livro Eletrônico (Original)',
                        aulaNumber
                    )
                );
            }
        });

        // 2. Extract video material links (resumo, slides, mapa mental)
        const videoLinks = querySelectorSafe(doc, SELECTORS.VIDEO_LINKS);
        const processedVideos = new Set();

        videoLinks.forEach(link => {
            const href = link.getAttribute('href');

            if (href && href.includes('/download/')) {
                const videoId = extractVideoId(href);
                const key = `${videoId}`;

                // Determine type
                let type = 'video';
                if (href.includes('resumo')) type = 'resumo';
                else if (href.includes('slideshow')) type = 'slides';
                else if (href.includes('mapa_mental')) type = 'mapa_mental';

                // Add item if not a raw video
                if (type !== 'video') {
                    downloads.push(
                        new DownloadItem(
                            type,
                            href,
                            type.toUpperCase(),
                            aulaNumber,
                            videoCounter
                        )
                    );
                }

                // Increment video counter only once per video
                if (type === 'resumo' && !processedVideos.has(key)) {
                    processedVideos.add(key);
                    videoCounter++;
                }
            }
        });

        return downloads;
    }

    /**
     * Scans all aulas for a course
     * @param {string} courseId - Course ID
     * @param {Function} onProgress - Progress callback (aulaNum, totalAulas)
     * @returns {Promise<Array<DownloadItem>>} Array of all download items
     */
    async scanCourse(courseId, onProgress = null) {
        log(`🔍 Starting scan for course ${courseId}`);

        this.visitedAulas.clear();
        this.items = [];

        const allDownloads = [];
        const aulaQueue = [];
        let aulaCounter = 0;

        // 1. Fetch listing page
        const listingUrl = `${BASE_URL}/app/dashboard/cursos/${courseId}/aulas`;
        const listingHtml = await this.fetchPage(listingUrl);

        if (!listingHtml) {
            logError('Failed to load course listing page');
            return [];
        }

        // 2. Extract initial aula links
        const aulaLinks = this.extractAulaLinks(listingHtml);
        aulaQueue.push(...aulaLinks);

        log(`Found ${aulaLinks.length} aulas in listing`);

        // 3. Process aula queue
        while (aulaQueue.length > 0) {
            const aulaPath = aulaQueue.shift();

            if (this.visitedAulas.has(aulaPath)) {
                continue;
            }

            this.visitedAulas.add(aulaPath);
            aulaCounter++;

            try {
                const aulaUrl = `${BASE_URL}${aulaPath}`;
                const aulaHtml = await this.fetchPage(aulaUrl);

                if (!aulaHtml) {
                    log(`Skipping aula ${aulaCounter} (failed to fetch)`);
                    continue;
                }

                // Parse downloads from this aula
                const downloads = this.parseAulaPage(aulaHtml, aulaCounter);
                allDownloads.push(...downloads);

                log(`✅ Aula ${aulaCounter}: ${downloads.length} items`);

                // Notify progress
                if (onProgress) {
                    onProgress(aulaCounter, aulaLinks.length);
                }

                // Check for additional aula links
                const nextLinks = this.extractAulaLinks(aulaHtml);
                nextLinks.forEach(link => {
                    if (!this.visitedAulas.has(link) && !aulaQueue.includes(link)) {
                        aulaQueue.push(link);
                    }
                });

                // Delay before next fetch
                await delay(DELAY_BETWEEN_FETCHES);

            } catch (error) {
                logError(`Error processing aula ${aulaCounter}`, error);
            }
        }

        this.items = allDownloads;
        logSuccess(`Scan complete: ${allDownloads.length} items found`);

        return allDownloads;
    }

    /**
     * Gets items filtered by type
     * @param {Array<string>} types - Array of types to include
     * @returns {Array<DownloadItem>} Filtered items
     */
    getItemsByType(types) {
        return this.items.filter(item => types.includes(item.type));
    }

    /**
     * Gets items grouped by aula
     * @returns {Object} Object with aula numbers as keys
     */
    getItemsByAula() {
        const grouped = {};

        this.items.forEach(item => {
            if (!grouped[item.aulaNumber]) {
                grouped[item.aulaNumber] = [];
            }
            grouped[item.aulaNumber].push(item);
        });

        return grouped;
    }

    /**
     * Gets summary statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const stats = {
            total: this.items.length,
            byType: {},
            byAula: {}
        };

        this.items.forEach(item => {
            // Count by type
            if (!stats.byType[item.type]) {
                stats.byType[item.type] = 0;
            }
            stats.byType[item.type]++;

            // Count by aula
            if (!stats.byAula[item.aulaNumber]) {
                stats.byAula[item.aulaNumber] = 0;
            }
            stats.byAula[item.aulaNumber]++;
        });

        return stats;
    }

    /**
     * Resets scanner state
     */
    reset() {
        this.visitedAulas.clear();
        this.items = [];
    }
}

// ==================== EXPORTS ====================

export default CourseScanner;
