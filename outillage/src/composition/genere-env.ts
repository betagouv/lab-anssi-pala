import { join } from 'node:path';
import { genereEnv } from '../environnement/cli/genere-env.ts';
import { ConsoleNode } from '../noyau/infrastructure/consoleNode.ts';
import { lesDependancesPourLaGenerationEnvironnement } from './dependances.ts';

const racine = join(import.meta.dirname, '../../..');
const console = new ConsoleNode();

process.exitCode = await genereEnv(
  process.argv.slice(2),
  lesDependancesPourLaGenerationEnvironnement({ racine, console })
);
