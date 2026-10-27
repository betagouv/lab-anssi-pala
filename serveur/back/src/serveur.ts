import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import express, { type Request, type Response } from 'express';
import { type AdaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import type { Middleware } from './http/middleware.ts';

export type ConfigurationServeur = {
  adaptateurProtection: AdaptateurProtection;
  middleware: Middleware;
};

const creeApp = (config: ConfigurationServeur) => {
  const { adaptateurProtection, middleware } = config;
  const app = express();

  app.disable('x-powered-by');

  app.use(adaptateurProtection.protectionLimiteTrafic());

  app.use(middleware.positionneHeaders);

  app.get('/', (_: Request, reponse: Response) => envoieIndexAvecNonce(reponse));

  app.use(/\/((?!statique).)*/, middleware.interdisLaMiseEnCache);

  app.get('{*path}', (_: Request, reponse: Response) =>
    envoieIndexAvecNonce(reponse)
  );

  return app;
};

const lisLeFichierIndex = () => {
  const cheminIndex = path.join(process.cwd(), 'serveur/front/dist/index.html');
  return fs.readFileSync(cheminIndex, 'utf8');
};

const envoieIndexAvecNonce = (reponse: Response) => {
  const indexAvecLeNonce = lisLeFichierIndex().replace(
    '%%NONCE%%',
    reponse.locals['nonce']
  );

  reponse.setHeader('Content-Type', 'text/html').send(indexAvecLeNonce);
};

const creeServeur = (config: ConfigurationServeur) => {
  let serveur: http.Server;

  const app = creeApp(config);

  const ecoute = (port: number, succes: () => void) => {
    serveur = app.listen(port, succes);
  };
  const arreteEcoute = () => {
    serveur.close();
  };

  return { app, ecoute, arreteEcoute };
};

export { creeServeur };
