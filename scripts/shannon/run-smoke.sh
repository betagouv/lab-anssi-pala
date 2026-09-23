#!/usr/bin/env bash
# Passage de vérification de Shannon (--pipeline-testing) contre une cible locale triviale.
# La clé Albert est lue dans scripts/shannon/.env (ignoré par git) ; elle n'est jamais affichée.
#
# Usage : bash scripts/shannon/run-smoke.sh
# Variables : SMOKE_PORT (défaut 8080), SMOKE_WORKSPACE (défaut : nom unique horodaté),
#             SMOKE_REAL=1 (vrais prompts au lieu de --pipeline-testing)
set -euo pipefail

ici="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
shannon_dir="$ici/../../outils/shannon"
port="${SMOKE_PORT:-8080}"

[ -f "$ici/.env" ] || { echo "Fichier manquant : $ici/.env" >&2; exit 1; }
[ -f "$shannon_dir/apps/cli/dist/index.mjs" ] || { echo "CLI Shannon non construit (pnpm build)" >&2; exit 1; }

set -a
. "$ici/.env"
set +a
export SHANNON_AI_MODEL="${SHANNON_AI_MODEL:-albert:openai/gpt-oss-120b}"

# Cible triviale, limitée à la boucle locale pour ne pas s'exposer sur le réseau.
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$ici/smoke-target" >/dev/null 2>&1 &
serveur=$!
trap 'kill "$serveur" 2>/dev/null || true' EXIT

# Par défaut, nom unique : un même nom reprend le workspace existant au lieu d'en créer un neuf.
# SMOKE_WORKSPACE=<nom> force la reprise d'un workspace précis (ne rejoue que la partie en échec).
workspace="${SMOKE_WORKSPACE:-albert-smoke-$(date +%s)}"

# Par défaut : prompts minimaux (--pipeline-testing), qui ne produisent pas de rapport valide.
# SMOKE_REAL=1 lance les vrais prompts, avec le vrai agent de rapport.
mode=(--pipeline-testing)
[ "${SMOKE_REAL:-0}" = "1" ] && mode=()

cd "$shannon_dir"
direnv exec . node shannon start \
  -u "http://host.docker.internal:$port" \
  -r "$ici/smoke-target" \
  --models-config "$ici/models.albert.json" \
  ${mode[@]+"${mode[@]}"} \
  --follow \
  -w "$workspace"