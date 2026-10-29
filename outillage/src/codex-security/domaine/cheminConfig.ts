const DOSSIER_CONFIGS = 'outils/codex-security/configs';

export const cheminConfigCible = (nomCible: string): string =>
  `${DOSSIER_CONFIGS}/config-${nomCible}.yaml`;
