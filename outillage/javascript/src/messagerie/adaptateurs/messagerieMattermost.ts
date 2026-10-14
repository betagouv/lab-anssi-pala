import type {
  Message,
  MessagerieInstantanee,
} from '../domaine/messagerieInstantanee.ts';
import type { ApiHTTP } from '../../noyau/ports/apiHTTP.ts';
import { environnement } from '../../noyau/environnement.ts';

export class MessagerieMattermost implements MessagerieInstantanee {
  #apiHTTP: ApiHTTP;

  constructor(apiHTTP: ApiHTTP) {
    this.#apiHTTP = apiHTTP;
  }

  async envoyer(message: Message): Promise<void> {
    await this.#apiHTTP.poste(environnement.mattermost().urlWebhook, {
      text: message.contenu,
    });
  }
}
