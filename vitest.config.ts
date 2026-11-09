import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      BASE_DONNEES_URL:
        process.env.BASE_DONNEES_URL || 'postgres://postgres@localhost:5432/pala',
    },
    include: [
      'outillage/test/**/*.spec.ts',
      'serveur/back/test/**/*.spec.ts',
      'serveur/front/test/**/*.spec.ts',
      'noyau-partage/test/**/*.spec.ts',
    ],
  },
});
