// Dossier des configs Codex Security (versionné : aucun secret dans les configs).
const DOSSIER_CONFIGS = 'outils/codex-security/configs';

// Nom de cible par défaut, tant que l'outillage ne scanne qu'un projet.
export const NOM_CIBLE_PAR_DEFAUT = 'cible';

// Génère le chemin du fichier de config ciblée, distinct par cible : l'outillage l'industrialise
// pour plusieurs projets, et ce chemin est ensuite passé à la CLI de scan (option --config).
export const cheminConfigCible = (nomCible: string): string =>
  `${DOSSIER_CONFIGS}/config-${nomCible}.yaml`;

// Périmètre à scanner, en dur pour l'instant. Sera bientôt valorisé par la sortie d'un
// `git diff` sur N jours glissants (chemins relatifs au dépôt cible).
export const CHEMINS_A_SCANNER_PAR_DEFAUT = ['src'];
