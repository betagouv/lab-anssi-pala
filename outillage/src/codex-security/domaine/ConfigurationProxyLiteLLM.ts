import { Document } from 'yaml';

const EN_TETE =
  " Config du proxy LiteLLM (model_list) GÉNÉRÉE automatiquement par l'outillage — ne pas éditer à la main.\n" +
  ' Le model_list est dérivé du .env racine (FOURNISSEUR_*) ; litellm_settings est conservé tel quel.\n' +
  ' Fichier non versionné (config-genere.yaml) ; la config de référence reste litellm/config.yaml.';

export type ConfigurationLiteLLM = {
  modele: string;
  coutEntreeParToken: number;
  coutSortieParToken: number;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  toolChoice?: string;
};

type ConfigurationCellar = {
  url: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  nomDuBucket: string;
};

export type EnvironnementProxyLiteLLM = {
  cheminFichierDeConfiguration: string;
  configuration: () => ConfigurationLiteLLM;
  cellar: () => ConfigurationCellar;
};

export class ConfigurationProxyLiteLLM {
  readonly #parametres: EnvironnementProxyLiteLLM;

  constructor(parametres: EnvironnementProxyLiteLLM) {
    this.#parametres = parametres;
  }

  get #modele(): string {
    return this.#parametres.configuration().modele;
  }

  get #coutEntreeParToken(): number {
    return this.#parametres.configuration().coutEntreeParToken;
  }

  get #coutSortieParToken(): number {
    return this.#parametres.configuration().coutSortieParToken;
  }

  #parametresOptionnels(): Record<string, number | string> {
    const { maxTokens, temperature, topP, presencePenalty, toolChoice } =
      this.#parametres.configuration();
    return {
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(temperature !== undefined && { temperature }),
      ...(topP !== undefined && { top_p: topP }),
      ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
      ...(toolChoice !== undefined && { tool_choice: toolChoice }),
    };
  }

  versYaml(): string {
    const document = new Document({
      model_list: [
        {
          model_name: this.#modele,
          litellm_params: {
            model: `hosted_vllm/${this.#modele}`,
            api_base: 'os.environ/FOURNISSEUR_BASE_URL',
            api_key: 'os.environ/FOURNISSEUR_API_KEY',
            use_chat_completions_api: true,
            timeout: 600,
            input_cost_per_token: this.#coutEntreeParToken,
            output_cost_per_token: this.#coutSortieParToken,
            ...this.#parametresOptionnels(),
          },
        },
      ],
      litellm_settings: {
        callbacks: 'json_schema_to_object.json_schema_vers_objet',
        max_budget: 10,
        budget_duration: '30d',
      },
    });
    document.commentBefore = EN_TETE;
    return document.toString();
  }
}
