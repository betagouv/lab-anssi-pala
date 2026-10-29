import { creeServeur } from './serveur.ts';
import { middleware } from './http/middleware.ts';
import { adaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import { adaptateurEnvironnement } from './adaptateurs/adaptateurEnvironnement.ts';

const leServeur = creeServeur({
  middleware: middleware(),
  adaptateurProtection: adaptateurProtection,
  adaptateurEnvironnement: adaptateurEnvironnement,
});

const port = process.env.PORT || 8086;
leServeur.ecoute(port as number, () => {
  console.log(`PALA est démarré et écoute le port ${port} !…`);
});
