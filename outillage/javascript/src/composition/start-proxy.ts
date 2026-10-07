// Racine de composition : démarre le proxy LiteLLM depuis la racine du dépôt.
import { join } from 'node:path';
import { ConteneurProxyDocker } from '../codex-security/adaptateurs/ConteneurProxyDocker.ts';
import { GenerateurDeJetonAleatoire } from '../codex-security/adaptateurs/GenerateurDeJetonAleatoire.ts';
import { GenereEnvironnementProxy } from '../codex-security/application/genereEnvironnementProxy.ts';
import { startProxy } from '../codex-security/cli/start-proxy.ts';
import { AttenteTemporisee } from '../noyau/adaptateurs/node/AttenteTemporisee.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();

process.exitCode = await startProxy(process.argv.slice(2), {
  conteneur: new ConteneurProxyDocker(join(racine, 'outils/codex-security')),
  reseau: new ReseauFetch(2000),
  attente: new AttenteTemporisee(),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
});
