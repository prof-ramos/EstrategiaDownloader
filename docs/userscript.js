// ==UserScript==
// @name         Estratégia Downloader v2.0
// @namespace    estrategia.downloader.v2
// @version      2.0.0
// @description  Baixa automaticamente todo um curso do Estratégia
// @author       Gabriel Ramos
// @match        https://www.estrategiaconcursos.com.br/app/dashboard/cursos/*/aulas*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=estrategiaconcursos.com.br
// @grant        unsafeWindow
// @connect      api.estrategiaconcursos.com.br
// @run-at       document-idle
// ==/UserScript==

/**
 * Estratégia Downloader - Tampermonkey Version
 *
 * This is a bundled version of the modular codebase.
 * Source code available at: https://github.com/yourusername/estrategia-downloader
 */

(async function() {
    'use strict';

    // NOTE: This file should be built from the modular source using a bundler
    // For development, you can use the standalone HTML version
    // For production, run: npm run build:userscript

    console.log('%c[Estratégia Downloader] This is a placeholder for the bundled userscript.',
                'color: #667eea; font-weight: bold;');
    console.log('%cTo build the userscript from modules, run: npm run build:userscript',
                'color: #ff9800;');
    console.log('%cFor now, please use the standalone HTML version in dist/index.html',
                'color: #4caf50;');

    // Temporary notice
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    notice.innerHTML = `
        <h2 style="margin: 0 0 15px 0; color: #667eea;">📥 Estratégia Downloader</h2>
        <p style="margin: 0 0 10px 0; line-height: 1.6;">
            Este é um placeholder para a versão Tampermonkey.
        </p>
        <p style="margin: 0 0 15px 0; line-height: 1.6;">
            Para usar a ferramenta agora, abra o arquivo <code>dist/index.html</code> no seu navegador.
        </p>
        <button id="close-notice" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
        ">
            Entendi
        </button>
    `;

    document.body.appendChild(notice);

    document.getElementById('close-notice').addEventListener('click', () => {
        notice.remove();
    });

})();

/*
 * BUILD INSTRUCTIONS:
 *
 * To build this file from the modular source:
 *
 * 1. Install dependencies:
 *    npm install
 *
 * 2. Build the userscript:
 *    npm run build:userscript
 *
 * This will bundle all modules from src/ into a single userscript file.
 */
