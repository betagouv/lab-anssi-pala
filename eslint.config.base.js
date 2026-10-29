// Socle ESLint partagé du monorepo.
//
// Fournit les règles JavaScript de base et la désactivation des règles de style
// (Prettier reste seul maître du formatage, via eslint-config-prettier). Chaque
// workspace importe ce socle puis ajoute son parser TypeScript et ses globals,
// car typescript-eslint ne peut pas vivre à la racine : il y résoudrait le
// typescript@7 natif (sans API JS) alors qu'il lui faut un typescript@5.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export const globalsNode = globals.node;
export const globalsNavigateur = globals.browser;
export { prettier };

// Réglages communs des règles TypeScript. À étaler APRÈS
// `tseslint.configs.recommended` (qui enregistre le plugin). Un identifiant
// volontairement inutilisé se préfixe par `_`.
export const reglesTypeScript = {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
];
