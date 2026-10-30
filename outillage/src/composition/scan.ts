import { join } from 'node:path';
import { scan } from '../codex-security/cli/scan.ts';
import { ConsoleNode } from '../noyau/infrastructure/consoleNode.ts';
import { lesDependancesPourLeScan } from './dependances.ts';

const racine = join(import.meta.dirname, '../../..');
const console = new ConsoleNode();

process.exitCode = await scan(
  process.argv.slice(2),
  lesDependancesPourLeScan({ racine, console })
);
