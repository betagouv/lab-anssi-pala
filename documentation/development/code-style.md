# Conventions de code

## Principes

Privilégier la lisibilité, l'explicitation, la simplicité, la cohérence et la maintenabilité. Éviter les abstractions prématurées.

## TypeScript

- Utiliser le mode strict.
- Éviter `any` et les assertions non justifiées.
- Définir des types métier explicites.
- Préférer les unions discriminées lorsque pertinentes.
- Utiliser `readonly` lorsque cela exprime une contrainte réelle.
- Rendre les effets de bord identifiables.

## Fonctions et classes

- Une responsabilité principale par composant.
- Dépendances explicites.
- Méthodes suffisamment courtes et cohérentes.
- Éviter les classes ou services « fourre-tout ».

## Commentaires

Expliquer le pourquoi et les contraintes non évidentes, pas la syntaxe triviale. Maintenir les commentaires en cohérence avec le code.

## Outils

- `ESLint 10.14.0`, chaque sous module a ses propres règles :
  - `serveur/back/eslint.config.js`
  - `serveur/front/eslint.config.js`
  - `outillage/eslint.config.js`
  - `noyau-partage/eslint.config.js`
  - racine : `eslint.config.js`
- `Prettier 3.9.10`, `.prettierrc` déclaré à la racine
- `Prettier-plugin-svelte 4.1.1` : utilisé spécifiquement pour le formatage de fichiers Svelte
- `Typescript 7.0.2 ou 5.9.3`
- `Vite 7.3.7`
- `Vitest 5.1.0`
- `Svelte 5.57.3`

Les versions de référence sont celles des `package.json` et du `pnpm-lock.yaml`.

## Commandes

```bash
pnpm run lint            # ESLint sur la racine et chaque paquet
pnpm run lint:fix        # ESLint avec correction
pnpm run format:verifie  # Prettier en vérification
pnpm run format:corrige  # Prettier en correction
pnpm run typecheck       # tsc --noEmit (outillage, serveur/back, noyau-partage)
pnpm --filter pala-front check  # svelte-check pour le front
```

Réglages Prettier : guillemets simples, virgules finales `es5`, largeur de 85 colonnes.
Un identifiant volontairement inutilisé est préfixé par `_`.
