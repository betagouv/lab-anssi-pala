import { join } from 'node:path';
import { genereConfigProxy } from '../codex-security/cli/genere-config-proxy.ts';
import { ConsoleNode } from '../noyau/infrastructure/consoleNode.ts';
import { lesDependancesPourLaGenerationConfigProxy } from './dependances.ts';

const racine = join(import.meta.dirname, '../../..');
const console = new ConsoleNode();

process.exitCode = await genereConfigProxy(
  process.argv.slice(2),
  lesDependancesPourLaGenerationConfigProxy({ racine, console })
);
