import { join } from 'node:path';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { ApiChatFetch } from '../shannon/adaptateurs/ApiChatFetch.ts';
import { checkToolCalls } from '../shannon/cli/check-tool-calls.ts';

const racine = join(import.meta.dirname, '../../../..');

process.exitCode = await checkToolCalls(process.argv.slice(2), {
  apiChat: new ApiChatFetch({ maxTokens: Number(process.env.MAX_TOKENS || '4000') }),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console: new ConsoleNode(),
});
