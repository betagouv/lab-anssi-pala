import { randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';

const CSP_BIBLIOTHEQUES = {
  viteHotReload: process.env.SVELTE_DEV_LOCAL_AVEC_HOT_RELOAD
    ? 'ws://localhost:3001'
    : '',
  labAnssiUiKit:
    'https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com',
};

export interface Middleware {
  interdisLaMiseEnCache: RequestHandler;
  positionneHeaders: RequestHandler;
}

export const middleware = (): Middleware => {
  const positionneHeaders: RequestHandler = (_requete, reponse, suite) => {
    const nonce = randomBytes(16).toString('base64');
    reponse.locals['nonce'] = nonce;

    const uiKit = CSP_BIBLIOTHEQUES.labAnssiUiKit;

    const defaultCsp = "default-src 'self'";
    const connectCsp = `connect-src 'self' ${CSP_BIBLIOTHEQUES.viteHotReload}`;
    const imgCsp = `img-src 'self' data: ${uiKit}`;
    const fontCsp = `font-src 'self' ${uiKit}`;
    const mediaCsp = `media-src 'self'`;

    const styleCsp = `style-src 'self' 'nonce-${nonce}' ${uiKit}`;
    const styleSrcElemCsp = `style-src-elem 'self' 'nonce-${nonce}' ${uiKit}`;
    const scriptCsp = `script-src 'self' 'nonce-${nonce}' ${uiKit}`;

    const toutesCsp = [
      defaultCsp,
      connectCsp,
      imgCsp,
      fontCsp,
      mediaCsp,
      styleCsp,
      styleSrcElemCsp,
      scriptCsp,
    ].filter((csp) => csp !== '');

    const DEUX_ANS = '63072000';

    reponse.set({
      'content-security-policy': `${toutesCsp.join('; ')}`,
      'strict-transport-security': `max-age=${DEUX_ANS}; includeSubDomains; preload`,
      'x-frame-options': 'deny',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-resource-policy': 'same-origin',
    });

    suite();
  };

  const interdisLaMiseEnCache: RequestHandler = (_requete, reponse, suite) => {
    reponse.set({
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      pragma: 'no-cache',
      expires: '0',
      'surrogate-control': 'no-store',
    });
    suite();
  };

  return {
    positionneHeaders,
    interdisLaMiseEnCache,
  };
};
