import { existsSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, relative } from 'node:path';
import type { ServeurCibleFumee } from '../ports/ServeurCibleFumee.ts';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

// Sert outils/shannon/smoke-target sur la boucle locale seulement (remplace python3 -m http.server).
export class ServeurCibleFumeeHttp implements ServeurCibleFumee {
  readonly #dossier: string;
  #serveur?: Server;

  constructor(dossier: string) {
    this.#dossier = dossier;
  }

  demarre(port: number): Promise<void> {
    this.#serveur = createServer((requete, reponse) => {
      const fichier = this.#fichierDemande(requete.url ?? '/');
      if (!fichier || !existsSync(fichier)) {
        reponse.writeHead(404).end();
        return;
      }
      reponse.writeHead(200, {
        'content-type': TYPES[extname(fichier)] ?? 'application/octet-stream',
      });
      reponse.end(readFileSync(fichier));
    });
    return new Promise((resoudre, rejeter) => {
      this.#serveur?.once('error', rejeter);
      this.#serveur?.listen(port, '127.0.0.1', resoudre);
    });
  }

  arrete(): Promise<void> {
    return new Promise((resoudre) =>
      this.#serveur ? this.#serveur.close(() => resoudre()) : resoudre()
    );
  }

  // Refuse toute sortie du dossier servi (« ../ », y compris encodé).
  #fichierDemande(url: string): string | undefined {
    const chemin = decodeURIComponent(
      new URL(url, 'http://localhost').pathname
    ).replace(/\/$/, '/index.html');
    const fichier = join(this.#dossier, chemin);
    return relative(this.#dossier, fichier).startsWith('..') ? undefined : fichier;
  }
}
