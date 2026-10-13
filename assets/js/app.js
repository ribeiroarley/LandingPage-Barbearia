/**
 * Barbearia Dom Rocha — Orquestrador Principal (app.js)
 * Módulo ES que integra: config, store, calendar, checkout e whatsapp.
 */

import { CONFIG, MENU, EMOJI, ALL, brl, durLabel } from "./config.js";
import {
  cart,
  order,
  modal,
  count,
  subtotal,
  duracaoTotal,
  descontoCupom,
  total,
  qtyOf,
  addServ as storeAddServ,
  decServ as storeDecServ,
  incLine as storeIncLine,
  decLine as storeDecLine,
  addFromModal as storeAddFromModal,
  setOrderData,
  setOrderHora,
  setOrderProf,
  setOrderPag,
  setOrderNome,
  aplicarCupom as storeAplicarCupom,
  loadSavedCustomer,
  saveLastBooking,
  getLastBooking,
  repeatBooking,
  onCartChange
} from "./store.js";
import {
  statusLoja,
  slotsDoDia,
  getFirstValidDate,
  dataLabel,
  dataContextual,
  currentCalendarMonth,
  currentCalendarYear,
  setCalendarMonth,
  renderIOSCalendar,
  renderSlots
} from "./calendar.js";
import {
  formatPhone,
  handlePhoneInput,
  highlightFieldError,
  clearFieldError,
  validateBookingForm
} from "./checkout.js";
import { dispatchWhatsApp } from "./whatsapp.js";

/* ===================== CONTROLE DE SHEET / MODAL ===================== */
let sheetMode = "";

export function openSheet(m){
  sheetMode = m || "serv";
  document.getElementById("sheetWrap")?.classList.add("on");
  document.getElementById("sheet")?.classList.add("on");
  document.body.style.overflow = "hidden";
}

export function closeAll(){
  document.getElementById("sheetWrap")?.classList.remove("on");
  document.getElementById("sheet")?.classList.remove("on");
  document.body.style.overflow = "";
  sheetMode = "";
}

window.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && sheetMode) closeAll();
});

/* ===================== TOAST NOTIFICATIONS ===================== */
let tt;
export function toast(m){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("on"), 1900);
}

/* ===================== RENDER TOPO & HERO ===================== */
export function renderMeta(){
  const s = statusLoja();
  const metaEl = document.getElementById("meta");
  if(metaEl){
    metaEl.innerHTML = `
      <span class="chip ${s.aberto ? 'status-open' : 'status-closed'}">
        <span class="dot ${s.aberto ? 'on' : 'off'}"></span>${s.aberto ? 'Aberto agora' : 'Fechado'}
      </span>
      <span class="chip rating-chip">★ 4.9 (850+ no Google)</span>
      <span class="chip"><a href="${CONFIG.maps}" target="_blank" rel="noopener">📍 Como chegar</a></span>
      <span class="chip">🕐 Ter a Sáb · 9h–20h</span>`;
  }
  const footAddr = document.getElementById("footAddr");
  if(footAddr) footAddr.textContent = "📍 " + CONFIG.endereco;

  const cb = document.getElementById("closedBanner");
  if(cb){
    if(!s.aberto){
      cb.style.display = "block";
      cb.textContent = "🕐 Estamos fechados agora" + (s.proximo ? " (abrimos " + s.proximo + ")" : "") + ". Você já pode deixar seu horário agendado.";
    } else {
      cb.style.display = "none";
    }
  }
}

/* ===================== RENDER CATÁLOGO ===================== */
export function render(){
  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu");
  if(!nav || !menu) return;

  nav.innerHTML = "";
  menu.innerHTML = "";

  MENU.forEach((c, i) => {
    const cid = "cat-" + c.key;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-pill" + (i === 0 ? " active" : "");
    btn.textContent = c.cat;
    btn.dataset.target = cid;
    btn.dataset.cid = cid;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(cid);
      if(targetEl){
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    nav.appendChild(btn);

    const sec = document.createElement("section");
    sec.className = "sec" + (c.card ? "" : " simple");
    sec.id = cid;
    sec.innerHTML = `<div class="sec-h"><h2>${c.cat}</h2>${c.sub ? `<span class="sub">${c.sub}</span>` : ""}</div>`;

    const g = document.createElement("div");
    g.className = "grid";
    c.items.forEach(it => g.appendChild(cardEl(it)));
    sec.appendChild(g);
    menu.appendChild(sec);
  });
  syncCards();
}

function cardEl(it){
  const el = document.createElement("div");
  el.className = "card";
  el.id = "card-" + it.id;
  const thumb = it.img ? `<img class="thumb" width="104" height="104" loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt || it.n}">` : "";
  el.innerHTML = `
    ${thumb}
    <div class="txt">
      <h3>${it.n}</h3>
      <div class="desc">${it.d || ""}</div>
      <div class="dur">🕐 ${durLabel(it.dur)}</div>
      <div class="bot">
        <span class="price">${brl(it.p)}</span>
        <span id="act-${it.id}"></span>
      </div>
    </div>`;
  return el;
}

function actEl(it){
  if(it.card) return `<button class="add" onclick="window.openServ('${it.id}')">Agendar</button>`;
  const q = qtyOf(it.id);
  if(q === 0) return `<button class="add" onclick="window.addServ('${it.id}')">Adicionar</button>`;
  return `<span class="qtc"><button onclick="window.decServ('${it.id}')">−</button><span>${q}</span><button onclick="window.addServ('${it.id}')">+</button></span>`;
}

export function syncCards(){
  MENU.forEach(c => c.items.forEach(it => {
    const s = document.getElementById("act-" + it.id);
    if(s) s.innerHTML = actEl(it);
  }));
}

/* ===================== MODAL DO SERVIÇO ===================== */
export function openServ(id){
  const it = ALL[id];
  if(!it) return;
  modal.item = it;
  modal.qty = 1;
  modal.obs = "";
  document.getElementById("shTitle").textContent = it.n;
  renderServ();
  openSheet("serv");
}

export function renderServ(){
  const it = modal.item;
  const body = document.getElementById("shBody");
  if(!it || !body) return;

  body.innerHTML = `
    ${it.img ? `<img class="pz-img" loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt || it.n}">` : ""}
    <div class="pz-tags">
      <span class="pz-tag">🕐 ${durLabel(it.dur)}</span>
      <span class="pz-tag">${brl(it.p)}</span>
    </div>
    <div class="pz-desc">${it.d || ""}</div>
    <div class="opt-group">
      <label>Alguma observação pro barbeiro?</label>
      <input class="obs-in" id="svObs" placeholder="ex: degradê na régua, barba curta, disfarçado…" value="${modal.obs}" oninput="modal.obs=this.value">
    </div>
    <div class="opt-group">
      <label>Quantas pessoas / vezes?</label>
      <div class="qty-big">
        <button onclick="modal.qty=Math.max(1,modal.qty-1);window.renderServ()">−</button>
        <span>${modal.qty}</span>
        <button onclick="modal.qty++;window.renderServ()">+</button>
      </div>
    </div>
    <div class="opt-group">
      <label>Adicione também</label>
      <div class="sug-row">${adicioneChips(it.id)}</div>
    </div>`;
  renderServFoot();
}

function renderServFoot(){
  const foot = document.getElementById("shFoot");
  if(!foot || !modal.item) return;
  foot.innerHTML = `
    <button class="pz-add" onclick="window.addFromModal()">
      <span>Adicionar ao agendamento</span><span>${brl(modal.item.p * modal.qty)}</span>
    </button>`;
}

function adicioneChips(excludeId){
  const sug = ["barba", "pezinho", "sobrancelha", "hidratacao"].filter(x => x !== excludeId).map(x => ALL[x]).filter(Boolean).slice(0, 3);
  return sug.map(x => `<button class="sug-chip" onclick="event.stopPropagation();window.addServ('${x.id}')">+ ${x.n} <b>${brl(x.p)}</b></button>`).join("");
}

/* ===================== AGENDAMENTO (CARRINHO) ===================== */
function ensureInitialDate(){
  if(!order.data){
    order.data = getFirstValidDate();
  }
  if(order.data){
    const [y, m] = order.data.split("-").map(Number);
    setCalendarMonth(y, m - 1);
  }
}

export function openCart(){
  renderCart();
  openSheet("cart");
}

export function renderCart(){
  const title = document.getElementById("shTitle");
  if(title) title.textContent = "Meu agendamento";
  const body = document.getElementById("shBody");
  const foot = document.getElementById("shFoot");
  if(!body || !foot) return;

  if(!cart.length){
    body.innerHTML = `<div class="empty"><div class="em">💈</div>Nenhum serviço escolhido ainda.<br>Escolha seus serviços no catálogo.</div>`;
    foot.innerHTML = "";
    return;
  }

  ensureInitialDate();

  const itemsHtml = cart.map(l => {
    const it = ALL[l.id];
    const img = it.img ? `<img loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt || it.n}">` : `<div class="ni">${EMOJI[it.catKey] || "✂️"}</div>`;
    return `
      <div class="citem">
        ${img}
        <div class="ci-t">
          <h4>${l.nome}</h4>
          <div class="cfg">${durLabel(l.dur)}${l.obs ? ' · ' + l.obs : ''}</div>
        </div>
        <div class="ci-r">
          <span class="lp">${brl(l.preco * l.qty)}</span>
          <span class="qtc">
            <button onclick="window.decLine('${l.lineId}')">−</button>
            <span>${l.qty}</span>
            <button onclick="window.incLine('${l.lineId}')">+</button>
          </span>
        </div>
      </div>`;
  }).join("") + suggestBlock();

  const formHtml = `
    <div class="nudge">💈 <b>Aproveite e agende também</b> a barba ou a sobrancelha — sai tudo na mesma cadeira, sem esperar de novo.</div>
    
    <div class="field" id="fieldData">
      <label>Escolha a data do atendimento</label>
      <div id="calContainer"></div>
    </div>

    <div class="field" id="slotsField"></div>

    <div class="field">
      <label>Profissional</label>
      <div class="prof-row">
        ${CONFIG.profissionais.map(p => `<button type="button" class="o2 center ${order.prof === p ? 'sel' : ''}" onclick="window.setProf('${p}')">${p === 'Sem preferência' ? '😎 ' + p : '💈 ' + p}</button>`).join("")}
      </div>
    </div>

    <div class="field" id="fieldNome">
      <label>Seu nome</label>
      <input class="txt" id="fNome" placeholder="Como te chamam?" value="${order.nome}" oninput="window.order.nome=this.value;window.clearFieldError('fieldNome');window.updateSend()">
    </div>

    <div class="field" id="fieldTel">
      <label>Seu WhatsApp</label>
      <input class="txt" id="fTel" inputmode="tel" placeholder="(11) 90000-0000" value="${order.tel}" oninput="window.handlePhoneInput(this);window.updateSend()">
    </div>

    <div class="field">
      <label>Pagamento (no local)</label>
      <div class="pay3">
        <button type="button" class="o2 center ${order.pag === 'PIX' ? 'sel' : ''}" onclick="window.setPag('PIX')">💠 PIX</button>
        <button type="button" class="o2 center ${order.pag === 'Dinheiro' ? 'sel' : ''}" onclick="window.setPag('Dinheiro')">💵 Dinheiro</button>
        <button type="button" class="o2 center ${order.pag === 'Cartão' ? 'sel' : ''}" onclick="window.setPag('Cartão')">💳 Cartão</button>
      </div>
      <div class="hint">Combine o pagamento direto com o barbeiro no dia.</div>
    </div>

    <div class="field">
      <label>Cupom de desconto</label>
      <div class="coupon ${descontoCupom() > 0 ? 'ok' : ''}">
        <input class="txt" id="fCupom" placeholder="Tem um cupom? (ex: PRIMEIRA10)" value="${order.cupom}">
        <button type="button" onclick="window.aplicarCupom()">Aplicar</button>
      </div>
    </div>

    <div style="margin-top:16px">
      <div class="sumrow"><span>Serviços (${count()})</span><span>${brl(subtotal())}</span></div>
      <div class="sumrow"><span>Duração estimada</span><span>${durLabel(duracaoTotal())}</span></div>
      ${descontoCupom() > 0 ? `<div class="sumrow disc"><span>Cupom ${order.cupom}</span><span>- ${brl(descontoCupom())}</span></div>` : ""}
      <div class="totrow"><span style="font-weight:600">Total estimado</span><span class="tv">${brl(total())}</span></div>
    </div>`;

  body.innerHTML = itemsHtml + formHtml;

  foot.innerHTML = `
    <button class="send" id="sendBtn" onclick="window.enviar()">
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>
      Confirmar agendamento no WhatsApp
    </button>
    <div class="hint">A confirmação final do horário é feita na conversa do WhatsApp.</div>`;

  renderCalendarAndSlots();
  updateSend();
}

function suggestBlock(){
  const faltantes = ["barba", "pezinho", "sobrancelha"].map(x => ALL[x]).filter(it => it && !cart.some(l => l.id === it.id));
  if(!faltantes.length) return "";
  return `
    <div class="suggest">
      <b>Complete seu visual</b>
      <div class="sug-row">
        ${faltantes.map(x => `<button class="sug-chip" onclick="window.addServ('${x.id}')">+ ${x.n} <b>${brl(x.p)}</b></button>`).join("")}
      </div>
    </div>`;
}

export function renderCalendarAndSlots(){
  const calBox = document.getElementById("calContainer");
  const slotsBox = document.getElementById("slotsField");
  if(calBox) {
    renderIOSCalendar(calBox, order.data, (iso) => {
      setData(iso);
    }, () => {
      renderCalendarAndSlots();
    });
  }
  if(slotsBox) {
    renderSlots(slotsBox, order.data, order.hora, (hora) => {
      setHora(hora);
    });
  }
}

export function setData(iso){
  setOrderData(iso);
  clearFieldError("fieldData");
  renderCalendarAndSlots();
  updateSend();
}

export function setHora(t){
  setOrderHora(t);
  clearFieldError("slotsField");
  const slotsContainer = document.getElementById("slotsField");
  if(slotsContainer){
    slotsContainer.querySelectorAll(".slot").forEach(b => {
      b.classList.toggle("sel", b.dataset.slot === t);
    });
  }
  updateSend();
}

export function setProf(p){
  setOrderProf(p);
  document.querySelectorAll(".prof-row .o2").forEach(b => {
    b.classList.toggle("sel", b.textContent.includes(p));
  });
}

export function setPag(p){
  setOrderPag(p);
  document.querySelectorAll(".pay3 .o2").forEach(b => {
    b.classList.toggle("sel", b.textContent.includes(p));
  });
}

export function aplicarCupomBtn(){
  const input = document.getElementById("fCupom");
  const res = storeAplicarCupom(input ? input.value : "");
  if(res.msg) toast(res.msg);
  renderCart();
}

export function updateSend(){
  const b = document.getElementById("sendBtn");
  if(!b) return;
  const telDigits = String(order.tel || "").replace(/\D/g, "");
  const ok = cart.length && order.data && order.hora && order.nome.trim().length >= 2 && telDigits.length >= 10;
  b.classList.toggle("attention", !ok && Boolean(order.data || order.nome.trim()));
}

export function enviar(){
  const isValid = validateBookingForm(cart, order, toast);
  if(!isValid) return;

  saveLastBooking();

  dispatchWhatsApp({
    cart,
    order,
    subtotalVal: subtotal(),
    descontoVal: descontoCupom(),
    totalVal: total(),
    duracaoTotalVal: duracaoTotal()
  });
}

/* ===================== SINCRONIZAÇÃO GERAL DO CARRINHO ===================== */
onCartChange(() => {
  syncCards();
  const n = count();
  const fabCount = document.getElementById("fabCount");
  const fabTotal = document.getElementById("fabTotal");
  const fab = document.getElementById("fab");
  if(fabCount) fabCount.textContent = n;
  if(fabTotal) fabTotal.textContent = brl(total());
  if(fab) fab.classList.toggle("hide", n === 0);
  if(document.getElementById("sheet")?.classList.contains("on") && sheetMode === "cart") {
    renderCart();
  }
});

/* ===================== REPETIR / RETENÇÃO ===================== */
export function initRepeat(){
  loadSavedCustomer();
  const last = getLastBooking();
  if(last && last.cart && last.cart.length){
    const btn = document.getElementById("repeatBtn");
    if(btn){
      btn.style.display = "block";
      const resumo = last.cart.map(l => l.qty + "x " + l.nome).slice(0, 2).join(", ");
      btn.innerHTML = `🔁 Repetir último agendamento <b>· ${resumo}${last.cart.length > 2 ? "…" : ""}</b>`;
    }
  }
}

export function repeatLast(){
  const ok = repeatBooking();
  if(ok){
    openCart();
    toast("Serviços do último agendamento carregados — escolha a nova data");
  }
}

/* ===================== DEEP LINK & SCROLLSPY ===================== */
export function initDeepLink(){
  const p = new URLSearchParams(location.search).get("servico");
  if(p && ALL[p]){
    setTimeout(() => {
      ALL[p].card ? openServ(p) : window.addServ(p);
    }, 350);
  }
}

export function initSpy(){
  const links = [...document.querySelectorAll(".nav .cat-pill, .nav button, .nav a")];
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if(e.isIntersecting){
        links.forEach(l => l.classList.toggle("active", l.dataset.cid === e.target.id));
        const al = links.find(l => l.dataset.cid === e.target.id);
        if(al) al.scrollIntoView({ inline: "center", block: "nearest" });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll(".sec").forEach(s => io.observe(s));
}

/* ===================== PWA & SERVICE WORKER ===================== */
let deferredPrompt = null;
const ehMobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  if(ehMobile){
    const pwaBar = document.getElementById("pwaBar");
    if(pwaBar) pwaBar.style.display = "flex";
  }
});

export function installPWA(){
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
  const pwaBar = document.getElementById("pwaBar");
  if(pwaBar) pwaBar.style.display = "none";
}

if (location.protocol === "http:" || location.protocol === "https:") {
  const mLink = document.createElement("link");
  mLink.rel = "manifest";
  mLink.href = "manifest.json";
  document.head.appendChild(mLink);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(err => console.warn("SW:", err));
    });
  }
}

/* ===================== EXPOSIÇÃO GLOBAL (COMPATIBILIDADE TEMPLATES) ===================== */
Object.assign(window, {
  CONFIG,
  MENU,
  ALL,
  cart,
  order,
  modal,
  openCart,
  closeAll,
  openServ,
  renderServ,
  addServ: (id) => { storeAddServ(id); toast((ALL[id]?.n || "Item") + " adicionado"); },
  decServ: storeDecServ,
  incLine: storeIncLine,
  decLine: storeDecLine,
  addFromModal: () => {
    const nome = modal.item?.n || "Item";
    storeAddFromModal();
    closeAll();
    toast(nome + " adicionado ao agendamento");
  },
  setData,
  setHora,
  setProf,
  setPag,
  aplicarCupom: aplicarCupomBtn,
  updateSend,
  enviar,
  repeatLast,
  installPWA,
  handlePhoneInput: (el) => { handlePhoneInput(el, order, clearFieldError); updateSend(); },
  clearFieldError
});

/* ===================== INICIALIZAÇÃO ===================== */
function bootstrap(){
  renderMeta();
  render();
  initSpy();
  initRepeat();
  initDeepLink();
  setInterval(renderMeta, 60000);
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
