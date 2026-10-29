import type {
  Message,
  MessagerieInstantanee,
} from '../domaine/messagerieInstantanee.ts';
import type { ApiHTTP } from '../../noyau/ports/apiHTTP.ts';
import { environnement } from '../../noyau/environnement.ts';
import { ApiHTTPFetch } from '../../noyau/adaptateurs/node/apiHTTPFetch.ts';

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

class MessagerieMemoire implements MessagerieInstantanee {
  envoyer(_message: Message): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export const fabriqueMessagerie = (): MessagerieInstantanee => {
  if (environnement.mattermost().urlWebhook)
    return new MessagerieMattermost(new ApiHTTPFetch());
  return new MessagerieMemoire();
};
