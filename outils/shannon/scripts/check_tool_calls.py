#!/usr/bin/env python3
"""Vérifie que le modèle du fournisseur émet de vrais `tool_calls` structurés.

Contexte : certains modèles n'émettent jamais d'appel d'outil dans le champ
structuré `tool_calls`. Shannon pilote chaque phase par des appels d'outils
multi-tours : ce test le vérifie avant de dépenser un scan.

Deux contrôles, répétés RUNS fois (5 par défaut) :
  1. émission : le modèle appelle l'outil `execute` avec un JSON valide
     contenant `command` (erreur fréquente : `command` manquant) ;
  2. multi-tour : après le résultat de l'outil, le modèle répond ou enchaîne
     un nouvel appel valide.

URL et clé du fournisseur sont lues dans l'environnement (FOURNISSEUR_BASE_URL,
FOURNISSEUR_API_KEY du .env racine) ; la clé n'est jamais affichée. Le modèle est
l'identifiant de SHANNON_AI_MODEL (partie après « fournisseur: »), ou MODEL.

Usage :
    set -a; . ./.env; . outils/shannon/shannon.env; set +a
    python3 outils/shannon/scripts/check_tool_calls.py
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("FOURNISSEUR_BASE_URL", "")
MODEL = os.environ.get("MODEL") or os.environ.get("SHANNON_AI_MODEL", "").partition(":")[2]
RUNS = int(os.environ.get("RUNS", "5"))
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "4000"))
TIMEOUT_SECONDS = 120

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "execute",
            "description": "Exécute une commande shell dans le bac à sable et renvoie stdout, stderr et le code de sortie.",
            "parameters": {
                "type": "object",
                "properties": {"command": {"type": "string", "description": "Commande shell à exécuter."}},
                "required": ["command"],
            },
        },
    }
]

MESSAGES = [
    {"role": "system", "content": "Tu es un agent d'audit. Utilise les outils fournis pour agir, sans deviner."},
    {"role": "user", "content": "Liste le contenu du répertoire /workspace en utilisant l'outil execute."},
]


def api_key():
    key = os.environ.get("FOURNISSEUR_API_KEY")
    if not key:
        sys.exit("Clé absente : définir FOURNISSEUR_API_KEY dans le .env racine.")
    if not BASE_URL:
        sys.exit("URL absente : définir FOURNISSEUR_BASE_URL dans le .env racine.")
    if not MODEL:
        sys.exit("Modèle absent : définir SHANNON_AI_MODEL (outils/shannon/shannon.env) ou MODEL.")
    return key


def chat(key, messages):
    corps = json.dumps(
        {"model": MODEL, "messages": messages, "tools": TOOLS, "tool_choice": "auto", "max_tokens": MAX_TOKENS}
    ).encode()
    requete = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=corps,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "audit-check-tool-calls/1.0",
        },
    )
    try:
        with urllib.request.urlopen(requete, timeout=TIMEOUT_SECONDS) as reponse:
            return json.load(reponse), None
    except urllib.error.HTTPError as erreur:
        return None, f"http_{erreur.code}: {erreur.read()[:200].decode(errors='replace')}"
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as erreur:
        return None, f"reseau: {type(erreur).__name__}"


def appel_valide(message):
    """Renvoie (appel, None) si le premier tool_call est exploitable, sinon (None, raison)."""
    appels = message.get("tool_calls") or []
    if not appels:
        return None, "aucun tool_calls structure"
    fonction = appels[0].get("function", {})
    if fonction.get("name") != "execute":
        return None, f"outil inattendu: {fonction.get('name')!r}"
    try:
        arguments = json.loads(fonction.get("arguments") or "")
    except json.JSONDecodeError:
        return None, "arguments non JSON"
    if not isinstance(arguments, dict) or not isinstance(arguments.get("command"), str) or not arguments["command"]:
        return None, "parametre 'command' absent ou vide"
    return appels[0], None


def un_essai(key):
    """Exécute les deux contrôles ; renvoie (emission_ok, multitour_ok, details)."""
    reponse, erreur = chat(key, MESSAGES)
    if erreur:
        return False, False, {"emission": erreur}
    choix = reponse["choices"][0]
    message = choix["message"]
    details = {"finish": choix.get("finish_reason"), "tokens": reponse.get("usage", {}).get("completion_tokens")}
    appel, raison = appel_valide(message)
    if raison:
        details["emission"] = raison
        return False, False, details

    suite = MESSAGES + [
        {"role": "assistant", "content": message.get("content") or "", "tool_calls": message["tool_calls"]},
        {"role": "tool", "tool_call_id": appel["id"], "content": "README.md\nsrc\npackage.json\nexit_code=0"},
    ]
    reponse2, erreur2 = chat(key, suite)
    if erreur2:
        details["multitour"] = erreur2
        return True, False, details
    message2 = reponse2["choices"][0]["message"]
    if (message2.get("content") or "").strip():
        return True, True, details
    _, raison2 = appel_valide(message2)
    if raison2 is None:
        return True, True, details
    details["multitour"] = f"ni reponse ni nouvel appel valide ({raison2})"
    return True, False, details


def main():
    key = api_key()
    print(f"Modèle {MODEL} sur {BASE_URL}, {RUNS} essai(s)\n")
    emissions = multitours = 0
    for numero in range(1, RUNS + 1):
        emission_ok, multitour_ok, details = un_essai(key)
        emissions += emission_ok
        multitours += multitour_ok
        print(f"essai {numero}: emission={'OK' if emission_ok else 'KO'}  multi-tour={'OK' if multitour_ok else 'KO'}  {details}")
    print(f"\nEmission de tool_calls valides : {emissions}/{RUNS}")
    print(f"Enchainement multi-tour        : {multitours}/{RUNS}")
    sys.exit(0 if emissions == RUNS and multitours == RUNS else 1)


if __name__ == "__main__":
    main()