# Contraintes du projet

## Contraintes fonctionnelles

- Un scan porte sur un périmètre réduit (fichiers modifiés sur une fenêtre glissante) : un
  contexte trop grand dégrade les résultats et le coût.
- Le pentest s'exécute uniquement contre une instance et une base jetables.
- [À compléter par l'équipe.]

## Contraintes techniques

- Node.js : version de `.nvmrc` ; les fichiers TypeScript sont exécutés directement par Node, ce
  qui impose une syntaxe effaçable (`erasableSyntaxOnly`) et des imports avec extension `.ts`.
- Fournisseur de modèles compatible Chat Completions ; Codex Security ne parle que l'API
  _Responses_, d'où le proxy LiteLLM.
- Le code amont des outils (`outils/*/source`) n'est jamais modifié.
- Versions : voir `../technical/stack.md` et `../versions.md`.

## Contraintes de sécurité

- Aucune cible, aucun identifiant, aucune sortie de scan n'est versionné.
- Les secrets vivent dans `.env` (non suivi).
- Détail : `../development/security.md`.

## Contraintes opérationnelles

- Hébergement DEMO sur Clever Cloud ; l'application repart d'un état vierge à chaque exécution,
  ce qui impose de recloner les cibles et de réinstaller les outils (ADR 0002).
- [À compléter : sauvegardes, supervision, disponibilité.]

## Contraintes de développement

- Français pour le code métier, la documentation et les échanges.
- Architecture hexagonale, injection par constructeur, TDD, doublures écrites à la main.
- Contrôles obligatoires : lint, mise en forme, typage, tests (`../quality/definition-of-done.md`).
- Contribution par pull request (`../development/git-workflow.md`).
- Nouvelles versions de dépendances acceptées après sept jours (`minimumReleaseAge`).
