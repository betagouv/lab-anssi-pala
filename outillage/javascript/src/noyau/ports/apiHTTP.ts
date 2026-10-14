export interface ApiHTTP {
  poste: (url: string, corps: object) => Promise<Response>;
}
