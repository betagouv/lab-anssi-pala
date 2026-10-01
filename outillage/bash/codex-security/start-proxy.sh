#!/usr/bin/env bash
# Lance (ou relance) le proxy LiteLLM qui traduit l'API Responses (Codex) vers l'API Chat
# Completions d'Albert. Exposé sur 127.0.0.1:${LITELLM_PORT:-4000} uniquement.
#
# Usage : ./outillage/bash/codex-security/start-proxy.sh
# Arrêt : docker rm -f codex-security-litellm
#
# Budget : les prix par modèle et max_budget sont dans litellm/config.yaml. LiteLLM n'APPLIQUE le
# plafond qu'avec une base de données. Sans DB : le coût est suivi mais pas bloqué (tracking seul).
# Pour l'enforcement, fournir LITELLM_DATABASE_URL (Postgres) ; recette dans le README.
set -euo pipefail

OUTIL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/outils/codex-security"
PORT="${LITELLM_PORT:-4000}"
# Image figée par digest (main-stable du 23/09/2026) : le pont Responses -> Chat évolue vite.
IMAGE="${LITELLM_IMAGE:-ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02}"
CONTAINER=codex-security-litellm

"$(dirname "${BASH_SOURCE[0]}")/generate-env.sh"

# Enforcement du budget : uniquement si une base est fournie (DATABASE_URL, requis par LiteLLM).
db_args=()
if [ -n "${LITELLM_DATABASE_URL:-}" ]; then
  db_args=(-e "DATABASE_URL=$LITELLM_DATABASE_URL")
  echo "Budget : enforcement actif (DATABASE_URL fournie)."
else
  echo "Budget : suivi seul (pas de DATABASE_URL) — le plafond n'est pas bloquant. Voir le README."
fi

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" \
  --env-file "$OUTIL_DIR/codex-security.env" \
  ${db_args[@]+"${db_args[@]}"} \
  -v "$OUTIL_DIR/litellm:/app/proxy-config:ro" \
  -p "127.0.0.1:$PORT:4000" \
  "$IMAGE" --config /app/proxy-config/config.yaml --port 4000 >/dev/null

printf 'Attente du proxy LiteLLM'
for _ in $(seq 1 60); do
  if curl -s -o /dev/null -m 2 "http://127.0.0.1:$PORT/health/liveliness"; then
    echo " : prêt sur http://127.0.0.1:$PORT/v1"
    exit 0
  fi
  printf '.'
  sleep 2
done
echo
echo "Erreur: le proxy ne répond pas — voir docker logs $CONTAINER" >&2
exit 1