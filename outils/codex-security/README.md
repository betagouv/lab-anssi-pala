# Codex Security

Analyse de code agentique [Codex Security](https://github.com/openai/codex-security) (OpenAI),
branchée sur un **modèle souverain** (Albert — DINUM, ou Scaleway) via un proxy LiteLLM local. Un
scan est une session Codex (agents, appels d'outils shell en bac à sable) pilotée par le plugin de
sécurité.

Les chemins ci-dessous sont relatifs à la racine du dépôt.

## Pourquoi un proxy LiteLLM

1. **Codex ne parle que l'API Responses** d'OpenAI (`wire_api = "chat"` est refusé).
2. **Les fournisseurs souverains n'exposent que Chat Completions** (`/v1/responses` → 404 chez
   Albert ; côté Scaleway, Responses n'est pas servi pour tous les modèles).
3. D'où un **proxy LiteLLM local** (`litellm/config.yaml`) qui expose `/v1/responses` et le
   traduit en Chat Completions (`use_chat_completions_api: true`). La clé du fournisseur reste
   dans le proxy, hors de l'environnement de Codex.
4. Le proxy peut appliquer un **hook** (`litellm/json_schema_to_object.py`) : certains modèles se
   dégradent sous décodage contraint par schéma JSON ; le hook remplace alors `json_schema` par
   `json_object` et passe le schéma en consigne. Il impose aussi les paramètres d'échantillonnage
   que Codex ne transmet pas et, pour les modèles qui l'exigent, `tool_choice: auto`.

```
codex-security ──Responses──▶ LiteLLM (127.0.0.1:4000) ──Chat Completions──▶ fournisseur
   jeton local LITELLM_API_KEY                   clé du fournisseur (reste dans le proxy)
```

Réglages Codex utiles (section `codex` des configs) : fournisseur personnalisé pointant le proxy
(`wire_api: responses`), `model_reasoning_effort: high`, `model_reasoning_summary: none` (sinon un
champ de résumé de raisonnement provoque un 400 côté fournisseur), fenêtre de contexte explicite,
`approval_policy: never` (durcissement : une demande d'élévation échoue au lieu d'être auto-revue),
télémétrie désactivée.

## Contenu de `outils/codex-security/`

```
source/                           sous-module : dépôt amont (jamais modifié)
package.json, package-lock.json   CLI npm figée ; node_modules/ non versionné
codex-security.env.template       modèle ; codex-security.env généré (non versionné)
litellm/config.yaml               proxy Responses -> Chat Completions
litellm/json_schema_to_object.py  hook du proxy (format de sortie, paramètres)
configs/config-defaut.yaml        config par défaut (dépôt entier)
configs/config-cible.template.yaml  template d'un scan ciblé (scope.paths à renseigner)
configs/*-minimal.yaml            exemples de périmètre (chemins génériques)
configs/consignes-scan.md         consignes de scan pas à pas (--scan-prompt-file)
scripts/                          generate-env.sh, start-proxy.sh, env-runtime.sh,
                                  run-scan.sh, validate.sh + validate.mjs (SDK)
codex-home/, state/               identité Codex et historique de scan (non versionnés)
```

La cible est un clone git dans `cible/copies/<nom>`, créé par le bootstrap ; les sorties sont
écrites **hors** du dépôt de la cible (contrainte de Codex Security).

## Utilisation

Une CLI est disponible et est déclinée en 2 versions, une `bash` et une `TypeScript`.
L’exécution de la CLI s’opère depuis la racine du projet PALA.

### Lancer un scan

Pour afficher l'aide et obtenir la liste des paramètres (et leurs valeurs par défaut) :
```bash
pnpm run scan --help
```

Pour lancer le scan
```bash
pnpm run start-proxy
pnpm scan --cible <CHEMIN CIBLE> --config <CHEMIN CONFIG>
```

Une **estimation du coût** est affichée en fin de scan
(tokens × tarif du fournisseur ; Albert gratuit).

Les consignes de scan sont **génériques** : le périmètre est fourni par le SDK
(`ecrit-artefacts-scan.py --liste-perimetre`) et les contrôles s'appuient sur **l'OWASP API Security
Top 10**. Pour votre cible, copier `config-cible.template.yaml` et y fixer `scope.paths`.

### Validation d'un point précis

Pour afficher l'aide et obtenir la liste des paramètres (et leurs valeurs par défaut) :
```bash
pnpm run validate --help
```

Pour lancer la validation d'un point précis :
```bash
pnpm run validate --cible <CHEMIN CIBLE>  --finding-file <CHEMIN FICHIER finding.json>
```

`finding.json` décrit un point à confronter au code (titre, emplacement, catégorie, description).
La CLI `validate` n'applique pas de fournisseur personnalisé ; `validate.mjs` passe
donc par le SDK (`CodexSecurity.validate()`), qui applique la section `codex` de la configuration.

## Maîtrise du coût

Le garde-fou natif de Codex s'appuie sur des tarifs OpenAI codés en dur, inutilisable ici. Le
budget se règle **au niveau du proxy LiteLLM** : prix par modèle (`input/output_cost_per_token`)
puis plafond global `litellm_settings.max_budget` + `budget_duration`. L'application du plafond
exige une base de données connectée au proxy (sinon le coût est seulement *suivi*) ; détails et
variante Postgres jetable dans `litellm/config.yaml`. Sans base, les
leviers restent le **périmètre** (`scope.paths`), le **mode** (`standard` plutôt que `deep`) et un
budget côté console du fournisseur.

## Notes

- Choisir un modèle qui gère bien les **appels d'outils en plusieurs tours** et, si le flux impose
  un schéma de sortie, le **décodage contraint** ; ces deux capacités varient d'un modèle à l'autre
  (voir `outils/shannon/scripts/check_tool_calls.py`).
- Certains fournisseurs ne comptent pas le raisonnement ni les tours d'outils dans les tokens de
  sortie : les estimations de coût correspondantes sont alors sous-estimées.
