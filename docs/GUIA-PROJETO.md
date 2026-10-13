# CONFIGURAÇÃO E MANUTENÇÃO TÉCNICA DO PROJETO

> **Manual Técnico de Operação e Parametrização Interna.**  
> Referência para customização de variáveis de negócio, tokens CSS e chaves de armazenamento local.

---

## 1. Referência de Configuração de Negócio (`assets/js/config.js`)

Todas as variáveis com impacto direto na lógica de cálculo e exibição estão centralizadas no módulo [`assets/js/config.js`](../assets/js/config.js).

### 1.1. Identificação e Contato
- `CONFIG.nome` (string): Identificador textual exibido na marca, título e mensagens transacionais.
- `CONFIG.whatsapp` (string): Sequência numérica de destino contendo código do país (55) + DDD (2 dígitos) + número (8 ou 9 dígitos). Deve conter apenas números ou string limpa (a camada `whatsapp.js` remove pontuação automaticamente via regex).
- `CONFIG.endereco` (string): Endereço físico injetado dinamicamente no elemento `#footAddr`.
- `CONFIG.maps` (string): URL completa direcionada para o ponto exato no Google Maps com parâmetros de busca (`?q=...`).

### 1.2. Regras de Expediente e Janela de Agendamento
- `CONFIG.horario.dias` (number[]): Lista de números inteiros correspondentes aos dias com expediente ativo (`0` = Domingo, `1` = Segunda, `2` = Terça, `3` = Quarta, `4` = Quinta, `5` = Sexta, `6` = Sábado). Dias ausentes desta lista são bloqueados compulsoriamente no calendário com classe `.disabled`.
- `CONFIG.horario.abre` (string): Horário inicial do primeiro slot de atendimento ("HH:MM").
- `CONFIG.horario.fecha` (string): Horário final de encerramento do expediente ("HH:MM").
- `CONFIG.horario.slot` (number): Duração de cada bloco de agendamento em minutos (padrão: `30`).
- `CONFIG.diasFrente` (number): Limite máximo de avanço no calendário em dias corridos a partir da data atual (padrão: `14`). O módulo `calendar.js` utiliza esse valor para desabilitar a navegação de meses subsequentes e bloquear datas que ultrapassem o limite.

### 1.3. Profissionais e Cupons
- `CONFIG.profissionais` (string[]): Relação de barbeiros. A primeira entrada deve ser `"Sem preferência"` para não gerar fricção na escolha do usuário.
- `CONFIG.cupons` (object): Dicionário indexado por código em caixa alta:
  - `tipo: "percent"` calcula desconto percentual sobre o subtotal.
  - `tipo: "fixed"` deduz valor fixo em BRL.

---

## 2. Chaves de Persistência Local (`localStorage`)

O módulo [`assets/js/store.js`](../assets/js/store.js) manipula as seguintes chaves de armazenamento no navegador do cliente:

| Chave | Tipo de Dado | Finalidade Técnica |
| :--- | :--- | :--- |
| `dr_cart` | `JSON string` | Serialização das linhas atuais do carrinho para recuperação de sessão em recargas de página. |
| `dr_nome` | `string` | Nome do cliente persistido para auto-preenchimento nos próximos agendamentos. |
| `dr_tel` | `string` | Telefone com máscara `(XX) XXXXX-XXXX` persistido para auto-preenchimento. |
| `dr_last` | `JSON string` | Snapshot completo do último agendamento finalizado (`{ cart, order }`) utilizado pelo botão de retenção `repeatLast()`. |

---

## 3. Referência de Tokens de Estilo (`assets/css/style.css`)

A identidade visual é controlada por Design Tokens declarados no escopo `:root` em [`assets/css/style.css`](../assets/css/style.css).

### 3.1. Paleta de Cores (Dark Vintage)
```css
:root {
  /* Superfícies e Fundos */
  --bg: #16130F;          /* Fundo principal da página com gradiente radial sutil */
  --card: #211C15;        /* Superfície primária de cards, sheets e containers */
  --card2: #2A2318;       /* Superfície secundária para inputs, slots e botões internos */

  /* Cores de Acento (Couro & Ouro Envelhecido) */
  --amber: #C79A5B;       /* Acento dourado para títulos, seleções e estados ativos */
  --amber-deep: #a97e42;  /* Acento dourado escuro para estados de foco/hover */

  /* Cores de Ação e Conversão */
  --red: #9B2D20;         /* Vermelho clássico para botões de adicionar e sacola flutuante */
  --red-deep: #7c2319;    /* Hover de ação primária */
  --green: #25D366;       /* Verde oficial WhatsApp e status de loja aberta */

  /* Tipografia e Linhas Divisórias */
  --ink: #F1E7D8;         /* Texto de alto contraste sobre fundo escuro */
  --ink-soft: #b3a284;    /* Texto secundário e legendas com menor contraste */
  --line: #39301f;        /* Delimitador de bordas e divisores estruturais */

  /* Elevação e Métricas */
  --shadow: 0 10px 30px rgba(0,0,0,.45); /* Sombra padrão de elevação de cards */
  --radius: 16px;                         /* Raio de curvatura base da aplicação */
}
```

### 3.2. Breakpoints e Regras Responsivas de Layout

| Dispositivo / Viewport | Breakpoint CSS | Comportamento Estrutural |
| :--- | :--- | :--- |
| **Mobile Compacto** | `< 380px` | A grade de slots (`.slot-grid`) reduz de 4 para 3 colunas. O calendário adapta alvos de dia para 36px. |
| **Mobile Padrão** | `≤ 640px` | Grade de catálogo em coluna única (`grid-template-columns: 1fr`). Modais operam como **Bottom Sheet** (`align-self: flex-end; border-radius: 20px 20px 0 0`). |
| **Tablet** | `641px - 1024px` | Catálogo em 2 colunas (`repeat(2, 1fr)`). Modais operam centralizados na viewport com escala (`scale(0.96) → scale(1)`). |
| **Desktop / Wide** | `≥ 1025px` | Grade auto-fill fluida (`repeat(auto-fill, minmax(340px, 1fr))`). Barra de categorias com pílulas centralizadas sem scroll horizontal. |

### 3.3. Funções Fluidas (`clamp()`)
- **Container Master:** `padding: 0 clamp(16px, 4vw, 32px)` com largura máxima estrita de `1140px`.
- **Títulos de Seção (`.sec-h h2`):** `font-size: clamp(24px, 2.4vw, 28px)`.
- **Tipografia Textual (`.sobre p`):** `font-size: clamp(0.95rem, 1.1vw, 1.05rem)`.
