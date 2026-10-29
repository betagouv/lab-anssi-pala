import { describe, expect, it } from 'vitest';
import { MessagerieMattermost } from '../../../src/messagerie/adaptateurs/messagerieMattermost.ts';
import type { ApiHTTP } from '../../../src/noyau/ports/apiHTTP.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

class ApiHTTPMemoire implements ApiHTTP {
  #statutReponseAttendue = 0;
  #messageEnvoye = {};
  #urlCiblee = '';

  poste(url: string, corps: object): Promise<Response> {
    this.#urlCiblee = url;
    this.#messageEnvoye = corps;
    this.#statutReponseAttendue = 200;
    return Promise.resolve({ status: 200 } as Response);
  }

  get statutReponseAttendue(): number {
    return this.#statutReponseAttendue;
  }
  get messageEnvoye(): object {
    return this.#messageEnvoye;
  }
  get urlCiblee(): string {
    return this.#urlCiblee;
  }
}

describe('Messagerie Mattermost', () => {
  it('envoie un message', () => {
    environnement.mattermost = () => ({ urlWebhook: 'http://messagerie.local' });
    const apiHTTP = new ApiHTTPMemoire();
    const messagerie = new MessagerieMattermost(apiHTTP);

    messagerie.envoyer({ contenu: 'Mon super message' });

    expect(apiHTTP.statutReponseAttendue).toBe(200);
    expect(apiHTTP.messageEnvoye).toEqual({ text: 'Mon super message' });
    expect(apiHTTP.urlCiblee).toEqual('http://messagerie.local');
  });
});
