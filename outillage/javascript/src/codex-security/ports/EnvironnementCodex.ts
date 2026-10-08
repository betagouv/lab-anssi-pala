export type EnvironnementCodex = NodeJS.ProcessEnv & {
  LITELLM_API_KEY: string;
  CODEX_API_KEY: string;
  CODEX_HOME: string;
  CODEX_SECURITY_STATE_DIR: string;
  CODEX_SECURITY_NO_UPDATE_NOTICE: string;
  CODEX_SCAN_ECRIT_ARTEFACTS: string;
};
