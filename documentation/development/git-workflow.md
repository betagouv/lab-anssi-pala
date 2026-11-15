# Workflow Git

## Branches

- `main` est la branche de référence : elle ne reçoit du code que par pull request.
- Tout développement passe par une branche dédiée.
- Nom de branche en `kebab-case`, minuscules, sans accent ni préfixe de type (`feat/`, `fix/`) :
  il décrit le sujet, par exemple `documentation-agentique`.

## Messages de commit

```text
[CATEGORIE] Titre court, verbe au présent
... description complémentaire si nécessaire
```

- Titre en français, sans point final, commençant par un verbe : `Ajoute`, `Corrige`,
  `Supprime`, `Passe`, `Démarre`…
- La catégorie est optionnelle. Catégories en usage : `[SOIN]` (nettoyage sans changement de
  comportement), `[CORRECTION]`, `[SECURITE]`, `[CI]`, `[VERSION]`, `[RENOVATE]` (mises à jour
  automatiques), `[WIP]`.
- Le complément, optionnel, commence par `...` et précise le pourquoi ou le périmètre.
- Les noms de fichiers, fonctions, variables et paquets sont cités entre accents graves.
- Aucune ligne d'attribution (`Co-Authored-By`, `Generated with…`), y compris pour un commit
  préparé par un agent.

Exemples tirés de l'historique :

```text
Ajoute la route de santé `/sante`
... requise par Clever Cloud pour sonder l'application

[SOIN] Active le formatage prettier des fichiers Svelte

[CORRECTION] Corrige la dockerization pour le développement en local
```

## Commits atomiques

Un commit porte une seule intention, compile et passe les tests à lui seul.

## Contrôles automatiques

- Avant chaque commit : `lint-staged` (ESLint et Prettier sur les fichiers indexés), via
  `.githooks/pre-commit`. Le hook est activé par `pnpm install`.
- Sur chaque pull request : lint, mise en forme, typage et tests
  (voir `../technical/build-and-deployment.md`).
- Les mises à jour de dépendances sont proposées par Renovate (`.github/renovate.json`).
