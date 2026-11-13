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

[Préciser les versions et règles ESLint, Prettier, TypeScript et autres outils réellement utilisés.]
