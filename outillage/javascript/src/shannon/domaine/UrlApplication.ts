// URL de l'application à auditer, en marche sur l'hôte. Le conteneur Shannon l'atteint via
// host.docker.internal : localhost et 127.0.0.1 y désignent le conteneur lui-même.
export class UrlApplication {
  readonly surLHote: string;

  constructor(url: string) {
    this.surLHote = url;
  }

  get depuisLeConteneur(): string {
    return this.surLHote.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal");
  }
}
