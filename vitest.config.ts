import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['outillage/javascript/test/**/*.spec.ts'],
  },
});
