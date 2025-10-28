
import {EXPERIENCES, DEFAULT_OBS} from './data.js';
const KEY = "eps_observer_full_v1";

export function uid(){ return Math.random().toString(36).slice(2); }
export function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || def(); }catch(e){ return def(); } }
export function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
export function def(){ return { context:{champ:"", apsa:"", observer:"", group:""}, pages:{}, custom:{}, saved:[] }; }

export function ensurePage(state, expId, ppsaName){
  state.pages[expId] = state.pages[expId] || {};
  const pagesForExp = state.pages[expId];
  if(!pagesForExp[ppsaName]){
    const preset = (DEFAULT_OBS[ppsaName]||["Observable 1","Observable 2","Observable 3"]).map(t=>({id:uid(), text:t, pos:0, neg:0, mastery:"moyen"}));
    pagesForExp[ppsaName] = { observables: preset };
  }
  return pagesForExp[ppsaName];
}

export function makeNav(active){
  const tabs=[
    {href:"/index.html", icon:"🏠", label:"Accueil"},
    {href:"/export.html", icon:"📄", label:"Export"},
    {href:"/manage.html", icon:"➕", label:"Ajouter"}
  ];
  const nav=document.createElement("nav"); nav.className="navbar";
  tabs.forEach(t=>{
    const a=document.createElement("a"); a.href=t.href; a.className="nav-item"+(active===t.label?" active":"");
    const i=document.createElement("div"); i.className="nav-icon"; i.textContent=t.icon;
    const s=document.createElement("div"); s.textContent=t.label;
    a.append(i,s); nav.append(a);
  });
  return nav;
}

export function masteryChips(o, onChange){
  const wrap = document.createElement("div"); wrap.className="mastery";
  [["fragile","🔴 Fragile"],["moyen","🟡 Moyen"],["bon","🟢 Bon"],["tb","🔵 Très Bon"]].forEach(([v,lab])=>{
    const c=document.createElement("div"); c.className="chip"+(o.mastery===v?" active":""); c.dataset.v=v; c.textContent=lab; c.onclick=()=>{ o.mastery=v; onChange&&onChange(); };
    wrap.append(c);
  });
  return wrap;
}

export function obsRow(o, onChange){
  const row=document.createElement("div"); row.className="obs-item"; row.dataset.id=o.id;
  const name=document.createElement("div"); name.className="obs-name"; name.textContent=o.text;
  const plus=document.createElement("button"); plus.className="btn buzzer btn-good"; plus.textContent="+";
  const pos=document.createElement("div"); pos.className="count"; pos.textContent=o.pos;
  const minus=document.createElement("button"); minus.className="btn buzzer btn-danger"; minus.textContent="-";
  const neg=document.createElement("div"); neg.className="count"; neg.textContent=o.neg;

  plus.onclick=()=>{ o.pos++; pos.textContent=o.pos; onChange&&onChange(); };
  minus.onclick=()=>{ o.neg++; neg.textContent=o.neg; onChange&&onChange(); };

  // swipe
  let sx=null, sy=null;
  row.addEventListener("touchstart",(e)=>{ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; }, {passive:true});
  row.addEventListener("touchend",(e)=>{
    if(sx==null) return; const t=e.changedTouches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy;
    if(Math.abs(dx)>30 && Math.abs(dy)<40){ if(dx>0){ o.pos++; pos.textContent=o.pos; } else { o.neg++; neg.textContent=o.neg; } onChange&&onChange(); }
    sx=sy=null;
  }, {passive:true});

  row.append(name, masteryChips(o,onChange), plus, pos, minus, neg);
  return row;
}

export function buildPDF(state){
  const w=window.open("","_blank");
  const c=state.context;
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bilan EPS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:8px;text-align:left}th{background:#eee}</style>
  </head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto;padding:24px">`);
  w.document.write(`<h2>Bilan d'observation</h2>`);
  w.document.write(`<div><b>Date:</b> ${new Date().toLocaleString()} • <b>Observateur:</b> ${c.observer||"—"} • <b>Groupe:</b> ${(c.group||"")}</div>`);

  Object.entries(state.pages).forEach(([expId, map])=>{
    w.document.write(`<h3 style="margin-top:16px">${expId}</h3>`);
    Object.entries(map).forEach(([ppsaName, page])=>{
      w.document.write(`<h4>${ppsaName}</h4>`);
      w.document.write(`<table><thead><tr><th>Observable</th><th>+</th><th>-</th><th>Niveau</th></tr></thead><tbody>`);
      page.observables.forEach(o=>{
        w.document.write(`<tr><td>${o.text}</td><td>${o.pos}</td><td>${o.neg}</td><td>${o.mastery}</td></tr>`);
      });
      w.document.write(`</tbody></table>`);
    });
  });

  w.document.write(`</body></html>`); w.document.close(); w.focus(); w.print();
}
