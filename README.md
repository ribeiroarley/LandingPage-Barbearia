# Barbearia Dom Rocha — Landing Page & Agendamento Online

Landing page de alta conversão para barbearias clássicas e modernas, combinando a agilidade visual de um catálogo interativo estilo iFood com a praticidade do agendamento direto pelo WhatsApp — sem necessidade de aplicativo, sem mensalidades e sem intermediários.

---

## 💈 Destaques da Aplicação

- **Agendamento Rápido via WhatsApp:** O cliente monta a sacola com os serviços desejados, escolhe dia, horário e profissional, e envia a solicitação formatada para o WhatsApp do estabelecimento com um único clique.
- **Calendário Mensal Estilo iOS (Apple HIG):**
  - Navegação entre meses com bloqueio de datas passadas e dias sem expediente (ex: segundas e domingos).
  - Identificação de dias cheios/expirados e seleção contextual de horários em tempo real.
  - Preservação total do estado dos dados preenchidos durante a troca de mês.
- **Experiência Multi-Dispositivo (320px até 4K):**
  - **Mobile:** Grade vertical em 1 coluna e barra de categorias com scroll horizontal touch suave.
  - **Tablet (641px - 1024px):** Layout balanceado em 2 colunas e modal flutuante centralizado.
  - **Desktop (≥ 1025px):** Grid expansivo com container fluido de até 1140px, pílulas de categorias centralizadas e visual sofisticado.
- **Zero Build & 100% Vanilla:**
  - Desenvolvido puramente em HTML5 semântico, CSS3 moderno (`clamp()`, CSS Grid, Flexbox) e JavaScript ES6+.
  - Sem necessidade de Node.js, Webpack, Vite ou dependências externas no cliente final.
- **PWA Ready (Progressive Web App):**
  - Service Worker com suporte a navegação offline (`sw.js`).
  - Instalação na tela inicial do celular com 1 toque.
  - Compatibilidade nativa com protocolo `file:///`: execução por duplo clique sem disparar erros de CORS no console do navegador.
- **Otimizações para Core Web Vitals & SEO Local:**
  - LCP otimizado com formato WebP e atributo `fetchpriority="high"` no Hero.
  - Imagens de serviços com `loading="lazy"` e `decoding="async"`.
  - Atributos `alt` descritivos e semânticos para máxima acessibilidade (A11y).
  - `content-visibility: auto` para carregamento acelerado abaixo da dobra.
  - Marcação estruturada Schema.org / JSON-LD (`Barbershop`) e metatags OpenGraph completas.

---

## 📁 Estrutura de Diretórios

```text
LandingPage-Barbearia/
├── assets/
│   ├── css/
│   │   └── style.css            # Folha de estilos responsiva, temas e animações
│   ├── js/
│   │   └── app.js              # Lógica de catálogo, carrinho, calendário e WhatsApp
│   └── img/
│       ├── icons/              # Favicons, apple-touch-icon e ícones PWA
│       ├── services/           # Imagens dos serviços do catálogo (.webp)
│       ├── hero.webp           # Imagem principal do cabeçalho
│       └── og.jpg              # Imagem para preview em redes sociais e WhatsApp
├── docs/
│   ├── DIRETRIZES-DEV.md       # Instruções técnicas e contextuais para desenvolvedores e IA
│   └── GUIA-PROJETO.md         # Guia passo a passo de customização e regras comerciais
├── index.html                  # Estrutura principal, metatags de SEO e contêineres
├── manifest.json               # Manifesto PWA com metadados do app
├── sw.js                       # Service Worker com estratégia de cache offline
└── README.md                   # Documentação geral do repositório
```

---

## 🚀 Como Executar Localmente

### Opção 1: Duplo Clique Direto (`file:///`)
Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari). A aplicação possui blindagem contra erros de CORS, executando perfeitamente sem necessidade de servidor local.

### Opção 2: Servidor Local HTTP Simples
Se desejar testar a instalação PWA completa e o Service Worker:

- **Python:**
  ```bash
  python -m http.server 3000
  ```
  Acesse `http://localhost:3000`.

- **VS Code:**
  Utilize a extensão **Live Server** clicando com o botão direito no `index.html` > *Open with Live Server*.

- **Node.js (npx):**
  ```bash
  npx serve .
  ```

---

## 🌐 Publicação e Deploy

Por ser 100% estático, o projeto pode ser publicado gratuitamente em segundos:

1. **Vercel:**
   - Conecte o repositório ou use o comando `npx vercel` na raiz do projeto.
2. **Netlify Drop:**
   - Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta do projeto.
3. **GitHub Pages:**
   - No repositório no GitHub, vá em **Settings** > **Pages** e habilite a publicação a partir do branch `main` na raiz (`/`).

---

## ⚙️ Customização Rápida

Para alterar número do WhatsApp, endereço ou itens do menu:
1. Abra [`assets/js/app.js`](assets/js/app.js).
2. Atualize o objeto `CONFIG` com seu número (`55` + DDD + número) e horários.
3. Altere serviços e preços na constante `MENU`.
4. Atualize o telefone e endereço no bloco `<script type="application/ld+json">` em [`index.html`](index.html).

Consulte [`docs/GUIA-PROJETO.md`](docs/GUIA-PROJETO.md) e [`docs/DIRETRIZES-DEV.md`](docs/DIRETRIZES-DEV.md) para detalhes avançados.
