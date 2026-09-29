// Environnement du proxy LiteLLM (outils/codex-security/codex-security.env), dérivé du .env racine,
// source de vérité des clés. Seul le proxy lit les clés des fournisseurs ; Codex ne reçoit que le
// jeton local.
type Variables = Record<string, string | undefined>;

export class EnvironnementProxy {
  static readonly CHEMIN = "outils/codex-security/codex-security.env";

  readonly #variables: Record<string, string>;

  private constructor(variables: Record<string, string>) {
    this.#variables = variables;
  }

  static depuis(racine: Variables, jetonLocal: string): EnvironnementProxy {
    if (!racine.ALBERT_API_KEY) throw new Error("Erreur: ALBERT_API_KEY manquant ou vide dans .env");
    if (!racine.ALBERT_BASE_URL) throw new Error("Erreur: ALBERT_BASE_URL manquant dans .env");
    return new EnvironnementProxy({
      ALBERT_API_KEY: racine.ALBERT_API_KEY,
      ALBERT_BASE_URL: racine.ALBERT_BASE_URL,
      LITELLM_MASTER_KEY: jetonLocal,
      // Facultative : n'est utilisée que par le modèle deepseek-v4-flash-0731 du proxy.
      ...(racine.SCALEWAY_DEEPSEEK_API_KEY && { SCALEWAY_DEEPSEEK_API_KEY: racine.SCALEWAY_DEEPSEEK_API_KEY }),
    });
  }

  // Fournisseurs vers lesquels le proxy peut router, selon les clés présentes. Aucune clé affichée.
  get fournisseurs(): string {
    const albert = `Albert (${this.#variables.ALBERT_BASE_URL})`;
    return this.#variables.SCALEWAY_DEEPSEEK_API_KEY
      ? `${albert} + Scaleway (DeepSeek)`
      : `${albert} ; Scaleway absent (SCALEWAY_DEEPSEEK_API_KEY non renseignée dans .env)`;
  }

  get contenu(): string {
    return `${Object.entries(this.#variables)
      .map(([nom, valeur]) => `${nom}=${valeur}`)
      .join("\n")}\n`;
  }
}
