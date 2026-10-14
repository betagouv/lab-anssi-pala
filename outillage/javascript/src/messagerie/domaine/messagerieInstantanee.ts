export type Message = {
  contenu: string;
};

export interface MessagerieInstantanee {
  envoyer: (message: Message) => Promise<void>;
}
