# 📥 Estratégia Downloader v2.0

Ferramenta automatizada para download de materiais de cursos da plataforma Estratégia Concursos.

## ✨ Características

- 🔄 **Escaneia automaticamente** todas as aulas de um curso
- 📚 **Baixa múltiplos formatos**: Livros PDF, Resumos, Slides, Mapas Mentais
- 🎯 **Seleção customizável** de tipos de arquivo
- ⚡ **Downloads paralelos** com controle de concorrência
- 📝 **Nomenclatura inteligente**: `Aula00_V01_Resumo.pdf`
- 🏗️ **Arquitetura modular** para fácil manutenção

## 📁 Estrutura do Projeto

```
EstrategiaDownloader/
├── src/
│   ├── core/
│   │   ├── config.js           # Configurações centralizadas
│   │   ├── utils.js            # Funções utilitárias
│   │   ├── scanner.js          # Motor de escaneamento de aulas
│   │   └── download-manager.js # Gerenciador de downloads
│   └── ui/
│       └── ui.js               # Componentes de interface
├── dist/
│   ├── index.html              # Versão HTML standalone (USE ESTA!)
│   └── userscript.js           # Versão Tampermonkey (placeholder)
├── docs/
├── PRD.md                      # Product Requirements Document
└── README.md                   # Este arquivo
```

## 🚀 Como Usar

### Opção 1: HTML Standalone (Recomendado)

1. **Abra o arquivo no navegador:**
   ```bash
   # Navegue até a pasta e abra
   open dist/index.html
   # ou simplesmente dê duplo-clique no arquivo
   ```

2. **Configure:**
   - Insira o ID do curso (encontrado na URL: `/cursos/[ID]/aulas`)
   - Exemplo: `358349`

3. **Selecione os tipos:**
   - ☑️ Livros Eletrônicos
   - ☑️ Resumos
   - ☑️ Slides
   - ☑️ Mapas Mentais

4. **Execute:**
   - Clique em **🔍 LISTAR** para escanear
   - Clique em **⬇️ BAIXAR** para iniciar downloads

### Opção 2: Tampermonkey (Em desenvolvimento)

A versão Tampermonkey será construída a partir dos módulos usando um bundler.

**Instruções de build:**
```bash
# Instalar dependências
npm install

# Construir userscript
npm run build:userscript
```

## 🏗️ Arquitetura

### Módulos Principais

#### 1. **Config** (`src/core/config.js`)
Centraliza todas as configurações:
- URLs base
- Delays e timeouts
- Padrões de nomenclatura
- Seletores CSS
- Mensagens de status

#### 2. **Utils** (`src/core/utils.js`)
Funções utilitárias reutilizáveis:
- Logging (`log`, `logError`, `logSuccess`)
- Async helpers (`delay`, `retry`)
- URL parsing (`extractCourseId`, `extractAulaId`)
- String utilities (`padZero`, `sanitizeFilename`)
- DOM utilities (`parseHTML`, `querySelectorSafe`)
- Storage utilities (`getStorageItem`, `setStorageItem`)

#### 3. **Scanner** (`src/core/scanner.js`)
Responsável por escanear cursos:
- `CourseScanner`: Classe principal de escaneamento
- `DownloadItem`: Representa um item baixável
- Métodos:
  - `scanCourse(courseId)`: Escaneia todas as aulas
  - `getItemsByType(types)`: Filtra por tipo
  - `getItemsByAula()`: Agrupa por aula
  - `getStats()`: Estatísticas

#### 4. **DownloadManager** (`src/core/download-manager.js`)
Gerencia a fila de downloads:
- Controle de concorrência (padrão: 3 downloads paralelos)
- Sistema de retry
- Callbacks de progresso
- Métodos:
  - `addToQueue(items)`: Adiciona à fila
  - `start()`: Inicia downloads
  - `pause()` / `resume()`: Controle de fluxo
  - `stop()`: Cancela downloads

#### 5. **UI** (`src/ui/ui.js`)
Interface do usuário:
- `UIController`: Gerencia componentes visuais
- Métodos:
  - `inject()`: Injeta UI na página
  - `setStatus(msg, type)`: Atualiza status
  - `addResult(html)`: Adiciona resultado
  - `getSelectedTypes()`: Obtém tipos selecionados

## 📋 Padrão de Nomenclatura

Os arquivos são nomeados seguindo o padrão:

```
AulaXX_[VYY_]Tipo.extensão
```

**Onde:**
- `XX` = Número da aula (00-99), zero-padded
- `VYY` = Número do vídeo (01-99), zero-padded [OPCIONAL]
- `Tipo` = {Original, Grifado, Resumo, Slides, Mapa}
- `extensão` = {.pdf, .mp4, .mp3}

**Exemplos:**
```
Aula00_LivroEletronico_Original.pdf
Aula00_LivroEletronico_Grifado.pdf
Aula00_V01_Resumo.pdf
Aula00_V01_Slides.pdf
Aula01_V01_MapaMental.pdf
```

## ⚙️ Configuração

Edite `src/core/config.js` para personalizar:

```javascript
export const CONFIG = {
    DEBUG: true,                      // Habilita logs
    DELAY_BETWEEN_FETCHES: 300,       // ms entre buscas
    DELAY_BETWEEN_DOWNLOADS: 500,     // ms entre downloads
    MAX_CONCURRENT_DOWNLOADS: 3,      // downloads paralelos
    DOWNLOAD_TIMEOUT: 30000,          // timeout (ms)
    // ... mais opções
};
```

## 🔧 Desenvolvimento

### Estrutura de Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/yourusername/estrategia-downloader
cd estrategia-downloader

# Instalar dependências (quando disponível)
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Adicionando Novos Recursos

1. **Criar módulo** em `src/core/` ou `src/ui/`
2. **Exportar** funções/classes necessárias
3. **Importar** em `dist/index.html` ou outros módulos
4. **Documentar** no código com JSDoc
5. **Testar** manualmente
6. **Atualizar** PRD.md se necessário

### Exemplo: Adicionar novo tipo de arquivo

```javascript
// 1. Adicionar em config.js
FILE_PATTERNS: {
    // ... existentes
    questoes: 'Questoes.pdf'  // novo tipo
}

// 2. Atualizar scanner.js
if (href.includes('questoes')) {
    type = 'questoes';
}

// 3. Adicionar checkbox na UI
<input type="checkbox" id="edl-questoes" checked>
📝 Questões
```

## 🐛 Troubleshooting

### Problema: "CORS error" ou "blocked by client"

**Solução:** Use a versão HTML standalone e certifique-se de estar logado na plataforma Estratégia em outra aba.

### Problema: Downloads não iniciam

**Solução:**
1. Verifique se o navegador não está bloqueando pop-ups
2. Tente reduzir `MAX_CONCURRENT_DOWNLOADS` para 1
3. Verifique o console (F12) para erros

### Problema: "Course ID não encontrado"

**Solução:** Verifique se o ID está correto na URL:
```
https://www.estrategiaconcursos.com.br/app/dashboard/cursos/358349/aulas
                                                            ^^^^^^
                                                         Este é o ID
```

## 📊 Roadmap

### v2.1 (Próxima versão)
- [ ] Build system com Webpack/Rollup
- [ ] Versão Tampermonkey funcional
- [ ] Testes unitários
- [ ] CI/CD com GitHub Actions

### v2.5 (Futuro)
- [ ] Suporte a vídeos/áudios
- [ ] Download de múltiplos cursos
- [ ] Sistema de notificações
- [ ] Organização automática em pastas

### v3.0 (Longo prazo)
- [ ] Sincronização com Google Drive
- [ ] Dashboard de histórico
- [ ] Agendamento automático
- [ ] Detecção de novos materiais

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a [MIT License](LICENSE).

## ⚠️ Disclaimer

Esta ferramenta é destinada apenas para uso pessoal e backup de materiais aos quais você já tem acesso legítimo através de sua assinatura na plataforma Estratégia Concursos.

**NÃO use** para:
- Distribuir materiais protegidos por direitos autorais
- Compartilhar com terceiros
- Violação de termos de serviço

## 📞 Suporte

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/estrategia-downloader/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/yourusername/estrategia-downloader/discussions)

---

**Desenvolvido com ❤️ por [Seu Nome]**

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
