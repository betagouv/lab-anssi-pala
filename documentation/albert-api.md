# Albert API — vérification

Endpoint : `https://albert.api.etalab.gouv.fr/v1`
Authentification : `Authorization: Bearer ${ALBERT_API_KEY}` (clé non documentée ici, voir `.env` local).

## GET /v1/models

`HTTP 200`. Extrait pertinent (modèles utilisés) :

| id retourné par l'API | alias(es) | type | contexte max |
|---|---|---|---|
| `openai/gpt-oss-120b` | `openweight-large` | `text-generation` | 131072 |
| `bge-m3` | `BAAI/bge-m3`, `openweight-embeddings` | `text-embeddings-inference` | 8192 |

`openai/gpt-oss-120b` est bien l'**id canonique** (pas un alias) — aucune
différence avec `ALBERT_LLM_MODEL` dans `.env`.

Pour les embeddings, l'id canonique renvoyé par `/v1/models` est **`bge-m3`**,
et `BAAI/bge-m3` (la valeur utilisée dans `.env`, imposée par la mission)
n'apparaît que comme **alias**. Vérification faite : `/v1/embeddings` accepte
les deux valeurs indifféremment (`HTTP 200` dans les deux cas, même vecteur
retourné). Aucune modification requise — `ALBERT_EMBEDDING_MODEL=BAAI/bge-m3`
reste utilisé tel quel dans `.env`, l'alias étant pleinement supporté côté
Albert.

## POST /v1/chat/completions — `openai/gpt-oss-120b`

`HTTP 200`. Point notable : `openai/gpt-oss-120b` est un modèle "raisonneur"
qui émet d'abord des tokens de raisonnement internes (champ `reasoning` de la
réponse) avant le contenu final. Avec un `max_tokens` trop bas (10), la
réponse est tronquée en plein raisonnement (`finish_reason:"length"`,
`content:null`). Avec `max_tokens:200`, la réponse aboutit normalement :
`content:"OK"`, `finish_reason:"stop"`. À garder en tête pour le
paramétrage des outils (prévoir un budget de tokens de sortie suffisant).

Requête de test (clé masquée) :

```bash
curl -s \
  -H "Authorization: Bearer $ALBERT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"Réponds uniquement OK."}],"max_tokens":200}' \
  https://albert.api.etalab.gouv.fr/v1/chat/completions
```

Réponse (extrait) : `{"content":"OK", ..., "finish_reason":"stop"}`.

## POST /v1/embeddings — `bge-m3` / `BAAI/bge-m3`

`HTTP 200` pour les deux identifiants, vecteur d'embedding renvoyé
normalement (1024 dimensions, format bge-m3 standard).

## Résumé

| Vérification | Résultat |
|---|---|
| Endpoint joignable | OK |
| Authentification (clé Albert) | OK |
| Chat `openai/gpt-oss-120b` | OK |
| Embeddings `BAAI/bge-m3` (alias) / `bge-m3` (canonique) | OK |
| `/v1/models` liste bien les deux modèles pour notre clé | OK |

La clé API n'est jamais journalisée ni documentée dans ce dépôt.
