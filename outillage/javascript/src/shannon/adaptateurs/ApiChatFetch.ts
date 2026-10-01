import type { ApiChat, DemandeChat, MessageChat, ReponseChat } from "../ports/ApiChat.ts";

// Outil proposé au modèle : celui par lequel Shannon pilote le bac à sable.
const OUTILS = [
  {
    type: "function",
    function: {
      name: "execute",
      description: "Exécute une commande shell dans le bac à sable et renvoie stdout, stderr et le code de sortie.",
      parameters: {
        type: "object",
        properties: { command: { type: "string", description: "Commande shell à exécuter." } },
        required: ["command"],
      },
    },
  },
];

type Reponse = {
  choices: { message: MessageChat; finish_reason?: string }[];
  usage?: { completion_tokens?: number };
};

// API compatible Chat Completions (Albert, Scaleway…), interrogée par fetch.
export class ApiChatFetch implements ApiChat {
  readonly #maxTokens: number;
  readonly #delaiMs: number;

  constructor({ maxTokens = 4000, delaiMs = 120_000 }: { maxTokens?: number; delaiMs?: number } = {}) {
    this.#maxTokens = maxTokens;
    this.#delaiMs = delaiMs;
  }

  async complete({ url, cle, modele, messages }: DemandeChat): Promise<{ reponse: ReponseChat } | { erreur: string }> {
    try {
      const reponse = await fetch(`${url}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cle}`,
          "Content-Type": "application/json",
          "User-Agent": "audit-check-tool-calls/1.0",
        },
        body: JSON.stringify({ model: modele, messages, tools: OUTILS, tool_choice: "auto", max_tokens: this.#maxTokens }),
        signal: AbortSignal.timeout(this.#delaiMs),
      });
      if (!reponse.ok) return { erreur: `http_${reponse.status}: ${(await reponse.text()).slice(0, 200)}` };
      const { choices, usage } = (await reponse.json()) as Reponse;
      return {
        reponse: { message: choices[0].message, finDeReponse: choices[0].finish_reason, tokensDeSortie: usage?.completion_tokens },
      };
    } catch (erreur) {
      return { erreur: `reseau: ${erreur instanceof Error ? erreur.name : "Erreur"}` };
    }
  }
}
