/**
 * Barbearia Dom Rocha — Módulo de Estado e Persistência (store.js)
 */

import { CONFIG, ALL } from "./config.js";

export let cart = []; // linhas: {lineId, id, nome, preco, dur, qty, obs}
export let order = {
  data: "",
  hora: "",
  prof: "Sem preferência",
  nome: "",
  tel: "",
  pag: "",
  cupom: "",
  obs: ""
};
export let modal = {
  item: null,
  qty: 1,
  obs: ""
};

const listeners = [];
export function onCartChange(fn){
  if(typeof fn === "function") listeners.push(fn);
}
export function notifyCartChange(){
  persistCart();
  listeners.forEach(fn => fn());
}

/* ===================== CÁLCULOS ===================== */
export function count(){
  return cart.reduce((s, l) => s + l.qty, 0);
}

export function subtotal(){
  return cart.reduce((s, l) => s + l.preco * l.qty, 0);
}

export function duracaoTotal(){
  return cart.reduce((s, l) => s + l.dur * l.qty, 0);
}

export function descontoCupom(){
  const c = CONFIG.cupons[order.cupom];
  if(!c) return 0;
  return c.tipo === "percent" ? (subtotal() * c.valor / 100) : c.valor;
}

export function total(){
  return Math.max(0, subtotal() - descontoCupom());
}

export function qtyOf(id){
  return cart.filter(l => l.id === id).reduce((s, l) => s + l.qty, 0);
}

/* ===================== AÇÕES DO CARRINHO ===================== */
export function addServ(id, silent){
  const it = ALL[id];
  if(!it) return;
  const line = cart.find(l => l.id === id && !l.obs);
  if(line) {
    line.qty++;
  } else {
    cart.push({
      lineId: "L" + Date.now() + Math.round(Math.random() * 999),
      id,
      nome: it.n,
      preco: it.p,
      dur: it.dur,
      qty: 1,
      obs: ""
    });
  }
  notifyCartChange();
}

export function decServ(id){
  const line = [...cart].reverse().find(l => l.id === id);
  if(!line) return;
  line.qty--;
  if(line.qty <= 0) cart = cart.filter(l => l !== line);
  notifyCartChange();
}

export function incLine(lineId){
  const l = cart.find(x => x.lineId === lineId);
  if(l){
    l.qty++;
    notifyCartChange();
  }
}

export function decLine(lineId){
  const l = cart.find(x => x.lineId === lineId);
  if(!l) return;
  l.qty--;
  if(l.qty <= 0) cart = cart.filter(x => x !== l);
  notifyCartChange();
}

export function addFromModal(){
  const it = modal.item;
  if(!it) return;
  const obsTrim = (modal.obs || "").trim();
  if(obsTrim){
    cart.push({
      lineId: "L" + Date.now() + Math.round(Math.random() * 999),
      id: it.id,
      nome: it.n,
      preco: it.p,
      dur: it.dur,
      qty: modal.qty,
      obs: obsTrim
    });
  } else {
    const line = cart.find(l => l.id === it.id && !l.obs);
    if(line) {
      line.qty += modal.qty;
    } else {
      cart.push({
        lineId: "L" + Date.now() + Math.round(Math.random() * 999),
        id: it.id,
        nome: it.n,
        preco: it.p,
        dur: it.dur,
        qty: modal.qty,
        obs: ""
      });
    }
  }
  notifyCartChange();
}

/* ===================== AÇÕES DE PEDIDO ===================== */
export function setOrderData(iso){
  order.data = iso;
  order.hora = "";
}

export function setOrderHora(hora){
  order.hora = hora;
}

export function setOrderProf(prof){
  order.prof = prof;
}

export function setOrderPag(pag){
  order.pag = pag;
}

export function setOrderNome(nome){
  order.nome = nome;
}

export function setOrderTel(tel){
  order.tel = tel;
}

export function aplicarCupom(code){
  const c = (code || "").trim().toUpperCase();
  order.cupom = c;
  if(CONFIG.cupons[c]){
    return { ok: true, msg: "Cupom aplicado: " + CONFIG.cupons[c].label };
  } else if(c){
    order.cupom = "";
    return { ok: false, msg: "Cupom inválido" };
  }
  return { ok: false, msg: "" };
}

/* ===================== PERSISTÊNCIA ===================== */
export function persistCart(){
  try {
    localStorage.setItem("dr_cart", JSON.stringify(cart));
  } catch(e) {}
}

export function loadSavedCustomer(){
  try {
    const nome = localStorage.getItem("dr_nome");
    if(nome) order.nome = nome;
    const tel = localStorage.getItem("dr_tel");
    if(tel) order.tel = tel;
  } catch(e) {}
}

export function saveLastBooking(){
  try {
    localStorage.setItem("dr_last", JSON.stringify({ cart, order: { ...order } }));
    if(order.nome.trim()) localStorage.setItem("dr_nome", order.nome.trim());
    if(order.tel.trim()) localStorage.setItem("dr_tel", order.tel.trim());
  } catch(e) {}
}

export function getLastBooking(){
  try {
    const last = localStorage.getItem("dr_last");
    if(!last) return null;
    return JSON.parse(last);
  } catch(e) {
    return null;
  }
}

export function repeatBooking(){
  const last = getLastBooking();
  if(!last || !last.cart || !last.cart.length) return false;
  cart = last.cart.map(l => ({
    ...l,
    lineId: "L" + Date.now() + Math.round(Math.random() * 9999)
  }));
  if(last.order){
    order.nome = last.order.nome || order.nome;
    order.tel = last.order.tel || order.tel;
    order.prof = last.order.prof || "Sem preferência";
  }
  order.data = "";
  order.hora = "";
  notifyCartChange();
  return true;
}
