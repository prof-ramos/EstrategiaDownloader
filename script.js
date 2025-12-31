// ==UserScript==
// @name         Estratégia Downloader v2.0 - Download Automático
// @namespace    estrategia.downloader.v2
// @version      2.0.0
// @description  Baixa automaticamente todo um curso do Estratégia
// @author       Você
// @match        https://www.estrategiaconcursos.com.br/app/dashboard/cursos/*/aulas*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=estrategiaconcursos.com.br
// @grant        unsafeWindow
// @connect      api.estrategiaconcursos.com.br
// @run-at       document-idle
// ==/UserScript==

(async function() {
    'use strict';

    // ==================== CONFIG ====================
    const CONFIG = {
        DEBUG: true,
        DELAY_BETWEEN_FETCHES: 300, // ms entre requisições de lista
        DELAY_BETWEEN_DOWNLOADS: 500, // ms entre downloads
        MAX_CONCURRENT_DOWNLOADS: 3,
        DOWNLOAD_TIMEOUT: 30000 // ms
    };

    // ==================== CLASSES ====================
    class DownloadItem {
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

        getFileName() {
            const aulaPrefix = `Aula${String(this.aulaNumber).padStart(2, '0')}`;
            const videoPrefix = this.videoNumber ? `V${String(this.videoNumber).padStart(2, '0')}_` : '';
            
            const typeMap = {
                'livro_original': 'LivroEletronico_Original.pdf',
                'livro_grifado': 'LivroEletronico_Grifado.pdf',
                'resumo': 'Resumo.pdf',
                'slides': 'Slides.pdf',
                'mapa_mental': 'MapaMental.pdf',
                'video': 'Video.mp4',
                'audio': 'Audio.mp3'
            };
            
            const ext = typeMap[this.type] || `${this.type}.pdf`;
            return `${aulaPrefix}_${videoPrefix}${ext}`;
        }
    }

    // ==================== LOGGING ====================
    const log = (msg, data = null) => {
        if (CONFIG.DEBUG) {
            console.log(`[EstrategiaDownloader] ${msg}`, data || '');
        }
    };

    const logError = (msg, error) => {
        console.error(`[EstrategiaDownloader] ❌ ${msg}`, error || '');
    };

    // ==================== UTILIDADES ====================
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const extractCourseId = (url) => {
        const match = url.match(/\\/cursos\\/(\\d+)\\//);
        return match ? match[1] : null;
    };

    const extractAulaId = (url) => {
        const match = url.match(/\\/aulas\\/(\\d+)/);
        return match ? match[1] : null;
    };

    // ==================== PARSING ====================
    const parseAulaPage = (html, aulaNumber) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const downloads = [];
        let videoCounter = 1;

        // 1. PDFs de livros
        const pdfLinks = doc.querySelectorAll('a[href*="api/aluno/pdf"]');
        pdfLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.includes('pdfGrifado')) {
                downloads.push(new DownloadItem('livro_grifado', href, 'Livro Eletrônico (Grifado)', aulaNumber));
            } else if (href.includes('pdf/download')) {
                downloads.push(new DownloadItem('livro_original', href, 'Livro Eletrônico (Original)', aulaNumber));
            }
        });

        // 2. Downloads de vídeos (resumo, slides, mapa mental)
        const videoLinks = doc.querySelectorAll('a[href*="api/video"]');
        const processedVideos = new Set();

        videoLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.includes('/download/')) {
                const videoIdMatch = href.match(/\\/video\\/(\\d+)\\//);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                const key = `${videoId}`;

                if (!processedVideos.has(key)) {
                    let type = 'video';
                    if (href.includes('resumo')) type = 'resumo';
                    else if (href.includes('slideshow')) type = 'slides';
                    else if (href.includes('mapa_mental')) type = 'mapa_mental';

                    if (type !== 'video') {
                        downloads.push(new DownloadItem(type, href, type.toUpperCase(), aulaNumber, videoCounter));
                    }
                    
                    if (type === 'resumo') {
                        processedVideos.add(key);
                        videoCounter++;
                    }
                }
            }
        });

        return downloads;
    };

    const getAulaLinks = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = [];
        const seen = new Set();

        doc.querySelectorAll('a[href*="/aulas/"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href.match(/\\/aulas\\/\\d+$/) && !href.includes('videos') && !seen.has(href)) {
                seen.add(href);
                links.push(href);
            }
        });

        return links;
    };

    // ==================== NETWORK ====================
    const fetchPage = async (url) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'text/html' }
            });
            return await response.text();
        } catch (error) {
            logError(`Erro ao buscar ${url}`, error);
            return null;
        }
    };

    // ==================== SCAN ====================
    const scanAllAulas = async (startUrl) => {
        const courseId = extractCourseId(startUrl);
        if (!courseId) {
            logError('Não foi possível extrair Course ID');
            return [];
        }

        log(`🔍 Iniciando scan do curso ${courseId}`);
        
        const allDownloads = [];
        const visitedAulas = new Set();
        const aulaQueue = [];
        let aulaCounter = 0;

        // Buscar a página de listagem de aulas
        const listingUrl = `https://www.estrategiaconcursos.com.br/app/dashboard/cursos/${courseId}/aulas`;
        const listingHtml = await fetchPage(listingUrl);

        if (!listingHtml) {
            logError('Não foi possível carregar a página de listagem');
            return [];
        }

        const aulaLinks = getAulaLinks(listingHtml);
        aulaQueue.push(...aulaLinks);

        // Processar fila de aulas
        while (aulaQueue.length > 0) {
            const aulaPath = aulaQueue.shift();
            
            if (visitedAulas.has(aulaPath)) continue;
            visitedAulas.add(aulaPath);
            aulaCounter++;

            try {
                const aulaUrl = `https://www.estrategiaconcursos.com.br${aulaPath}`;
                const aulaHtml = await fetchPage(aulaUrl);

                if (!aulaHtml) continue;

                const downloads = parseAulaPage(aulaHtml, aulaCounter);
                allDownloads.push(...downloads);

                log(`✅ Aula ${aulaCounter}: ${downloads.length} itens`);

                // Verificar próximas aulas
                const nextLinks = getAulaLinks(aulaHtml);
                nextLinks.forEach(link => {
                    if (!visitedAulas.has(link) && !aulaQueue.includes(link)) {
                        aulaQueue.push(link);
                    }
                });

                await delay(CONFIG.DELAY_BETWEEN_FETCHES);
            } catch (error) {
                logError(`Erro ao processar aula`, error);
            }
        }

        return allDownloads;
    };

    // ==================== DOWNLOAD ====================
    const downloadFile = (url, filename) => {
        return new Promise((resolve) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            resolve();
        });
    };

    const performDownloads = async (items) => {
        let queue = items.filter(item => item.checked !== false);
        let activeDownloads = 0;
        let completed = 0;
        let failed = 0;

        const updateUI = () => {
            const statusEl = document.getElementById('edl-status');
            if (statusEl) {
                statusEl.innerHTML = `📥 Completando: ${completed}/${queue.length} | ❌ Erros: ${failed}`;
            }
        };

        const downloadNext = async () => {
            if (queue.length === 0) {
                if (activeDownloads === 0) return;
                await delay(1000);
                return downloadNext();
            }

            if (activeDownloads >= CONFIG.MAX_CONCURRENT_DOWNLOADS) {
                await delay(500);
                return downloadNext();
            }

            const item = queue.shift();
            activeDownloads++;

            try {
                await downloadFile(item.url, item.getFileName());
                completed++;
                item.downloaded = true;
                log(`✅ Downloaded: ${item.getFileName()}`);
            } catch (error) {
                failed++;
                item.failed = true;
                logError(`Erro ao baixar ${item.getFileName()}`, error);
            }

            activeDownloads--;
            updateUI();
            downloadNext();
        };

        // Iniciar downloads paralelos
        for (let i = 0; i < CONFIG.MAX_CONCURRENT_DOWNLOADS; i++) {
            downloadNext();
        }

        // Aguardar conclusão
        return new Promise((resolve) => {
            const checkComplete = setInterval(() => {
                if (queue.length === 0 && activeDownloads === 0) {
                    clearInterval(checkComplete);
                    resolve({ completed, failed });
                }
            }, 500);
        });
    };

    // ==================== UI ====================
    const injectUI = async () => {
        // Criar container principal
        const container = document.createElement('div');
        container.id = 'edl-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            width: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        // Estilos globais
        const style = document.createElement('style');
        style.textContent = `
            #edl-container { background: white; color: #333; }
            #edl-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 12px 12px 0 0; font-weight: bold; }
            #edl-content { padding: 15px; max-height: 400px; overflow-y: auto; }
            #edl-checkbox-group { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
            #edl-checkbox-group label { display: flex; align-items: center; cursor: pointer; }
            #edl-checkbox-group input[type="checkbox"] { margin-right: 8px; cursor: pointer; }
            #edl-buttons { display: flex; gap: 10px; padding: 15px; border-top: 1px solid #eee; }
            #edl-buttons button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
            #edl-scan-btn { background: #667eea; color: white; }
            #edl-scan-btn:hover { background: #5568d3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
            #edl-download-btn { background: #00d084; color: white; }
            #edl-download-btn:hover { background: #00b870; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 208, 132, 0.4); }
            #edl-download-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
            #edl-status { padding: 10px; background: #f0f4ff; border-radius: 6px; font-size: 12px; text-align: center; color: #667eea; font-weight: bold; }
        `;
        document.head.appendChild(style);

        // Header
        const header = document.createElement('div');
        header.id = 'edl-header';
        header.innerHTML = '📥 Estratégia Downloader v2.0';

        // Content
        const content = document.createElement('div');
        content.id = 'edl-content';
        content.innerHTML = `
            <div id="edl-checkbox-group">
                <label><input type="checkbox" id="edl-livros" checked> 📚 Livros Eletrônicos</label>
                <label><input type="checkbox" id="edl-resumos" checked> 📄 Resumos</label>
                <label><input type="checkbox" id="edl-slides" checked> 🎨 Slides</label>
                <label><input type="checkbox" id="edl-mapas" checked> 🗺️ Mapas Mentais</label>
            </div>
            <div id="edl-status" style="margin-top: 10px; display: none;">Aguardando...</div>
        `;

        // Buttons
        const buttons = document.createElement('div');
        buttons.id = 'edl-buttons';
        buttons.innerHTML = `
            <button id="edl-scan-btn">🔍 LISTAR</button>
            <button id="edl-download-btn" disabled>⬇️ BAIXAR</button>
        `;

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(buttons);
        document.body.appendChild(container);

        // Event listeners
        let scannedItems = [];

        document.getElementById('edl-scan-btn').addEventListener('click', async function() {
            this.disabled = true;
            this.innerHTML = '⏳ Escaneando...';
            const statusEl = document.getElementById('edl-status');
            statusEl.style.display = 'block';
            statusEl.innerHTML = '🔄 Buscando aulas...';

            scannedItems = await scanAllAulas(window.location.href);
            
            this.disabled = false;
            this.innerHTML = `✅ LISTAR (${scannedItems.length} itens)`;
            document.getElementById('edl-download-btn').disabled = scannedItems.length === 0;
            
            statusEl.innerHTML = `✅ ${scannedItems.length} itens encontrados. Escolha o que baixar e clique em BAIXAR.`;
        });

        document.getElementById('edl-download-btn').addEventListener('click', async function() {
            this.disabled = true;
            this.innerHTML = '⏳ Iniciando...';

            // Aplicar filtros
            const filters = {
                livro_original: document.getElementById('edl-livros').checked,
                livro_grifado: document.getElementById('edl-livros').checked,
                resumo: document.getElementById('edl-resumos').checked,
                slides: document.getElementById('edl-slides').checked,
                mapa_mental: document.getElementById('edl-mapas').checked
            };

            const filteredItems = scannedItems.filter(item => filters[item.type]);
            
            const statusEl = document.getElementById('edl-status');
            statusEl.innerHTML = `📥 Iniciando download de ${filteredItems.length} arquivos...`;

            const result = await performDownloads(filteredItems);

            statusEl.innerHTML = `✅ Concluído! ${result.completed} baixados, ${result.failed} erros.`;
            this.disabled = false;
            this.innerHTML = '⬇️ BAIXAR';
        });

        log('✅ UI injetada');
    };

    // ==================== INIT ====================
    const init = async () => {
        log('🚀 Estratégia Downloader v2.0 iniciado');
        const courseId = extractCourseId(window.location.href);
        
        if (courseId) {
            await injectUI();
        } else {
            logError('Não foi possível detectar um curso válido');
        }
    };

    // Aguardar DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();