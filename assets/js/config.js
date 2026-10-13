/**
 * Barbearia Dom Rocha — Módulo de Configuração e Catálogo (config.js)
 */

export const CONFIG = {
  nome: "Barbearia Dom Rocha",
  whatsapp: "SEU_WHATSAPP",               // número da barbearia (só dígitos, 55 + DDD)
  endereco: "Rua do Ferreiro, 88 — Vila Ferro",
  maps: "https://maps.google.com/?q=Rua+do+Ferreiro+88+Vila+Ferro",
  horario: { dias:[2,3,4,5,6], abre:"09:00", fecha:"20:00", slot:30 }, // Ter–Sáb 9h–20h, slots de 30min
  profissionais: ["Sem preferência","Rocha","Léo","Tiago"],
  cupons: { "PRIMEIRA10": {tipo:"percent", valor:10, label:"10% na 1ª visita"} },
  diasFrente: 14,
};

export const MENU = [
  {cat:"Cortes", key:"cortes", sub:"máquina, tesoura e navalha", card:true, items:[
    {id:"corte", n:"Corte", d:"lavagem, corte na tesoura ou máquina e finalização com pomada", p:45, dur:40, img:"corte-fade", alt:"Corte degradê masculino fade com acabamento na navalha"},
    {id:"corte-infantil", n:"Corte Infantil", d:"corte tranquilo pra criançada, até 10 anos", p:40, dur:30, img:"corte-infantil", alt:"Corte de cabelo infantil masculino com atendimento paciente e personalizado"},
  ]},
  {cat:"Barba", key:"barba", sub:"toalha quente e navalha", card:true, items:[
    {id:"barba", n:"Barba", d:"toalha quente, óleo, navalha e finalização", p:35, dur:30, img:"barba", alt:"Design e alinhamento de barba com toalha quente e navalhete"},
  ]},
  {cat:"Combos", key:"combos", sub:"o pacote completo, mais em conta", card:true, items:[
    {id:"corte-barba", n:"Corte + Barba", d:"o combo da casa: corte completo e barba na navalha", p:70, dur:70, img:"combo", alt:"Combo completo de corte de cabelo masculino e barba alinhada"},
  ]},
  {cat:"Tratamentos", key:"tratamentos", sub:"cuidado extra pro cabelo", card:true, items:[
    {id:"platinado", n:"Platinado / Descoloração", d:"descoloração e tonalização (consulta prévia recomendada)", p:120, dur:120, img:"platinado", alt:"Descoloração capilar masculina e cabelo platinado / nevou"},
    {id:"hidratacao", n:"Hidratação / Relaxamento", d:"hidratação profunda ou relaxamento capilar", p:40, dur:30, img:"hidratacao", alt:"Tratamento capilar masculino, hidratação profunda e alinhamento dos fios"},
  ]},
  {cat:"Extras", key:"extras", sub:"acabamentos rápidos", card:false, items:[
    {id:"pezinho", n:"Pezinho / Acabamento", d:"acabamento da nuca e contornos", p:15, dur:15},
    {id:"sobrancelha", n:"Sobrancelha", d:"limpeza e alinhamento na navalha", p:15, dur:15},
  ]},
];

export const EMOJI = {extras:"✂️", cortes:"✂️", barba:"🪒", combos:"💈", tratamentos:"💧"};

export const ALL = {};
MENU.forEach(c => c.items.forEach(i => {
  i.cat = c.cat;
  i.catKey = c.key;
  i.card = c.card;
  ALL[i.id] = i;
}));

export const brl = v => "R$ " + v.toFixed(2).replace(".", ",");

export function durLabel(m){
  if(m < 60) return m + "min";
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h${r}` : `${h}h`;
}
