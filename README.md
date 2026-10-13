# Barbearia Dom Rocha — Documentação Técnica do Sistema

Aplicação web estática de alta conversão estruturada como **Progressive Web App (PWA)**, desenvolvida sob a filosofia **Vanilla First / Zero-Build** (sem bundlers, transpiladores ou dependências npm em runtime). O sistema gerencia catálogo, agendamento de horários em grade contextual e despacho transacional formatado diretamente para a API de mensageria do WhatsApp (`wa.me`).

---

## 1. Visão Geral do Sistema

- **Arquitetura de Execução:** Frontend estático desacoplado em **ES Modules (ESM)** nativos carregados via `<script type="module">`.
- **Estratégia de Build:** Zero-Build. Executável nativamente em servidores HTTP estáticos (Nginx, Vercel, Netlify, GitHub Pages) ou via protocolo local (`file:///`) com tolerância de runtime para testes de interface.
- **Isolamento de Responsabilidades:** Separação estrita entre camada de configuração/dados de negócio, motor reativo de estado, motor de cálculo temporal/calendário, camada de validação de formulário e adaptador de integração WhatsApp.

---

## 2. Mapa de Arquitetura do Repositório

```text
LandingPage-Barbearia/
├── assets/
│   ├── css/
│   │   └── style.css            # Folha de estilos: Design Tokens, Grid, Bottom Sheet e acessibilidade
│   ├── js/
│   │   ├── config.js            # Contrato de dados: CONFIG, MENU, ALL e formatadores utilitários
│   │   ├── store.js             # State Store reativo: cart, order, modal, totais e persistência
│   │   ├── calendar.js          # Motor temporal: statusLoja, slotsDoDia, calendário iOS e escassez
│   │   ├── checkout.js          # Validação assistida: scroll suave, shake tátil e máscara telefônica
│   │   ├── whatsapp.js          # Adaptador WhatsApp: sanitização regex e montagem da URL wa.me
│   │   └── app.js               # Orquestrador: inicialização, binding de eventos e ciclo de vida
│   └── img/
│       ├── icons/               # Assets de ícones PWA e favicons multi-resolução
│       ├── services/            # Catálogo visual de cortes e tratamentos em formato WebP
│       ├── hero.webp            # Ativo crítico LCP pré-carregado no cabeçalho
│       └── og.jpg               # Metadata visual OpenGraph / Twitter Cards
├── docs/
│   ├── DIRETRIZES-DEV.md        # Princípios de engenharia, contratos de dados e regras estritas
│   └── GUIA-PROJETO.md          # Referência técnica de tokens, variáveis de negócio e breakpoints
├── index.html                   # Casca semântica, meta tags SEO, JSON-LD Schema.org e viewport
├── manifest.json                # Manifesto PWA com identificadores de aplicação e theme-color
├── sw.js                        # Service Worker de cache shell offline (versão dom-rocha-v5)
└── README.md                    # Este documento técnico
```

### Papel Técnico de Cada Módulo JavaScript (`assets/js/`)

| Módulo | Responsabilidade Técnica |
| :--- | :--- |
| **`config.js`** | Contrato de dados de negócio. Exporta `CONFIG` (parâmetros da barbearia), `MENU` (matriz de serviços e metadados), mapa indexado em O(1) `ALL`, tabela `EMOJI` e utilitários puros `brl()` e `durLabel()`. |
| **`store.js`** | Gerenciador central de estado (Single Source of Truth). Implementa padrão Observer via `onCartChange()` / `notifyCartChange()`. Controla mutações do carrinho, cálculo de totais/descontos e persistência em `localStorage`. |
| **`calendar.js`** | Motor de validação de expediente e paginação de calendário estilo Apple HIG. Controla janela de dias permitidos (`CONFIG.diasFrente`), calcula slots expirados por hora/minuto e computa gatilhos de escassez em tempo real. |
| **`checkout.js`** | Camada de validação de integridade do agendamento. Aplica máscara dinâmica de entrada telefônica no padrão brasileiro, executa scroll assistido para o campo faltante e aplica feedback visual de erro com animação de *shake*. |
| **`whatsapp.js`** | Adaptador de saída para `wa.me/`. Realiza higienização numérica do destinatário (`replace(/\D/g, '')`) e constrói a mensagem formatada em texto puro, com sanitização estrita para exclusão de emojis (prevenção de encoding no Windows Desktop). |
| **`app.js`** | Ponto de entrada e orquestrador de interface. Monta o DOM dinâmico do catálogo, gerencia o ciclo de vida dos Sheets/Modais, registra ouvintes de teclado (`Escape`), instala PWA e vincula bindings globais em `window` para compatibilidade com templates HTML. |

---

## 3. Stack Tecnológico e Padrões de Engenharia

- **HTML5 Semântico:**
  - Marcação de dados estruturados **Schema.org** em formato `JSON-LD` sob o tipo `@type: "Barbershop"` com geolocalização (`GeoCoordinates`), avaliações agregadas (`AggregateRating`), horário de expediente semanal e catálogo de serviços (`Offer`).
  - Imagens com atributos intrínsecos `width` e `height` inline para mitigação de **Cumulative Layout Shift (CLS)**.
  - Imagem Hero com `loading="eager"` e `fetchpriority="high"` para otimização de **Largest Contentful Paint (LCP)**.
- **CSS3 Moderno:**
  - Design Tokens centralizados no seletor `:root` (paleta dark vintage, superfícies, raios de borda e elevação).
  - Escala tipográfica e espaçamentos fluidos calculados via função CSS `clamp()`.
  - Otimização de renderização abaixo da dobra utilizando a propriedade `content-visibility: auto` com `contain-intrinsic-size`.
- **Vanilla ES Modules (JavaScript ESM):**
  - Isolamento de escopo por módulo nativo do navegador, sem dependência de bundlers.
  - Exposição de interface controlada para atributos de evento dinâmicos via `Object.assign(window, {...})`.

---

## 4. Progressive Web App (PWA) e Estratégia de Cache

O ciclo de vida do Service Worker é controlado pelo arquivo [`sw.js`](./sw.js):

- **Identificador de Cache Ativo:** `dom-rocha-v5`.
- **Estratégia de Cache:** **Cache-First com Network Fallback**. 
  - Requisições `GET` interceptadas tentam responder imediatamente a partir do cache local.
  - Em caso de miss, a requisição é direcionada à rede e a resposta clonada é salva no cache.
  - Em caso de falha de rede total (offline), o fallback direciona para `./index.html`.
- **Ativos Pré-Cacheados no Evento `install`:**
  - Shell HTML e Manifesto: `./`, `./index.html`, `./manifest.json`
  - Folha de Estilos: `./assets/css/style.css`
  - Grafo Completo de Módulos JavaScript: `./assets/js/app.js`, `./assets/js/config.js`, `./assets/js/store.js`, `./assets/js/calendar.js`, `./assets/js/checkout.js`, `./assets/js/whatsapp.js`
  - Ativos Visuais Essenciais: `./assets/img/hero.webp`, ícones PWA 192px e 512px.
- **Purga de Versões Anteriores:** O evento `activate` executa varredura de chaves no `caches.keys()`, deletando quaisquer instâncias que divirjam do identificador da versão corrente (`CACHE !== "dom-rocha-v5"`).
