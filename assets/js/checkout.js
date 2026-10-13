/**
 * Barbearia Dom Rocha — Módulo de Checkout e Validação (checkout.js)
 */

export function formatPhone(v){
  const digits = String(v || "").replace(/\D/g, "").slice(0, 11);
  if(!digits) return "";
  if(digits.length <= 2) return `(${digits}`;
  if(digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if(digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function handlePhoneInput(input, orderRef, clearErrorFn){
  if(!input) return;
  const formatted = formatPhone(input.value);
  input.value = formatted;
  if(orderRef) orderRef.tel = formatted;
  if(clearErrorFn) clearErrorFn("fieldTel");
}

export function highlightFieldError(fieldId, msg, toastFn){
  const el = document.getElementById(fieldId);
  if(el){
    el.classList.add("field-error", "shake");
    setTimeout(() => el.classList.remove("shake"), 400);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if(msg && typeof toastFn === "function"){
    toastFn(msg);
  }
}

export function clearFieldError(fieldId){
  const el = document.getElementById(fieldId);
  if(el) el.classList.remove("field-error");
}

export function validateBookingForm(cart, order, toastFn){
  if(!cart.length){
    if(toastFn) toastFn("Escolha ao menos um serviço no catálogo");
    return false;
  }
  if(!order.data){
    highlightFieldError("fieldData", "Escolha a data do atendimento", toastFn);
    return false;
  }
  clearFieldError("fieldData");

  if(!order.hora){
    highlightFieldError("slotsField", "Escolha o horário desejado", toastFn);
    return false;
  }
  clearFieldError("slotsField");

  if(!order.nome.trim() || order.nome.trim().length < 2){
    highlightFieldError("fieldNome", "Digite seu nome", toastFn);
    const input = document.getElementById("fNome");
    if(input) input.focus();
    return false;
  }
  clearFieldError("fieldNome");

  const telDigits = String(order.tel || "").replace(/\D/g, "");
  if(!telDigits || telDigits.length < 10){
    highlightFieldError("fieldTel", "Informe seu WhatsApp com DDD (ex: 11 99999-9999)", toastFn);
    const input = document.getElementById("fTel");
    if(input) input.focus();
    return false;
  }
  clearFieldError("fieldTel");

  return true;
}
