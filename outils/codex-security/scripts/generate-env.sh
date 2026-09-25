#!/usr/bin/env bash
# Génère outils/codex-security/codex-security.env à partir du .env racine (source de vérité
# Albert). Ne jamais committer le fichier généré.
#
# Mapping :
#   ALBERT_API_KEY   -> ALBERT_API_KEY      (lu par le proxy LiteLLM uniquement)
#   ALBERT_BASE_URL  -> ALBERT_BASE_URL
#   SCALEWAY_DEEPSEEK_API_KEY -> SCALEWAY_DEEPSEEK_API_KEY (optionnelle, proxy LiteLLM uniquement)
#   (généré)         -> LITELLM_MASTER_KEY  (jeton local entre Codex et le proxy)
#
# Le jeton local est conservé s'il existe déjà, pour ne pas invalider un proxy en marche.
#
# Usage : ./outils/codex-security/scripts/generate-env.sh
set -euo pipefail

OUTIL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$OUTIL_DIR/../.." && pwd)"
ROOT_ENV="$ROOT_DIR/.env"
OUT_ENV="$OUTIL_DIR/codex-security.env"

[ -f "$ROOT_ENV" ] || { echo "Erreur: fichier .env introuvable à la racine ($ROOT_ENV)" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ROOT_ENV"
set +a

: "${ALBERT_API_KEY:?ALBERT_API_KEY manquant ou vide dans .env}"
: "${ALBERT_BASE_URL:?ALBERT_BASE_URL manquant dans .env}"

master_key=""
if [ -f "$OUT_ENV" ]; then
  master_key="$(grep '^LITELLM_MASTER_KEY=sk-' "$OUT_ENV" | cut -d= -f2- || true)"
fi
[ -n "$master_key" ] || master_key="sk-local-$(openssl rand -hex 24)"

{
  echo "ALBERT_API_KEY=${ALBERT_API_KEY}"
  echo "ALBERT_BASE_URL=${ALBERT_BASE_URL}"
  echo "LITELLM_MASTER_KEY=${master_key}"
  # Optionnelle : n'est utilisée que par le modèle deepseek-v4-flash-0731 du proxy.
  [ -z "${SCALEWAY_DEEPSEEK_API_KEY:-}" ] || echo "SCALEWAY_DEEPSEEK_API_KEY=${SCALEWAY_DEEPSEEK_API_KEY}"
} > "$OUT_ENV"

chmod 600 "$OUT_ENV"
echo "Généré: $OUT_ENV (ALBERT_BASE_URL=${ALBERT_BASE_URL})"