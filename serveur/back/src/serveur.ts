import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import express, { type Request, type Response } from 'express';
import { type AdaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import type { Middleware } from './http/middleware.ts';
import type { Environnement } from './infra/environnement.ts';

export type ConfigurationServeur = {
  adaptateurProtection: AdaptateurProtection;
  adaptateurEnvironnement: Environnement;
  middleware: Middleware;
};

const CDN_LAB_ANSSI_UI_KIT =
  'https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com';

const lisVersionUiKit = (): string => {
  const cheminPkg = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(cheminPkg, 'utf8'));
  const version = pkg.runtimeDependencies?.['@lab-anssi/ui-kit'];
  if (!version)
    throw new Error(
      'Version de @lab-anssi/ui-kit absente de runtimeDependencies (package.json racine).'
    );
  return version;
};

const versionUiKit = lisVersionUiKit();

const balisesUiKit = () => {
  const base = `${CDN_LAB_ANSSI_UI_KIT}/${versionUiKit}`;
  return (
    `<link rel="stylesheet" nonce="%%NONCE%%" href="${base}/dsfr-variables.css">` +
    `<script nonce="%%NONCE%%" src="${base}/lab-anssi-ui-kit.iife.js"></script>`
  );
};

const creeApp = (config: ConfigurationServeur) => {
  const { adaptateurProtection, middleware, adaptateurEnvironnement } = config;
  const app = express();

  app.use(adaptateurProtection.protectionLimiteTrafic());

  app.disable('x-powered-by');
  app.set('trust proxy', adaptateurEnvironnement.trustProxy());

  app.use(middleware.positionneHeaders);

  app.use(
    '/statique',
    express.static(path.join(process.cwd(), 'serveur/front/dist'))
  );

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
  const indexAvecLeNonce = lisLeFichierIndex()
    .replace('</head>', `${balisesUiKit()}</head>`)
    .replaceAll('%%NONCE%%', reponse.locals['nonce']);

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
