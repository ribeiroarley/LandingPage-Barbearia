# GUIA DO PROJETO — Barbearia Dom Rocha

Este repositório contém uma **landing page de alta conversão e agendamento online** para barbearia com experiência estilo iFood e agendamento direto pelo WhatsApp — sem aplicativo para baixar, sem mensalidades e sem intermediários.

O cliente acessa o site, seleciona os serviços, escolhe o dia no calendário estilo iOS, define o horário disponível, seleciona o profissional e envia a solicitação pronta para o WhatsApp do estabelecimento.

---

## Como Personalizar em 3 Passos

1. **Defina as Informações do Estabelecimento:**
   - Configure o número do WhatsApp, nome, endereço e horários no arquivo `assets/js/app.js` (objeto `CONFIG`).
   - Atualize os dados estruturados (Schema.org / JSON-LD) no `index.html`.
2. **Personalize o Catálogo e Preços:**
   - Ajuste as categorias, serviços, durações e preços no array `MENU` em `assets/js/app.js`.
   - Coloque as imagens dos serviços em `assets/img/services/` em formato `.webp`.
3. **Publique:**
   - Faça o deploy estático instantâneo no [Vercel](https://vercel.com), [Netlify Drop](https://app.netlify.com/drop) ou [GitHub Pages](https://pages.github.com).

---

## Onde Encontrar as Configurações

- **WhatsApp (`SEU_WHATSAPP`):**
  - No `assets/js/app.js`: constante `CONFIG.whatsapp` (formato: `55` + DDD + número, ex: `5511999998888`).
  - No `index.html`: campo `telephone` do script `application/ld+json`.
- **Serviços, Preços e Descrições:**
  - Dentro de `assets/js/app.js` no array `MENU`.
- **Imagens e Assets:**
  - Fotos dos serviços: `assets/img/services/` (`.webp`).
  - Banner principal: `assets/img/hero.webp`.
  - Imagem OpenGraph / Preview de redes sociais: `assets/img/og.jpg`.
  - Favicons e ícones PWA: `assets/img/icons/`.
- **Estilos e Cores:**
  - Variáveis de cores em `:root` no início do `assets/css/style.css`.
- **Domínio e SEO:**
  - Atualize `https://SEU-DOMINIO.com.br/` no `canonical` e nas tags `og:` do `index.html`.
- **Configurações PWA:**
  - `manifest.json`: ajuste `name`, `short_name` e `theme_color`.

---

## Regras de Ouro de Desenvolvimento

1. **Lógica de Agendamento e Carrinho:**
   - Não altere a lógica de cálculo de totais nem a composição da mensagem do WhatsApp (`buildMsg`) sem testes prévios.
2. **Compatibilidade do WhatsApp:**
   - **Nunca insira emojis dentro da mensagem gerada para o WhatsApp** (parâmetro `text` do `wa.me`). Emojis decodificados causam corrupção de caracteres ("") no WhatsApp Desktop do Windows. Utilize apenas texto puro, formatação com asteriscos `*negrito*` e quebras de linha `\n`.
3. **Execução Local:**
   - A aplicação é 100% tolerante à abertura por duplo clique (`file:///`). Chamadas a Service Worker e manifest são condicionadas aos protocolos `http:` e `https:`.

---

## Dica Comercial e Conversão

A aplicação conta com recurso de **Cross-sell / Sugestão de adicionais** no checkout (ex: "Leve junto Pomada Modeladora"), aumentando o ticket médio de cada atendimento sem esforço operacional adicional.
