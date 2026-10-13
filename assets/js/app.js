/* ===================== CONFIG ===================== */
const CONFIG = {
  nome: "Barbearia Dom Rocha",
  whatsapp: "SEU_WHATSAPP",               // número da barbearia (só dígitos, 55 + DDD)
  endereco: "Rua do Ferreiro, 88 — Vila Ferro",
  maps: "https://maps.google.com/?q=Rua+do+Ferreiro+88+Vila+Ferro",
  horario: { dias:[2,3,4,5,6], abre:"09:00", fecha:"20:00", slot:30 }, // Ter–Sáb 9h–20h, slots de 30min
  profissionais: ["Sem preferência","Rocha","Léo","Tiago"],
  cupons: { "PRIMEIRA10": {tipo:"percent", valor:10, label:"10% na 1ª visita"} },
  diasFrente: 14,
};

/* ===================== SERVIÇOS ===================== */
const MENU = [
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
const EMOJI = {extras:"✂️", cortes:"✂️", barba:"🪒", combos:"💈", tratamentos:"💧"};

const ALL={}; MENU.forEach(c=>c.items.forEach(i=>{i.cat=c.cat;i.catKey=c.key;i.card=c.card;ALL[i.id]=i}));
const brl=v=>"R$ "+v.toFixed(2).replace(".",",");
function durLabel(m){ if(m<60)return m+"min"; const h=Math.floor(m/60),r=m%60; return r?`${h}h${r}`:`${h}h`; }

/* ===================== ESTADO ===================== */
let cart=[]; // linhas: {lineId, id, nome, preco, dur, qty, obs}
let order={data:"", hora:"", prof:"Sem preferência", nome:"", tel:"", pag:"", cupom:"", obs:""};
let modal={item:null, qty:1, obs:""};

/* ===================== HORÁRIO / STATUS ===================== */
function statusLoja(){
  const now=new Date(); const dia=now.getDay();
  const [ah,am]=CONFIG.horario.abre.split(":").map(Number);
  const [fh,fm]=CONFIG.horario.fecha.split(":").map(Number);
  const min=now.getHours()*60+now.getMinutes();
  const aberto=CONFIG.horario.dias.includes(dia) && min>=ah*60+am && min<fh*60+fm;
  let proximo="";
  if(!aberto){
    for(let i=0;i<7;i++){ const d=(dia+i)%7;
      if(CONFIG.horario.dias.includes(d)){
        if(i===0 && min<ah*60+am){ proximo="hoje às "+CONFIG.horario.abre; break; }
        if(i===0) continue;
        proximo=(i===1?"amanhã":["dom","seg","ter","qua","qui","sex","sáb"][d])+" às "+CONFIG.horario.abre; break;
      }
    }
  }
  return {aberto, proximo};
}

/* ===================== DATAS / SLOTS / CALENDÁRIO iOS ===================== */
const DIAS_SEM = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const DIAS_SEMANA_SIGLAS = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
const MESES_EXTENSO = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function getFirstValidDate(){
  const d = new Date();
  d.setHours(0,0,0,0);
  const max = CONFIG.diasFrente || 14;
  for(let i=0; i<max; i++){
    if(CONFIG.horario.dias.includes(d.getDay())){
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const slots = slotsDoDia(iso);
      if(slots.some(s => !s.off)) return iso;
    }
    d.setDate(d.getDate()+1);
  }
  return "";
}

function ensureInitialDate(){
  if(!order.data){
    order.data = getFirstValidDate();
  }
  if(order.data){
    const [y, m] = order.data.split("-").map(Number);
    currentCalendarYear = y;
    currentCalendarMonth = m - 1;
  }
}

function dataLabel(iso){
  if(!iso) return "";
  const [y,m,dd] = iso.split("-").map(Number);
  const dt = new Date(y, m-1, dd);
  return `${DIAS_SEM[dt.getDay()]}, ${String(dd).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
}

function dataContextual(iso){
  if(!iso) return "";
  const [y,m,dd] = iso.split("-").map(Number);
  const now = new Date();
  const hojeIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  if(iso === hojeIso) return `Hoje (${dd} de ${MESES_EXTENSO[m-1]})`;
  return `${dd} de ${MESES_EXTENSO[m-1]}`;
}

function slotsDoDia(iso){
  const [ah,am]=CONFIG.horario.abre.split(":").map(Number);
  const [fh,fm]=CONFIG.horario.fecha.split(":").map(Number);
  const ini=ah*60+am, fim=fh*60+fm, step=CONFIG.horario.slot;
  const now=new Date();
  const hojeIso=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  const nowMin=now.getHours()*60+now.getMinutes();
  const out=[];
  for(let m=ini;m<=fim-step;m+=step){
    const passou = (iso===hojeIso) && (m <= nowMin+15); // 15min de folga
    out.push({t:String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"), off:passou});
  }
  return out;
}

function renderIOSCalendar(container){
  if(!container) return;
  const today = new Date();
  today.setHours(0,0,0,0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (CONFIG.diasFrente || 14));
  maxDate.setHours(23,59,59,999);

  const isCurrentMonth = (currentCalendarYear === today.getFullYear() && currentCalendarMonth === today.getMonth());
  const nextMonthStart = new Date(currentCalendarYear, currentCalendarMonth + 1, 1);
  nextMonthStart.setHours(0,0,0,0);
  const isNextDisabled = nextMonthStart > maxDate;

  const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
  const mesExtenso = MESES_EXTENSO[currentCalendarMonth];

  let html = `
    <div class="cal-box">
      <div class="cal-header">
        <button type="button" class="cal-nav" id="calPrev" ${isCurrentMonth ? 'disabled' : ''} aria-label="Mês anterior">‹</button>
        <span class="cal-title">${mesExtenso} ${currentCalendarYear}</span>
        <button type="button" class="cal-nav" id="calNext" ${isNextDisabled ? 'disabled' : ''} aria-label="Próximo mês">›</button>
      </div>
      <div class="cal-weekdays">
        ${DIAS_SEMANA_SIGLAS.map(s => `<span class="cal-weekday">${s}</span>`).join("")}
      </div>
      <div class="cal-grid">
  `;

  for(let i=0; i<firstDayIndex; i++){
    html += `<div class="cal-empty"></div>`;
  }

  for(let day=1; day<=daysInMonth; day++){
    const thisDate = new Date(currentCalendarYear, currentCalendarMonth, day);
    thisDate.setHours(0,0,0,0);
    const iso = `${currentCalendarYear}-${String(currentCalendarMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const isPast = thisDate < today;
    const isClosed = !CONFIG.horario.dias.includes(thisDate.getDay());
    const isToday = thisDate.getTime() === today.getTime();
    const isBeyond = thisDate > maxDate;

    let allSlotsPassed = false;
    if(isToday){
      const slots = slotsDoDia(iso);
      allSlotsPassed = !slots.some(s => !s.off);
    }

    const isDisabled = isPast || isClosed || allSlotsPassed || isBeyond;
    const isSelected = order.data === iso;

    html += `
      <button type="button"
              class="cal-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}"
              data-date="${iso}"
              ${isDisabled ? 'disabled' : ''}>
        <span>${day}</span>
      </button>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  const prevBtn = container.querySelector("#calPrev");
  if(prevBtn){
    prevBtn.addEventListener("click", () => {
      if(isCurrentMonth) return;
      currentCalendarMonth--;
      if(currentCalendarMonth < 0){
        currentCalendarMonth = 11;
        currentCalendarYear--;
      }
      renderCalendarAndSlots();
    });
  }

  const nextBtn = container.querySelector("#calNext");
  if(nextBtn){
    nextBtn.addEventListener("click", () => {
      if(isNextDisabled) return;
      currentCalendarMonth++;
      if(currentCalendarMonth > 11){
        currentCalendarMonth = 0;
        currentCalendarYear++;
      }
      renderCalendarAndSlots();
    });
  }

  container.querySelectorAll(".cal-day:not(.disabled)").forEach(btn => {
    btn.addEventListener("click", () => {
      const iso = btn.dataset.date;
      if(!iso) return;
      order.data = iso;
      order.hora = "";
      clearFieldError("fieldData");
      renderCalendarAndSlots();
      updateSend();
    });
  });
}

function renderSlots(container){
  if(!container) return;
  if(!order.data){
    container.innerHTML = `<div class="pick-hint">Selecione uma data acima para visualizar os horários disponíveis.</div>`;
    return;
  }
  const slots = slotsDoDia(order.data);
  const availableSlots = slots.filter(s => !s.off);

  let html = `
    <div class="slots-wrap">
      <div class="slots-title">Horários disponíveis para <b>${dataContextual(order.data)}</b>:</div>
      ${availableSlots.length > 0 && availableSlots.length <= 5 ? `<div class="scarcity-hint">⚡ Restam apenas ${availableSlots.length} horário${availableSlots.length > 1 ? 's' : ''} para este dia!</div>` : ''}
  `;

  if(!availableSlots.length){
    html += `<div class="pick-hint" style="color:var(--amber)">Todos os horários para esta data já foram preenchidos ou encerrados. Por favor, escolha outra data.</div></div>`;
    container.innerHTML = html;
    return;
  }

  html += `
      <div class="slot-grid">
        ${slots.map(sl => `
          <button type="button"
                  class="slot ${order.hora === sl.t ? 'sel' : ''}"
                  ${sl.off ? 'disabled' : ''}
                  data-slot="${sl.t}"
                  onclick="setHora('${sl.t}')">
            ${sl.t}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderCalendarAndSlots(){
  const calBox = document.getElementById("calContainer");
  const slotsBox = document.getElementById("slotsField");
  if(calBox) renderIOSCalendar(calBox);
  if(slotsBox) renderSlots(slotsBox);
}

/* ===================== RENDER TOPO ===================== */
function renderMeta(){
  const s=statusLoja();
  document.getElementById("meta").innerHTML=`
    <span class="chip ${s.aberto?'status-open':'status-closed'}"><span class="dot ${s.aberto?'on':'off'}"></span>${s.aberto?'Aberto agora':'Fechado'}</span>
    <span class="chip rating-chip">★ 4.9 (850+ no Google)</span>
    <span class="chip"><a href="${CONFIG.maps}" target="_blank" rel="noopener">📍 Como chegar</a></span>
    <span class="chip">🕐 Ter a Sáb · 9h–20h</span>`;
  document.getElementById("footAddr").textContent="📍 "+CONFIG.endereco;
  const cb=document.getElementById("closedBanner");
  if(!s.aberto){ cb.style.display="block"; cb.textContent="🕐 Estamos fechados agora"+(s.proximo?" (abrimos "+s.proximo+")":"")+". Você já pode deixar seu horário agendado."; }
  else cb.style.display="none";
}

function render(){
  const nav=document.getElementById("nav"), menu=document.getElementById("menu");
  nav.innerHTML=""; menu.innerHTML="";
  MENU.forEach((c,i)=>{
    const cid="cat-"+c.key;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="cat-pill"+(i===0?" active":"");
    btn.textContent=c.cat;
    btn.dataset.target=cid;
    btn.dataset.cid=cid;
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const targetEl=document.getElementById(cid);
      if(targetEl){
        targetEl.scrollIntoView({behavior:"smooth",block:"start"});
      }
    });
    nav.appendChild(btn);
    const sec=document.createElement("section"); sec.className="sec"+(c.card?"":" simple"); sec.id=cid;
    sec.innerHTML=`<div class="sec-h"><h2>${c.cat}</h2>${c.sub?`<span class="sub">${c.sub}</span>`:""}</div>`;
    const g=document.createElement("div"); g.className="grid";
    c.items.forEach(it=>g.appendChild(cardEl(it)));
    sec.appendChild(g); menu.appendChild(sec);
  });
  syncCards();
}
function cardEl(it){
  const el=document.createElement("div"); el.className="card"; el.id="card-"+it.id;
  const thumb=it.img?`<img class="thumb" width="104" height="104" loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt||it.n}">`:"";
  el.innerHTML=`${thumb}<div class="txt"><h3>${it.n}</h3><div class="desc">${it.d||""}</div>
    <div class="dur">🕐 ${durLabel(it.dur)}</div>
    <div class="bot"><span class="price">${brl(it.p)}</span><span id="act-${it.id}"></span></div></div>`;
  return el;
}
function actEl(it){
  if(it.card) return `<button class="add" onclick="openServ('${it.id}')">Agendar</button>`;
  const q=qtyOf(it.id);
  if(q===0) return `<button class="add" onclick="addServ('${it.id}')">Adicionar</button>`;
  return `<span class="qtc"><button onclick="decServ('${it.id}')">−</button><span>${q}</span><button onclick="addServ('${it.id}')">+</button></span>`;
}
function syncCards(){ MENU.forEach(c=>c.items.forEach(it=>{const s=document.getElementById("act-"+it.id); if(s)s.innerHTML=actEl(it);})); }

/* ===================== ADD / REMOVE SERVIÇO ===================== */
function qtyOf(id){ return cart.filter(l=>l.id===id).reduce((s,l)=>s+l.qty,0); }
function addServ(id, silent){
  const it=ALL[id]; const line=cart.find(l=>l.id===id && !l.obs);
  if(line) line.qty++;
  else cart.push({lineId:"L"+Date.now()+Math.round(Math.random()*999),id,nome:it.n,preco:it.p,dur:it.dur,qty:1,obs:""});
  onCartChange(); if(!silent) toast(it.n+" adicionado");
}
function decServ(id){ const line=[...cart].reverse().find(l=>l.id===id); if(!line)return; line.qty--; if(line.qty<=0)cart=cart.filter(l=>l!==line); onCartChange(); }

/* ===================== MODAL SERVIÇO ===================== */
function openServ(id){
  const it=ALL[id]; modal={item:it, qty:1, obs:""};
  document.getElementById("shTitle").textContent=it.n;
  renderServ(); openSheet("serv");
}
function renderServ(){
  const it=modal.item;
  const body=document.getElementById("shBody");
  body.innerHTML=`
    ${it.img?`<img class="pz-img" loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt||it.n}">`:""}
    <div class="pz-tags"><span class="pz-tag">🕐 ${durLabel(it.dur)}</span><span class="pz-tag">${brl(it.p)}</span></div>
    <div class="pz-desc">${it.d||""}</div>
    <div class="opt-group"><label>Alguma observação pro barbeiro?</label>
      <input class="obs-in" id="svObs" placeholder="ex: degradê na régua, barba curta, disfarçado…" value="${modal.obs}" oninput="modal.obs=this.value">
    </div>
    <div class="opt-group"><label>Quantas pessoas / vezes?</label>
      <div class="qty-big"><button onclick="modal.qty=Math.max(1,modal.qty-1);renderServ()">−</button><span>${modal.qty}</span><button onclick="modal.qty++;renderServ()">+</button></div>
    </div>
    <div class="opt-group"><label>Adicione também</label>
      <div class="sug-row">${adicioneChips(it.id)}</div>
    </div>`;
  renderServFoot();
}
function renderServFoot(){
  document.getElementById("shFoot").innerHTML=`
    <button class="pz-add" onclick="addFromModal()">
      <span>Adicionar ao agendamento</span><span>${brl(modal.item.p*modal.qty)}</span></button>`;
}
function addFromModal(){
  const it=modal.item;
  if(modal.obs.trim()){
    cart.push({lineId:"L"+Date.now()+Math.round(Math.random()*999),id:it.id,nome:it.n,preco:it.p,dur:it.dur,qty:modal.qty,obs:modal.obs.trim()});
  } else {
    const line=cart.find(l=>l.id===it.id && !l.obs);
    if(line) line.qty+=modal.qty;
    else cart.push({lineId:"L"+Date.now()+Math.round(Math.random()*999),id:it.id,nome:it.n,preco:it.p,dur:it.dur,qty:modal.qty,obs:""});
  }
  closeAll(); onCartChange(); toast(it.n+" adicionado ao agendamento");
}
// "adicione também" no modal — sugere serviços complementares
function adicioneChips(excludeId){
  const sug=["barba","pezinho","sobrancelha","hidratacao"].filter(x=>x!==excludeId).map(x=>ALL[x]).filter(Boolean).slice(0,3);
  return sug.map(x=>`<button class="sug-chip" onclick="event.stopPropagation();addServ('${x.id}')">+ ${x.n} <b>${brl(x.p)}</b></button>`).join("");
}

/* ===================== TOTAIS ===================== */
function count(){ return cart.reduce((s,l)=>s+l.qty,0); }
function subtotal(){ return cart.reduce((s,l)=>s+l.preco*l.qty,0); }
function duracaoTotal(){ return cart.reduce((s,l)=>s+l.dur*l.qty,0); }
function descontoCupom(){ const c=CONFIG.cupons[order.cupom]; if(!c)return 0; return c.tipo==="percent"? subtotal()*c.valor/100 : c.valor; }
function total(){ return Math.max(0, subtotal()-descontoCupom()); }

function onCartChange(){
  syncCards(); persistCart();
  const n=count(); document.getElementById("fabCount").textContent=n;
  document.getElementById("fabTotal").textContent=brl(total());
  document.getElementById("fab").classList.toggle("hide",n===0);
  if(document.getElementById("sheet").classList.contains("on") && sheetMode==="cart") renderCart();
}

/* ===================== SHEET CTRL ===================== */
let sheetMode="";
function openSheet(m){
  sheetMode=m||"serv";
  document.getElementById("sheetWrap")?.classList.add("on");
  document.getElementById("sheet")?.classList.add("on");
  document.body.style.overflow="hidden";
}
function closeAll(){
  document.getElementById("sheetWrap")?.classList.remove("on");
  document.getElementById("sheet")?.classList.remove("on");
  document.body.style.overflow="";
  sheetMode="";
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sheetMode) closeAll();
});

/* ===================== AGENDAMENTO (CART) ===================== */
function openCart(){ renderCart(); openSheet("cart"); }
function renderCart(){
  document.getElementById("shTitle").textContent="Meu agendamento";
  const body=document.getElementById("shBody"), foot=document.getElementById("shFoot");
  if(!cart.length){ body.innerHTML=`<div class="empty"><div class="em">💈</div>Nenhum serviço escolhido ainda.<br>Escolha seus serviços no catálogo.</div>`; foot.innerHTML=""; return; }

  ensureInitialDate();

  const itemsHtml = cart.map(l=>{
    const it=ALL[l.id];
    const img = it.img?`<img loading="lazy" decoding="async" src="assets/img/services/${it.img}.webp" alt="${it.alt||it.n}">`:`<div class="ni">${EMOJI[it.catKey]||"✂️"}</div>`;
    return `<div class="citem">${img}
      <div class="ci-t"><h4>${l.nome}</h4>
        <div class="cfg">${durLabel(l.dur)}${l.obs?' · '+l.obs:''}</div></div>
      <div class="ci-r"><span class="lp">${brl(l.preco*l.qty)}</span>
        <span class="qtc"><button onclick="decLine('${l.lineId}')">−</button><span>${l.qty}</span><button onclick="incLine('${l.lineId}')">+</button></span></div></div>`;
  }).join("") + suggestBlock();

  const formHtml = `
    <div class="nudge">💈 <b>Aproveite e agende também</b> a barba ou a sobrancelha — sai tudo na mesma cadeira, sem esperar de novo.</div>
    
    <div class="field" id="fieldData">
      <label>Escolha a data do atendimento</label>
      <div id="calContainer"></div>
    </div>

    <div class="field" id="slotsField"></div>

    <div class="field"><label>Profissional</label>
      <div class="prof-row">
        ${CONFIG.profissionais.map(p=>`<button type="button" class="o2 center ${order.prof===p?'sel':''}" onclick="setProf('${p}')">${p==='Sem preferência'?'😎 '+p:'💈 '+p}</button>`).join("")}
      </div>
    </div>
    <div class="field" id="fieldNome"><label>Seu nome</label><input class="txt" id="fNome" placeholder="Como te chamam?" value="${order.nome}" oninput="order.nome=this.value;clearFieldError('fieldNome');updateSend()"></div>
    <div class="field" id="fieldTel"><label>Seu WhatsApp</label><input class="txt" id="fTel" inputmode="tel" placeholder="(11) 90000-0000" value="${order.tel}" oninput="handlePhoneInput(this);updateSend()"></div>
    <div class="field"><label>Pagamento (no local)</label>
      <div class="pay3">
        <button type="button" class="o2 center ${order.pag==='PIX'?'sel':''}" onclick="setPag('PIX')">💠 PIX</button>
        <button type="button" class="o2 center ${order.pag==='Dinheiro'?'sel':''}" onclick="setPag('Dinheiro')">💵 Dinheiro</button>
        <button type="button" class="o2 center ${order.pag==='Cartão'?'sel':''}" onclick="setPag('Cartão')">💳 Cartão</button>
      </div>
      <div class="hint">Combine o pagamento direto com o barbeiro no dia.</div>
    </div>
    <div class="field"><label>Cupom de desconto</label>
      <div class="coupon ${descontoCupom()>0?'ok':''}"><input class="txt" id="fCupom" placeholder="Tem um cupom? (ex: PRIMEIRA10)" value="${order.cupom}"><button type="button" onclick="aplicarCupom()">Aplicar</button></div>
    </div>
    <div style="margin-top:16px">
      <div class="sumrow"><span>Serviços (${count()})</span><span>${brl(subtotal())}</span></div>
      <div class="sumrow"><span>Duração estimada</span><span>${durLabel(duracaoTotal())}</span></div>
      ${descontoCupom()>0?`<div class="sumrow disc"><span>Cupom ${order.cupom}</span><span>- ${brl(descontoCupom())}</span></div>`:""}
      <div class="totrow"><span style="font-weight:600">Total estimado</span><span class="tv">${brl(total())}</span></div>
    </div>`;

  body.innerHTML = itemsHtml + formHtml;

  foot.innerHTML=`
    <button class="send" id="sendBtn" onclick="enviar()">
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>
      Confirmar agendamento no WhatsApp</button>
    <div class="hint">A confirmação final do horário é feita na conversa do WhatsApp.</div>`;

  renderCalendarAndSlots();
  updateSend();
}

/* ===================== FORMATO E VALIDAÇÃO ===================== */
function formatPhone(v){
  const digits = String(v||"").replace(/\D/g,"").slice(0,11);
  if(!digits) return "";
  if(digits.length <= 2) return `(${digits}`;
  if(digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if(digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
}
function handlePhoneInput(input){
  input.value = formatPhone(input.value);
  order.tel = input.value;
  clearFieldError("fieldTel");
}
function highlightFieldError(fieldId, msg){
  const el = document.getElementById(fieldId);
  if(el){
    el.classList.add("field-error", "shake");
    setTimeout(()=>el.classList.remove("shake"), 400);
    el.scrollIntoView({behavior:"smooth", block:"center"});
  }
  if(msg) toast(msg);
}
function clearFieldError(fieldId){
  const el = document.getElementById(fieldId);
  if(el) el.classList.remove("field-error");
}

// sugestões que aumentam o ticket
function suggestBlock(){
  const faltantes=["barba","pezinho","sobrancelha"].map(x=>ALL[x]).filter(it=>it && !cart.some(l=>l.id===it.id));
  if(!faltantes.length) return "";
  return `<div class="suggest"><b>Complete seu visual</b>
    <div class="sug-row">${faltantes.map(x=>`<button class="sug-chip" onclick="addServ('${x.id}')">+ ${x.n} <b>${brl(x.p)}</b></button>`).join("")}</div></div>`;
}
function incLine(id){ const l=cart.find(x=>x.lineId===id); if(l){l.qty++;onCartChange();} }
function decLine(id){ const l=cart.find(x=>x.lineId===id); if(!l)return; l.qty--; if(l.qty<=0)cart=cart.filter(x=>x!==l); onCartChange(); }
function setData(iso){
  order.data=iso;
  order.hora="";
  clearFieldError("fieldData");
  renderCalendarAndSlots();
  updateSend();
}
function setHora(t){
  order.hora=t;
  clearFieldError("slotsField");
  const slotsContainer = document.getElementById("slotsField");
  if(slotsContainer){
    slotsContainer.querySelectorAll(".slot").forEach(b => {
      b.classList.toggle("sel", b.dataset.slot === t);
    });
  }
  updateSend();
}
function setProf(p){
  order.prof=p;
  document.querySelectorAll(".prof-row .o2").forEach(b=>{
    b.classList.toggle("sel", b.textContent.includes(p));
  });
}
function setPag(p){
  order.pag=p;
  document.querySelectorAll(".pay3 .o2").forEach(b=>{
    b.classList.toggle("sel", b.textContent.includes(p));
  });
}
function aplicarCupom(){
  const code=(document.getElementById("fCupom").value||"").trim().toUpperCase();
  order.cupom=code;
  if(CONFIG.cupons[code]){ toast("Cupom aplicado: "+CONFIG.cupons[code].label); } else if(code){ toast("Cupom inválido"); order.cupom=""; }
  renderCart();
}
function updateSend(){
  const b=document.getElementById("sendBtn");
  if(!b) return;
  const telDigits = String(order.tel||"").replace(/\D/g,"");
  const ok = cart.length && order.data && order.hora && order.nome.trim().length >= 2 && telDigits.length >= 10;
  b.classList.toggle("attention", !ok && Boolean(order.data || order.nome.trim()));
}

/* ===================== ENVIO WHATSAPP ===================== */
function enviar(){
  if(!cart.length){ toast("Escolha ao menos um serviço"); return; }
  if(!order.data){
    highlightFieldError("fieldData", "Escolha a data do atendimento");
    return;
  }
  clearFieldError("fieldData");

  if(!order.hora){
    highlightFieldError("slotsField", "Escolha o horário desejado");
    return;
  }
  clearFieldError("slotsField");

  if(!order.nome.trim() || order.nome.trim().length < 2){
    highlightFieldError("fieldNome", "Digite seu nome");
    const input = document.getElementById("fNome");
    if(input) input.focus();
    return;
  }
  clearFieldError("fieldNome");

  const telDigits = String(order.tel||"").replace(/\D/g,"");
  if(!telDigits || telDigits.length < 10){
    highlightFieldError("fieldTel", "Informe seu WhatsApp com DDD (ex: 11 99999-9999)");
    const input = document.getElementById("fTel");
    if(input) input.focus();
    return;
  }
  clearFieldError("fieldTel");

  const L=[];
  L.push(`*AGENDAMENTO — ${CONFIG.nome}*`); L.push("");
  L.push(`*Cliente:* ${order.nome.trim()}`);
  L.push(`*WhatsApp:* ${order.tel.trim()}`);
  L.push(`*Data:* ${dataLabel(order.data)} às ${order.hora}`);
  L.push(`*Profissional:* ${order.prof}`);
  L.push(""); L.push("*Serviços:*");
  cart.forEach(l=>{
    L.push(`• ${l.qty}x ${l.nome} — ${brl(l.preco*l.qty)} (${durLabel(l.dur)})`);
    if(l.obs) L.push(`   _${l.obs}_`);
  });
  L.push("");
  L.push(`*Duração estimada:* ${durLabel(duracaoTotal())}`);
  if(descontoCupom()>0){ L.push(`*Subtotal:* ${brl(subtotal())}`); L.push(`*Cupom ${order.cupom}:* -${brl(descontoCupom())}`); }
  L.push(`*Total estimado:* ${brl(total())}`);
  L.push(`*Pagamento:* no local${order.pag?` (${order.pag})`:""}`);
  L.push(""); L.push("_Confirmar no WhatsApp · agendamento feito pelo site_");
  localStorage.setItem("dr_last", JSON.stringify({cart, order:{...order}}));
  localStorage.setItem("dr_nome", order.nome.trim());
  localStorage.setItem("dr_tel", order.tel.trim());
  
  const cleanWa = String(CONFIG.whatsapp).replace(/\D/g,"");
  window.open(`https://wa.me/${cleanWa}?text=`+encodeURIComponent(L.join("\n")),"_blank");
}

/* ===================== REPETIR / NOME ===================== */
function persistCart(){ localStorage.setItem("dr_cart", JSON.stringify(cart)); }
function initRepeat(){
  const nome=localStorage.getItem("dr_nome"); if(nome){ order.nome=nome; order.tel=localStorage.getItem("dr_tel")||""; }
  const last=localStorage.getItem("dr_last");
  if(last){ try{ const d=JSON.parse(last); if(d.cart&&d.cart.length){
    const btn=document.getElementById("repeatBtn"); btn.style.display="block";
    const resumo=d.cart.map(l=>l.qty+"x "+l.nome).slice(0,2).join(", ");
    btn.innerHTML=`🔁 Repetir último agendamento <b>· ${resumo}${d.cart.length>2?"…":""}</b>`;
  }}catch(e){} }
}
function repeatLast(){
  const last=localStorage.getItem("dr_last"); if(!last)return;
  try{ const d=JSON.parse(last); cart=d.cart.map(l=>({...l,lineId:"L"+Date.now()+Math.round(Math.random()*9999)}));
    if(d.order){ order.nome=d.order.nome||order.nome; order.tel=d.order.tel||order.tel; order.prof=d.order.prof||"Sem preferência"; }
    order.data=""; order.hora=""; // sempre reescolhe data/horário
    onCartChange(); openCart(); toast("Serviços do último agendamento carregados — escolha a nova data");
  }catch(e){}
}

/* ===================== DEEP LINK ?servico= ===================== */
function initDeepLink(){
  const p=new URLSearchParams(location.search).get("servico");
  if(p && ALL[p]){ setTimeout(()=>{ ALL[p].card?openServ(p):addServ(p); },350); }
}

/* ===================== SCROLLSPY ===================== */
function initSpy(){
  const links=[...document.querySelectorAll(".nav .cat-pill, .nav button, .nav a")];
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){
    links.forEach(l=>l.classList.toggle("active",l.dataset.cid===e.target.id));
    const al=links.find(l=>l.dataset.cid===e.target.id); if(al)al.scrollIntoView({inline:"center",block:"nearest"});
  }})},{rootMargin:"-45% 0px -50% 0px"});
  document.querySelectorAll(".sec").forEach(s=>io.observe(s));
}

/* ===================== PWA ===================== */
let deferredPrompt=null;
const ehMobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredPrompt=e; if(ehMobile){ document.getElementById("pwaBar").style.display="flex"; } });
function installPWA(){ if(!deferredPrompt)return; deferredPrompt.prompt(); deferredPrompt=null; document.getElementById("pwaBar").style.display="none"; }

if (location.protocol === "http:" || location.protocol === "https:") {
  // Injeta manifest apenas em servidor web
  const mLink = document.createElement("link");
  mLink.rel = "manifest";
  mLink.href = "manifest.json";
  document.head.appendChild(mLink);

  // Registra Service Worker apenas em servidor web
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(err => console.warn("SW:", err));
    });
  }
}

/* ===================== toast ===================== */
let tt; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("on"),1900); }

renderMeta(); render(); initSpy(); initRepeat(); initDeepLink();
setInterval(renderMeta,60000);
