
import {CHAMPS, DEFAULT_OBS} from './data.js';
const KEY = "eps_multi_observer_v1";

export function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || def(); }catch(e){ return def(); } }
export function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
export function def(){ return {
  observers: [],
  selectedChamp: null,
  apsaByChamp: {},
  selectedAPSA: null,
  observables: [],
  observations: [],
  group: [],
}; }

export function chips(container, items, onRemove){
  container.innerHTML = "";
  items.forEach((txt, i)=>{
    const span = document.createElement("span");
    span.className="badge"; span.textContent=txt;
    const b=document.createElement("button"); b.className="btn btn-gray"; b.textContent="×"; b.style.marginLeft="8px";
    b.onclick=()=>onRemove(i);
    const wrap=document.createElement("span"); wrap.style.display="inline-flex"; wrap.style.alignItems="center"; wrap.style.gap="6px";
    wrap.append(span,b); container.append(wrap);
  });
}

export function parseNames(raw){
  return (raw||"").replace(/\r\n?/g,"\n").split(/[ ,;\n]+/).map(s=>s.trim()).filter(Boolean);
}

export function ensureApsaList(state, champId){
  if(!state.apsaByChamp[champId]){
    const base = (CHAMPS.find(c=>c.id===champId)?.baseAPSA || []).slice();
    state.apsaByChamp[champId] = base;
  }
  return state.apsaByChamp[champId];
}

export function ensureObservablesFor(state, apsaName){
  if(!state.observables.length || state.currentFor !== apsaName){
    state.currentFor = apsaName;
    state.observables = (DEFAULT_OBS[apsaName] || ["Observable 1","Observable 2"]).map(t=>({text:t,pos:0,neg:0,level:"moyen"}));
  }
  return state.observables;
}

export function mastery3Buttons(current, onPick){
  const wrap=document.createElement("div"); wrap.className="fmb";
  [["fragile","🔴 Fragile"],["moyen","🟡 Moyen"],["bon","🟢 Bon"]].forEach(([v,lab])=>{
    const b=document.createElement("button"); b.textContent=lab; b.className = (current===v)?"active":"";
    b.onclick=()=>onPick(v);
    wrap.append(b);
  });
  return wrap;
}

export function exportPDF(observation){
  const w=window.open("","_blank");
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bilan EPS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"><style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto; margin:24px}
  h1{font-size:20px;margin:0 0 8px 0}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}
  </style></head><body>`);
  const names = (observation.observers||[]).join(", ");
  w.document.write(`<h1>Observation — ${observation.apsa}</h1>`);
  w.document.write(`<div><b>Date:</b> ${new Date(observation.date).toLocaleString()} • <b>Observateurs:</b> ${names||"—"}</div>`);
  w.document.write(`<div><b>Groupe:</b> ${(observation.group||[]).join(", ")||"—"}</div>`);
  w.document.write(`<table><thead><tr><th>Observable</th><th>+</th><th>-</th><th>Niveau (🔴/🟡/🟢)</th></tr></thead><tbody>`);
  observation.items.forEach(it=>{
    w.document.write(`<tr><td>${it.text}</td><td>${it.pos}</td><td>${it.neg}</td><td>${it.level}</td></tr>`);
  });
  w.document.write(`</tbody></table></body></html>`);
  w.document.close(); w.focus(); w.print();
}
