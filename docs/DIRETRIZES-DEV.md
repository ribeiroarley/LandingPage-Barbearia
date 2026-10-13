# DIRETRIZES DE ENGENHARIA E DESENVOLVIMENTO

> **Documento Interno de Referência Técnica.**  
> Destinado a engenheiros de software e agentes de IA na manutenção, extensão e refatoração do código da aplicação.

---

## 1. Princípios Fundamentais de Desenvolvimento

1. **Vanilla First & Zero External Dependencies:**
   - É terminantemente proibida a introdução de frameworks (React, Vue, Svelte), bibliotecas utilitárias (Lodash, jQuery, Axios) ou dependências de pacote npm para o cliente final.
   - Qualquer funcionalidade nova deve ser implementada com APIs nativas da plataforma web (ES Modules, DOM Level 3/4, Fetch, IntersectionObserver, Storage, MatchMedia).
2. **Zero-Build Architecture:**
   - O código-fonte presente em `assets/` é o código de execução direta. Não deve haver etapa intermediária de compilação, empacotamento ou transpilação.
   - O versionamento dos arquivos deve preservar a legibilidade, a clareza modular e a compatibilidade direta com os navegadores evergreen.
3. **Preservação de Performance Mobile:**
   - O First Contentful Paint (FCP) e o Largest Contentful Paint (LCP) devem permanecer abaixo de 1,2s em conexões móveis 4G.
   - Todo novo ativo de imagem deve utilizar formato WebP e conter atributos explícitos `width` e `height` inline na geração do DOM para assegurar CLS = 0.
   - A imagem principal do Hero (`assets/img/hero.webp`) deve obrigatoriamente manter `loading="eager"` e `fetchpriority="high"`.

---

## 2. Contrato de Dados (`assets/js/config.js`)

Toda a parametrização de negócio deve residir de forma desacoplada no módulo [`assets/js/config.js`](../assets/js/config.js).

### 2.1. Objeto `CONFIG`
```javascript
export const CONFIG = {
  nome: string,          // Nome fantasia da barbearia (exibido na UI e cabeçalho de mensagens)
  whatsapp: string,      // Telefone com DDI + DDD (somente dígitos numéricos, ex: "5511999998888")
  endereco: string,      // Endereço físico completo formatado
  maps: string,          // URI direta da rota no Google Maps
  horario: {
    dias: number[],      // Array com índices de dias de funcionamento (0 = Dom, 1 = Seg ... 6 = Sáb)
    abre: string,        // Horário de abertura no formato "HH:MM" (ex: "09:00")
    fecha: string,       // Horário de encerramento no formato "HH:MM" (ex: "20:00")
    slot: number         // Intervalo em minutos de cada slot de atendimento (ex: 30)
  },
  profissionais: string[], // Relação de profissionais disponíveis (deve incluir "Sem preferência")
  cupons: {
    [code: string]: {
      tipo: "percent" | "fixed", // Modalidade do desconto
      valor: number,             // Percentual ou valor monetário em BRL
      label: string              // Texto descritivo exibido no badge de confirmação
    }
  },
  diasFrente: number     // Janela máxima de agendamento em dias a partir da data atual (ex: 14)
};
```

### 2.2. Matriz `MENU`
Estrutura composta por categorias e serviços:
```javascript
export const MENU = [
  {
    cat: string,         // Título da categoria exibido nas seções e pílulas do menu
    key: string,         // Identificador slug da categoria (usado em IDs do DOM: "cat-" + key)
    sub: string,         // Subtítulo ou descritivo da categoria
    card: boolean,       // true: renderiza card completo com modal; false: card compacto
    items: [
      {
        id: string,      // Identificador único do serviço (kebab-case)
        n: string,       // Nome oficial do serviço
        d: string,       // Descrição dos procedimentos inclusos
        p: number,       // Valor em reais (ponto flutuante)
        dur: number,     // Duração estimada em minutos
        img?: string,    // Nome base do arquivo em assets/img/services/ (.webp implícito)
        alt?: string     // Texto alternativo semântico obrigatório para acessibilidade
      }
    ]
  }
];
```
> **Regra Obrigatória:** Todo novo serviço adicionado ao array `items` deve conter o atributo `alt` semântico descritivo quando possuir o campo `img`.

---

## 3. Fluxo de Agendamento, Estado e Integração WhatsApp

O fluxo transacional opera de forma estritamente unidirecional através dos módulos:

```text
[Interação do Usuário]
        │
        ▼
[store.js] ───────────────► Notifica Listeners (Observer Pattern)
        │                               │
        ▼                               ▼
[checkout.js] (Validação)        [app.js] (Atualização de UI / Badges)
        │
        ▼ (Se Válido)
[store.js] (saveLastBooking)
        │
        ▼
[whatsapp.js] ────────────► Gera URL sanitizada ──► window.open(wa.me/...)
```

### 3.1. Regras Estritas do Módulo `whatsapp.js`
1. **Incompatibilidade Crítica de Emojis:**
   - **É expressamente proibido injetar caracteres de emoji na mensagem gerada para o WhatsApp** (parâmetro `text` do `wa.me`).
   - *Justificativa Técnica:* O cliente nativo WhatsApp Desktop para Windows corrompe emojis codificados via URI component em versões de SO localizadas em pt-BR, exibindo caixas com pontos de interrogação ("").
   - *Formatação Permitida:* Utilize exclusivamente texto alfanumérico padrão, pontuações, quebras de linha `\n` e delimitadores nativos de markdown do WhatsApp (`*negrito*` e `_itálico_`).
2. **Higienização de Número de Telefone:**
   - O número da barbearia deve ser sanitizado compulsoriamente via regex `replace(/\D/g, '')` antes da concatenação da URL.

---

## 4. Padrões de Acessibilidade (a11y) e Ergonomia Mobile

1. **Conformidade de Alvos de Toque (WCAG 2.5.5 - Target Size):**
   - Qualquer elemento interativo (botões de dia do calendário `.cal-day`, botões de horário `.slot`, botões de incremento `.qtc button` e controles de navegação `.cal-nav`) deve manter dimensão mínima de **44px × 44px** (tolerância absoluta de 36px apenas em telas ultra-compactas com largura < 340px).
   - A grade de horários `.slot-grid` deve colapsar de 4 para 3 colunas em viewports com largura inferior a 380px para evitar toques acidentais e truncamento de texto.
2. **Ergonomia da Thumb-Zone:**
   - O botão de ação principal `.fab` e o rodapé do modal de agendamento `.sh-foot` devem ancorar-se na extremidade inferior da viewport, respeitando obrigatoriamente a variável de ambiente `env(safe-area-inset-bottom)`.
3. **Feedback Tátil e Validação Assistida:**
   - Formulários com campos pendentes não devem permanecer desabilitados sem explicação. O clique deve disparar a função `highlightFieldError()` em [`assets/js/checkout.js`](../assets/js/checkout.js), executando scroll suave com centralização do campo no viewport e aplicando a classe CSS `.field-error.shake` com animação `@keyframes fieldShake` de 380ms.
