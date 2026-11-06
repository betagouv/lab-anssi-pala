import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import express, { type Request, type Response } from 'express';
import session from 'express-session';
import { type AdaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import type { Middleware } from './http/middleware.ts';
import type { Environnement } from './infra/environnement.ts';
import {
  creeRouteEnrolement,
  type ServicesEnrolement,
} from './http/routeEnrolement.ts';

export type ConfigurationServeur = {
  adaptateurProtection: AdaptateurProtection;
  adaptateurEnvironnement: Environnement;
  middleware: Middleware;
  servicesEnrolement: ServicesEnrolement;
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

const sessionEnrolement = () =>
  session({
    name: 'pala.enrolement',
    secret: process.env.SESSION_SECRET ?? 'pala-enrolement-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 5 * 60 * 1000,
    },
  });

const creeApp = (config: ConfigurationServeur) => {
  const {
    adaptateurProtection,
    middleware,
    adaptateurEnvironnement,
    servicesEnrolement,
  } = config;
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

  app.get('/enrolement', (_: Request, reponse: Response) =>
    envoieIndexAvecNonce(reponse, 'enrolement/index.html')
  );

  app.use(
    '/enrolement',
    sessionEnrolement(),
    express.json({ limit: '64kb' }),
    creeRouteEnrolement(servicesEnrolement)
  );

  app.use(/\/((?!statique).)*/, middleware.interdisLaMiseEnCache);

  app.get('{*path}', (_: Request, reponse: Response) =>
    envoieIndexAvecNonce(reponse)
  );

  return app;
};

const lisLeFichierIndex = (cheminRelatifIndex: string) => {
  const cheminIndex = path.join(
    process.cwd(),
    'serveur/front/dist',
    cheminRelatifIndex
  );
  return fs.readFileSync(cheminIndex, 'utf8');
};

const envoieIndexAvecNonce = (
  reponse: Response,
  cheminRelatifIndex = 'index.html'
) => {
  const indexAvecLeNonce = lisLeFichierIndex(cheminRelatifIndex)
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
