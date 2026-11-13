import { creeServeur } from './serveur.ts';
import { middleware } from './http/middleware.ts';
import { adaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import { adaptateurEnvironnement } from './adaptateurs/adaptateurEnvironnement.ts';
import { LocalisateurServicesEnrolement } from './enrolement/localisateurServicesEnrolement.ts';
import { fabriqueEntrepots } from './infra/entrepots.ts';

const entrepots = fabriqueEntrepots();
const leServeur = creeServeur({
  middleware: middleware(),
  adaptateurProtection: adaptateurProtection,
  localisateurServicesEnrolement: new LocalisateurServicesEnrolement(
    entrepots.utilisateurs
  ),
  entrepots: entrepots,
});

const { port, hote } = adaptateurEnvironnement.serveur();
leServeur.ecoute(port, hote, () => {
  console.log(`PALA est démarré et écoute ${hote}:${port} !…`);
});
