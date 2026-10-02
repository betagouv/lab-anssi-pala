// Racine de composition : vérifie les appels d'outils du modèle de Shannon.
import { join } from "node:path";
import { ConsoleNode } from "../noyau/adaptateurs/node/consoleNode.ts";
import { EnvironnementProcessus } from "../noyau/adaptateurs/node/EnvironnementProcessus.ts";
import { SystemeDeFichierNode } from "../noyau/adaptateurs/node/SystemeDeFichierNode.ts";
import { ApiChatFetch } from "../shannon/adaptateurs/ApiChatFetch.ts";
import { checkToolCalls } from "../shannon/cli/check-tool-calls.ts";

<<<<<<< Updated upstream
const racine = join(import.meta.dirname, "../../..");
=======
const racine = join(import.meta.dirname, '../../../..');
>>>>>>> Stashed changes

process.exitCode = await checkToolCalls(process.argv.slice(2), {
  racine,
  // pnpm exécute depuis la racine du paquet mais garde le répertoire d'appel dans INIT_CWD.
  repertoireAppel: process.env.INIT_CWD || process.cwd(),
  apiChat: new ApiChatFetch({ maxTokens: Number(process.env.MAX_TOKENS || "4000") }),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  environnement: new EnvironnementProcessus(),
  console: new ConsoleNode(),
});
