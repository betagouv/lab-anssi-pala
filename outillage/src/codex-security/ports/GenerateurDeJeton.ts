// Jeton local partagé entre Codex et le proxy LiteLLM (« sk-local-… »).
export interface GenerateurDeJeton {
  jetonLocal(): string;
}
