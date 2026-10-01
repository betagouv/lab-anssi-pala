# À sourcer (pas à exécuter) : prépare l'environnement commun aux commandes Codex Security
# lancées contre Albert via le proxy LiteLLM (run-scan.sh, validate.sh).
# Définit : outil, racine, cible, config, port ; exporte les variables Codex.
# shellcheck shell=bash

outil="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
racine="$(cd "$outil/../.." && pwd)"
# Cible fournie par CODEX_TARGET (dépôt agnostique : aucune cible par défaut).
cible="${CODEX_TARGET:-}"
# Défaut : DeepSeek servi par Albert, dépôt entier (config-defaut.yaml). gpt-oss n'est plus le
# défaut (il n'écrit pas les artefacts). Pour un scan ciblé : copier config-cible.template.yaml.
config="${CODEX_CONFIG:-$outil/configs/config-defaut.yaml}"
port="${LITELLM_PORT:-4000}"
env_file="$outil/codex-security.env"

[ -x "$outil/node_modules/.bin/codex-security" ] || { echo "CLI absente : lancer outillage/bash/bootstrap.sh (npm ci dans outils/codex-security)" >&2; exit 1; }
[ -f "$env_file" ] || { echo "Fichier manquant : $env_file (lancer scripts/start-proxy.sh)" >&2; exit 1; }
[ -n "$cible" ] || { echo "CODEX_TARGET non défini : indiquer la cible, ex. CODEX_TARGET=\"\$PWD/cible/copies/<nom>\" (voir outillage/bash/bootstrap.sh --project <nom> --url <git-url>)" >&2; exit 1; }
[ -d "$cible" ] || { echo "Cible manquante : $cible (cloner via outillage/bash/bootstrap.sh --project <nom> --url <git-url>)" >&2; exit 1; }
curl -s -o /dev/null -m 5 "http://127.0.0.1:$port/health/liveliness" \
  || { echo "Proxy LiteLLM injoignable sur 127.0.0.1:$port (lancer scripts/start-proxy.sh)" >&2; exit 1; }

# Le jeton local du proxy est la seule clé transmise à Codex ; la clé Albert reste dans le proxy.
LITELLM_API_KEY="$(grep '^LITELLM_MASTER_KEY=' "$env_file" | cut -d= -f2-)"
export LITELLM_API_KEY
# Codex Security refuse de démarrer en mode api-key sans OPENAI_API_KEY/CODEX_API_KEY :
# on lui fournit le même jeton local. Il n'est envoyé qu'au fournisseur configuré (le proxy).
export CODEX_API_KEY="$LITELLM_API_KEY"
unset OPENAI_API_KEY

# Identité et historique Codex isolés : rien n'est lu ni écrit dans ~/.codex.
export CODEX_HOME="$outil/codex-home"
export CODEX_SECURITY_STATE_DIR="$outil/state"
export CODEX_SECURITY_NO_UPDATE_NOTICE=1
# Script d'écriture des artefacts appelé par l'agent (configs/consignes-scan.md, étape 4).
export CODEX_SCAN_ECRIT_ARTEFACTS="$outil/scripts/ecrit-artefacts-scan.py"
mkdir -p "$CODEX_HOME" "$CODEX_SECURITY_STATE_DIR"
chmod 700 "$CODEX_HOME" "$CODEX_SECURITY_STATE_DIR"