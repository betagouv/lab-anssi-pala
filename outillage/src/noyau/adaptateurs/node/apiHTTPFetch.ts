import type { ApiHTTP } from '../../ports/apiHTTP.ts';

export class ApiHTTPFetch implements ApiHTTP {
  poste(url: string, corps: object): Promise<Response> {
    return fetch(url, { body: JSON.stringify(corps), method: 'POST' });
  }
}
