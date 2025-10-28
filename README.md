# EPS Observer — Page unique (A+C)

Cette version implémente **la page d’observation unique** optimisée iPad, avec **boutons ronds géants** *et* **gestuelle swipe** (→ = +, ← = -).

## Points clés
- **Une seule page** avec 3 zones : Contexte (haut), Observables (milieu), Maîtrise (bas).
- Comptage **+ / -** via **buzzer** (60px) **et** **swipe** horizontal sur la ligne.
- **4 niveaux de maîtrise** par observable (🔴/🟡/🟢/🔵) sans quitter la ligne.
- **PDF uniquement** : bouton *Générer PDF* s’appuie sur l’**impression native** iPad (feuille de bilan compacte).
- **LocalStorage** uniquement (aucune donnée envoyée). Sessions sauvegardées listées en bas.
- **Hors-ligne / MDM** : fichier unique `index.html`, aucune dépendance externe.

## Utilisation
1. Ouvrir `index.html` sur iPad (Web Clip MDM, intranet, ou fichier local selon politique).
2. Renseigner le **contexte**, **ajouter/retirer** des observables si besoin.
3. Pendant l’observation : tap **+** ou swipe **→** ; tap **-** ou swipe **←**.
4. Sélectionner les **niveaux de maîtrise**.
5. **Générer PDF** pour obtenir la trace (via impression en PDF).

## Source des APSA et champs
Les APSA / champs proviennent du document officiel que tu as fourni précédemment, et un sous-ensemble est préchargé dans l'app. 

## Différences vs version précédente
- Passage d'un **wizard multi-sections** à une **page unique**.
- Export **PDF natif** (plus de dépendance `html2canvas/jsPDF`).

## Licence
Voir `LICENSE` (fichier inchangé).
