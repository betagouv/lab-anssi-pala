# Instructions générales pour les agents de code

## 1. Mission

Intervenir comme un développeur logiciel expérimenté. Produire un code maintenable, testable, correctement typé et conforme à l'architecture et aux conventions existantes.

Ne pas introduire de nouvelle architecture, bibliothèque ou convention sans justification.

## 2. Ordre de consultation

Avant une intervention :

1. Lire `README.md`.
2. Lire `documentation/project/overview.md` et `documentation/project/glossary.md`.
3. Lire `documentation/architecture/overview.md` et `documentation/architecture/module-organization.md`.
4. Consulter les conventions dans `documentation/development`.
5. Consulter `documentation/technical` pour la configuration, la base de données, Docker et le déploiement.
6. Consulter `documentation/quality` pour les exigences de validation.
7. Identifier les skills pertinentes dans le catalogue `.agents/skills/README.md` et lire leur `SKILL.md`.
8. Consulter la documentation métier (`documentation/business`) avant toute modification d'une règle fonctionnelle.
9. Consulter les ADR (`documentation/architecture/decisions`) avant de toucher à un sujet qu'ils couvrent.

L'index `documentation/README.md` indique l'état de chaque document. Une section marquée `[À compléter]` n'est pas une règle : ne pas en déduire de comportement, se référer au code.

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
- Ne jamais modifier le contenu des sous-modules `outils/*/source`.
- Ne jamais versionner une cible, un identifiant, un `.env` rempli ou une sortie de scan.
- Ne pas utiliser `vi.mock`, `vi.fn` ni `vi.spyOn` : écrire les doublures à la main.
- Ne pas lancer de scan ni de pentest sans demande explicite : ces commandes consomment des tokens et, pour Shannon, agissent sur une application.

## 7. Configuration propre à chaque agent

Le référentiel commun à tous les agents est `AGENTS.md`, `documentation/` et `.agents/` (dont `.agents/skills`). Il ne se duplique pas.

Chaque agent de code utilisé sur le projet crée et versionne son propre dossier à la racine, nommé d'après lui (`.claude`, `.codex`…) :

- n'y placer que ce qui est nécessaire pour que l'agent découvre et utilise le référentiel commun ;
- référencer les fichiers canoniques (lien symbolique ou renvoi), ne jamais recopier une règle ni adapter le référentiel commun à un agent particulier ;
- vérifier le mécanisme de découverte officiellement pris en charge par l'agent avant de le configurer ;
- ne pas versionner de réglage personnel ni de secret (par exemple `.claude/settings.local.json`).

Dossiers existants :

- `.claude` (Claude Code) : `AGENTS.md` est chargé automatiquement ; `.claude/skills` est un lien symbolique vers `.agents/skills`.

## 8. Commandes de validation

```bash
pnpm run test            # tests (PostgreSQL démarré, migrations appliquées)
pnpm run typecheck       # typage
pnpm run lint            # ESLint
pnpm run format:verifie  # mise en forme (format:corrige pour corriger)
```

Pour une modification du front : `pnpm --filter pala-front check`.

## 9. Fin d'intervention

Une tâche est terminée lorsque :

- l'implémentation respecte l'architecture ;
- les tests pertinents passent ;
- le typage, le lint et les contrôles disponibles passent ;
- les conventions sont respectées ;
- la documentation concernée est à jour ;
- les limites ou compromis restants sont signalés.
