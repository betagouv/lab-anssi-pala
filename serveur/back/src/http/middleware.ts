import type { RequestHandler } from 'express';

const CSP_BIBLIOTHEQUES = {
  viteHotReload: process.env.SVELTE_DEV_LOCAL_AVEC_HOT_RELOAD
    ? 'ws://localhost:3001'
    : '',
};

export interface Middleware {
  interdisLaMiseEnCache: RequestHandler;
  positionneHeaders: RequestHandler;
}

export const middleware = (): Middleware => {
  const positionneHeaders: RequestHandler = (_requete, reponse, suite) => {
    const defaultCsp = "default-src 'self'";
    const connectCsp = `connect-src 'self' ${CSP_BIBLIOTHEQUES.viteHotReload}`;
    const imgCsp = `img-src 'self'`;
    const mediaCsp = `media-src 'self'`;

    const styleCsp = `style-src 'self'`;
    const styleSrcElemCsp = `style-src-elem 'self'`;
    const scriptCsp = `script-src 'self'`;

    const toutesCsp = [
      defaultCsp,
      connectCsp,
      imgCsp,
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
