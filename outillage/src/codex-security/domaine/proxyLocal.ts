// Décide s'il faut démarrer le conteneur proxy LiteLLM en local.
// En local, l'URL pointe vers la boucle locale (ou est laissée vide = proxy local par défaut) ;
// un proxy distant (déployé sur Clever) est déjà en service et ne doit pas être redémarré ici.
const HOTES_LOCAUX = ['localhost', '127.0.0.1', '[::1]', '::1'];

export const proxyEstLocal = (urlLiteLLM: string): boolean => {
  if (urlLiteLLM === '') return true;
  try {
    return HOTES_LOCAUX.includes(new URL(urlLiteLLM).hostname);
  } catch {
    return false;
  }
};
