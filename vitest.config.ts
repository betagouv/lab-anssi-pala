import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['outillage/test/**/*.spec.ts', 'serveur/test/**/*.spec.ts'],
  },
});
