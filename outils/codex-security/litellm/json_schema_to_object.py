# Hook LiteLLM : remplace le format de sortie `json_schema` imposé par Codex (--output-schema)
# par `json_object`, et donne le schéma au modèle dans les instructions.
#
# Pourquoi : sous `response_format: json_schema`, gpt-oss-120b servi par Albert (vLLM) produit une
# sortie dégénérée (caractères invisibles, JSON invalide) ; sous `json_object`, la sortie reste
# propre (voir ../README.md, diagnostic du 25/09/2026). La conformité au schéma n'est plus
# garantie par le décodage : elle reste vérifiée à l'arrivée par Codex Security (zod).
import json

from litellm.integrations.custom_logger import CustomLogger

CONSIGNE = (
    "\n\n# Final answer format\n"
    "Your final answer must be a single JSON object, and nothing else, that conforms to this "
    "JSON Schema:\n{schema}\n"
    "Inside JSON strings, write line breaks as \\n."
)


# Seul gpt-oss-120b (Albert) est concerné : DeepSeek chez Scaleway respecte json_schema sans
# dégénérer, et json_object lui fait perdre les valeurs imposées par le schéma.
MODELES_CONCERNES = {"gpt-oss-120b"}


class JsonSchemaVersObjet(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if data.get("model") not in MODELES_CONCERNES:
            return data
        texte = data.get("text")
        format_sortie = texte.get("format") if isinstance(texte, dict) else None
        if not isinstance(format_sortie, dict) or format_sortie.get("type") != "json_schema":
            return data
        schema = json.dumps(format_sortie.get("schema", {}), ensure_ascii=False)
        texte["format"] = {"type": "json_object"}
        data["instructions"] = (data.get("instructions") or "") + CONSIGNE.format(schema=schema)
        return data


json_schema_vers_objet = JsonSchemaVersObjet()
