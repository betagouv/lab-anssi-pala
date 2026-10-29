import base, {
  prettier,
  globalsNode,
  reglesTypeScript,
} from '../eslint.config.base.js';
import tseslint from 'typescript-eslint';

export default [
  ...base,
  ...tseslint.configs.recommended,
  reglesTypeScript,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globalsNode },
  },
  prettier,
];
