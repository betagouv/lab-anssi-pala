import base, {
  prettier,
  globalsNavigateur,
  reglesTypeScript,
} from '../../eslint.config.base.js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
  ...base,
  ...tseslint.configs.recommended,
  reglesTypeScript,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.{ts,svelte}'],
    languageOptions: { globals: globalsNavigateur },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.svelte'] },
    },
  },
  ...svelte.configs['flat/prettier'],
  prettier,
  { ignores: ['dist/**'] },
];
