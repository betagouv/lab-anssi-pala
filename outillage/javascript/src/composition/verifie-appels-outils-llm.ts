import { join } from 'node:path';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { ApiChatFetch } from '../shannon/adaptateurs/ApiChatFetch.ts';
import { verifieAppelsOutilsLLM } from '../shannon/cli/verifie-appels-outils-llm.ts';

const racine = join(import.meta.dirname, '../../../..');

process.exitCode = await verifieAppelsOutilsLLM(process.argv.slice(2), {
  racine,
  apiChat: new ApiChatFetch({ maxTokens: Number(process.env.MAX_TOKENS || '4000') }),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console: new ConsoleNode(),
});
