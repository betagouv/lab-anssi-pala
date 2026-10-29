export type CibleScan = { nom: string; url: string; branche?: string };

export const nomDepuisUrl = (url: string): string => {
  const dernier = url.trim().replace(/\/+$/, '').split(/[/:]/).filter(Boolean).pop();
  const nom = dernier?.replace(/\.git$/, '') ?? '';
  if (!nom)
    throw new Error(
      `URL de cible invalide : « ${url} » (nom de dépôt introuvable).`
    );
  return nom;
};

const uneCible = (url: string, branche?: string): CibleScan =>
  branche === undefined
    ? { nom: nomDepuisUrl(url), url }
    : { nom: nomDepuisUrl(url), url, branche };

const valideListe = (cibles: CibleScan[]): CibleScan[] => {
  if (cibles.length === 0) throw new Error('Aucune cible à scanner.');
  const doublons = cibles
    .map((cible) => cible.nom)
    .filter((nom, index, noms) => noms.indexOf(nom) !== index);
  if (doublons.length > 0)
    throw new Error(
      `Noms de cibles en collision : ${[...new Set(doublons)].join(', ')} ` +
        '(deux dépôts homonymes ; renommer ou retirer l’un d’eux).'
    );
  return cibles;
};

export const ciblesEnLigne = (urls: string[], branche?: string): CibleScan[] =>
  valideListe(urls.map((url) => uneCible(url, branche)));

export const ciblesDepuisJson = (contenu: string, branche?: string): CibleScan[] => {
  let donnees: unknown;
  try {
    donnees = JSON.parse(contenu);
  } catch {
    throw new Error('Fichier de cibles illisible : JSON invalide.');
  }
  if (!Array.isArray(donnees))
    throw new Error('Fichier de cibles invalide : un tableau d’URLs est attendu.');
  if (donnees.some((url) => typeof url !== 'string'))
    throw new Error(
      'Fichier de cibles invalide : chaque entrée doit être une URL (chaîne).'
    );
  return ciblesEnLigne(donnees as string[], branche);
};
