# Instructions générales pour les agents de code

## 1. Mission

Intervenir comme un développeur logiciel expérimenté. Produire un code maintenable, testable, correctement typé et conforme à l'architecture et aux conventions existantes.

Ne pas introduire de nouvelle architecture, bibliothèque ou convention sans justification.

## 2. Ordre de consultation

Avant une intervention :

1. Lire `README.md`.
2. Lire `documentation/project` et `documentation/project`.
3. Lire `documentation/architecture` et `documentation/architecture`.
4. Consulter les conventions dans `documentation/development`.
5. Consulter `documentation/quality` pour les exigences de validation.
6. Identifier les skills pertinentes dans `.agents/skills`.
7. Consulter la documentation métier concernée avant toute modification d'une règle fonctionnelle.

## 3. Principes obligatoires

- Privilégier une conception orientée domaine (DDD).
- Respecter l'architecture hexagonale et les frontières de couches.
- Appliquer les principes SOLID sans créer d'abstractions artificielles.
- Injecter les dépendances par constructeur.
- Utiliser une démarche TDD pour les comportements modifiés ou créés lorsque cela est applicable.
- Garder le domaine indépendant des frameworks et de l'infrastructure.
- Ne pas placer de logique métier dans les contrôleurs HTTP ou les composants d'interface.
- Respecter les frontières des modules et leurs contrats publics.

## 4. Langue

Le français est la langue de référence :

- échanges et comptes rendus en français ;
- documentation et commentaires en français ;
- noms métier en français lorsque cela reste cohérent avec l'écosystème technique ;
- messages destinés aux utilisateurs en français.

Les mots-clés du langage, API, conventions imposées par les frameworks, noms de bibliothèques et interfaces externes peuvent rester en anglais. Ne pas mélanger les langues pour un même concept métier.

## 5. Méthode de travail

Pour chaque tâche :

1. Comprendre le besoin et son contexte.
2. Examiner le code et les tests existants.
3. Identifier les modules, couches et contrats concernés.
4. Identifier les skills applicables.
5. Proposer une solution compatible avec l'architecture existante.
6. Écrire ou adapter les tests avant l'implémentation lorsque possible.
7. Implémenter le changement minimal nécessaire.
8. Exécuter les tests et contrôles qualité pertinents.
9. Vérifier les régressions et les effets de bord.
10. Mettre à jour la documentation si nécessaire.

## 6. Contraintes

- Ne pas inventer de règles métier.
- Ne pas contourner les invariants pour simplifier une implémentation.
- Ne pas créer de dépendance circulaire.
- Ne pas utiliser une dépendance globale implicite pour remplacer l'injection.
- Ne pas masquer une erreur par un traitement silencieux.
- Ne pas modifier des éléments hors périmètre sans justification.
- En cas d'ambiguïté structurante, demander une clarification ou expliciter l'hypothèse avant d'agir.

## 7. Fin d'intervention

Une tâche est terminée lorsque :

- l'implémentation respecte l'architecture ;
- les tests pertinents passent ;
- le typage, le lint et les contrôles disponibles passent ;
- les conventions sont respectées ;
- la documentation concernée est à jour ;
- les limites ou compromis restants sont signalés.
