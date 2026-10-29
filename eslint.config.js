import base, { prettier, globalsNode } from './eslint.config.base.js';

export default [
  {
    ignores: [
      'serveur/**',
      'outillage/**',
      'cible/**',
      'outils/**',
      'resultats/**',
      '**/dist/**',
    ],
  },
  ...base,
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'module', globals: globalsNode },
  },
  prettier,
];
