/**
 * Barbearia Dom Rocha — Módulo de Calendário e Horários (calendar.js)
 */

import { CONFIG } from "./config.js";

export const DIAS_SEM = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
export const DIAS_SEMANA_SIGLAS = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
export const MESES_EXTENSO = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export let currentCalendarMonth = new Date().getMonth();
export let currentCalendarYear = new Date().getFullYear();

export function setCalendarMonth(y, m){
  currentCalendarYear = y;
  currentCalendarMonth = m;
}

export function statusLoja(){
  const now = new Date();
  const dia = now.getDay();
  const [ah, am] = CONFIG.horario.abre.split(":").map(Number);
  const [fh, fm] = CONFIG.horario.fecha.split(":").map(Number);
  const min = now.getHours() * 60 + now.getMinutes();
  const aberto = CONFIG.horario.dias.includes(dia) && min >= ah * 60 + am && min < fh * 60 + fm;
  let proximo = "";
  if(!aberto){
    for(let i = 0; i < 7; i++){
      const d = (dia + i) % 7;
      if(CONFIG.horario.dias.includes(d)){
        if(i === 0 && min < ah * 60 + am){
          proximo = "hoje às " + CONFIG.horario.abre;
          break;
        }
        if(i === 0) continue;
        proximo = (i === 1 ? "amanhã" : ["dom","seg","ter","qua","qui","sex","sáb"][d]) + " às " + CONFIG.horario.abre;
        break;
      }
    }
  }
  return { aberto, proximo };
}

export function slotsDoDia(iso){
  const [ah, am] = CONFIG.horario.abre.split(":").map(Number);
  const [fh, fm] = CONFIG.horario.fecha.split(":").map(Number);
  const ini = ah * 60 + am, fim = fh * 60 + fm, step = CONFIG.horario.slot;
  const now = new Date();
  const hojeIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out = [];
  for(let m = ini; m <= fim - step; m += step){
    const passou = (iso === hojeIso) && (m <= nowMin + 15); // 15min de tolerância
    out.push({
      t: String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"),
      off: passou
    });
  }
  return out;
}

export function getFirstValidDate(){
  const d = new Date();
  d.setHours(0,0,0,0);
  const max = CONFIG.diasFrente || 14;
  for(let i = 0; i < max; i++){
    if(CONFIG.horario.dias.includes(d.getDay())){
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const slots = slotsDoDia(iso);
      if(slots.some(s => !s.off)) return iso;
    }
    d.setDate(d.getDate() + 1);
  }
  return "";
}

export function dataLabel(iso){
  if(!iso) return "";
  const [y, m, dd] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, dd);
  return `${DIAS_SEM[dt.getDay()]}, ${String(dd).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function dataContextual(iso){
  if(!iso) return "";
  const [y, m, dd] = iso.split("-").map(Number);
  const now = new Date();
  const hojeIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if(iso === hojeIso) return `Hoje (${dd} de ${MESES_EXTENSO[m - 1]})`;
  return `${dd} de ${MESES_EXTENSO[m - 1]}`;
}

export function renderIOSCalendar(container, selectedDate, onSelectDate, onCalendarStateChange){
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

  for(let i = 0; i < firstDayIndex; i++){
    html += `<div class="cal-empty"></div>`;
  }

  for(let day = 1; day <= daysInMonth; day++){
    const thisDate = new Date(currentCalendarYear, currentCalendarMonth, day);
    thisDate.setHours(0,0,0,0);
    const iso = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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
    const isSelected = selectedDate === iso;

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
      if(onCalendarStateChange) onCalendarStateChange();
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
      if(onCalendarStateChange) onCalendarStateChange();
    });
  }

  container.querySelectorAll(".cal-day:not(.disabled)").forEach(btn => {
    btn.addEventListener("click", () => {
      const iso = btn.dataset.date;
      if(!iso) return;
      if(onSelectDate) onSelectDate(iso);
    });
  });
}

export function renderSlots(container, selectedDate, selectedSlot, onSelectSlot){
  if(!container) return;
  if(!selectedDate){
    container.innerHTML = `<div class="pick-hint">Selecione uma data acima para visualizar os horários disponíveis.</div>`;
    return;
  }
  const slots = slotsDoDia(selectedDate);
  const availableSlots = slots.filter(s => !s.off);

  let html = `
    <div class="slots-wrap">
      <div class="slots-title">Horários disponíveis para <b>${dataContextual(selectedDate)}</b>:</div>
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
                  class="slot ${selectedSlot === sl.t ? 'sel' : ''}"
                  ${sl.off ? 'disabled' : ''}
                  data-slot="${sl.t}"
                  onclick="window.setHora('${sl.t}')">
            ${sl.t}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}
