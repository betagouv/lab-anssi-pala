import { join } from 'node:path';
import { genereConfig } from '../codex-security/cli/genere-config.ts';
import { DepotGitEnLigneDeCommande } from '../codex-security/adaptateurs/DepotGitEnLigneDeCommande.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

const racine = join(import.meta.dirname, '../../../..');

process.exitCode = await genereConfig(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console: new ConsoleNode(),
  depotGit: new DepotGitEnLigneDeCommande(racine),
});
