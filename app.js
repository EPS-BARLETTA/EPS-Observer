// =============================
// EPS OBSERVER - APP.JS
// Version avec couleurs, options in situ, bilan + page print.html
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

// Palette de couleurs pour différencier les observables
const OBS_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#f97373"
];

// --- État global de l'application ---

const STORAGE_KEY = "eps_observer_v5_state";

const appState = {
  // activité
  selectedChampId: null,
  selectedApsa: null,
  selectedLevel: 2,

  customApsaByChamp: {},

  // observables pour la session (modèle)
  // chaque observable : {id,text,useComment,usePlusMinus,useLevels,color}
  observablesTemplate: [],

  currentRole: null,

  session: null,

  sessionTargetsTemp: []
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

  return base.map((txt, index) => ({
    id: uid(),
    text: hint ? `${txt} — ${hint}` : txt,
    useComment: true,
    usePlusMinus: true,    // tous activés par défaut
    useLevels: true,
    color: OBS_COLORS[index % OBS_COLORS.length]
  }));
}

// --- Session helpers ---

function makeEmptyItemsFromTemplate(){
  return (appState.observablesTemplate || []).map(o => ({
    id: o.id,
    text: o.text,
    plus: 0,
    minus: 0,
    level: null,
    note: "",
    useComment: (typeof o.useComment === "boolean") ? o.useComment : true,
    usePlusMinus: (typeof o.usePlusMinus === "boolean") ? o.usePlusMinus : true,
    useLevels: (typeof o.useLevels === "boolean") ? o.useLevels : true,
    color: o.color || null
  }));
}

function getActiveTarget(){
  if(!appState.session) return null;
  return (appState.session.targets || []).find(
    t => t.id === appState.session.activeTargetId
  ) || null;
}

// Charger l'état au démarrage
loadState();

// =============================
// Bloc 2/4 : Page Activité & Observables
// =============================

// ---------- PAGE 2 : ACTIVITÉ ----------

function renderLevelButtons(){
  const container = $("levelButtons");
  if(!container) return;
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

function renderChampList(){
  const container = $("champList");
  if(!container) return;
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

function renderApsaList(){
  const container = $("apsaList");
  if(!container) return;
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

// Ajouter une APSA
const addApsaBtn = $("addApsaBtn");
if(addApsaBtn){
  addApsaBtn.onclick = ()=>{
    const input = $("addApsaInput");
    if(!input) return;
    const txt = input.value.trim();
    if(!txt || !appState.selectedChampId) return;

    if(!appState.customApsaByChamp[appState.selectedChampId])
      appState.customApsaByChamp[appState.selectedChampId] = [];

    appState.customApsaByChamp[appState.selectedChampId].push(txt);
    input.value = "";
    saveState();
    renderApsaList();
  };
}

// Aller aux observables
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
    renderObservableList();
    const label = $("obsApsaLabel");
    if(label){
      label.textContent = `APSA : ${appState.selectedApsa} (Niveau ${appState.selectedLevel})`;
    }
    showPage("page-observables");
  };
}

// Retour couverture
const btnBackToCover = $("btnBackToCover");
if(btnBackToCover){
  btnBackToCover.onclick = ()=>{
    showPage("page-cover");
  };
}

// ---------- PAGE 3 : OBSERVABLES ----------

function renderObservableList(){
  const list = $("observableList");
  if(!list) return;
  list.innerHTML = "";

  appState.observablesTemplate.forEach((obs, index)=>{
    if(typeof obs.useComment !== "boolean") obs.useComment = true;
    if(typeof obs.usePlusMinus !== "boolean") obs.usePlusMinus = true;
    if(typeof obs.useLevels !== "boolean") obs.useLevels = true;
    if(!obs.color){
      obs.color = OBS_COLORS[index % OBS_COLORS.length];
    }

    const card = document.createElement("div");
    card.className = "obs-config-card";
    card.style.borderLeft = `6px solid ${obs.color}`;

    const header = document.createElement("div");
    header.className = "obs-config-header";

    const input = document.createElement("input");
    input.type = "text";
    input.value = obs.text;
    input.oninput = ()=>{
      obs.text = input.value;
      saveState();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-red small";
    delBtn.textContent = "Suppr.";
    delBtn.onclick = ()=>{
      appState.observablesTemplate =
        appState.observablesTemplate.filter(o=>o.id !== obs.id);
      saveState();
      renderObservableList();
    };

    header.appendChild(input);
    header.appendChild(delBtn);
    card.appendChild(header);

    const opts = document.createElement("div");
    opts.className = "obs-config-options";

    const optComment = document.createElement("label");
    const chkComment = document.createElement("input");
    chkComment.type = "checkbox";
    chkComment.checked = obs.useComment;
    chkComment.onchange = ()=>{
      obs.useComment = chkComment.checked;
      saveState();
    };
    optComment.appendChild(chkComment);
    optComment.appendChild(document.createTextNode("Commentaire"));

    const optPM = document.createElement("label");
    const chkPM = document.createElement("input");
    chkPM.type = "checkbox";
    chkPM.checked = obs.usePlusMinus;
    chkPM.onchange = ()=>{
      obs.usePlusMinus = chkPM.checked;
      saveState();
    };
    optPM.appendChild(chkPM);
    optPM.appendChild(document.createTextNode("Compteur +/-"));

    const optLevels = document.createElement("label");
    const chkLv = document.createElement("input");
    chkLv.type = "checkbox";
    chkLv.checked = obs.useLevels;
    chkLv.onchange = ()=>{
      obs.useLevels = chkLv.checked;
      saveState();
    };
    optLevels.appendChild(chkLv);
    optLevels.appendChild(document.createTextNode("Niveaux 1–4"));

    opts.appendChild(optComment);
    opts.appendChild(optPM);
    opts.appendChild(optLevels);

    card.appendChild(opts);
    list.appendChild(card);
  });
}

// Ajouter un observable
const addObservableBtn = $("addObservableBtn");
if(addObservableBtn){
  addObservableBtn.onclick = ()=>{
    const input = $("addObservableInput");
    if(!input) return;
    const txt = input.value.trim();
    if(!txt) return;

    const index = appState.observablesTemplate.length;
    appState.observablesTemplate.push({
      id: uid(),
      text: txt,
      useComment: true,
      usePlusMinus: true,
      useLevels: true,
      color: OBS_COLORS[index % OBS_COLORS.length]
    });

    input.value = "";
    saveState();
    renderObservableList();
  };
}

// Options globales
const btnApplyGlobalOptions = $("btnApplyGlobalOptions");
if(btnApplyGlobalOptions){
  btnApplyGlobalOptions.onclick = ()=>{
    const useComment = $("globalUseComment")?.checked ?? true;
    const usePlusMinus = $("globalUsePlusMinus")?.checked ?? true;
    const useLevels = $("globalUseLevels")?.checked ?? true;

    appState.observablesTemplate = (appState.observablesTemplate || []).map(o=>({
      ...o,
      useComment,
      usePlusMinus,
      useLevels
    }));
    saveState();
    renderObservableList();
  };
}

// Page suivante → rôle
const btnToRole = $("btnToRole");
if(btnToRole){
  btnToRole.onclick = ()=>{
    showPage("page-role");
  };
}

// Retour activité
const btnBackToActivity = $("btnBackToActivity");
if(btnBackToActivity){
  btnBackToActivity.onclick = ()=>{
    showPage("page-activity");
  };
}

function initActivityPage(){
  renderLevelButtons();
  renderChampList();
  renderApsaList();

  const gpm = $("globalUsePlusMinus");
  if (gpm) gpm.checked = true;
}

// =============================
// Bloc 3/4 : Gestion du rôle + session + UI observation
// =============================

// PAGE 4 : CHOIX DU RÔLE

const roleObserverBtn = $("roleObserver");
if(roleObserverBtn){
  roleObserverBtn.onclick = () => {
    appState.currentRole = "observer";
    saveState();
    setupRoleForm();
  };
}

const roleObservedBtn = $("roleObserved");
if(roleObservedBtn){
  roleObservedBtn.onclick = () => {
    appState.currentRole = "observed";
    saveState();
    setupRoleForm();
  };
}

function setupRoleForm() {
  const form = $("roleForm");
  if(!form) return;
  form.classList.remove("hidden");

  if (appState.currentRole === "observer") {
    $("roleTitle").textContent = "Je suis observateur";
    $("roleTargetLabel").textContent = "J’observe :";
  } else {
    $("roleTitle").textContent = "Je suis observé";
    $("roleTargetLabel").textContent = "Je suis observé par :";
  }

  renderRoleTargetList();
}

// Retour observables
const btnBackToObservables = $("btnBackToObservables");
if(btnBackToObservables){
  btnBackToObservables.onclick = ()=>{
    showPage("page-observables");
  };
}

// Ajout de cibles
const roleTargetInput = $("roleTargetInput");
if(roleTargetInput){
  roleTargetInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRoleTarget();
    }
  });
}

function addRoleTarget() {
  const input = $("roleTargetInput");
  if(!input) return;
  const txt = input.value.trim();
  if (!txt) return;

  appState.sessionTargetsTemp.push(txt);

  input.value = "";
  renderRoleTargetList();
}

function renderRoleTargetList() {
  const container = $("roleTargetList");
  if(!container) return;
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

// CRÉATION SESSION

const btnStartSession = $("btnStartSession");
if(btnStartSession){
  btnStartSession.onclick = () => {
    const selfInput = $("roleSelfInput");
    const selfName = selfInput ? selfInput.value.trim() : "";
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
      mode: appState.currentRole,
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
    if(selfInput) selfInput.value = "";
    if(roleTargetInput) roleTargetInput.value = "";
    const list = $("roleTargetList");
    if(list) list.innerHTML = "";

    saveState();
    renderObservationPage();
    showPage("page-observation");
  };
}

// PAGE 5 : OBSERVATION

function renderObservationPage() {
  if (!appState.session) return;

  const session = appState.session;
  const header = $("sessionHeader");
  if(header){
    header.textContent =
      session.mode === "observer"
        ? `Je suis observateur — ${session.selfName}`
        : `Je suis observé — ${session.selfName}`;
  }

  renderTargetTabs();
  renderObservationArea();
}

// ajout de personne en cours de séance
const btnAddTarget = $("btnAddTarget");
if(btnAddTarget){
  btnAddTarget.onclick = () => {
    if (!appState.session) return;
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

function renderTargetTabs() {
  const container = $("targetTabs");
  if(!container) return;
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

function ensureItemColor(target, item){
  if(item.color) return item.color;

  const tpl = (appState.observablesTemplate || []).find(o=>o.id === item.id);
  if(tpl && tpl.color){
    item.color = tpl.color;
    return item.color;
  }

  const idx = target.items.indexOf(item);
  item.color = OBS_COLORS[idx % OBS_COLORS.length];
  return item.color;
}

function renderObservationArea() {
  const container = $("observationArea");
  if(!container) return;
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

  target.items.forEach((item) => {
    if(typeof item.plus !== "number") item.plus = 0;
    if(typeof item.minus !== "number") item.minus = 0;
    if(typeof item.useComment !== "boolean") item.useComment = true;
    if(typeof item.usePlusMinus !== "boolean") item.usePlusMinus = true;
    if(typeof item.useLevels !== "boolean") item.useLevels = true;
    if(typeof item.level !== "number") item.level = null;

    const color = ensureItemColor(target, item);

    const row = document.createElement("div");
    row.className = "obs-row";
    row.style.borderLeftColor = color;

    // Libellé observable centré + couleur
    const label = document.createElement("div");
    label.textContent = item.text;
    label.classList.add("centered");
    label.style.paddingLeft = "4px";
    row.appendChild(label);

    // Options locales (compteur / niveau / commentaire)
    const optRow = document.createElement("div");
    optRow.className = "obs-live-options";

    const buildOpt = (prop, text)=>{
      const lab = document.createElement("label");

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = item[prop];

      chk.onchange = ()=>{
        item[prop] = chk.checked;
        saveState();
        renderObservationArea();
      };

      lab.appendChild(chk);
      lab.appendChild(document.createTextNode(text));
      return lab;
    };

    optRow.appendChild(buildOpt("usePlusMinus", "Compteur"));
    optRow.appendChild(buildOpt("useLevels", "Niveaux"));
    optRow.appendChild(buildOpt("useComment", "Commentaire"));

    row.appendChild(optRow);

    // Ligne de contrôles
    const controlsRow = document.createElement("div");
    controlsRow.className = "obs-controls-row";

    // Groupe compteur (un seul compteur + / -)
    if(item.usePlusMinus){
      const pmGroup = document.createElement("div");
      pmGroup.className = "pm-group";

      const pmRow = document.createElement("div");
      pmRow.className = "pm-row";

      const decBtn = document.createElement("button");
      decBtn.className = "pm-btn pm-minus";
      decBtn.textContent = "−";

      const countSpan = document.createElement("span");
      countSpan.className = "pm-count";
      countSpan.textContent = item.plus; // affiche uniquement le nombre de "+"

      const incBtn = document.createElement("button");
      incBtn.className = "pm-btn pm-plus";
      incBtn.textContent = "+";

      decBtn.onclick = ()=>{
        if(item.plus > 0) item.plus--;
        countSpan.textContent = item.plus;
        saveState();
      };

      incBtn.onclick = ()=>{
        item.plus++;
        countSpan.textContent = item.plus;
        saveState();
      };

      pmRow.appendChild(decBtn);
      pmRow.appendChild(countSpan);
      pmRow.appendChild(incBtn);

      pmGroup.appendChild(pmRow);
      controlsRow.appendChild(pmGroup);
    }

    // Niveaux 1-4 à droite
    if(item.useLevels){
      const levelGroup = document.createElement("div");
      levelGroup.style.display = "flex";
      levelGroup.style.gap = "4px";
      levelGroup.style.marginLeft = "auto";

      for (let lvl = 1; lvl <= 4; lvl++) {
        const circle = document.createElement("div");
        circle.className = "level-circle";
        circle.dataset.level = lvl;
        circle.textContent = lvl;

        if (item.level === lvl) circle.classList.add("active");

        circle.onclick = () => {
          item.level = lvl;
          saveState();
          renderObservationArea();
        };

        levelGroup.appendChild(circle);
      }

      controlsRow.appendChild(levelGroup);
    }

    if(controlsRow.childElementCount > 0){
      row.appendChild(controlsRow);
    }

    // Commentaire individuel
    if(item.useComment){
      const noteInput = document.createElement("textarea");
      noteInput.placeholder = "Note / commentaire pour cet observable";
      noteInput.value = item.note || "";
      noteInput.oninput = () => {
        item.note = noteInput.value;
        saveState();
      };
      row.appendChild(noteInput);
    }

    body.appendChild(row);
  });

  // Commentaire global pour la personne
  const commentBlock = document.createElement("textarea");
  commentBlock.placeholder = "Commentaire global pour " + target.name;
  commentBlock.value = target.comment;
  commentBlock.oninput = () => {
    target.comment = commentBlock.value;
    saveState();
  };

  body.appendChild(commentBlock);

  card.appendChild(body);
  container.appendChild(card);
}

// NAVIGATION OBS / BILAN

const btnToBilan = $("btnToBilan");
if(btnToBilan){
  btnToBilan.onclick = () => {
    renderBilanPage();
    showPage("page-bilan");
  };
}

const btnBackToSession = $("btnBackToSession");
if(btnBackToSession){
  btnBackToSession.onclick = () => {
    showPage("page-observation");
  };
}

const btnEndSession = $("btnEndSession");
if(btnEndSession){
  btnEndSession.onclick = () => {
    if (!confirm("Terminer la session ? Cela ne supprime rien mais ferme le mode.")) return;

    appState.session = null;
    saveState();
    showPage("page-cover");
  };
}

// =============================
// Bloc 4/4 : Bilan (HTML) + Export print.html
// =============================

function renderBilanPage() {
  const container = $("bilanContent");
  if(!container) return;
  container.innerHTML = "";

  const session = appState.session;
  if (!session) return;

  const info = document.createElement("div");
  info.className = "bilan-block";
  info.innerHTML = `
    <h3>Informations séance</h3>
    <p><strong>Nom :</strong> ${session.selfName}</p>
    <p><strong>Mode :</strong> ${
      session.mode === "observer"
        ? "Je suis observateur"
        : "Je suis observé"
    }</p>
    <p><strong>APSA :</strong> ${session.apsa} — Niveau ${session.level}</p>
    <p><strong>Date :</strong> ${new Date(session.dateIso).toLocaleString()}</p>
  `;
  container.appendChild(info);

  session.targets.forEach(target => {
    const bloc = document.createElement("div");
    bloc.className = "bilan-block";

    bloc.innerHTML = `
      <h3>${
        session.mode === "observer"
          ? "J’ai observé"
          : "J’ai été observé par"
      } : ${target.name}</h3>
    `;

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    ["Observable","Niveau (1–4)","Compteur (+)","Commentaire"].forEach(t=>{
      const th = document.createElement("th");
      th.textContent = t;
      th.style.border = "1px solid #000";
      th.style.padding = "4px";
      th.style.background = "#f3f4f6";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    target.items.forEach(item => {
      const useLevels = (typeof item.useLevels === "boolean") ? item.useLevels : true;
      const usePlusMinus = (typeof item.usePlusMinus === "boolean") ? item.usePlusMinus : true;
      const useComment = (typeof item.useComment === "boolean") ? item.useComment : true;

      const tr = document.createElement("tr");

      const tdObs = document.createElement("td");
      tdObs.textContent = item.text;
      tdObs.style.border = "1px solid #000";
      tdObs.style.padding = "4px";

      const tdLevel = document.createElement("td");
      tdLevel.style.border = "1px solid #000";
      tdLevel.style.padding = "4px";
      tdLevel.textContent = (useLevels && typeof item.level === "number") ? item.level : "";

      const tdCount = document.createElement("td");
      tdCount.style.border = "1px solid #000";
      tdCount.style.padding = "4px";
      tdCount.textContent = usePlusMinus ? (item.plus || 0) : "";

      const tdNote = document.createElement("td");
      tdNote.style.border = "1px solid #000";
      tdNote.style.padding = "4px";
      tdNote.textContent = useComment ? (item.note || "") : "";

      tr.appendChild(tdObs);
      tr.appendChild(tdLevel);
      tr.appendChild(tdCount);
      tr.appendChild(tdNote);

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

  // Bouton reset
  const resetBtn = $("btnResetAll");
  if (resetBtn) {
    resetBtn.onclick = () => {
      const ok = confirm(
        "Êtes-vous sûr de vouloir tout effacer ?\n" +
        "Vous allez perdre toutes les observations effectuées.\n" +
        "Le PDF doit avoir été exporté et envoyé par AirDrop à votre prof."
      );
      if (!ok) return;
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    };
  }
}

// EXPORT PDF → print.html

const btnExportPDF = $("btnExportPDF");
if(btnExportPDF){
  btnExportPDF.onclick = () => {
    if (!appState.session) {
      alert("Aucune session active.");
      return;
    }
    // on s'assure que tout est bien sauvegardé
    saveState();
    window.open("print.html", "_blank");
  };
}

// =============================
// Démarrage (page de garde)
// =============================

const btnStart = $("btnStart");
if(btnStart){
  btnStart.onclick = () => {
    showPage("page-activity");
    initActivityPage();
  };
}
