export type AppelOutilChat = {
  id: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};

export type MessageChat = {
  role: string;
  content?: string | null;
  tool_calls?: AppelOutilChat[] | null;
  tool_call_id?: string;
};

export type DemandeChat = {
  // API compatible Chat Completions du fournisseur (baseUrl de sa description pi).
  url: string;
  cle: string;
  modele: string;
  messages: MessageChat[];
};

export type ReponseChat = {
  message: MessageChat;
  finDeReponse?: string;
  tokensDeSortie?: number;
};

// Une complétion, ou l'erreur réseau/HTTP qui l'a empêchée.
export interface ApiChat {
  complete(
    demande: DemandeChat
  ): Promise<{ reponse: ReponseChat } | { erreur: string }>;
}
