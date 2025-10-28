# EPS Observer

Application web (single-file) pour observer des activités en EPS, conçue pour fonctionner **entièrement côté client** (localStorage) — adapté aux iPads gérés par MDM / liste blanche.

## Fonctionnalités
- Choix du champ d'apprentissage (CA1..CA5) — données basées sur le document officiel fourni. fileciteturn0file0
- Sélection / création d'APSA.
- Observables par APSA (par défaut) + possibilité d'ajouter des observables personnalisés.
- Observation en mode élève : 4 niveaux de maîtrise (fragile/moyen/bon/tb) + comptage des actions positives (+) et négatives (-) par observable.
- Enregistrement local (localStorage). Export JSON par observation.
- Export PDF possible (prévoir bundling de `html2canvas` et `jspdf` dans `/vendor` pour environnement MDM sans accès CDN).

## Déploiement sur iPad géré par MDM (sans hébergement externe)
Options possibles :
1. **Distribuer l'app en tant que site local (web clip)** : héberger `index.html` et autres fichiers dans le dépôt GitHub, puis l'admin MDM pousse le site en Web Clip ou héberge en intranet accessible uniquement par le réseau de l'établissement.
2. **Distribuer les fichiers statiques et ouvrir `index.html` localement** : certains MDM permettent de pousser des fichiers et raccourcis vers Safari ou Files.app. Les iPads ouvriront l'index en local (file://) — vérifier politique MDM.
3. **Vendoriser les dépendances** : éviter les CDN. Place les fichiers `html2canvas.min.js` et `jspdf.umd.min.js` dans `/vendor` et modifie `index.html` pour charger depuis `./vendor/...`.

## Structure du dépôt
```
eps-observer/
├─ index.html
├─ README.md
├─ vendor/          # place ici les bibliothèques html2canvas + jspdf pour usage offline
└─ LICENSE
```

## Respect de la confidentialité
L'application stocke tout localement dans le navigateur (localStorage). Aucune donnée n'est envoyée vers un service distant. Cela convient aux iPads en MDM et à des exigences de confidentialité strictes.

## Next steps (je peux générer / intégrer)
- Ajouter sauvegarde CSV / export groupé.
- Ajouter fonctionnalité d'association enseignant <-> observations (si tu changes d'avis).
- Fournir une version "packagée" (PWA) avec icône et manifest pour installer sur l'écran d'accueil iPad.

## Source des APSA et champs
Les APSA et la catégorisation par champ proviennent du document officiel (programme EPS — classes de seconde et cycle terminal) que tu as fourni. fileciteturn0file0
