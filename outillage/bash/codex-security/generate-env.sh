#!/usr/bin/env bash
# Génère outils/codex-security/codex-security.env à partir du .env racine (source de vérité
# du fournisseur). Ne jamais committer le fichier généré.
#
# Mapping :
#   FOURNISSEUR_NOM      -> FOURNISSEUR_NOM      (albert ou scaleway)
#   FOURNISSEUR_BASE_URL -> FOURNISSEUR_BASE_URL
#   FOURNISSEUR_API_KEY  -> FOURNISSEUR_API_KEY  (lu par le proxy LiteLLM uniquement)
#   (généré)             -> LITELLM_MASTER_KEY   (jeton local entre Codex et le proxy)
#
# Le jeton local est conservé s'il existe déjà, pour ne pas invalider un proxy en marche.
#
# Usage : ./outillage/bash/codex-security/generate-env.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
OUTIL_DIR="$ROOT_DIR/outils/codex-security"
ROOT_ENV="$ROOT_DIR/.env"
OUT_ENV="$OUTIL_DIR/codex-security.env"

[ -f "$ROOT_ENV" ] || { echo "Erreur: fichier .env introuvable à la racine ($ROOT_ENV)" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ROOT_ENV"
set +a

: "${FOURNISSEUR_NOM:?FOURNISSEUR_NOM manquant dans .env (albert ou scaleway)}"
: "${FOURNISSEUR_API_KEY:?FOURNISSEUR_API_KEY manquant ou vide dans .env}"
: "${FOURNISSEUR_BASE_URL:?FOURNISSEUR_BASE_URL manquant dans .env}"

master_key=""
if [ -f "$OUT_ENV" ]; then
  master_key="$(grep '^LITELLM_MASTER_KEY=sk-' "$OUT_ENV" | cut -d= -f2- || true)"
fi
[ -n "$master_key" ] || master_key="sk-local-$(openssl rand -hex 24)"

{
  echo "FOURNISSEUR_NOM=${FOURNISSEUR_NOM}"
  echo "FOURNISSEUR_API_KEY=${FOURNISSEUR_API_KEY}"
  echo "FOURNISSEUR_BASE_URL=${FOURNISSEUR_BASE_URL}"
  echo "LITELLM_MASTER_KEY=${master_key}"
} > "$OUT_ENV"

chmod 600 "$OUT_ENV"

# Aucune clé n'est affichée.
echo "Généré: $OUT_ENV"
echo "  Fournisseur configuré pour le proxy : ${FOURNISSEUR_NOM} (${FOURNISSEUR_BASE_URL})"
