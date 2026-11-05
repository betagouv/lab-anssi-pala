#!/bin/sh
set -e

echo "Récupération de la configuration depuis Cellar..."

cd /app/telechargement-config

node telecharge-config.mjs

echo "Démarrage de LiteLLM..."

exec litellm "$@"