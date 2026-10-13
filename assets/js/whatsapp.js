/**
 * Barbearia Dom Rocha — Módulo de Integração com WhatsApp (whatsapp.js)
 */

import { CONFIG, brl, durLabel } from "./config.js";
import { dataLabel } from "./calendar.js";

/**
 * Monta o texto de agendamento seguindo estritamente a regra de ouro:
 * ZERO emojis na mensagem para evitar quebra de caracteres no WhatsApp Desktop do Windows.
 */
export function buildWhatsAppMessage({ cart, order, subtotalVal, descontoVal, totalVal, duracaoTotalVal }){
  const L = [];
  L.push(`*AGENDAMENTO — ${CONFIG.nome}*`);
  L.push("");
  L.push(`*Cliente:* ${order.nome.trim()}`);
  L.push(`*WhatsApp:* ${order.tel.trim()}`);
  L.push(`*Data:* ${dataLabel(order.data)} às ${order.hora}`);
  L.push(`*Profissional:* ${order.prof}`);
  L.push("");
  L.push("*Serviços:*");
  cart.forEach(l => {
    L.push(`• ${l.qty}x ${l.nome} — ${brl(l.preco * l.qty)} (${durLabel(l.dur)})`);
    if(l.obs) L.push(`   _${l.obs}_`);
  });
  L.push("");
  L.push(`*Duração estimada:* ${durLabel(duracaoTotalVal)}`);
  if(descontoVal > 0){
    L.push(`*Subtotal:* ${brl(subtotalVal)}`);
    L.push(`*Cupom ${order.cupom}:* -${brl(descontoVal)}`);
  }
  L.push(`*Total estimado:* ${brl(totalVal)}`);
  L.push(`*Pagamento:* no local${order.pag ? ` (${order.pag})` : ""}`);
  L.push("");
  L.push("_Confirmar no WhatsApp · agendamento feito pelo site_");
  return L.join("\n");
}

/**
 * Sanitiza o número do WhatsApp da barbearia e gera a URL wa.me
 */
export function buildWhatsAppUrl(messageText, rawWhatsappNumber = CONFIG.whatsapp){
  const cleanWa = String(rawWhatsappNumber || "").replace(/\D/g, "");
  return `https://wa.me/${cleanWa}?text=` + encodeURIComponent(messageText);
}

/**
 * Dispara a abertura do WhatsApp com a mensagem formatada
 */
export function dispatchWhatsApp(params){
  const text = buildWhatsAppMessage(params);
  const url = buildWhatsAppUrl(text);
  window.open(url, "_blank");
}
