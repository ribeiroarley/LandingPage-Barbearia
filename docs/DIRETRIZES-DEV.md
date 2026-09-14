# DIRETRIZES DE DESENVOLVIMENTO E IA

> Utilize este documento como instrução e contexto de desenvolvimento para modelos de IA (Claude, ChatGPT, etc.) ou novos desenvolvedores na manutenção do projeto.

---

Você é um engenheiro de software especialista em front-end de alta performance e UX de conversão. Este repositório contém uma **Landing Page e Sistema de Agendamento Online para Barbearia**, estruturado de forma desacoplada com Vanilla JS, CSS3 moderno e HTML5 semântico.

### Arquitetura do Projeto
- `index.html`: Estrutura semântica, metatags de SEO local, OpenGraph, JSON-LD (Schema.org) e containers principais.
- `assets/css/style.css`: Estilização modular com CSS Grid, Flexbox, tipografia fluida com `clamp()`, calendário estilo iOS e regras responsivas para mobile (<640px), tablet (641-1024px) e desktop (>1024px).
- `assets/js/app.js`: Objeto `CONFIG` com parâmetros de negócio, catálogo de serviços `MENU`, lógica do carrinho, calendário mensal estilo iOS, horários de expediente e geração do link WhatsApp (`wa.me`).
- `assets/img/services/`: Fotos dos serviços em formato `.webp`.
- `assets/img/icons/`: Favicons e ícones PWA.
- `manifest.json` & `sw.js`: Suporte a Progressive Web App (PWA) e cache offline.

---

### Procedimento para Personalização por IA

Antes de alterar o código, solicite ao usuário as seguintes definições se ainda não informadas:
1. Nome da barbearia e slogan institucional.
2. Número de WhatsApp com DDD para recebimento de agendamentos.
3. Endereço completo e horários de funcionamento (dias abertos e faixa de horas).
4. Lista de serviços, categorias, durações estimadas (minutos) e valores em reais (R$).
5. Profissionais/Barbeiros disponíveis e formas de pagamento aceitas no local.
6. Cores institucionais (ou manter as variáveis padrão em `--amber`, `--bg`, `--card`).

---

### Diretrizes Estritas de Implementação

1. **Mensagem do WhatsApp (`buildMsg` em `assets/js/app.js`):**
   - **NÃO utilize emojis na string de mensagem enviada ao WhatsApp** (`wa.me/?text=...`). Emojis causam quebra e exibição de caracteres ilegíveis ("") no WhatsApp Desktop para Windows. Utilize caracteres alfanuméricos normais, hífens, pontuações e delimitadores de formatação `*` e `_`.
2. **Cálculo de Preço e Descontos:**
   - Preserve a integridade das funções de totalização, cupom de desconto e validação de campos obrigatórios (`fNome`, `fTel`).
3. **Compatibilidade com `file:///`:**
   - Mantenha a guarda condicional para o registro de Service Worker e injeção de `manifest.json`, permitindo testes locais diretos por duplo clique sem warnings de CORS no console.
4. **Performance e Acessibilidade:**
   - Todos os serviços no `MENU` devem conter o atributo `alt` descritivo.
   - Imagens devem usar `loading="lazy"` e `decoding="async"`, exceto a imagem principal LCP (`assets/img/hero.webp`), que usa `loading="eager"` e `fetchpriority="high"`.
