/**
 * Estratégia Downloader - UI Module
 *
 * Manages the user interface components.
 */

import { CONFIG, VERSION, MESSAGES } from '../core/config.js';
import { log, logError } from '../core/utils.js';

// ==================== STYLES ====================

const STYLES = `
    #edl-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #edl-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #edl-title {
        font-size: 14px;
    }

    #edl-version {
        font-size: 10px;
        opacity: 0.8;
    }

    #edl-content {
        padding: 15px;
        max-height: 400px;
        overflow-y: auto;
    }

    #edl-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 15px;
    }

    #edl-checkbox-group label {
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    #edl-checkbox-group label:hover {
        opacity: 0.8;
    }

    #edl-checkbox-group input[type="checkbox"] {
        margin-right: 8px;
        cursor: pointer;
        width: 16px;
        height: 16px;
    }

    #edl-buttons {
        display: flex;
        gap: 10px;
        padding: 15px;
        border-top: 1px solid #eee;
    }

    #edl-buttons button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 13px;
        transition: all 0.3s;
    }

    #edl-scan-btn {
        background: #667eea;
        color: white;
    }

    #edl-scan-btn:hover:not(:disabled) {
        background: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    #edl-download-btn {
        background: #00d084;
        color: white;
    }

    #edl-download-btn:hover:not(:disabled) {
        background: #00b870;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 208, 132, 0.4);
    }

    #edl-buttons button:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }

    #edl-status {
        padding: 10px;
        background: #f0f4ff;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
        color: #667eea;
        font-weight: bold;
        margin-top: 10px;
        display: none;
    }

    #edl-status.loading {
        background: #fff3e0;
        color: #ff9800;
    }

    #edl-status.success {
        background: #e8f5e9;
        color: #4caf50;
    }

    #edl-status.error {
        background: #ffebee;
        color: #f44336;
    }

    #edl-result {
        margin-top: 15px;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.6;
        display: none;
    }

    .edl-result-item {
        padding: 8px;
        border-bottom: 1px solid #e0e0e0;
    }

    .edl-result-item:last-child {
        border-bottom: none;
    }

    .edl-aula-header {
        font-weight: bold;
        color: #667eea;
        margin-top: 10px;
        margin-bottom: 5px;
    }

    .edl-video-item {
        margin-left: 15px;
        font-size: 12px;
        color: #666;
    }
`;

// ==================== UI CONTROLLER CLASS ====================

/**
 * Manages the UI components and interactions
 */
export class UIController {
    constructor() {
        this.container = null;
        this.scanBtn = null;
        this.downloadBtn = null;
        this.statusEl = null;
        this.resultEl = null;
        this.checkboxes = {};

        // Callbacks
        this.onScan = null;
        this.onDownload = null;
    }

    /**
     * Injects the UI into the page
     */
    inject() {
        // Inject styles
        this.injectStyles();

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'edl-container';

        // Build UI
        this.container.innerHTML = this.getHTML();
        document.body.appendChild(this.container);

        // Get references
        this.scanBtn = document.getElementById('edl-scan-btn');
        this.downloadBtn = document.getElementById('edl-download-btn');
        this.statusEl = document.getElementById('edl-status');
        this.resultEl = document.getElementById('edl-result');

        // Get checkbox references
        this.checkboxes = {
            livros: document.getElementById('edl-livros'),
            resumos: document.getElementById('edl-resumos'),
            slides: document.getElementById('edl-slides'),
            mapas: document.getElementById('edl-mapas')
        };

        // Attach event listeners
        this.attachEvents();

        log('✅ UI injected successfully');
    }

    /**
     * Injects CSS styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    /**
     * Gets the HTML for the UI
     * @returns {string} HTML string
     */
    getHTML() {
        return `
            <div id="edl-header">
                <div id="edl-title">📥 Estratégia Downloader</div>
                <div id="edl-version">v${VERSION}</div>
            </div>

            <div id="edl-content">
                <div id="edl-checkbox-group">
                    <label>
                        <input type="checkbox" id="edl-livros" checked>
                        📚 Livros Eletrônicos
                    </label>
                    <label>
                        <input type="checkbox" id="edl-resumos" checked>
                        📄 Resumos
                    </label>
                    <label>
                        <input type="checkbox" id="edl-slides" checked>
                        🎨 Slides
                    </label>
                    <label>
                        <input type="checkbox" id="edl-mapas" checked>
                        🗺️ Mapas Mentais
                    </label>
                </div>

                <div id="edl-status">${MESSAGES.INITIAL}</div>
            </div>

            <div id="edl-buttons">
                <button id="edl-scan-btn">🔍 LISTAR</button>
                <button id="edl-download-btn" disabled>⬇️ BAIXAR</button>
            </div>

            <div id="edl-result"></div>
        `;
    }

    /**
     * Attaches event listeners
     */
    attachEvents() {
        this.scanBtn.addEventListener('click', () => {
            if (this.onScan) {
                this.onScan();
            }
        });

        this.downloadBtn.addEventListener('click', () => {
            if (this.onDownload) {
                this.onDownload(this.getSelectedTypes());
            }
        });
    }

    /**
     * Gets the selected file types
     * @returns {Object} Object with type filters
     */
    getSelectedTypes() {
        return {
            livro_original: this.checkboxes.livros.checked,
            livro_grifado: this.checkboxes.livros.checked,
            resumo: this.checkboxes.resumos.checked,
            slides: this.checkboxes.slides.checked,
            mapa_mental: this.checkboxes.mapas.checked
        };
    }

    /**
     * Shows the status element
     */
    showStatus() {
        this.statusEl.style.display = 'block';
    }

    /**
     * Hides the status element
     */
    hideStatus() {
        this.statusEl.style.display = 'none';
    }

    /**
     * Sets status message
     * @param {string} message - Message to display
     * @param {string} type - Type (info, loading, success, error)
     */
    setStatus(message, type = 'info') {
        this.statusEl.className = 'status';
        if (type === 'loading') this.statusEl.classList.add('loading');
        else if (type === 'success') this.statusEl.classList.add('success');
        else if (type === 'error') this.statusEl.classList.add('error');

        this.statusEl.textContent = message;
        this.showStatus();
    }

    /**
     * Enables scan button
     * @param {string} text - Button text
     */
    enableScanBtn(text = '🔍 LISTAR') {
        this.scanBtn.disabled = false;
        this.scanBtn.textContent = text;
    }

    /**
     * Disables scan button
     * @param {string} text - Button text
     */
    disableScanBtn(text = '⏳ Escaneando...') {
        this.scanBtn.disabled = true;
        this.scanBtn.textContent = text;
    }

    /**
     * Enables download button
     * @param {string} text - Button text
     */
    enableDownloadBtn(text = '⬇️ BAIXAR') {
        this.downloadBtn.disabled = false;
        this.downloadBtn.textContent = text;
    }

    /**
     * Disables download button
     * @param {string} text - Button text
     */
    disableDownloadBtn(text = '⬇️ BAIXAR') {
        this.downloadBtn.disabled = true;
        this.downloadBtn.textContent = text;
    }

    /**
     * Shows result area
     */
    showResult() {
        this.resultEl.style.display = 'block';
    }

    /**
     * Hides result area
     */
    hideResult() {
        this.resultEl.style.display = 'none';
    }

    /**
     * Clears result content
     */
    clearResult() {
        this.resultEl.innerHTML = '';
        this.hideResult();
    }

    /**
     * Adds content to result area
     * @param {string} html - HTML to append
     */
    addResult(html) {
        this.resultEl.innerHTML += html;
        this.showResult();
        this.resultEl.scrollTop = this.resultEl.scrollHeight;
    }

    /**
     * Removes the UI from the page
     */
    remove() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// ==================== EXPORTS ====================

export default UIController;
