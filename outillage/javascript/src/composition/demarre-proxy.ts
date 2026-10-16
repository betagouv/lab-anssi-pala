import { join } from 'node:path';
import { ConteneurProxyDocker } from '../codex-security/adaptateurs/ConteneurProxyDocker.ts';
import { demarreProxy } from '../codex-security/cli/demarre-proxy.ts';
import { AttenteTemporisee } from '../noyau/adaptateurs/node/AttenteTemporisee.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();

process.exitCode = await demarreProxy(process.argv.slice(2), {
  conteneur: new ConteneurProxyDocker(join(racine, 'outils/codex-security')),
  reseau: new ReseauFetch(2000),
  attente: new AttenteTemporisee(),
  console,
});
