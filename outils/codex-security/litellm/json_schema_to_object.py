# Hook LiteLLM : remplace le format de sortie `json_schema` imposé par Codex (--output-schema),
# selon le modèle, et donne le schéma au modèle dans les instructions. La conformité au schéma
# n'est plus garantie par le décodage : elle reste vérifiée à l'arrivée par Codex Security (zod).
#
# Pourquoi (voir ../README.md) :
# - gpt-oss-120b (Albert) : sous `json_schema`, sortie dégénérée (caractères invisibles, JSON
#   invalide) ; sous `json_object`, sortie propre. Format remplacé par `json_object`.
# - deepseek-v4-flash-0731 (Scaleway) : sous tout format imposé (`json_schema` comme
#   `json_object`), le modèle n'appelle plus aucun outil et répond aussitôt par un JSON vide de
#   sens ; le flux `validate` échoue donc sans analyse. Format retiré.
import json

from litellm.integrations.custom_logger import CustomLogger

CONSIGNE = (
    "\n\n# Final answer format\n"
    "Use tools as needed first. Your final answer must be a single JSON object, and nothing else "
    "(no Markdown code fence), that conforms to this JSON Schema:\n{schema}\n"
    "Inside JSON strings, write line breaks as \\n."
)

# Modèle -> format de remplacement (None : format retiré). Les autres modèles sont inchangés.
REMPLACEMENTS = {
    "gpt-oss-120b": {"type": "json_object"},
    "deepseek-v4-flash-0731": None,
}


class JsonSchemaVersObjet(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if data.get("model") not in REMPLACEMENTS:
            return data
        texte = data.get("text")
        format_sortie = texte.get("format") if isinstance(texte, dict) else None
        if not isinstance(format_sortie, dict) or format_sortie.get("type") != "json_schema":
            return data
        schema = json.dumps(format_sortie.get("schema", {}), ensure_ascii=False)
        remplacement = REMPLACEMENTS[data["model"]]
        if remplacement is None:
            del texte["format"]
        else:
            texte["format"] = remplacement
        data["instructions"] = (data.get("instructions") or "") + CONSIGNE.format(schema=schema)
        return data


json_schema_vers_objet = JsonSchemaVersObjet()
