import { join } from 'node:path';
import { demarreProxy } from '../codex-security/cli/demarre-proxy.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { lesDependancesPourLeDemarrageDuProxy } from './dependances.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();

process.exitCode = await demarreProxy(
  process.argv.slice(2),
  lesDependancesPourLeDemarrageDuProxy({ racine, console })
);
