# Variables d'environnement

Ne jamais inscrire de secret réel dans ce document ni dans `../../.env.example`.

La source de vérité est le `.env` racine (copié depuis `.env.example`). En production
(`NODE_ENV=production`), la CLI lit directement l'environnement du processus.

## Fournisseur de modèles et proxy LiteLLM (CLI)

| Variable                               | Obligatoire | Défaut                                                                   | Description                                                                                                                      |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `FOURNISSEUR_NOM`                      | Non         | Aucun                                                                    | `albert` ou `scaleway`                                                                                                           |
| `FOURNISSEUR_BASE_URL`                 | Oui         | Aucun                                                                    | URL de l'API compatible Chat Completions                                                                                         |
| `FOURNISSEUR_API_KEY`                  | Oui         | Aucun                                                                    | Clé d'API du fournisseur                                                                                                         |
| `FOURNISSEUR_MODELE`                   | Oui         | Aucun                                                                    | Identifiant exact du modèle, espace de noms inclus                                                                               |
| `FOURNISSEUR_COUT_ENTREE_PAR_TOKEN`    | Oui (proxy) | Aucun                                                                    | Tarif d'entrée en $/token, pour le `model_list` du proxy et l'estimation du coût                                                 |
| `FOURNISSEUR_COUT_SORTIE_PAR_TOKEN`    | Oui (proxy) | Aucun                                                                    | Tarif de sortie en $/token                                                                                                       |
| `FOURNISSEUR_MAX_TOKENS`               | Non         | Omis                                                                     | Paramètre imposé par le proxy                                                                                                    |
| `FOURNISSEUR_TEMPERATURE`              | Non         | Omis                                                                     | Paramètre imposé par le proxy                                                                                                    |
| `FOURNISSEUR_TOP_P`                    | Non         | Omis                                                                     | Paramètre imposé par le proxy                                                                                                    |
| `FOURNISSEUR_PRESENCE_PENALTY`         | Non         | Omis                                                                     | Paramètre imposé par le proxy                                                                                                    |
| `FOURNISSEUR_TOOL_CHOICE`              | Non         | Omis                                                                     | `tool_choice` imposé par le proxy                                                                                                |
| `LITELLM_BASE_URL`                     | Oui         | Aucun                                                                    | URL du proxy, sans `/v1`. Une URL locale déclenche le conteneur Docker local ; sinon le proxy distant (Clever Cloud) est utilisé |
| `LITELLM_API_KEY`                      | Oui         | Aucun                                                                    | Clé créée côté proxy                                                                                                             |
| `LITELLM_CHEMIN_FICHIER_CONFIGURATION` | Oui (proxy) | Aucun                                                                    | Chemin où la configuration générée du proxy est écrite                                                                           |
| `LITELLM_DATABASE_URL`                 | Non         | Aucun                                                                    | Base PostgreSQL du proxy (plafond de budget)                                                                                     |
| `CODEX_LITE_LLM_IMAGE`                 | Non         | Image épinglée par empreinte dans `outillage/src/noyau/environnement.ts` | Image Docker du proxy                                                                                                            |
| `CODEX_LITE_LLM_APP`                   | Non         | Aucun                                                                    | Application du proxy distant                                                                                                     |

## Notification et rapports (CLI)

| Variable         | Obligatoire | Défaut | Description                                                         |
| ---------------- | ----------- | ------ | ------------------------------------------------------------------- |
| `MATTERMOST_URL` | Non         | Aucun  | Webhook Mattermost recevant le compte rendu de fin de scan          |
| `PALA_BASE_URL`  | Non         | Aucun  | URL publique de PALA, utilisée pour le lien vers le rapport de scan |

## Stockage Cellar (CLI, proxy distant)

| Variable                   | Obligatoire      | Défaut | Description           |
| -------------------------- | ---------------- | ------ | --------------------- |
| `CELLAR_ACCESS_KEY_ID`     | Si proxy distant | Aucun  | Clé d'accès           |
| `CELLAR_SECRET_ACCESS_KEY` | Si proxy distant | Aucun  | Secret d'accès        |
| `CELLAR_NOM_DU_BUCKET`     | Si proxy distant | Aucun  | Bucket cible          |
| `CELLAR_REGION`            | Si proxy distant | Aucun  | Région                |
| `CELLAR_URL`               | Si proxy distant | Aucun  | URL du service Cellar |

## Shannon (CLI)

`SHANNON_AI_API_KEY` et `SHANNON_AI_MODEL` vivent dans `outils/shannon/shannon.env`, généré par
`pnpm pala:génère-env` à partir du `.env` racine.

| Variable                    | Obligatoire | Défaut | Description                                            |
| --------------------------- | ----------- | ------ | ------------------------------------------------------ |
| `SHANNON_ESPACE_DE_TRAVAIL` | Non         | Aucun  | Espace de travail Shannon                              |
| `RUNS`                      | Non         | `5`    | Nombre d'essais de la vérification des appels d'outils |
| `SMOKE_PORT`                | Non         | `8080` | Port de la cible du test de fumée                      |
| `TEST_PIPELINE_ACTIVE`      | Non         | Faux   | `true` active le pipeline de test                      |

## Serveur

| Variable                                       | Obligatoire | Défaut | Description                                                                                       |
| ---------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------- |
| `PALA_PORT`                                    | Oui         | Aucun  | Port d'écoute (ex. `8086`). Validé au démarrage                                                   |
| `PALA_HOTE`                                    | Oui         | Aucun  | Interface d'écoute (`localhost` en local, `0.0.0.0` dans Docker)                                  |
| `NB_REQUETES_MAX_PAR_MINUTE`                   | Non         | `0`    | Limite de trafic globale                                                                          |
| `NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE` | Non         | `0`    | Limite de trafic des points d'accès sensibles                                                     |
| `NB_REQUETES_TRUST_PROXY`                      | Oui         | Aucun  | Nombre de proxys en amont, ou configuration `trust proxy` d'Express. Le serveur échoue si absente |
| `ENROLEMENT_DOMAINE`                           | Oui         | Aucun  | Identifiant de partie de confiance WebAuthn (`rpID`)                                              |
| `ENROLEMENT_ORIGINE`                           | Oui         | Aucun  | Origine attendue des cérémonies WebAuthn                                                          |
| `ENROLEMENT_SECRET_SESSION`                    | Oui         | Aucun  | Secret de la session d'enrôlement                                                                 |
| `ENROLEMENT_SERVICE`                           | Non         | `PALA` | Nom du service affiché lors de l'enrôlement                                                       |
| `NODE_ENV`                                     | Non         | Aucun  | `development` : proxy vers Vite et CSP désactivée ; `production` : cookie de session `secure`     |
| `SVELTE_DEV_LOCAL_AVEC_HOT_RELOAD`             | Non         | Aucun  | Autorise le WebSocket de rechargement à chaud de Vite dans la CSP                                 |

## Base de données (serveur et CLI)

| Variable                   | Obligatoire | Défaut | Description                 |
| -------------------------- | ----------- | ------ | --------------------------- |
| `BASE_DONNEES_URL`         | Oui         | Aucun  | URL de connexion PostgreSQL |
| `BASE_DE_DONNEES_MAX_POOL` | Non         | `10`   | Taille maximale du pool     |
| `BASE_DE_DONNEES_MIN_POOL` | Non         | `0`    | Taille minimale du pool     |

## Construction Docker

| Variable       | Obligatoire | Défaut | Description                                                                      |
| -------------- | ----------- | ------ | -------------------------------------------------------------------------------- |
| `NODE_VERSION` | Oui         | Aucun  | Argument de construction des images, lu dans `.nvmrc` par `scripts/dev/start.sh` |

Toute nouvelle variable doit être ajoutée ici et dans `../../.env.example`.
