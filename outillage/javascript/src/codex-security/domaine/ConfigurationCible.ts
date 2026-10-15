import { Document, type YAMLSeq } from 'yaml';

// Objet-valeur : une configuration de projet Codex Security ciblée, rendue en YAML.
// Le périmètre (chemins) et le fournisseur sont renseignés depuis l'environnement ; les autres
// réglages Codex reprennent configs/config-cible.template.yaml.
export type ParametresConfigurationCible = {
  modele: string;
  fournisseur: string;
  urlProxy: string;
  chemins: string[];
};

const EN_TETE =
  ' yaml-language-server: $schema=../node_modules/@openai/codex-security/schemas/project-config.schema.json\n' +
  '\n' +
  " Config Codex Security CIBLÉE, générée automatiquement par l'outillage — ne pas éditer à la main.\n" +
  ' Fournisseur et proxy renseignés depuis le .env racine ; scan.scope.paths délimite le périmètre.';

export class ConfigurationCible {
  readonly #modele: string;
  readonly #fournisseur: string;
  readonly #urlProxy: string;
  readonly #chemins: string[];

  constructor({
    modele,
    fournisseur,
    urlProxy,
    chemins,
  }: ParametresConfigurationCible) {
    this.#modele = modele;
    this.#fournisseur = fournisseur;
    this.#urlProxy = urlProxy;
    this.#chemins = chemins;
  }

  versYaml(): string {
    const document = new Document({
      auth: 'api-key',
      scan: {
        mode: 'standard',
        scope: { paths: this.#chemins },
      },
      codex: {
        model: this.#modele,
        model_provider: this.#fournisseur,
        model_reasoning_effort: 'high',
        model_reasoning_summary: 'none',
        model_context_window: 131072,
        approval_policy: 'never',
        analytics: { enabled: false },
        model_providers: {
          [this.#fournisseur]: {
            name: `${this.#fournisseur} via LiteLLM`,
            base_url: `${this.#urlProxy}/v1`,
            env_key: 'LITELLM_API_KEY',
            wire_api: 'responses',
          },
        },
      },
    });
    document.commentBefore = EN_TETE;
    // Périmètre sur une seule ligne (style « flow »), comme les configs de référence.
    (document.getIn(['scan', 'scope', 'paths'], true) as YAMLSeq).flow = true;
    return document.toString();
  }
}
