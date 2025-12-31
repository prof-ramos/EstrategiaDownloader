# PRD — Product Requirements Document
**Estratégia Downloader**
Ferramenta de Download Automatizado de Cursos Online

---

## 1. Visão Geral do Produto

### 1.1 Problema
Alunos da plataforma Estratégia Concursos enfrentam dificuldades para fazer backup ou downloads organizados de todos os materiais de um curso (livros, PDFs de vídeos, mapas mentais, slides). Atualmente, é necessário:

- Navegar manualmente por cada aula
- Clicar individualmente em cada botão de download
- Organizar manualmente os arquivos baixados
- Repetir o processo para cada disciplina do curso

**Impacto**: Perda de tempo (horas), desorganização, risco de perder material se a assinatura expirar.

### 1.2 Solução
Uma ferramenta web-based que permite fazer download de todos os materiais de um curso em uma única ação, com:

✅ Interface intuitiva
✅ Seleção customizável de tipos de arquivo
✅ Nomes organizados automaticamente
✅ Downloads paralelos (sem travar o navegador)

### 1.3 Público-Alvo

- **Primário**: Alunos de cursos do Estratégia Concursos que desejam fazer backup
- **Secundário**: Candidatos em preparação para concursos públicos
- **Terciário**: Alunos que estudam offline ou com internet limitada

---

## 2. Objetivos e Sucesso

### 2.1 Objetivos Principais

1. Automatizar o processo de descoberta e download de materiais
2. Organizar arquivos com nomenclatura clara (`Aula00_V01_Resumo.pdf`)
3. Economizar tempo do usuário (de horas para minutos)
4. Garantir compatibilidade com todos os cursos da plataforma Estratégia

### 2.2 Métricas de Sucesso

- **Tempo para download completo**: < 2 minutos (para curso de 4 aulas)
- **Taxa de sucesso**: > 95% dos arquivos baixados corretamente
- **Satisfação de usuário**: feedback positivo em comunidades
- **Escalabilidade**: funciona para cursos com até 50+ aulas

---

## 3. Requisitos Funcionais

### 3.1 Funcionalidades MVP (Mínimo Viável)

#### RF-001: Listar Materiais de um Curso
**Descrição**: O sistema deve escanear todas as aulas de um curso e listar os materiais disponíveis.

**Fluxo**:
1. Usuário insere o ID do curso ou acessa via URL
2. Sistema acessa a página de listagem de aulas
3. Extrai IDs de todas as aulas
4. Para cada aula, faz parsing do HTML para encontrar:
   - Links de livros eletrônicos (original + grifado)
   - Links de downloads de vídeos (resumo, slides, mapa mental)
5. Exibe um relatório com total de itens encontrados

- **Input**: ID do Curso (ex: `358349`)
- **Output**: Lista de 50-200 itens estruturados
- **Tempo estimado**: 30-60 segundos

#### RF-002: Filtrar Materiais por Tipo
**Descrição**: Usuário pode escolher quais tipos de arquivo baixar.

**Tipos suportados**:
- ☑ Livros Eletrônicos (original)
- ☑ Livros Eletrônicos (marcação/grifado)
- ☑ Resumos (PDF)
- ☑ Slides (PDF)
- ☑ Mapas Mentais (PDF)

**Comportamento**:
- Checkboxes aparecem ANTES de iniciar downloads
- Estados persistem durante a sessão
- Padrão: todos selecionados

#### RF-003: Fazer Download Automático
**Descrição**: Sistema baixa os arquivos selecionados de forma organizada.

**Comportamento**:
- Downloads com nomes padronizados: `AulaXX_VYY_Tipo.pdf`
- Máximo 3 downloads paralelos (evita throttling)
- Delay de 500ms entre downloads
- Barra de progresso em tempo real (X/Y baixados)
- Pasta de destino: Downloads padrão do navegador

**Exemplo de nomes**:
```
Aula00_Original.pdf
Aula00_Grifado.pdf
Aula00_V01_Resumo.pdf
Aula00_V01_Slides.pdf
Aula00_V01_Mapa.pdf
Aula01_Original.pdf
Aula01_V01_Resumo.pdf
...
```

#### RF-004: Tratamento de Erros
**Descrição**: Sistema detecta e relata problemas durante a operação.

**Cenários**:
- **Erro 401/403**: Acesso negado (sessão expirada)
  - Ação: Informar ao usuário para fazer login novamente
- **Erro 404**: Link expirado ou removido
  - Ação: Pular arquivo e continuar
- **Timeout**: Requisição > 30 segundos
  - Ação: Retentar até 2 vezes
- **Conexão perdida**: Sem internet
  - Ação: Pausar e permitir resumir

### 3.2 Funcionalidades Fase 2

#### RF-005: Varrer Múltiplos Cursos
**Descrição**: Download automático de TODOS os cursos de um candidato de uma vez.

- **Entrada**: URL da página "Meus Cursos"
- **Processo**:
  1. Extrair IDs de todos os cursos listados
  2. Executar RF-001 para cada curso em sequência
  3. Organizar em pastas por matéria

#### RF-006: Suporte a Vídeos/Áudios
**Descrição**: Detectar e baixar vídeos e áudios quando disponíveis (via Network inspection).

- **Padrão**: URLs de vídeo em CDN (`cdn.estrategiaconcursos.com.br`)
- **Qualidade**: 720p (configurável para 1080p, 480p)

#### RF-007: Agendamento de Downloads
**Descrição**: Agendar downloads para rodarem automaticamente em horários específicos.

- **Exemplo**: Todos os dias às 2 da manhã, baixar novos materiais

### 3.3 Funcionalidades Fase 3

#### RF-008: Sincronização com Google Drive
**Descrição**: Fazer upload automático dos arquivos baixados para Google Drive.

#### RF-009: Notificações
**Descrição**: Alertas via email/Telegram quando downloads completam.

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance

- **Tempo de listagem** de aulas: < 60 segundos para 50 aulas
- **Tempo de download**: 500ms-1s por arquivo (depende da velocidade de internet)
- **Uso de RAM**: < 100MB durante operação
- **Compatibilidade**: Chrome, Firefox, Safari, Edge (últimas 2 versões)

### 4.2 Segurança

- **Autenticação**: Usa cookies de sessão existente (sem armazenar credenciais)
- **HTTPS only**: Todas as requisições via HTTPS
- **Sem servidores**: Execução 100% no navegador do usuário
- **CORS**: Respeita política CORS da Estratégia
- **Logs**: Sem coleta de dados pessoais

### 4.3 Confiabilidade

- **Disponibilidade**: 99.9% (não depende de servidor externo)
- **Recuperação de falhas**: Permitir resumir downloads interrompidos
- **Validação de integridade**: Verificar se arquivo foi completamente baixado

### 4.4 Escalabilidade

- **Capacidade**: Suportar cursos com até 100+ aulas
- **Paralelização**: Downloads simultâneos controlados
- **Throttling**: Respeitar limites de taxa da API Estratégia

---

## 5. Arquitetura Técnica

### 5.1 Stack Tecnológico

| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Frontend | HTML5 + CSS3 + Vanilla JS | Sem dependências, rápido, leve |
| Execução | Client-side (no navegador) | Sem servidor, sem custos |
| Dist. | 1. Tampermonkey (extensão)<br>2. HTML standalone | Múltiplas opções de acesso |
| APIs | Fetch API, DOM Parser | Padrão moderno |
| Storage | LocalStorage (opcional) | Persistência de configurações |

### 5.2 Componentes Principais

```
┌─────────────────────────────────────┐
│   Estratégia Downloader             │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────────┐ │
│  │  UI Component                  │ │
│  │  - Input: Course ID            │ │
│  │  - Checkboxes: Tipo de arquivo │ │
│  │  - Botões: Listar, Baixar      │ │
│  │  - Status: Progresso real-time │ │
│  └────────────────────────────────┘ │
│                 │                    │
│  ┌──────────────▼───────────────────┐ │
│  │  Scanner Engine                  │ │
│  │  - Fetch HTML de aulas           │ │
│  │  - Parse DOM (links)             │ │
│  │  - Validação de URLs             │ │
│  └──────────────┬───────────────────┘ │
│                 │                    │
│  ┌──────────────▼───────────────────┐ │
│  │  Download Manager                │ │
│  │  - Queue de downloads            │ │
│  │  - Controle de concorrência      │ │
│  │  - Retry logic                   │ │
│  │  - Nomeação de arquivos          │ │
│  └────────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 5.3 Fluxo de Dados

```
Entrada (Course ID)
        │
        ▼
┌─────────────────────┐
│ Fetch /aulas page   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Extract aula URLs   │  (4 aulas)
└──────────┬──────────┘
           │
           ├─► Fetch /aulas/3572496
           ├─► Fetch /aulas/3562250
           ├─► Fetch /aulas/3562251
           └─► Fetch /aulas/3562252
                      │
                      ▼
           ┌──────────────────────┐
           │ Parse cada aula      │
           │ - PDFs de livros     │
           │ - Links de vídeos    │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Array de 50-200 URLs │
           │ com metadata         │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ User filters (UI)    │
           │ Seleciona tipos      │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Download Manager     │
           │ (3 paralelos)        │
           └──────────┬───────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    [GET]        [GET]         [GET]
    (File 1)     (File 2)      (File 3)
         │            │            │
         └────────────┼────────────┘
                      ▼
           ┌──────────────────────┐
           │ Browser Downloads    │
           │ Pasta padrão         │
           └──────────────────────┘
```

---

## 6. Design & UX

### 6.1 Wireframe Principal

```
┌──────────────────────────────────────┐
│  📥 Estratégia Downloader v2.0       │
├──────────────────────────────────────┤
│                                      │
│  🔗 ID do Curso (extraído da URL)   │
│  ┌──────────────────────────────────┐│
│  │ 358349                           ││
│  └──────────────────────────────────┘│
│  Encontre na URL: /cursos/[ID]/aulas│
│                                      │
│  📋 O que deseja baixar?             │
│  ☑ 📚 Livros  ☑ 📄 Resumos         │
│  ☑ 🎨 Slides  ☑ 🗺️ Mapas           │
│                                      │
│  Status:                             │
│  ┌──────────────────────────────────┐│
│  │ ℹ️ Clique LISTAR para começar    ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────┬──────────────────┐ │
│  │ 🔍 LISTAR    │ ⬇️ BAIXAR       │ │
│  └──────────────┴──────────────────┘ │
│                                      │
│  Resultados:                         │
│  ┌──────────────────────────────────┐│
│  │ 📖 Encontradas 4 aulas           ││
│  │   📚 Livro Original              ││
│  │   📚 Livro Grifado              ││
│  │   📄 Resumo                      ││
│  │   🎨 Slides                      ││
│  │   🗺️ Mapa                        ││
│  │ 📖 Aula 01                       ││
│  │   ...                            ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

### 6.2 Estados da Interface

| Estado | Botões | Status | Descrição |
|--------|--------|--------|-----------|
| Inicial | LISTAR (enabled), BAIXAR (disabled) | ℹ️ Info | Aguardando ação |
| Escaneando | LISTAR (disabled), BAIXAR (disabled) | 🔄 Loading | Descobrindo materiais |
| Pronto | LISTAR (enabled), BAIXAR (enabled) | ✅ Success | Pronto para baixar |
| Baixando | LISTAR (disabled), BAIXAR (disabled) | 📥 Loading | Fazendo downloads |
| Concluído | LISTAR (enabled), BAIXAR (enabled) | ✅ Success | X itens baixados |
| Erro | LISTAR (enabled), BAIXAR (disabled) | ❌ Error | Mensagem de erro |

---

## 7. Padrões de Nomeação

### 7.1 Convenção de Nomes de Arquivos

**Padrão**: `AulaXX_[VYY_]Tipo.extensão`

Onde:
- `XX` = Número da aula (00-99), zero-padded
- `VYY` = Número do vídeo (01-99), zero-padded [OPCIONAL]
- `Tipo` = {Original, Grifado, Resumo, Slides, Mapa}
- `extensão` = {.pdf, .mp4, .mp3}

**Exemplos**:
```
✅ Aula00_Original.pdf
✅ Aula00_Grifado.pdf
✅ Aula00_V01_Resumo.pdf
✅ Aula00_V02_Slides.pdf
✅ Aula01_V01_Mapa.pdf
✅ Aula15_V08_Resumo.pdf
```

### 7.2 Estrutura de Pasta (Futuro)

```
Downloads/
├── Estratégia_Controle_Externo_358349/
│   ├── Aula00/
│   │   ├── Aula00_Original.pdf
│   │   ├── Aula00_Grifado.pdf
│   │   ├── Videos/
│   │   │   ├── V01_Resumo.pdf
│   │   │   ├── V02_Slides.pdf
│   │   │   └── V03_Mapa.pdf
│   ├── Aula01/
│   │   └── ...
```

---

## 8. Casos de Uso

### 8.1 UC-001: Download de Um Curso

**Ator**: Aluno
**Pré-condição**: Aluno autenticado e com acesso ao curso

1. Aluno acessa a ferramenta
2. Insere ID do curso (358349)
3. Seleciona tipos: Livros ✓, Resumos ✓, Slides ✓, Mapas ✓
4. Clica "LISTAR"
5. Sistema encontra 4 aulas com 47 itens
6. Aluno clica "BAIXAR"
7. Sistema baixa 47 arquivos em ~3 minutos
8. Todos aparecem em Downloads com nomes organizados

**Pós-condição**: 47 arquivos disponíveis localmente

### 8.2 UC-002: Download Seletivo

**Ator**: Aluno
**Pré-condição**: Aluno com espaço limitado em disco

1. Aluno insere ID do curso
2. Clica "LISTAR"
3. **Desseleciona** "Mapas" (para economizar espaço)
4. Clica "BAIXAR"
5. Sistema baixa apenas Livros, Resumos e Slides (~30 itens)

**Pós-condição**: ~30 arquivos baixados, poupando 15% de espaço

### 8.3 UC-003: Recuperação de Falha

**Ator**: Aluno
**Pré-condição**: Conexão instável

1. Aluno começa download
2. Internet cai no item 15 de 47
3. Sistema detecta erro e **pausa**
4. Aluno reconecta
5. Clica "BAIXAR" novamente
6. Sistema resume a partir do item 16

**Pós-condição**: Todos 47 itens baixados sem perder progresso

---

## 9. Matriz de Rastreabilidade

| Requisito | Tipo | Status | Prioridade | Fase |
|-----------|------|--------|------------|------|
| RF-001: Listar materiais | Funcional | ✅ Done | P0 | MVP |
| RF-002: Filtrar por tipo | Funcional | ✅ Done | P0 | MVP |
| RF-003: Download automático | Funcional | ✅ Done | P0 | MVP |
| RF-004: Tratamento de erros | Funcional | ✅ Done | P1 | MVP |
| RNF-001: Performance <60s | Não-func | ✅ Atend | P0 | MVP |
| RNF-002: Segurança HTTPS | Não-func | ✅ Atend | P0 | MVP |
| RF-005: Múltiplos cursos | Funcional | 🔄 In Progress | P2 | Fase 2 |
| RF-006: Vídeos/Áudios | Funcional | ⏳ Backlog | P2 | Fase 2 |
| RF-007: Agendamento | Funcional | ⏳ Backlog | P3 | Fase 3 |
| RF-008: Google Drive | Funcional | ⏳ Backlog | P3 | Fase 3 |

---

## 10. Riscos & Mitigação

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Estratégia muda estrutura HTML | Alto | Médio | Monitorar mudanças, documentar seletores |
| Links de download expiram | Médio | Alto | Incluir timestamp, validar antes de baixar |
| CORS blocking | Alto | Baixo | Usar Tampermonkey para bypassar |
| Taxa de requisições limitada | Médio | Médio | Implementar retry com backoff exponencial |
| Sessão expirada | Médio | Alto | Detectar 401/403 e informar ao usuário |
| Navegador bloqueia downloads | Baixo | Médio | Usar blob + anchor tag (compatível com todos) |

---

## 11. Plano de Lançamento

### 11.1 MVP (v1.0) — Q1 2025

- ✅ Listar materiais de um curso
- ✅ Downloads automáticos
- ✅ Interface HTML standalone
- ✅ Extensão Tampermonkey

### 11.2 Fase 2 (v1.5) — Q2 2025

- 🔄 Suporte a vídeos/áudios
- 🔄 Download de múltiplos cursos
- 🔄 Sistema de notificações

### 11.3 Fase 3 (v2.0) — Q3 2025

- ⏳ Sincronização Google Drive
- ⏳ Dashboard de histórico
- ⏳ Agendamento automático

---

## 12. Definição de Pronto

Uma funcionalidade é considerada "Pronta" quando:

- ✅ Código escrito e revisado
- ✅ Testes unitários com >80% coverage
- ✅ Testado em Chrome, Firefox e Safari
- ✅ Documentação atualizada
- ✅ Sem console errors/warnings
- ✅ Performance dentro dos limites
- ✅ Aprovado por ao menos 1 usuário beta

---

## 13. Métricas & KPIs

| Métrica | Alvo | Frequência | Responsável |
|---------|------|------------|-------------|
| Taxa de sucesso de downloads | >95% | Semanal | QA |
| Tempo médio de download | <3 min (47 itens) | Semanal | Dev |
| Uso de memória pico | <100MB | Semanal | Dev |
| Satisfação de usuário (NPS) | >50 | Mensal | PM |
| Bugs críticos / semana | <2 | Semanal | QA |
| Compatibilidade de navegadores | 100% | A cada release | QA |

---

## 14. Dependências & Integrações

### 14.1 Dependências

- ✅ Navegador moderno (Chrome/Firefox/Safari)
- ✅ Acesso à plataforma Estratégia Concursos
- ✅ Sessão autenticada (cookies)
- ✅ Conexão HTTPS

### 14.2 Integrações Futuras

- 🔄 Google Drive API (Fase 3)
- 🔄 Telegram Bot API (Fase 3)
- 🔄 Servidor de agendamento (Fase 3)

---

## 15. Glossário

| Termo | Definição |
|-------|-----------|
| Aula | Unidade de conteúdo dentro de um curso (ex: Aula 00, Aula 01) |
| Vídeo/Bloco | Material videoaula dentro de uma aula (ex: Vídeo 1, Vídeo 2) |
| Livro Eletrônico | PDF com conteúdo principal (original ou grifado) |
| Resumo | PDF com resumo do vídeo |
| Mapa Mental | PDF com diagrama visual dos conceitos |
| Slide | PDF com slides de apresentação |
| Course ID | Identificador único do curso na URL |
| RFC | Remote Fetch Credentials (uso de cookies de sessão) |

---

**Versão**: 1.0
**Data**: 31/12/2025
**Status**: Aprovado
