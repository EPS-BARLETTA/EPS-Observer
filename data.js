
export const EXPERIENCES = [
  { id:"EC1", label:"Réaliser une performance motrice maximale mesurable", icon:"⏱️",
    ppsa:[ "Course de 1/2 fond","Course de relais","Combiné athlétique","Natation de vitesse" ] },
  { id:"EC2", label:"Adapter son déplacement à des environnements variés/incertains", icon:"🧭",
    ppsa:[ "Escalade","Course d’orientation","Sauvetage aquatique" ] },
  { id:"EC3C", label:"Création artistique (prestation destinée à être vue)", icon:"🎭",
    ppsa:[ "Danse contemporaine","Arts du cirque" ] },
  { id:"EC3F", label:"Formes codifiées (production jugée)", icon:"⭐",
    ppsa:[ "Acrosport","Gymnastique au sol","Danse de couple" ] },
  { id:"EC4", label:"Conduire un affrontement (individuel/collectif)", icon:"⚔️",
    ppsa:[ "Badminton","Tennis de table","Boxe française","Basket-ball","Football","Handball","Rugby","Volley-ball","Judo" ] },
  { id:"EC5", label:"Développer ses ressources et s’entretenir", icon:"💪",
    ppsa:[ "Course en durée","Musculation","Natation en durée","Step","Yoga" ] }
];

// Defaults for observables (minimal, extensible). The teacher can add more per PPSA.
export const DEFAULT_OBS = {
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
  "Step":["Complexité pas","Synchronisation","Rythme","Sécurité"],
  "Gymnastique au sol":["Éléments","Liaisons","Amplitude","Tenue"],
  "Acrosport":["Portés","Voltige","Sécurité","Synchronisation"],
  "Danse de couple":["Synchronisation","Guidage","Musicalité","Connexion"],
  "Danse contemporaine":["Intention","Espace","Temps","Qualité du mouvement"],
  "Arts du cirque":["Numéro","Maîtrise objet","Risque contrôlé","Présence"],
  "Combiné athlétique":["Course","Saut","Lancer","Transitions"],
  "Course de 1/2 fond":["Allure","Relances","Gestion effort","Arrivée"],
  "Course de relais":["Transmission","Placement","Allure","Coordination"],
  "Sauvetage aquatique":["Immersion","Saisie","Remorquage","Gestion effort"]
};
