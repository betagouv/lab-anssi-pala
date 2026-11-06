import { creeServeur } from './serveur.ts';
import { middleware } from './http/middleware.ts';
import { adaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import { EntrepotUtilisateursEnMemoire } from './adaptateurs/entrepotUtilisateursEnMemoire.ts';
import { LocalisateurServicesEnrolement } from './enrolement/localisateurServicesEnrolement.ts';

const entrepot = new EntrepotUtilisateursEnMemoire();

const leServeur = creeServeur({
  middleware: middleware(),
  adaptateurProtection: adaptateurProtection,
  localisateurServicesEnrolement: new LocalisateurServicesEnrolement(entrepot),
});

const port = process.env.PORT || 8086;
leServeur.ecoute(port as number, () => {
  console.log(`PALA est démarré et écoute le port ${port} !…`);
});
