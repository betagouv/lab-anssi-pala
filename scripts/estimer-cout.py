#!/usr/bin/env python3
"""Estime le coût d'un run à partir des tokens consommés.

Deux sources d'entrée :
  --codex-log <fichier>       lit la ligne « TOKENS … » du log Codex Security (mode --verbose)
  --shannon-session <fichier> lit .shannon/session.json d'un workspace Shannon

Le fournisseur/modèle donne le tarif :
  --provider <nom> --model <id>   (Codex : model_provider / model de la config)
  --model-spec <provider:model>   (Shannon : valeur de SHANNON_AI_MODEL)

Tarifs en euros par million de tokens. Un fournisseur « albert » est gratuit (service DINUM).
Estimation volontairement HAUTE : les tokens en cache sont comptés au tarif d'entrée plein
(le cache peut être facturé moins cher, ce qui abaisserait le coût réel).
"""
import argparse
import json
import re
import sys

# €/million de tokens. cache_read laissé indicatif ; ici le cache est compté au tarif d'entrée.
TARIFS = {
    "deepseek-v4-flash-0731": {"in": 0.40, "out": 0.80, "note": "tarif Scaleway"},
    "glm-5.2": {"in": 1.80, "out": 5.50, "note": "tarif Scaleway"},
}


def gratuit(provider: str) -> bool:
    return provider.lower().startswith("albert")


def tokens_codex(log_path: str):
    # Ligne type : "  TOKENS   777,656 uncached input, 348,672 cache reads, 0 cache writes, 31,639 output, 1,157,967 total"
    ligne = None
    with open(log_path, encoding="utf-8", errors="replace") as fichier:
        for l in fichier:
            if "TOKENS" in l and "input" in l and "output" in l:
                ligne = l
    if not ligne:
        return None
    nb = lambda motif: int(re.search(rf"([\d,]+)\s+{motif}", ligne).group(1).replace(",", ""))
    try:
        entree = nb("uncached input")
        cache = nb("cache reads")
        sortie = nb("output")
    except AttributeError:
        return None
    return {"input": entree, "cache": cache, "output": sortie}


def tokens_shannon(session_path: str):
    with open(session_path, encoding="utf-8") as fichier:
        agents = json.load(fichier).get("metrics", {}).get("agents", {})
    entree = sum(a.get("total_input_tokens", 0) for a in agents.values())
    sortie = sum(a.get("total_output_tokens", 0) for a in agents.values())
    return {"input": entree, "cache": 0, "output": sortie}


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--codex-log")
    p.add_argument("--shannon-session")
    p.add_argument("--provider", default="")
    p.add_argument("--model", default="")
    p.add_argument("--model-spec", default="")
    args = p.parse_args()

    provider, model = args.provider, args.model
    if args.model_spec:
        provider, _, model = args.model_spec.partition(":")

    if args.codex_log:
        toks = tokens_codex(args.codex_log)
    elif args.shannon_session:
        toks = tokens_shannon(args.shannon_session)
    else:
        p.error("fournir --codex-log ou --shannon-session")

    print("--- Coût estimé ---")
    if toks is None:
        print("  tokens indisponibles (run non terminé ?) : coût non calculable")
        return
    entree_totale = toks["input"] + toks["cache"]
    print(f"  Modèle    : {model or '?'} (fournisseur {provider or '?'})")
    print(f"  Tokens    : {entree_totale:,} entrée (dont {toks['cache']:,} en cache), {toks['output']:,} sortie")
    if gratuit(provider):
        print("  Coût      : 0 € — Albert (DINUM), service gratuit")
        print("  Note      : Albert sous-estime les tokens de sortie (raisonnement/outils non comptés).")
        return
    tarif = TARIFS.get(model)
    if not tarif:
        print(f"  Coût      : tarif inconnu pour « {model} » — compléter TARIFS dans scripts/estimer-cout.py")
        return
    cout = entree_totale * tarif["in"] / 1e6 + toks["output"] * tarif["out"] / 1e6
    print(f"  Coût      : ~{cout:.2f} € ({tarif['note']} : {tarif['in']} €/M entrée, {tarif['out']} €/M sortie)")
    print("  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.")


if __name__ == "__main__":
    main()
