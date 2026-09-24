#!/usr/bin/env bash
# Lance un scan Codex Security sur une copie de la cible, avec Albert (gpt-oss-120b) via le
# proxy LiteLLM local (voir start-proxy.sh, à lancer d'abord).
#
# Usage : bash outils/codex-security/scripts/run-scan.sh [options codex-security scan…]
#   ex. : bash outils/codex-security/scripts/run-scan.sh --dry-run
# Variables :
#   CODEX_TARGET  dépôt à scanner (défaut cible/copies/cible-exemple-codex, voir bootstrap.sh)
#   CODEX_CONFIG  fichier de configuration (défaut configs/albert-minimal.yaml)
#   CODEX_OUTPUT  dossier de sortie, vide (défaut resultats/brut/codex-security/scan-<horodatage>)
#   LITELLM_PORT  port du proxy (défaut 4000 ; doit correspondre à base_url dans CODEX_CONFIG)
#
# État et identité Codex isolés dans outils/codex-security/{codex-home,state}/ (non versionnés) :
# rien n'est lu ni écrit dans ~/.codex.
set -euo pipefail

outil="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
racine="$(cd "$outil/../.." && pwd)"
cible="${CODEX_TARGET:-$racine/cible/copies/cible-exemple-codex}"
config="${CODEX_CONFIG:-$outil/configs/albert-minimal.yaml}"
sortie="${CODEX_OUTPUT:-$racine/resultats/brut/codex-security/scan-$(date +%Y%m%d-%H%M%S)}"
port="${LITELLM_PORT:-4000}"
env_file="$outil/codex-security.env"
cli="$outil/node_modules/.bin/codex-security"

[ -x "$cli" ] || { echo "CLI absente : lancer scripts/bootstrap.sh (npm ci dans outils/codex-security)" >&2; exit 1; }
[ -f "$env_file" ] || { echo "Fichier manquant : $env_file (lancer scripts/start-proxy.sh)" >&2; exit 1; }
[ -d "$cible" ] || { echo "Cible manquante : $cible (lancer scripts/bootstrap.sh)" >&2; exit 1; }
curl -s -o /dev/null -m 5 "http://127.0.0.1:$port/health/liveliness" \
  || { echo "Proxy LiteLLM injoignable sur 127.0.0.1:$port (lancer scripts/start-proxy.sh)" >&2; exit 1; }

# Le jeton local du proxy est la seule clé transmise à Codex ; la clé Albert reste dans le proxy.
LITELLM_API_KEY="$(grep '^LITELLM_MASTER_KEY=' "$env_file" | cut -d= -f2-)"
export LITELLM_API_KEY
# Codex Security refuse de démarrer en mode api-key sans OPENAI_API_KEY/CODEX_API_KEY :
# on lui fournit le même jeton local. Il n'est envoyé qu'au fournisseur configuré (le proxy).
export CODEX_API_KEY="$LITELLM_API_KEY"
unset OPENAI_API_KEY

export CODEX_HOME="$outil/codex-home"
export CODEX_SECURITY_STATE_DIR="$outil/state"
export CODEX_SECURITY_NO_UPDATE_NOTICE=1
mkdir -p "$CODEX_HOME" "$CODEX_SECURITY_STATE_DIR" "$sortie"
chmod 700 "$CODEX_HOME" "$CODEX_SECURITY_STATE_DIR" "$sortie"

echo "Cible  : $cible"
echo "Config : $config"
echo "Sortie : $sortie"
exec "$cli" scan "$cible" -c "$config" --output-dir "$sortie" --headless "$@"