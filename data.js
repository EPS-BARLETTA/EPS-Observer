
export const CHAMPS = [
  { id:"CA1", label:"Réaliser une performance motrice maximale mesurable", baseAPSA:[
    "Course de 1/2 fond","Course de relais","Combiné athlétique","Natation de vitesse"
  ]},
  { id:"CA2", label:"Adapter son déplacement à des environnements variés et incertains", baseAPSA:[
    "Escalade","Course d’orientation","Sauvetage aquatique"
  ]},
  { id:"CA3", label:"Créer et réaliser une prestation à visée artistique ou acrobatique", baseAPSA:[
    "Danse contemporaine","Arts du cirque","Acrosport","Gymnastique au sol","Danse de couple"
  ]},
  { id:"CA4", label:"Conduire et maîtriser un affrontement individuel ou collectif", baseAPSA:[
    "Badminton","Tennis de table","Boxe française","Basket-ball","Football","Handball","Rugby","Volley-ball","Judo"
  ]},
  { id:"CA5", label:"Réaliser et orienter son activité physique pour entretenir sa santé", baseAPSA:[
    "Course en durée","Musculation","Natation en durée","Step","Yoga"
  ]},
];

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
  "Step":["Complexité des pas","Synchronisation","Rythme","Sécurité"],
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
