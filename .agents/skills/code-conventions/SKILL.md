---
name: code-conventions
description: À utiliser pour toute création ou modification de code afin de respecter le style, le typage, le nommage et les outils du projet.
---

# Conventions de code

## 1. Objectif

Garantir un code homogène, lisible et maintenable.

## 2. Règles

- Lire `documentation/development/code-style.md` et `documentation/development/naming-conventions.md`.
- Respecter la configuration réelle du formatter, du linter et de TypeScript.
- Privilégier les noms explicites et le vocabulaire métier.
- Éviter `any`, les assertions de type non justifiées et les conversions dangereuses.
- Limiter les effets de bord et les dépendances implicites.
- Ne pas introduire une nouvelle bibliothèque de style ou de validation sans justification.

## 3. Validation

Exécuter `pnpm run format:verifie`, `pnpm run lint` et `pnpm run typecheck` (et `pnpm --filter pala-front check` pour une modification du front).
