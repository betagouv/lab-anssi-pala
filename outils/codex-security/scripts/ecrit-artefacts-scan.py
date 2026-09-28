#!/usr/bin/env python3
# Écrit les trois artefacts canoniques d'un scan Codex Security (scan-manifest.json, findings.json,
# coverage.json) à partir d'un brouillon simple rédigé par le modèle, puis rattache le périmètre
# demandé avec le script du plugin. Appelé par l'agent pendant le scan (voir
# configs/consignes-scan.md) : gpt-oss-120b ne parvient pas à recopier et exécuter un long script.
#
# Les valeurs imposées par le SDK (identifiant du scan, cible, périmètre) sont lues dans
# l'environnement. Les identités des findings sont provisoires : le finaliseur du SDK les recalcule.
# Le brouillon est supprimé une fois les artefacts écrits.
#
# Usage : "$PYTHON" "$CODEX_SCAN_ECRIT_ARTEFACTS" "$CODEX_SECURITY_SCAN_DIR/brouillon.json"
#         "$PYTHON" "$CODEX_SCAN_ECRIT_ARTEFACTS" --liste-perimetre   (fichiers du périmètre)
# Brouillon : {"findings": [{ruleId, anchor, title, summary, severity, confidence,
#   confidenceRationale, category, cwe, locations, remediation}],
#   "surfaces": [{id, label, disposition, notes, riskArea?}]}, une surface par fichier du périmètre.
import datetime
import json
import os
import subprocess
import sys

SEVERITES = ("critical", "high", "medium", "low", "informational")
CONFIANCES = ("high", "medium", "low")
DISPOSITIONS = ("reported", "no_issue_found", "rejected", "not_applicable", "needs_follow_up")
CHAMPS_FINDING = ("ruleId", "anchor", "title", "summary", "severity", "confidence",
                  "confidenceRationale", "category", "cwe", "locations", "remediation")


def erreur(message):
    # Message en anglais : il est lu par le modèle, qui doit corriger son brouillon.
    sys.exit(f"ERROR: {message}. Fix the draft file and rerun this command.")


def verifie(brouillon):
    if not isinstance(brouillon, dict):
        erreur("the draft must be a JSON object with keys findings and surfaces")
    # Le finaliseur refuse deux findings de même identité (ruleId + anchor).
    identites = set()
    for i, f in enumerate(brouillon.get("findings", [])):
        manquants = [c for c in CHAMPS_FINDING if c not in f]
        if manquants:
            erreur(f"findings[{i}] is missing {', '.join(manquants)}")
        if (f["ruleId"], f["anchor"]) in identites:
            erreur(f"findings[{i}] duplicates another finding (same ruleId and anchor); merge them or use distinct anchors")
        identites.add((f["ruleId"], f["anchor"]))
        if f["severity"] not in SEVERITES:
            erreur(f"findings[{i}].severity must be one of {', '.join(SEVERITES)}")
        if f["confidence"] not in CONFIANCES:
            erreur(f"findings[{i}].confidence must be one of {', '.join(CONFIANCES)}")
        if not isinstance(f["cwe"], list) or not f["cwe"]:
            erreur(f'findings[{i}].cwe must be a non-empty list such as ["CWE-200"]')
        if not isinstance(f["locations"], list) or not f["locations"]:
            erreur(f"findings[{i}].locations must be a non-empty list")
        for j, loc in enumerate(f["locations"]):
            if not isinstance(loc.get("path"), str) or not isinstance(loc.get("startLine"), int):
                erreur(f"findings[{i}].locations[{j}] needs path (string) and startLine (integer)")
    for i, s in enumerate(brouillon.get("surfaces", [])):
        if not all(isinstance(s.get(c), str) for c in ("id", "label", "disposition", "notes")):
            erreur(f"surfaces[{i}] needs id, label, disposition and notes strings")
        if s["disposition"] not in DISPOSITIONS:
            erreur(f"surfaces[{i}].disposition must be one of {', '.join(DISPOSITIONS)}")
        if len(s["notes"].strip()) < 40:
            erreur(f"surfaces[{i}].notes must justify the decision in at least one full sentence")


def verifie_decision_par_fichier(brouillon, fichiers):
    # Une surface par fichier du périmètre (label = chemin), cohérente avec les findings : oblige
    # le modèle à statuer explicitement sur chaque fichier lu.
    surfaces = {s["label"]: s for s in brouillon.get("surfaces", [])}
    fichiers_signales = {loc["path"] for f in brouillon.get("findings", []) for loc in f["locations"]}
    manquants = [f for f in fichiers if f not in surfaces]
    if manquants:
        erreur("add one surface per file in scope, with label set to the file path; missing: "
               + ", ".join(manquants))
    for fichier in fichiers:
        disposition = surfaces[fichier]["disposition"]
        if fichier in fichiers_signales and disposition != "reported":
            erreur(f'surface "{fichier}" has a finding, so its disposition must be "reported"')
        if disposition == "reported" and fichier not in fichiers_signales:
            erreur(f'surface "{fichier}" is "reported" but no finding has a location in this file')


def fichiers_du_perimetre(depot, perimetre):
    sortie = subprocess.run(["git", "-C", depot, "ls-files", "--", *perimetre],
                            check=True, capture_output=True, text=True).stdout
    return [ligne for ligne in sortie.splitlines() if ligne]


def perimetre_demande():
    with open(os.environ["CODEX_SECURITY_TARGET_PATHS_FILE"], encoding="utf-8") as fichier:
        return json.load(fichier)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: ecrit-artefacts-scan.py <draft.json> | --liste-perimetre")
    if sys.argv[1] == "--liste-perimetre":
        # Évite aux consignes de coder le périmètre en dur : il vient du SDK.
        print("\n".join(fichiers_du_perimetre(os.environ["CODEX_SECURITY_REPOSITORY"],
                                             perimetre_demande())))
        return
    chemin_brouillon = sys.argv[1]
    try:
        with open(chemin_brouillon, encoding="utf-8") as fichier:
            brouillon = json.load(fichier)
    except (OSError, json.JSONDecodeError) as exc:
        erreur(f"cannot read the draft as JSON ({exc})")
    verifie(brouillon)

    env = os.environ
    dossier = env["CODEX_SECURITY_SCAN_DIR"]
    scan_id = env["CODEX_SECURITY_SCAN_ID"]
    fichier_perimetre = env["CODEX_SECURITY_TARGET_PATHS_FILE"]
    perimetre = perimetre_demande()
    verifie_decision_par_fichier(
        brouillon, fichiers_du_perimetre(env["CODEX_SECURITY_REPOSITORY"], perimetre))
    maintenant = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    cible = {
        "kind": env["CODEX_SECURITY_TARGET_KIND"],
        "targetId": env["CODEX_SECURITY_TARGET_ID"],
        "displayName": env["CODEX_SECURITY_TARGET_DISPLAY_NAME"],
    }
    if env.get("CODEX_SECURITY_TARGET_REVISION"):
        cible["revision"] = env["CODEX_SECURITY_TARGET_REVISION"]
    if env.get("CODEX_SECURITY_TARGET_SNAPSHOT_DIGEST") and cible["kind"] != "git_revision":
        cible["snapshotDigest"] = env["CODEX_SECURITY_TARGET_SNAPSHOT_DIGEST"]

    manifeste = {"documentType": "codex-security.scan-manifest", "schemaVersion": "1.0", "scan": {
        "id": scan_id, "producer": {"name": "codex-security-plugin", "version": "0.1.95"},
        "status": "completed", "startedAt": maintenant, "completedAt": maintenant, "target": cible,
        "scope": {"includePaths": perimetre, "excludePaths": []},
        "coverageRef": "coverage.json", "findingsRef": "findings.json"}}
    findings = {"documentType": "codex-security.findings", "schemaVersion": "1.0", "scanId": scan_id,
        "findings": [{
            "findingId": "draft", "occurrenceId": "draft", "ruleId": f["ruleId"],
            "identity": {"anchor": f["anchor"]},
            "fingerprints": {"algorithm": "codex-security/v1", "primary": "draft"},
            "title": f["title"], "summary": f["summary"],
            "severity": {"level": f["severity"]},
            "confidence": {"level": f["confidence"], "rationale": f["confidenceRationale"]},
            "taxonomy": {"category": f["category"], "cwe": f["cwe"]},
            "locations": f["locations"], "remediation": f["remediation"],
            "provenance": {"source": "local_plugin"}} for f in brouillon.get("findings", [])]}
    couverture = {"documentType": "codex-security.coverage", "schemaVersion": "1.0", "scanId": scan_id,
        "mode": "scoped_path", "completeness": "complete", "inventoryStrategy": "scoped_path",
        "includePaths": perimetre, "excludePaths": [],
        "surfaces": [{**s, "receiptRefs": []} for s in brouillon.get("surfaces", [])],
        "explicitExclusions": [], "deferred": []}

    for nom, document in (("scan-manifest.json", manifeste), ("findings.json", findings),
                          ("coverage.json", couverture)):
        with open(os.path.join(dossier, nom), "w", encoding="utf-8") as sortie:
            json.dump(document, sortie, ensure_ascii=False, indent=2)

    subprocess.run([sys.executable,
                    os.path.join(env["CODEX_SECURITY_PLUGIN_ROOT"], "scripts", "generate_rank_input.py"),
                    "bind-repo-scopes", "--scopes-file", fichier_perimetre,
                    "--manifest", os.path.join(dossier, "scan-manifest.json"),
                    "--coverage", os.path.join(dossier, "coverage.json")], check=True)
    if os.path.abspath(os.path.dirname(chemin_brouillon)) == os.path.abspath(dossier):
        os.remove(chemin_brouillon)
    print(f"OK: wrote scan-manifest.json, findings.json, coverage.json "
          f"({len(findings['findings'])} findings, {len(couverture['surfaces'])} surfaces)")
    print("Files in scan directory:", ", ".join(sorted(os.listdir(dossier))))


if __name__ == "__main__":
    main()
