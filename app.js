// =============================
// EPS OBSERVER - APP.JS
// Version finale — option A (réglages globaux) + per‑observable
// =============================

// --- Constantes pédagogiques (CA, APSA, observables par défaut) ---

const CHAMPS = [
  {
    id: "CA1",
    color: "var(--ca1)",
    label: "Réaliser une performance motrice maximale mesurable",
    baseAPSA: ["Course de 1/2 fond", "Course de relais", "Combiné athlétique", "Natation de vitesse"]
  },
  {
    id: "CA2",
    color: "var(--ca2)",
    label: "Adapter son déplacement à des environnements variés et incertains",
    baseAPSA: ["Escalade", "Course d’orientation", "Sauvetage aquatique"]
  },
  {
    id: "CA3",
    color: "var(--ca3)",
    label: "Créer et réaliser une prestation à visée artistique ou acrobatique",
    baseAPSA: ["Danse contemporaine", "Arts du cirque", "Acrosport", "Gymnastique au sol"]
  },
  {
    id: "CA4",
    color: "var(--ca4)",
    label: "Conduire et maîtriser un affrontement individuel ou collectif",
    baseAPSA: ["Badminton", "Tennis de table", "Boxe française", "Basket-ball", "Football", "Handball", "Rugby", "Volley-ball", "Judo"]
  },
  {
    id: "CA5",
    color: "var(--ca5)",
    label: "Réaliser et orienter son activité physique pour entretenir sa santé",
    baseAPSA: ["Course en durée", "Musculation", "Natation en durée", "Step", "Yoga"]
  }
];

const DEFAULT_OBS = {
  "Basket-ball":["Passe","Tir","Rebond","Aide défensive"],
  "Football":["Passe","Tir","Pressing","Repli défensif"],
  "Handball":["Passe","Tir","Bloc/décalage","Retour défensif"],
  "Rugby":["Passe","Avancée","Placage","Soutien"],
  "Volley-ball":["Service","Réception","Contre","Attaque"],
  "Badminton":["Service","Amorti","Dégagé","Smash"],
  "Tennis de table":["Service","Topspin","Remise","Bloc"],
  "Judo":["Saisie","Déséquilibre","Projection","Immobilisation"],
  "Boxe française":["Direct","Fouetté","Parade","Esquive"],
  "Escalade":["Lecture de voie","Appuis","Prises","Gestion de l’effort"],
  "Course d’orientation":["Lecture carte","Choix itinéraire","Précision poste","Gestion allure"],
  "Natation de vitesse":["Départ","Fréquence/Amplitude","Virage","Arrivée"],
  "Natation en durée":["Allure","Distance","Régularité","Technique"],
  "Course en durée":["Allure","Régularité","FC/ressenti","Pacing"],
  "Musculation":["Technique","Charge","Répétitions","Récupération"],
  "Step":["Complexité des pas","Synchronisation","Rythme","Sécurité"],
  "Gymnastique au sol":["Éléments","Liaisons","Amplitude","Tenue"],
  "Acrosport":["Portés","Voltige","Sécurité","Synchronisation"],
  "Danse contemporaine":["Intention","Espace","Temps","Qualité du mouvement"],
  "Arts du cirque":["Numéro","Maîtrise objet","Risque contrôlé","Présence"],
  "Combiné athlétique":["Course","Saut","Lancer","Transitions"],
  "Course de 1/2 fond":["Allure","Relances","Gestion effort","Arrivée"],
  "Course de relais":["Transmission","Placement","Allure","Coordination"],
  "Sauvetage aquatique":["Immersion","Saisie","Remorquage","Gestion effort"],
  "Yoga":["Respiration","Alignement","Stabilité","Fluidité"]
};

// Petits "hints" par CA / niveau pour étoffer l'observable
const CA_LEVEL_HINTS = {
  CA1:{1:"Découverte / allure de base",2:"Régularité & tenue",3:"Optimisation technique",4:"Stratégie & gestion d'effort"},
  CA2:{1:"Sécurité & repères",2:"Choix simples",3:"Lecture / anticipation",4:"Optimisation itinéraire / effort"},
  CA3:{1:"Exécuter",2:"Enchaîner",3:"Qualité / expressivité",4:"Intention & présence"},
  CA4:{1:"Régularité du geste",2:"Mettre en difficulté",3:"Construire / finir",4:"Stratégie & lecture adverse"},
  CA5:{1:"Entrer dans l’effort",2:"Régularité & contrôle",3:"Planification / auto-régulation",4:"Optimisation santé / perf"}
};

// --- État global de l'application ---

const STORAGE_KEY = "eps_observer_v5_state";

const appState = {
  // activité
  selectedChampId: null,
  selectedApsa: null,
  selectedLevel: 2,

  // APSA personnalisées par CA
  customApsaByChamp: {},

  // observables pour la session courante (modèle)
  // [{id,text,usePlusMinus,useLevels,useFreeText}]
  observablesTemplate: [],

  // réglages globaux d'affichage
  usePlusMinusGlobal: true,
  useLevelsGlobal: true,
  useFreeTextGlobal: true,

  // rôle courant : "observer" ou "observed"
  currentRole: null,

  // session en cours
  session: null
};

// --- Helpers simples ---

function $(id){
  return document.getElementById(id);
}

function uid(){
  return Math.random().toString(36).slice(2);
}

// --- Stockage local ---

function saveState(){
  try{
    const payload = JSON.stringify(appState);
    localStorage.setItem(STORAGE_KEY, payload);
  }catch(e){
    console.error("Erreur saveState", e);
  }
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(appState, parsed || {});
  }catch(e){
    console.warn("Impossible de charger l'état, on repart propre.");
  }
}

// --- Navigation entre pages ---

function showPage(id){
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => p.classList.remove("visible"));
  const el = $(id);
  if(el) el.classList.add("visible");
}

// --- Récupérer données utiles ---

function getChampById(id){
  return CHAMPS.find(c => c.id === id) || null;
}

function getAllApsaForChamp(champId){
  const champ = getChampById(champId);
  if(!champ) return [];
  const customs = appState.customApsaByChamp[champId] || [];
  return [...champ.baseAPSA, ...customs];
}

// Créer la liste d'observables à partir de l'APSA + niveau
function buildObservablesTemplate(apsa, niveau){
  const base = DEFAULT_OBS[apsa] || ["Observable 1","Observable 2","Observable 3"];
  const champ = CHAMPS.find(c => c.baseAPSA.includes(apsa)) || CHAMPS[3]; // CA4 par défaut
  const hints = CA_LEVEL_HINTS[champ.id] || {};
  const hint = hints[niveau] || "";
  return base.map(txt => ({
    id: uid(),
    text: hint ? `${txt} — ${hint}` : txt,
    usePlusMinus: appState.usePlusMinusGlobal,
    useLevels: appState.useLevelsGlobal,
    useFreeText: appState.useFreeTextGlobal
  }));
}

// --- Session (structure) ---
/*
 item = {
   id: observableId,
   text: "...",
   plus: 0,
   minus: 0,
   level: null,   // 1..4 ou null
   note: ""
 }
*/

function makeEmptyItemsFromTemplate(){
  return (appState.observablesTemplate || []).map(o => ({
    id: o.id,
    text: o.text,
    plus: 0,
    minus: 0,
    level: null,
    note: ""
  }));
}

function getActiveTarget(){
  if(!appState.session) return null;
  return (appState.session.targets || []).find(t => t.id === appState.session.activeTargetId) || null;
}

// Récupérer la config d'affichage d'un observable à partir de son id
function getObservableConfig(obsId){
  return (appState.observablesTemplate || []).find(o => o.id === obsId) || {
    usePlusMinus: true,
    useLevels: true,
    useFreeText: true
  };
}

// =============================
// Bloc 2 : Page Activité & Observables
// =============================

// --- Niveaux (4 ronds) ---
function renderLevelButtons(){
  const container = $("levelButtons");
  container.innerHTML = "";

  for(let lvl=1; lvl<=4; lvl++){
    const btn = document.createElement("div");
    btn.className = "level-circle";
    btn.dataset.level = lvl;
    btn.textContent = lvl;
    if(appState.selectedLevel === lvl) btn.classList.add("active");

    btn.onclick = ()=>{
      appState.selectedLevel = lvl;
      saveState();
      renderLevelButtons();
    };

    container.appendChild(btn);
  }
}

// --- Champs (CA1 → CA5) ---
function renderChampList(){
  const container = $("champList");
  container.innerHTML = "";

  CHAMPS.forEach(champ=>{
    const pill = document.createElement("div");
    pill.className = "champ-pill";
    pill.textContent = champ.id;

    if(appState.selectedChampId === champ.id)
      pill.classList.add("active");

    pill.onclick = ()=>{
      appState.selectedChampId = champ.id;
      saveState();
      renderChampList();
      renderApsaList();
    };

    container.appendChild(pill);
  });
}

// --- APSA ---
function renderApsaList(){
  const container = $("apsaList");
  container.innerHTML = "";

  if(!appState.selectedChampId) return;

  const allApsa = getAllApsaForChamp(appState.selectedChampId);

  allApsa.forEach(apsa=>{
    const pill = document.createElement("div");
    pill.className = "apsa-pill";
    pill.textContent = apsa;

    if(appState.selectedApsa === apsa)
      pill.classList.add("active");

    pill.onclick = ()=>{
      appState.selectedApsa = apsa;
      saveState();
      renderApsaList();
    };

    container.appendChild(pill);
  });
}

// --- Observables : affichage par bloc avec réglages ---

function renderObservableList(){
  const list = $("observableList");
  list.innerHTML = "";

  appState.observablesTemplate.forEach(obs=>{
    const row = document.createElement("div");
    row.className = "observable-item";

    const header = document.createElement("div");
    header.className = "observable-header";

    const nameSpan = document.createElement("span");
    nameSpan.className = "observable-name";
    nameSpan.textContent = obs.text;
    header.appendChild(nameSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-red small";
    deleteBtn.textContent = "X";
    deleteBtn.onclick = ()=>{
      appState.observablesTemplate =
        appState.observablesTemplate.filter(o=>o.id !== obs.id);
      saveState();
      renderObservableList();
    };
    header.appendChild(deleteBtn);

    row.appendChild(header);

    const controls = document.createElement("div");
    controls.className = "observable-controls";

    const pmBtn = document.createElement("button");
    pmBtn.className = "toggle-chip" + (obs.usePlusMinus ? " on" : "");
    pmBtn.textContent = "+ / –";
    pmBtn.onclick = ()=>{
      obs.usePlusMinus = !obs.usePlusMinus;
      saveState();
      renderObservableList();
    };
    controls.appendChild(pmBtn);

    const lvlBtn = document.createElement("button");
    lvlBtn.className = "toggle-chip" + (obs.useLevels ? " on" : "");
    lvlBtn.textContent = "Niveaux";
    lvlBtn.onclick = ()=>{
      obs.useLevels = !obs.useLevels;
      saveState();
      renderObservableList();
    };
    controls.appendChild(lvlBtn);

    const txtBtn = document.createElement("button");
    txtBtn.className = "toggle-chip" + (obs.useFreeText ? " on" : "");
    txtBtn.textContent = "Commentaire";
    txtBtn.onclick = ()=>{
      obs.useFreeText = !obs.useFreeText;
      saveState();
      renderObservableList();
    };
    controls.appendChild(txtBtn);

    row.appendChild(controls);
    list.appendChild(row);
  });
}

// --- Réglages globaux ---

function refreshGlobalToggleButtons(){
  const pm = $("togglePlusMinusGlobal");
  const lvl = $("toggleLevelsGlobal");
  const txt = $("toggleFreeTextGlobal");

  if(pm){
    pm.classList.toggle("on", !!appState.usePlusMinusGlobal);
  }
  if(lvl){
    lvl.classList.toggle("on", !!appState.useLevelsGlobal);
  }
  if(txt){
    txt.classList.toggle("on", !!appState.useFreeTextGlobal);
  }
}

// Appliquer les réglages globaux aux observables existants
function applyGlobalToAllObservables(){
  (appState.observablesTemplate || []).forEach(o=>{
    o.usePlusMinus = !!appState.usePlusMinusGlobal;
    o.useLevels = !!appState.useLevelsGlobal;
    o.useFreeText = !!appState.useFreeTextGlobal;
  });
}

// ---------- INITIALISATION PAGE ACTIVITÉ ----------

function initActivityPage(){
  renderLevelButtons();
  renderChampList();
  renderApsaList();
}

// =============================
// Bloc 3 : Gestion du rôle + session + UI observation
// =============================

// ---------- PAGE 4 : CHOIX DU RÔLE ----------

function setupRoleForm() {
  $("roleForm").classList.remove("hidden");

  if (appState.currentRole === "observer") {
    $("roleTitle").textContent = "Je suis observateur";
    $("roleTargetLabel").textContent = "J’observe :";
  } else {
    $("roleTitle").textContent = "Je suis observé";
    $("roleTargetLabel").textContent = "Je suis observé par :";
  }

  renderRoleTargetList();
}

function addRoleTarget() {
  const input = $("roleTargetInput");
  const txt = input.value.trim();
  if (!txt) return;

  if (!appState.sessionTargetsTemp) appState.sessionTargetsTemp = [];
  appState.sessionTargetsTemp.push(txt);

  input.value = "";
  renderRoleTargetList();
}

function renderRoleTargetList() {
  const container = $("roleTargetList");
  container.innerHTML = "";

  const arr = appState.sessionTargetsTemp || [];

  arr.forEach((name, idx) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = name;

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.onclick = () => {
      arr.splice(idx, 1);
      renderRoleTargetList();
    };

    chip.appendChild(btn);
    container.appendChild(chip);
  });
}

// ---------- CRÉATION DE LA SESSION ----------

function startSession(){
  const selfName = $("roleSelfInput").value.trim();
  if (!selfName) {
    alert("Entrez votre prénom.");
    return;
  }

  const targets = appState.sessionTargetsTemp || [];
  if (targets.length === 0) {
    alert("Ajoutez au moins une personne.");
    return;
  }

  appState.session = {
    id: uid(),
    mode: appState.currentRole, // observer | observed
    dateIso: new Date().toISOString(),
    champId: appState.selectedChampId,
    apsa: appState.selectedApsa,
    level: appState.selectedLevel,
    selfName,
    targets: [],
    activeTargetId: null
  };

  targets.forEach(name => {
    appState.session.targets.push({
      id: uid(),
      name,
      items: makeEmptyItemsFromTemplate(),
      comment: ""
    });
  });

  if (appState.session.targets.length > 0) {
    appState.session.activeTargetId = appState.session.targets[0].id;
  }

  appState.sessionTargetsTemp = [];
  $("roleSelfInput").value = "";
  $("roleTargetInput").value = "";

  saveState();
  renderObservationPage();
  showPage("page-observation");
}

// ---------- PAGE 5 : OBSERVATION ----------

function renderObservationPage() {
  if (!appState.session) return;

  const session = appState.session;

  $("sessionHeader").textContent =
    session.mode === "observer"
      ? `Je suis observateur — ${session.selfName}`
      : `Je suis observé — ${session.selfName}`;

  renderTargetTabs();
  renderObservationArea();
}

function renderTargetTabs() {
  const container = $("targetTabs");
  container.innerHTML = "";

  if (!appState.session) return;

  appState.session.targets.forEach(target => {
    const tab = document.createElement("div");
    tab.className = "target-tab";
    tab.textContent = target.name;

    if (appState.session.activeTargetId === target.id)
      tab.classList.add("active");

    tab.onclick = () => {
      appState.session.activeTargetId = target.id;
      saveState();
      renderTargetTabs();
      renderObservationArea();
    };

    container.appendChild(tab);
  });
}

function renderObservationArea() {
  const container = $("observationArea");
  container.innerHTML = "";

  const target = getActiveTarget();
  if (!target) return;

  const session = appState.session;

  const card = document.createElement("div");
  card.className = "obs-card";

  const header = document.createElement("div");
  header.className = "obs-header";

  if(session.mode === "observer"){
    header.textContent = `${session.selfName} observe ${target.name}`;
  }else{
    header.textContent = `${session.selfName} est observé par ${target.name}`;
  }

  card.appendChild(header);

  const body = document.createElement("div");
  body.className = "obs-body";

  target.items.forEach(item => {
    const cfg = getObservableConfig(item.id);
    const row = document.createElement("div");
    row.className = "obs-row";

    const title = document.createElement("div");
    title.className = "obs-row-title";
    title.textContent = item.text;
    row.appendChild(title);

    const line = document.createElement("div");
    line.className = "obs-row-line";

    if(cfg.usePlusMinus){
      const counter = document.createElement("div");
      counter.className = "counter-wrapper";

      const minusBtn = document.createElement("button");
      minusBtn.className = "counter-button";
      minusBtn.textContent = "−";
      minusBtn.onclick = () => {
        if(item.plus + item.minus > 0){
          // on diminue d'abord un plus si possible, sinon un moins
          if(item.plus > 0) item.plus -= 1;
          else if(item.minus > 0) item.minus -= 1;
          saveState();
          renderObservationArea();
        }
      };

      const value = document.createElement("span");
      value.className = "counter-value";
      value.textContent = `${item.plus}/${item.minus}`;

      const plusBtn = document.createElement("button");
      plusBtn.className = "counter-button";
      plusBtn.textContent = "+";
      plusBtn.onclick = () => {
        item.plus += 1;
        saveState();
        renderObservationArea();
      };

      counter.appendChild(minusBtn);
      counter.appendChild(value);
      counter.appendChild(plusBtn);
      line.appendChild(counter);
    }

    if(cfg.useLevels){
      const lvlGroup = document.createElement("div");
      lvlGroup.className = "level-inline";

      for (let lvl = 1; lvl <= 4; lvl++) {
        const circle = document.createElement("div");
        circle.className = "level-circle";
        circle.dataset.level = lvl;
        circle.textContent = lvl;

        if (item.level === lvl) circle.classList.add("active");

        circle.onclick = () => {
          // si on reclique sur le même niveau, on enlève la sélection
          item.level = (item.level === lvl) ? null : lvl;
          saveState();
          renderObservationArea();
        };

        lvlGroup.appendChild(circle);
      }

      line.appendChild(lvlGroup);
    }

    row.appendChild(line);

    if(cfg.useFreeText){
      const noteInput = document.createElement("textarea");
      noteInput.value = item.note || "";
      noteInput.oninput = () => {
        item.note = noteInput.value;
        saveState();
      };
      row.appendChild(noteInput);
    }

    body.appendChild(row);
  });

  const commentBlock = document.createElement("textarea");
  commentBlock.placeholder = "Commentaire global";
  commentBlock.value = target.comment || "";
  commentBlock.oninput = () => {
    target.comment = commentBlock.value;
    saveState();
  };
  body.appendChild(commentBlock);

  card.appendChild(body);
  container.appendChild(card);
}

// ---------- BOUTONS DE NAVIGATION SESSION ----------

function endSession(){
  if (!confirm("Terminer la session ? Cela ne supprime rien mais ferme le mode."))
    return;

  appState.session = null;
  saveState();
  showPage("page-cover");
}

// =============================
// Bloc 4 : Bilan + Export PDF
// =============================

function renderBilanPage() {
  const container = $("bilanContent");
  container.innerHTML = "";

  const session = appState.session;
  if (!session) return;

  const info = document.createElement("div");
  info.className = "bilan-block";
  info.innerHTML = `
    <h3>Informations séance</h3>
    <p><strong>Nom :</strong> ${session.selfName}</p>
    <p><strong>Mode :</strong> ${session.mode === "observer" ? "Je suis observateur" : "Je suis observé"}</p>
    <p><strong>APSA :</strong> ${session.apsa} — Niveau ${session.level}</p>
    <p><strong>Date :</strong> ${new Date(session.dateIso).toLocaleString()}</p>
  `;
  container.appendChild(info);

  session.targets.forEach(target => {
    const bloc = document.createElement("div");
    bloc.className = "bilan-block";

    const titre = session.mode === "observer"
      ? `${session.selfName} observe ${target.name}`
      : `${session.selfName} est observé par ${target.name}`;

    bloc.innerHTML = `<h3>${titre}</h3>`;

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");

    function addTh(text){
      const th = document.createElement("th");
      th.textContent = text;
      th.style.borderBottom = "1px solid #e5e7eb";
      th.style.padding = "4px";
      th.style.textAlign = "left";
      thead.appendChild(hr);
      hr.appendChild(th);
    }

    addTh("Observable");
    addTh("+ / –");
    addTh("Niveau");
    addTh("Commentaire");

    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    target.items.forEach(item => {
      const cfg = getObservableConfig(item.id);
      const tr = document.createElement("tr");

      function addTd(text){
        const td = document.createElement("td");
        td.textContent = text;
        td.style.padding = "4px";
        td.style.borderBottom = "1px solid #f3f4f6";
        tr.appendChild(td);
      }

      addTd(item.text);

      // +/-
      addTd(cfg.usePlusMinus ? `${item.plus}/${item.minus}` : "");

      // niveau
      addTd(cfg.useLevels && item.level != null ? `${item.level}/4` : "");

      // commentaire
      addTd(cfg.useFreeText ? (item.note || "") : "");

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    bloc.appendChild(table);

    if (target.comment) {
      const p = document.createElement("p");
      p.innerHTML = `<em>Commentaire global : ${target.comment}</em>`;
      bloc.appendChild(p);
    }

    container.appendChild(bloc);
  });
}

// ---------- EXPORT PDF ----------

function exportPDF(){
  if (!appState.session) {
    alert("Aucune session active.");
    return;
  }

  const session = appState.session;

  const pdfContent = [
    { text: "EPS OBSERVER", style: "header", alignment: "center" },
    { text: "\n" },
    {
      text: session.mode === "observer"
        ? `COMPÉTENCE D’OBSERVATEUR — ${session.selfName}`
        : `DOSSIER D’OBSERVATION — ${session.selfName}`,
      style: "title",
      alignment: "center"
    },
    { text: "\n" },
    {
      text: `APSA : ${session.apsa} — Niveau ${session.level}\nDate : ${new Date(session.dateIso).toLocaleString()}`,
      style: "subheader"
    },
    { text: "\n\n" }
  ];

  session.targets.forEach(target => {
    const titre = session.mode === "observer"
      ? `${session.selfName} observe ${target.name}`
      : `${session.selfName} est observé par ${target.name}`;

    pdfContent.push({
      text: titre,
      style: "sectionHeader"
    });

    const tableBody = [
      [
        { text: "Observable", style: "tableHeader" },
        { text: "+ / –", style: "tableHeader" },
        { text: "Niveau (1-4)", style: "tableHeader" },
        { text: "Commentaire", style: "tableHeader" }
      ]
    ];

    target.items.forEach(item => {
      const cfg = getObservableConfig(item.id);
      tableBody.push([
        item.text,
        cfg.usePlusMinus ? `${item.plus}/${item.minus}` : "",
        cfg.useLevels && item.level != null ? item.level.toString() : "",
        cfg.useFreeText ? (item.note || "") : ""
      ]);
    });

    pdfContent.push({
      style: "table",
      table: {
        widths: ["*", 50, 60, "*"],
        body: tableBody
      }
    });

    if (target.comment) {
      pdfContent.push({
        text: `\nCommentaire global : ${target.comment}`,
        italics: true
      });
    }

    pdfContent.push({ text: "\n\n" });
  });

  const styles = {
    header: { fontSize: 24, bold: true },
    title: { fontSize: 18, bold: true },
    subheader: { fontSize: 12 },
    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
    tableHeader: { bold: true, fillColor: "#eeeeee" },
    table: { margin: [0, 5, 0, 15] }
  };

  pdfMake.createPdf({ content: pdfContent, styles }).download(
    `${session.selfName}_${session.mode}_${session.apsa}.pdf`
  );
}

// =============================
// Initialisation globale & écouteurs
// =============================

function attachEventHandlers(){
  // cover
  $("btnStart").onclick = () => {
    showPage("page-activity");
    initActivityPage();
  };

  // navigation simples
  const backToCover = $("backToCover");
  if(backToCover){
    backToCover.onclick = () => showPage("page-cover");
  }
  const backToActivity = $("backToActivity");
  if(backToActivity){
    backToActivity.onclick = () => showPage("page-activity");
  }
  const backToObservables = $("backToObservables");
  if(backToObservables){
    backToObservables.onclick = () => showPage("page-observables");
  }
  const backToRole = $("backToRole");
  if(backToRole){
    backToRole.onclick = () => showPage("page-role");
  }
  const backToSession = $("backToSession");
  if(backToSession){
    backToSession.onclick = () => showPage("page-observation");
  }

  // activité
  const addApsaBtn = $("addApsaBtn");
  if(addApsaBtn){
    addApsaBtn.onclick = ()=>{
      const txt = $("addApsaInput").value.trim();
      if(!txt || !appState.selectedChampId) return;

      if(!appState.customApsaByChamp[appState.selectedChampId])
        appState.customApsaByChamp[appState.selectedChampId] = [];

      appState.customApsaByChamp[appState.selectedChampId].push(txt);
      $("addApsaInput").value = "";
      saveState();
      renderApsaList();
    };
  }

  const btnToObservables = $("btnToObservables");
  if(btnToObservables){
    btnToObservables.onclick = ()=>{
      if(!appState.selectedChampId || !appState.selectedApsa){
        alert("Sélectionnez un CA et une APSA.");
        return;
      }
      appState.observablesTemplate = buildObservablesTemplate(
        appState.selectedApsa,
        appState.selectedLevel
      );
      saveState();
      $("obsApsaLabel").textContent =
        `APSA : ${appState.selectedApsa} (Niveau ${appState.selectedLevel})`;
      refreshGlobalToggleButtons();
      renderObservableList();
      showPage("page-observables");
    };
  }

  // réglages globaux observables
  const tPM = $("togglePlusMinusGlobal");
  if(tPM){
    tPM.onclick = () => {
      appState.usePlusMinusGlobal = !appState.usePlusMinusGlobal;
      saveState();
      refreshGlobalToggleButtons();
    };
  }
  const tLvl = $("toggleLevelsGlobal");
  if(tLvl){
    tLvl.onclick = () => {
      appState.useLevelsGlobal = !appState.useLevelsGlobal;
      saveState();
      refreshGlobalToggleButtons();
    };
  }
  const tTxt = $("toggleFreeTextGlobal");
  if(tTxt){
    tTxt.onclick = () => {
      appState.useFreeTextGlobal = !appState.useFreeTextGlobal;
      saveState();
      refreshGlobalToggleButtons();
    };
  }

  const applyAll = $("applyGlobalToAll");
  if(applyAll){
    applyAll.onclick = () => {
      applyGlobalToAllObservables();
      saveState();
      renderObservableList();
    };
  }

  const addObservableBtn = $("addObservableBtn");
  if(addObservableBtn){
    addObservableBtn.onclick = ()=>{
      const txt = $("addObservableInput").value.trim();
      if(!txt) return;

      appState.observablesTemplate.push({
        id: uid(),
        text: txt,
        usePlusMinus: appState.usePlusMinusGlobal,
        useLevels: appState.useLevelsGlobal,
        useFreeText: appState.useFreeTextGlobal
      });

      $("addObservableInput").value = "";
      saveState();
      renderObservableList();
    };
  }

  const btnToRole = $("btnToRole");
  if(btnToRole){
    btnToRole.onclick = ()=>{
      showPage("page-role");
    };
  }

  // rôle
  const roleObserver = $("roleObserver");
  if(roleObserver){
    roleObserver.onclick = () => {
      appState.currentRole = "observer";
      saveState();
      setupRoleForm();
    };
  }
  const roleObserved = $("roleObserved");
  if(roleObserved){
    roleObserved.onclick = () => {
      appState.currentRole = "observed";
      saveState();
      setupRoleForm();
    };
  }

  const roleTargetInput = $("roleTargetInput");
  if(roleTargetInput){
    roleTargetInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addRoleTarget();
      }
    });
  }

  const btnStartSession = $("btnStartSession");
  if(btnStartSession){
    btnStartSession.onclick = () => startSession();
  }

  // observation
  const btnAddTarget = $("btnAddTarget");
  if(btnAddTarget){
    btnAddTarget.onclick = () => {
      if(!appState.session){
        alert("Commencez d'abord une session.");
        return;
      }
      const name = prompt("Nom de la personne :");
      if (!name) return;

      const newTarget = {
        id: uid(),
        name,
        items: makeEmptyItemsFromTemplate(),
        comment: ""
      };
      appState.session.targets.push(newTarget);
      appState.session.activeTargetId = newTarget.id;
      saveState();
      renderTargetTabs();
      renderObservationArea();
    };
  }

  const btnToBilan = $("btnToBilan");
  if(btnToBilan){
    btnToBilan.onclick = () => {
      renderBilanPage();
      showPage("page-bilan");
    };
  }

  const btnEndSession = $("btnEndSession");
  if(btnEndSession){
    btnEndSession.onclick = () => endSession();
  }

  const btnExportPDF = $("btnExportPDF");
  if(btnExportPDF){
    btnExportPDF.onclick = () => exportPDF();
  }
}

// Au chargement du script
loadState();
attachEventHandlers();
// On reste sur la page cover, déjà visible dans le HTML
