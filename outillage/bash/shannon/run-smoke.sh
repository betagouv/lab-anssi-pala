#!/usr/bin/env bash
# Passage de vérification de Shannon (--pipeline-testing) contre une cible locale triviale.
# Modèle lu dans outils/shannon/shannon.env (ignoré par git), URL et clé du fournisseur dans le .env
# racine (FOURNISSEUR_*) ; la clé n'est jamais affichée.
#
# Usage : bash outillage/bash/shannon/run-smoke.sh
# Variables : SMOKE_PORT (défaut 8080), SMOKE_WORKSPACE (défaut : nom unique horodaté),
#             SMOKE_REAL=1 (vrais prompts au lieu de --pipeline-testing)
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
outil="$racine/outils/shannon"
shannon_dir="$outil/source"
env_file="$outil/shannon.env"
port="${SMOKE_PORT:-8080}"

[ -f "$env_file" ] || { echo "Fichier manquant : $env_file (à créer depuis shannon.env.template)" >&2; exit 1; }
[ -f "$shannon_dir/apps/cli/dist/index.mjs" ] || { echo "CLI Shannon non construit (pnpm build)" >&2; exit 1; }

set -a
. "$env_file"
set +a
: "${SHANNON_AI_MODEL:?SHANNON_AI_MODEL non renseigné (outils/shannon/shannon.env), ex. albert:openai/gpt-oss-120b}"
fournisseur="${SHANNON_AI_MODEL%%:*}"
# Shannon parle au même fournisseur que les scans : URL et clé viennent du .env racine.
[ -f "$racine/.env" ] || { echo "Fichier manquant : $racine/.env (FOURNISSEUR_*)" >&2; exit 1; }
set -a
. "$racine/.env"
set +a
: "${FOURNISSEUR_API_KEY:?FOURNISSEUR_API_KEY manquant ou vide dans .env}"
: "${FOURNISSEUR_BASE_URL:?FOURNISSEUR_BASE_URL manquant dans .env}"
export SHANNON_AI_API_KEY="$FOURNISSEUR_API_KEY"

# pi ne résout pas les variables dans baseUrl : copie (configs/genere/, non versionnée) de la
# description pi où ${FOURNISSEUR_BASE_URL} est remplacée par l'URL du fournisseur.
description_pi_du_fournisseur() {
  local gabarit="$1" description="$outil/configs/genere/$(basename "$1")"
  mkdir -p "$(dirname "$description")"
  sed "s|\${FOURNISSEUR_BASE_URL}|${FOURNISSEUR_BASE_URL}|g" "$gabarit" > "$description"
  echo "$description"
}

# Cible triviale, limitée à la boucle locale pour ne pas s'exposer sur le réseau.
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$outil/smoke-target" >/dev/null 2>&1 &
serveur=$!
trap 'kill "$serveur" 2>/dev/null || true' EXIT

# Par défaut, nom unique : un même nom reprend le workspace existant au lieu d'en créer un neuf.
# SMOKE_WORKSPACE=<nom> force la reprise d'un workspace précis (ne rejoue que la partie en échec).
workspace="${SMOKE_WORKSPACE:-$fournisseur-smoke-$(date +%s)}"

# Par défaut : prompts minimaux (--pipeline-testing), qui ne produisent pas de rapport valide.
# SMOKE_REAL=1 lance les vrais prompts, avec le vrai agent de rapport.
mode=(--pipeline-testing)
[ "${SMOKE_REAL:-0}" = "1" ] && mode=()

cd "$shannon_dir"
node shannon start \
  -u "http://host.docker.internal:$port" \
  -r "$outil/smoke-target" \
  --models-config "$(description_pi_du_fournisseur "$outil/configs/models.$fournisseur.json")" \
  ${mode[@]+"${mode[@]}"} \
  --follow \
  -w "$workspace"