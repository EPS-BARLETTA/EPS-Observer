// =============================
// EPS OBSERVER - APP.JS
// Version finale - Option A (+/-, niveaux, commentaire par observable)
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
  selectedChampId: null,   // "CA1"...
  selectedApsa: null,      // "Basket-ball"...
  selectedLevel: 2,        // 1..4

  // APSA personnalisées par CA
  customApsaByChamp: {},   // { CA1:["..."], ... }

  // observables pour la session courante (modèle)
  // chaque observable : {id,text,useComment,usePlusMinus,useLevels}
  observablesTemplate: [],

  // rôle courant : "observer" ou "observed"
  currentRole: null,

  // session en cours (voir structure plus bas)
  session: null,

  // tampon pour noms de personnes avant création de session
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
  // deviner le CA
  const champ = CHAMPS.find(c => c.baseAPSA.includes(apsa)) || CHAMPS[3]; // CA4 par défaut
  const hints = CA_LEVEL_HINTS[champ.id] || {};
  const hint = hints[niveau] || "";
  return base.map(txt => ({
    id: uid(),
    text: hint ? `${txt} — ${hint}` : txt,
    useComment: true,
    usePlusMinus: false,
    useLevels: true
  }));
}

// --- Session (structure) ---

/*
 session = {
   id: "...",
   mode: "observer" | "observed",
   dateIso: "...",
   champId: "CA4",
   apsa: "Basket-ball",
   level: 2,
   selfName: "Jérôme",
   targets: [
     {
       id: "...",
       name: "Paul",        // si mode observer => personne observée
                            // si mode observed => observateur
       items: [
         {
           id: observableId,
           text: "...",
           plus: 0,
           minus: 0,
           level: null,      // 1..4 ou null
           note: "",
           useComment: true,
           usePlusMinus: false,
           useLevels: true
         }, ...
       ],
       comment: ""
     },
     ...
   ],
   activeTargetId: "..."
 }
*/

// Créer un "pack" d'items observables vierges pour un nouveau target
function makeEmptyItemsFromTemplate(){
  return (appState.observablesTemplate || []).map(o => ({
    id: o.id,
    text: o.text,
    plus: 0,
    minus: 0,
    level: null, // aucun niveau sélectionné au départ
    note: "",
    useComment: (typeof o.useComment === "boolean") ? o.useComment : true,
    usePlusMinus: !!o.usePlusMinus,
    useLevels: (typeof o.useLevels === "boolean") ? o.useLevels : true
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

// --- Ajouter une APSA ---
$("addApsaBtn").onclick = ()=>{
  const txt = $("addApsaInput").value.trim();
  if(!txt || !appState.selectedChampId) return;

  if(!appState.customApsaByChamp[appState.selectedChampId])
    appState.customApsaByChamp[appState.selectedChampId] = [];

  appState.customApsaByChamp[appState.selectedChampId].push(txt);
  $("addApsaInput").value = "";
  saveState();
  renderApsaList();
};

// --- Aller aux observables ---
$("btnToObservables").onclick = ()=>{
  if(!appState.selectedChampId || !appState.selectedApsa){
    alert("Sélectionnez un CA et une APSA.");
    return;
  }

  // Construire la template d'observables (modifiable ensuite)
  appState.observablesTemplate = buildObservablesTemplate(
    appState.selectedApsa,
    appState.selectedLevel
  );

  saveState();
  renderObservableList();
  $("obsApsaLabel").textContent =
    `APSA : ${appState.selectedApsa} (Niveau ${appState.selectedLevel})`;
  showPage("page-observables");
};

// Bouton retour vers la cover
$("btnBackToCover").onclick = ()=>{
  showPage("page-cover");
};

// ---------- PAGE 3 : OBSERVABLES ----------

function renderObservableList(){
  const list = $("observableList");
  if(!list) return;
  list.innerHTML = "";

  appState.observablesTemplate.forEach(obs=>{
    // valeurs par défaut si on charge un ancien état
    if(typeof obs.useComment !== "boolean") obs.useComment = true;
    if(typeof obs.usePlusMinus !== "boolean") obs.usePlusMinus = false;
    if(typeof obs.useLevels !== "boolean") obs.useLevels = true;

    const card = document.createElement("div");
    card.className = "obs-config-card";

    // header : texte observable + bouton supprimer
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

    // options : commentaire / +/- / niveaux
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
    optPM.appendChild(document.createTextNode("+ / -"));

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
$("addObservableBtn").onclick = ()=>{
  const txt = $("addObservableInput").value.trim();
  if(!txt) return;

  appState.observablesTemplate.push({
    id: uid(),
    text: txt,
    useComment: true,
    usePlusMinus: false,
    useLevels: true
  });

  $("addObservableInput").value = "";
  saveState();
  renderObservableList();
};

// Appliquer options globales à tous les observables
$("btnApplyGlobalOptions").onclick = ()=>{
  const useComment = $("globalUseComment").checked;
  const usePlusMinus = $("globalUsePlusMinus").checked;
  const useLevels = $("globalUseLevels").checked;

  appState.observablesTemplate = (appState.observablesTemplate || []).map(o=>({
    ...o,
    useComment,
    usePlusMinus,
    useLevels
  }));
  saveState();
  renderObservableList();
};

// Page suivante → choix du rôle
$("btnToRole").onclick = ()=>{
  showPage("page-role");
};

// Retour activité depuis observables
$("btnBackToActivity").onclick = ()=>{
  showPage("page-activity");
};

// ---------- INITIALISATION PAGE ACTIVITÉ ----------

function initActivityPage(){
  renderLevelButtons();
  renderChampList();
  renderApsaList();
}

// =============================
// Bloc 3/4 : Gestion du rôle + session + UI observation
// =============================


// ---------- PAGE 4 : CHOIX DU RÔLE ----------

$("roleObserver").onclick = () => {
  appState.currentRole = "observer";
  saveState();
  setupRoleForm();
};

$("roleObserved").onclick = () => {
  appState.currentRole = "observed";
  saveState();
  setupRoleForm();
};

function setupRoleForm() {
  $("roleForm").classList.remove("hidden");

  if (appState.currentRole === "observer") {
    $("roleTitle").textContent = "Je suis observateur";
    $("roleTargetLabel").textContent = "J’observe :";
  } else {
    $("roleTitle").textContent = "Je suis observé";
    $("roleTargetLabel").textContent = "Je suis observé par :";
  }

  // reset affichage liste
  renderRoleTargetList();
}

// bouton retour observables
$("btnBackToObservables").onclick = ()=>{
  showPage("page-observables");
};

// Ajouter un élève/observateur
$("roleTargetInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addRoleTarget();
  }
});

function addRoleTarget() {
  const txt = $("roleTargetInput").value.trim();
  if (!txt) return;

  appState.sessionTargetsTemp.push(txt);

  $("roleTargetInput").value = "";
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

$("btnStartSession").onclick = () => {
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

  // Création de la session
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

  // Transformer chaque nom en "target complet"
  targets.forEach(name => {
    appState.session.targets.push({
      id: uid(),
      name,
      items: makeEmptyItemsFromTemplate(),
      comment: ""
    });
  });

  // Activer le premier target
  if (appState.session.targets.length > 0) {
    appState.session.activeTargetId = appState.session.targets[0].id;
  }

  // Nettoyage tampon
  appState.sessionTargetsTemp = [];
  $("roleSelfInput").value = "";
  $("roleTargetInput").value = "";
  $("roleTargetList").innerHTML = "";

  saveState();
  renderObservationPage();
  showPage("page-observation");
};


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

// Ajouter un nouveau target (élève observé ou observateur)
$("btnAddTarget").onclick = () => {
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
  // On bascule directement sur cette personne
  appState.session.activeTargetId = newTarget.id;

  saveState();
  renderTargetTabs();
  renderObservationArea();
};

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

  // bloc items observables
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
    // valeurs par défaut si ancien état
    if(typeof item.plus !== "number") item.plus = 0;
    if(typeof item.minus !== "number") item.minus = 0;
    if(typeof item.useComment !== "boolean") item.useComment = true;
    if(typeof item.usePlusMinus !== "boolean") item.usePlusMinus = false;
    if(typeof item.useLevels !== "boolean") item.useLevels = true;
    if(typeof item.level !== "number") item.level = null;

    const row = document.createElement("div");
    row.className = "obs-row";

    // Libellé observable
    const label = document.createElement("div");
    label.textContent = item.text;
    row.appendChild(label);

    // Ligne de contrôles ( +/-, niveaux )
    const controlsRow = document.createElement("div");
    controlsRow.className = "obs-controls-row";

    // Groupe +/- si activé
    if(item.usePlusMinus){
      const pmGroup = document.createElement("div");
      pmGroup.className = "pm-group";

      ["plus","minus"].forEach(key=>{
        const pmRow = document.createElement("div");
        pmRow.className = "pm-row";

        const decBtn = document.createElement("button");
        decBtn.className = "pm-btn";
        decBtn.textContent = "-";
        decBtn.onclick = ()=>{
          if(item[key] > 0) item[key]--;
          countSpan.textContent = item[key];
          saveState();
        };

        const labelSpan = document.createElement("span");
        labelSpan.className = "pm-label";
        labelSpan.textContent = key === "plus" ? "+" : "−";

        const countSpan = document.createElement("span");
        countSpan.className = "pm-count";
        countSpan.textContent = item[key];

        const incBtn = document.createElement("button");
        incBtn.className = "pm-btn";
        incBtn.textContent = "+";
        incBtn.onclick = ()=>{
          item[key]++;
          countSpan.textContent = item[key];
          saveState();
        };

        pmRow.appendChild(decBtn);
        pmRow.appendChild(labelSpan);
        pmRow.appendChild(countSpan);
        pmRow.appendChild(incBtn);
        pmGroup.appendChild(pmRow);
      });

      controlsRow.appendChild(pmGroup);
    }

    // Niveaux (4 ronds) si activé
    if(item.useLevels){
      const levelGroup = document.createElement("div");
      levelGroup.style.display = "flex";
      levelGroup.style.gap = "4px";

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

    // zone commentaires individuels si activé
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

  // Commentaire global pour le target
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


// ---------- BOUTONS DE NAVIGATION OBS / BILAN ----------

$("btnToBilan").onclick = () => {
  renderBilanPage();
  showPage("page-bilan");
};

$("btnBackToSession").onclick = () => {
  showPage("page-observation");
};

$("btnEndSession").onclick = () => {
  if (!confirm("Terminer la session ? Cela ne supprime rien mais ferme le mode.")) return;

  appState.session = null;
  saveState();
  showPage("page-cover");
};

// =============================
// Bloc 4/4 : Bilan + Export PDF
// =============================


// ---------- PAGE 6 : BILAN ----------
function renderBilanPage() {
  const container = $("bilanContent");
  container.innerHTML = "";

  const session = appState.session;
  if (!session) return;

  // Titre
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

  // Liste des personnes observées / observateurs
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

    // Ajout des observables sous forme de liste
    const ul = document.createElement("ul");
    target.items.forEach(item => {
      const li = document.createElement("li");

      const useLevels = (typeof item.useLevels === "boolean") ? item.useLevels : true;
      const usePlusMinus = !!item.usePlusMinus;
      const useComment = (typeof item.useComment === "boolean") ? item.useComment : true;

      let html = `<strong>${item.text}</strong><br>`;

      if(useLevels && typeof item.level === "number"){
        html += `Niveau : ${item.level} / 4<br>`;
      }

      if(usePlusMinus && (item.plus || item.minus)){
        html += `+ : ${item.plus || 0} / - : ${item.minus || 0}<br>`;
      }

      if(useComment && item.note){
        html += `Commentaire : ${item.note}<br>`;
      }

      li.innerHTML = html;
      ul.appendChild(li);
    });

    bloc.appendChild(ul);

    if (target.comment) {
      const p = document.createElement("p");
      p.innerHTML = `<em>Commentaire global : ${target.comment}</em>`;
      bloc.appendChild(p);
    }

    container.appendChild(bloc);
  });
}


// ---------- EXPORT PDF ----------

$("btnExportPDF").onclick = () => {
  if (!appState.session) {
    alert("Aucune session active.");
    return;
  }

  const session = appState.session;

  // Titre PDF
  const pdfContent = [
    { text: "EPS OBSERVER", style: "header", alignment: "center" },
    { text: "\n" }
  ];

  pdfContent.push({
    text: session.mode === "observer"
      ? `COMPÉTENCE D’OBSERVATEUR — ${session.selfName}`
      : `DOSSIER D’OBSERVATION — ${session.selfName}`,
    style: "title",
    alignment: "center"
  });

  pdfContent.push({ text: "\n" });

  pdfContent.push({
    text: `APSA : ${session.apsa} — Niveau ${session.level}\nDate : ${new Date(session.dateIso).toLocaleString()}`,
    style: "subheader"
  });

  pdfContent.push({ text: "\n\n" });

  // SECTION pour chaque personne observée / observateur
  session.targets.forEach(target => {
    pdfContent.push({
      text:
        (session.mode === "observer"
          ? `J’ai observé : `
          : `J’ai été observé par : `) + target.name,
      style: "sectionHeader"
    });

    // Observables sous forme de blocs texte
    target.items.forEach(item => {
      const useLevels = (typeof item.useLevels === "boolean") ? item.useLevels : true;
      const usePlusMinus = !!item.usePlusMinus;
      const useComment = (typeof item.useComment === "boolean") ? item.useComment : true;

      const lines = [];
      lines.push(item.text);

      if(useLevels && typeof item.level === "number"){
        lines.push(`Niveau : ${item.level} / 4`);
      }
      if(usePlusMinus && (item.plus || item.minus)){
        lines.push(`+ : ${item.plus || 0} / - : ${item.minus || 0}`);
      }
      if(useComment && item.note){
        lines.push(`Commentaire : ${item.note}`);
      }

      pdfContent.push({
        text: lines.join("\n"),
        margin: [0, 0, 0, 8]
      });
    });

    if (target.comment) {
      pdfContent.push({
        text: `Commentaire global : ${target.comment}`,
        italics: true,
        margin: [0, 4, 0, 10]
      });
    }

    pdfContent.push({ text: "\n" });
  });

  // Styles PDF
  const styles = {
    header: { fontSize: 24, bold: true },
    title: { fontSize: 18, bold: true },
    subheader: { fontSize: 12, bold: false },
    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
  };

  pdfMake.createPdf({ content: pdfContent, styles }).download(
    `${session.selfName}_${session.mode}_${session.apsa}.pdf`
  );
};

// =============================
// Démarrage (page de garde)
// =============================

$("btnStart").onclick = () => {
  showPage("page-activity");
  initActivityPage();
};
