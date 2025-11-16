// =============================
// EPS OBSERVER - APP.JS
// Bloc 1/4 : constantes, état, stockage, navigation
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

const STORAGE_KEY = "eps_observer_v4_state";

const appState = {
  // activité
  selectedChampId: null,   // "CA1"...
  selectedApsa: null,      // "Basket-ball"...
  selectedLevel: 2,        // 1..4

  // APSA personnalisées par CA
  customApsaByChamp: {},   // { CA1:["..."], ... }

  // observables pour la session courante (modèle)
  observablesTemplate: [], // [{id,text},...]

  // rôle courant : "observer" ou "observed"
  currentRole: null,

  // session en cours
  session: null            // objet défini plus bas
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
    text: hint ? `${txt} — ${hint}` : txt
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
       name: "Paul",              // si mode observer => personne observée
                                 // si mode observed => observateur
       items: [
         {
           id: observableId,
           text: "...",
           plus: 0,
           minus: 0,
           level: 2,              // 1..4
           note: ""
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
    level: 2,
    note: ""
  }));
}

function getActiveTarget(){
  if(!appState.session) return null;
  return (appState.session.targets || []).find(t => t.id === appState.session.activeTargetId) || null;
}

// On exposera ces fonctions plus bas dans les écouteurs d'évènements
// Les blocs suivants vont construire :
// - la page activité (champs, APSA, niveaux)
// - la page observables
// - la page rôle + session
// - la page observation
// - la page bilan & PDF
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


// ---------- PAGE 3 : OBSERVABLES ----------

function renderObservableList(){
  const list = $("observableList");
  list.innerHTML = "";

  appState.observablesTemplate.forEach(obs=>{
    const row = document.createElement("div");
    row.className = "observable-item";

    const label = document.createElement("span");
    label.textContent = obs.text;

    const btn = document.createElement("button");
    btn.className = "btn btn-red";
    btn.textContent = "X";
    btn.onclick = ()=>{
      appState.observablesTemplate =
        appState.observablesTemplate.filter(o=>o.id !== obs.id);
      saveState();
      renderObservableList();
    };

    row.appendChild(label);
    row.appendChild(btn);
    list.appendChild(row);
  });
}

// Ajouter un observable
$("addObservableBtn").onclick = ()=>{
  const txt = $("addObservableInput").value.trim();
  if(!txt) return;

  appState.observablesTemplate.push({
    id: uid(),
    text: txt
  });

  $("addObservableInput").value = "";
  saveState();
  renderObservableList();
};

// Page suivante → choix du rôle
$("btnToRole").onclick = ()=>{
  showPage("page-role");
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

// Ajouter un élève/observateur
$("roleTargetInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addRoleTarget();
  }
});

function addRoleTarget() {
  const txt = $("roleTargetInput").value.trim();
  if (!txt) return;

  if (!appState.sessionTargetsTemp) appState.sessionTargetsTemp = [];
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
  const name = prompt("Nom de la personne :");
  if (!name) return;

  appState.session.targets.push({
    id: uid(),
    name,
    items: makeEmptyItemsFromTemplate(),
    comment: ""
  });

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

  // bloc items observables
  const card = document.createElement("div");
  card.className = "obs-card";

  const header = document.createElement("div");
  header.className = "obs-header";
  header.textContent = `Observations pour : ${target.name}`;

  card.appendChild(header);

  const body = document.createElement("div");
  body.className = "obs-body";

  target.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "obs-row";

    // Libellé observable
    const label = document.createElement("div");
    label.textContent = item.text;

    // Niveaux (4 ronds)
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

    // zone commentaires individuels
    const noteInput = document.createElement("textarea");
    noteInput.placeholder = "Note / commentaire pour cet observable";
    noteInput.value = item.note;
    noteInput.oninput = () => {
      item.note = noteInput.value;
      saveState();
    };

    row.appendChild(label);
    row.appendChild(levelGroup);
    row.appendChild(noteInput);

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


// ---------- BOUTONS DE NAVIGATION ----------

$("btnToBilan").onclick = () => {
  renderBilanPage();
  showPage("page-bilan");
};

$("btnBackToSession").onclick = () => {
  showPage("page-observation");
};

$("btnEndSession").onclick = () => {
  if (!confirm("Terminer la session ? Cela ne supprime rien mais ferme le mode."))
    return;

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
    <p><strong>Mode :</strong> ${session.mode === "observer" ? "Je suis observateur" : "Je suis observé"}</p>
    <p><strong>APSA :</strong> ${session.apsa} — Niveau ${session.level}</p>
    <p><strong>Date :</strong> ${new Date(session.dateIso).toLocaleString()}</p>
  `;
  container.appendChild(info);

  // Liste des personnes observées / observateurs
  session.targets.forEach(target => {
    const bloc = document.createElement("div");
    bloc.className = "bilan-block";

    bloc.innerHTML = `
      <h3>${session.mode === "observer" ? "J’ai observé" : "J’ai été observé par"} : ${target.name}</h3>
    `;

    // Ajout des observables sous forme de liste
    const ul = document.createElement("ul");
    target.items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item.text}</strong><br>
        Niveau : ${item.level} / 4<br>
        ${item.note ? `Commentaire : ${item.note}<br>` : ""}
      `;
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

    const tableBody = [
      [
        { text: "Observable", style: "tableHeader" },
        { text: "Niveau (1-4)", style: "tableHeader" },
        { text: "Commentaire", style: "tableHeader" }
      ]
    ];

    target.items.forEach(item => {
      tableBody.push([
        item.text,
        item.level.toString(),
        item.note || ""
      ]);
    });

    pdfContent.push({
      style: "table",
      table: {
        widths: ["*", 60, "*"],
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

  // Styles PDF
  const styles = {
    header: { fontSize: 24, bold: true },
    title: { fontSize: 18, bold: true },
    subheader: { fontSize: 12, bold: false },
    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
    tableHeader: { bold: true, fillColor: "#eeeeee" },
    table: { margin: [0, 5, 0, 15] }
  };

  pdfMake.createPdf({ content: pdfContent, styles }).download(
    `${session.selfName}_${session.mode}_${session.apsa}.pdf`
  );
};
