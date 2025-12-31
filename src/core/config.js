/**
 * Estratégia Downloader - Configuration Module
 *
 * Centralizes all configuration settings for the application.
 */

export const CONFIG = {
    // Debug settings
    DEBUG: true,
    VERSION: '2.0.0',

    // Network settings
    DELAY_BETWEEN_FETCHES: 300,        // ms between course page fetches
    DELAY_BETWEEN_DOWNLOADS: 500,      // ms between file downloads
    MAX_CONCURRENT_DOWNLOADS: 3,       // max parallel downloads
    DOWNLOAD_TIMEOUT: 30000,           // ms before timeout
    FETCH_RETRY_ATTEMPTS: 2,           // number of retries on failure
    FETCH_RETRY_DELAY: 1000,           // ms delay between retries

    // URLs
    BASE_URL: 'https://www.estrategiaconcursos.com.br',
    API_BASE_URL: 'https://www.estrategiaconcursos.com.br/app',

    // File naming
    FILE_PATTERNS: {
        livro_original: 'LivroEletronico_Original.pdf',
        livro_grifado: 'LivroEletronico_Grifado.pdf',
        resumo: 'Resumo.pdf',
        slides: 'Slides.pdf',
        mapa_mental: 'MapaMental.pdf',
        video: 'Video.mp4',
        audio: 'Audio.mp3'
    },

    // UI settings
    UI: {
        CONTAINER_POSITION: {
            bottom: '20px',
            right: '20px'
        },
        ANIMATION_DURATION: 300,
        MAX_RESULT_HEIGHT: '300px'
    },

    // Status messages
    MESSAGES: {
        INITIAL: 'ℹ️ Clique em "LISTAR" para descobrir os materiais disponíveis',
        SCANNING: '🔄 Buscando aulas...',
        PROCESSING: (current, total) => `🔄 Processando aula ${current}/${total}...`,
        FOUND: (count) => `✅ ${count} itens encontrados! Clique em BAIXAR para começar.`,
        DOWNLOADING: (current, total) => `📥 ${current}/${total}`,
        COMPLETED: (completed, failed) => `✅ Concluído! ${completed} baixados${failed > 0 ? `, ${failed} erros` : ''}.`,
        ERROR_NO_COURSE_ID: '❌ Digite o ID do curso',
        ERROR_NO_SELECTION: '❌ Selecione pelo menos um tipo de arquivo',
        ERROR_NETWORK: (message) => `❌ Erro: ${message}`
    },

    // Selectors (for HTML parsing)
    SELECTORS: {
        AULA_LINKS: 'a[href*="/aulas/"]',
        PDF_LINKS: 'a[href*="api/aluno/pdf"]',
        VIDEO_LINKS: 'a[href*="api/video"]'
    },

    // Regex patterns
    PATTERNS: {
        COURSE_ID: /\/cursos\/(\d+)\//,
        AULA_ID: /\/aulas\/(\d+)/,
        VIDEO_ID: /\/video\/(\d+)\//
    }
};

// Export individual configs for easier imports
export const {
    DEBUG,
    VERSION,
    DELAY_BETWEEN_FETCHES,
    DELAY_BETWEEN_DOWNLOADS,
    MAX_CONCURRENT_DOWNLOADS,
    DOWNLOAD_TIMEOUT,
    BASE_URL,
    MESSAGES,
    SELECTORS,
    PATTERNS
} = CONFIG;

export default CONFIG;
