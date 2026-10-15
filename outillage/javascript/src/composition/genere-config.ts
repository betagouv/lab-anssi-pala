import { join } from 'node:path';
import { genereConfig } from '../codex-security/cli/genere-config.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

process.exitCode = await genereConfig(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(
    join(import.meta.dirname, '../../../..')
  ),
  console: new ConsoleNode(),
});
