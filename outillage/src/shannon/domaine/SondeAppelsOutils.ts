import type { AppelOutilChat, MessageChat } from '../ports/ApiChat.ts';

// Conversation de sonde : Shannon pilote chaque phase par des appels d'outils multi-tours ; on
// demande au modèle d'appeler l'outil execute.
export const MESSAGES_SONDE: MessageChat[] = [
  {
    role: 'system',
    content:
      "Tu es un agent d'audit. Utilise les outils fournis pour agir, sans deviner.",
  },
  {
    role: 'user',
    content:
      "Liste le contenu du répertoire /workspace en utilisant l'outil execute.",
  },
];

// Premier appel d'outil du message s'il est exploitable par Shannon : l'outil execute, avec des
// arguments JSON portant une commande non vide (erreur fréquente : `command` absent).
export function jugeAppelOutil(
  message: MessageChat
): { appel: AppelOutilChat } | { raison: string } {
  const appel = message.tool_calls?.[0];
  if (!appel) return { raison: 'aucun tool_calls structure' };
  const nom = appel.function?.name;
  if (nom !== 'execute')
    return { raison: `outil inattendu: ${nom === undefined ? 'None' : `'${nom}'`}` };
  let args: unknown;
  try {
    args = JSON.parse(appel.function?.arguments || '');
  } catch {
    return { raison: 'arguments non JSON' };
  }
  const commande =
    args && typeof args === 'object'
      ? (args as { command?: unknown }).command
      : undefined;
  if (typeof commande !== 'string' || !commande)
    return { raison: "parametre 'command' absent ou vide" };
  return { appel };
}
