import { creeServeur } from './serveur.ts';
import { middleware } from './http/middleware.ts';
import { adaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import { EntrepotUtilisateursPostgres } from './infra/entrepots/postgres/entrepotUtilisateursPostgres.ts';
import { knexPALA } from '../../../noyau-partage/src/knex/knexfile.ts';
import { adaptateurEnvironnement } from './adaptateurs/adaptateurEnvironnement.ts';
import { LocalisateurServicesEnrolement } from './enrolement/localisateurServicesEnrolement.ts';

const entrepot = new EntrepotUtilisateursPostgres(knexPALA);

const leServeur = creeServeur({
  middleware: middleware(),
  adaptateurProtection: adaptateurProtection,
  localisateurServicesEnrolement: new LocalisateurServicesEnrolement(entrepot),
});

const { port, hote } = adaptateurEnvironnement.serveur();
leServeur.ecoute(port, hote, () => {
  console.log(`PALA est démarré et écoute ${hote}:${port} !…`);
});
