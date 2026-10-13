# PALA — Pentest agentique, Lab ANSSI

PALA est une suite d'**outils d'audit de sécurité pilotés par des agents LLM**, sur une
cible fournie par l'utilisateur, avec des **modèles souverains** (Albert — DINUM, Scaleway).

Le dépôt ne contient aucun résultat d'audit : il fournit l'outillage, les configurations d'exemple et
la méthode. Les cibles, les identifiants et les sorties de scan ne sont jamais versionnés.

## Les outils

| Outil                                                               | Rôle                                                                                     | Nature                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| [Codex Security](https://github.com/openai/codex-security) (OpenAI) | Analyse statique de code agentique : repère des faiblesses potentielles et les documente | Lit le code, hors ligne       |
| [Shannon](https://github.com/KeygraphHQ/shannon) (Keygraph)         | Pentest agentique dynamique sur une application en marche                                | Agit sur une instance vivante |

Les deux s'enchaînent : **Codex Security d'abord** (analyse statique, large et bon marché), puis
**Shannon** (validation dynamique, ponctuelle) sur les points qui méritent une preuve.

Chaque outil est branché sur un modèle via une API compatible **Chat Completions**. Pour Codex
Security, qui ne parle que l'API _Responses_, un **proxy LiteLLM local** fait la traduction et
garde la clé du fournisseur hors de l'environnement de l'agent (voir
`outils/codex-security/README.md`).

## Démarrage

Prérequis : Node.js ≥ 24, Python ≥ 3.10, Docker. Les modèles sont fournis par un fournisseur
compatible OpenAI (Albert ou Scaleway).

Il existe une CLI déclinée en bash et en Node. Les commandes fournies utilisent la CLI Node

```bash
cp .env.example .env            # renseigner FOURNISSEUR_NOM / _BASE_URL / _API_KEY
# préparer les sous-modules et cloner une cible arbitraire dans cible/copies/<nom> :
pnpm run bootstrap --project <nom> --url <url git>
pnpm run génère-env
```

La configuration du fournisseur se fait par les variables `FOURNISSEUR_*` du `.env` racine
(voir `documentation/albert-api.md` et `documentation/scaleway-ai-api.md`).

## Lancer une évaluation

**⚠️ Préconisation pour les scans :**

Éviter de lancer un scan sur l’intégralité d’un repo github, sauf si le repo est très petit :

- Une analyse demande du temps et consomme beaucoup de ressources et de tokens.
- Un dépot ou un répertoire trop volumineux peut entraîner des résultats incomplets voir incohérents
  (plus le contexte grossi, plus le modèle et le raisonnement deviennent complexes et sujets à erreurs).
- Il est préférable de scanner des fichiers individuels ou des répertoires spécifiques.

1. **Analyse statique** avec Codex Security : `pnpm démarre-proxy`, puis `pnpm scan` (dépôt entier)
   ou un scan ciblé via une config copiée depuis `configs/config-cible.template.yaml`. La
   confrontation d'un point précis au code se fait avec `pnpm validate`.
2. **Validation dynamique** avec Shannon : une instance **jetable** de la cible doit tourner en
   local (base de données jetable, données de test). `pnpm shannon` lance le pentest ; les
   configurations par intention (analyse, authentifié, création de compte, focus, SAST) sont dans
   `outils/shannon/configs/`.

Détails par outil : `outils/codex-security/README.md`, `outils/shannon/README.md`.
Méthode d'ensemble : `documentation/demarche.md`.

## Structure

```
outils/<outil>/        source/ (sous-module amont), configs, README (voir documentation/ajouter-un-outil.md)
outillage/bash/        scripts de lancement bash/Python
outillage/javascript/  portage TypeScript (Node 24, vitest, architecture hexagonale)
documentation/         démarche, notes API fournisseurs, versions
cible/                 copies locales des cibles (jamais versionnées)
```

## Sécurité et précautions

- **Aucune cible, aucun identifiant, aucune sortie de scan n'est versionné** (voir `.gitignore`).
  Les secrets vivent dans `.env` (non suivi) ; seuls les modèles `*.template.*` sont versionnés.
- Shannon agit réellement sur l'application en mode exploitation (écritures, comptes, e-mails) :
  **toujours une instance et une base jetables**, jamais un environnement de production.
- Le bac à sable de Codex Security a un accès en lecture au disque : ne pas le lancer sur une
  machine portant d'autres secrets.
