// Racine de composition : démarre le proxy LiteLLM depuis la racine du dépôt.
import { join } from "node:path";
import { ConteneurProxyDocker } from "../codex-security/adaptateurs/ConteneurProxyDocker.ts";
import { GenerateurDeJetonAleatoire } from "../codex-security/adaptateurs/GenerateurDeJetonAleatoire.ts";
import { GenereEnvironnementProxy } from "../codex-security/application/genereEnvironnementProxy.ts";
import { startProxy } from "../codex-security/cli/start-proxy.ts";
import { AttenteTemporisee } from "../noyau/adaptateurs/node/AttenteTemporisee.ts";
import { ConsoleNode } from "../noyau/adaptateurs/node/consoleNode.ts";
import { EnvironnementProcessus } from "../noyau/adaptateurs/node/EnvironnementProcessus.ts";
import { ReseauFetch } from "../noyau/adaptateurs/node/ReseauFetch.ts";
import { SystemeDeFichierNode } from "../noyau/adaptateurs/node/SystemeDeFichierNode.ts";

<<<<<<< Updated upstream
const racine = join(import.meta.dirname, "../../..");
=======
const racine = join(import.meta.dirname, '../../../..');
>>>>>>> Stashed changes
const console = new ConsoleNode();
const environnement = new EnvironnementProcessus();

process.exitCode = await startProxy(process.argv.slice(2), {
  generation: new GenereEnvironnementProxy({
    systemeDeFichier: new SystemeDeFichierNode(racine),
    generateurDeJeton: new GenerateurDeJetonAleatoire(),
    environnement,
    console,
  }),
  conteneur: new ConteneurProxyDocker(join(racine, "outils/codex-security")),
  reseau: new ReseauFetch(2000),
  attente: new AttenteTemporisee(),
  environnement,
  console,
});
