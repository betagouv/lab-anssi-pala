import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      BASE_DONNEES_URL:
        process.env.BASE_DONNEES_URL || 'postgres://postgres@localhost:5432/pala',
    },
    include: ['outillage/test/**/*.spec.ts', 'serveur/test/**/*.spec.ts'],
  },
});
