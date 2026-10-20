# Albert API

- Endpoint : `https://albert.api.etalab.gouv.fr/v1`
- Configuration (`.env` racine) :
  - `FOURNISSEUR_NOM=albert`,
  - `FOURNISSEUR_BASE_URL=https://albert.api.etalab.gouv.fr/v1`,
  - `FOURNISSEUR_API_KEY=<clé Albert>`.
- Authentification : `Authorization: Bearer ${FOURNISSEUR_API_KEY}` (clé non documentée ici, voir `.env` local).

## GET /v1/models

`HTTP 200`. Extrait pertinent (modèles utilisés) :

| id retourné par l'API                            | alias(es)                            | type              | contexte max |
| ------------------------------------------------ | ------------------------------------ | ----------------- | ------------ |
| `openai/gpt-oss-120b`                            | `openweight-large`                   | `text-generation` | 131072       |
| `deepseek-v4-flash` (en test jusq’au 01/10/2026) | `deepseek-ai/DeepSeek-V4-Flash-0731` | `text-generation` | 131072       |

## POST /v1/chat/completions — `openai/gpt-oss-120b`

`HTTP 200`. Point notable : `openai/gpt-oss-120b` est un modèle "raisonneur"
qui émet d'abord des tokens de raisonnement internes (champ `reasoning` de la
réponse) avant le contenu final.

Avec un `max_tokens` trop bas (10), la
réponse est tronquée en plein raisonnement (`finish_reason:"length"`,
`content:null`).

Avec `max_tokens:200`, la réponse aboutit normalement :
`content:"OK"`, `finish_reason:"stop"`.

À garder en tête pour le
paramétrage des outils (prévoir un budget de tokens de sortie suffisant).

Requête de test (clé masquée) :

```bash
curl -s \
  -H "Authorization: Bearer $FOURNISSEUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"Réponds uniquement OK."}],"max_tokens":200}' \
  "$FOURNISSEUR_BASE_URL/chat/completions"
```

Réponse (extrait) : `{"content":"OK", ..., "finish_reason":"stop"}`.

## Résumé

| Vérification                              | Résultat |
| ----------------------------------------- | -------- |
| Endpoint joignable                        | OK       |
| Authentification (clé Albert)             | OK       |
| Chat `openai/gpt-oss-120b`                | OK       |
| Chat `deepseek-ai/DeepSeek-V4-Flash-0731` | OK       |
| `/v1/models` liste bien les deux modèles  | OK       |
