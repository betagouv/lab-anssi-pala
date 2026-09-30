import type { ApiChat, DemandeChat, ReponseChat } from "../../src/shannon/ports/ApiChat.ts";

type Resultat = { reponse: ReponseChat } | { erreur: string };

// Par défaut, un modèle bien élevé : il appelle l'outil execute, puis répond une fois le résultat
// de l'outil reçu. Un script de résultats peut remplacer ce comportement, appel par appel.
export class ApiChatSimulee implements ApiChat {
  readonly demandes: DemandeChat[] = [];
  readonly #script?: Resultat[];

  constructor(script?: Resultat[]) {
    this.#script = script && [...script];
  }

  async complete(demande: DemandeChat): Promise<Resultat> {
    this.demandes.push(demande);
    if (this.#script) return this.#script.shift()!;
    const resultatOutilRecu = demande.messages.at(-1)?.role === "tool";
    return resultatOutilRecu
      ? { reponse: { message: { role: "assistant", content: "Le répertoire contient README.md et src." } } }
      : {
          reponse: {
            message: {
              role: "assistant",
              content: null,
              tool_calls: [{ id: "appel-1", type: "function", function: { name: "execute", arguments: '{"command":"ls /workspace"}' } }],
            },
            finDeReponse: "tool_calls",
            tokensDeSortie: 42,
          },
        };
  }
}
