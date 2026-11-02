const DOSSIER_CONFIGS = 'outils/codex-security/configs';

export const cheminConfigCible = (nomCible: string): string =>
  `${DOSSIER_CONFIGS}/config-${nomCible}.yaml`;

export const CHEMIN_CONFIG_PROXY_GENERE =
  'outils/codex-security/litellm/config-genere.yaml';
