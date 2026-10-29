import { join } from 'node:path';
import { genereConfig } from '../codex-security/cli/genere-config.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { lesDependancesPourLaGenerationConfig } from './dependances.ts';

const racine = join(import.meta.dirname, '../../..');
const console = new ConsoleNode();

process.exitCode = await genereConfig(
  process.argv.slice(2),
  lesDependancesPourLaGenerationConfig({ racine, console })
);
