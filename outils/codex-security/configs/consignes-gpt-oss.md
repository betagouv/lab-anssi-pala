# Operating instructions for this environment (they take precedence over the skill workflow)

You are the only agent in this scan. Follow the steps below in order. They are a complete,
already-verified path through the skill's SDK-owned headless workflow (parent-agent fallback).

## Hard rules

- Do NOT read, grep, list or explore files under "$CODEX_SECURITY_PLUGIN_ROOT", node_modules, or any
  Codex installation. Everything you need about the plugin is written here.
- Do NOT run `codex`, `codex-security`, `which codex*`, or start any other scan. Do NOT spawn or wait
  for subagents; do the audit yourself.
- Do NOT run the config preflight helper: the host already ran it. Do NOT call any MCP tool.
- Do NOT read environment dumps (`env`, `printenv`), `.env` files, or anything outside
  "$CODEX_SECURITY_REPOSITORY" and "$CODEX_SECURITY_SCAN_DIR".
- Only write inside "$CODEX_SECURITY_SCAN_DIR". Never modify the repository.
- Keep runtime paths quoted exactly as environment variables ("$CODEX_SECURITY_REPOSITORY", ...).

## Step 1: list the files in scope

```sh
cd "$CODEX_SECURITY_REPOSITORY" && git ls-files -- src/chemin/exemple
```

Then print on its own line (N = number of files listed):
CODEX_SECURITY_SCAN_PROGRESS {"phase":"discovery","filesCompleted":0,"filesTotal":N}

## Step 2: read every file in scope completely

Read each file with line numbers, for example `nl -ba "$CODEX_SECURITY_REPOSITORY/<path>"`.
To understand a data flow you may open at most 8 other repository files (routes, middlewares,
adapters, JWT helpers) that the scoped files import or are mounted by; locate them with `rg -n`
inside "$CODEX_SECURITY_REPOSITORY" only. After each file in scope is fully read, print the
progress line again with the updated filesCompleted.

## Step 3: decide the findings

For each suspected vulnerability, check in the code you read: attacker-controlled source, missing
or bypassable control, reachable sink, concrete impact. Keep only findings supported by specific
lines. Examples of what to check in an OIDC login/logout flow: state and nonce validation, open
redirects, tokens or secrets placed in URLs or logs, session fixation, session and cookie handling
on login and logout, error handling that leaks data, missing authorization. Report nothing you
cannot tie to exact lines. It is fine to report zero findings.

Then print:
CODEX_SECURITY_SCAN_PROGRESS {"phase":"reporting","filesCompleted":N,"filesTotal":N}

## Step 4: write the three canonical files with this exact script

Write the script to "$CODEX_SECURITY_SCAN_DIR/write_artifacts.py" with a heredoc, fill in FINDINGS
and SURFACES, then run it with "$PYTHON". Do not change anything else in the script.
Identity fields ("findingId", "occurrenceId", "fingerprints") are placeholders: the SDK replaces them.

```python
import json, os, datetime
FINDINGS = [
    # One dict per finding, for example:
    # {
    #   "ruleId": "short-kebab-case-rule-id",
    #   "anchor": "short-kebab-case-unique-anchor",
    #   "title": "One-line title",
    #   "summary": "Two or three sentences: source, missing control, sink, impact.",
    #   "severity": "high",            # critical | high | medium | low | informational
    #   "confidence": "medium",        # high | medium | low
    #   "confidenceRationale": "Why, citing the evidence.",
    #   "category": "information-exposure",
    #   "cwe": ["CWE-200"],
    #   "locations": [{"path": "src/chemin/exemple/file.ts", "startLine": 34, "endLine": 34, "role": "sink"}],
    #   "remediation": "Concrete fix.",
    # },
]
SURFACES = [
    # One per security surface reviewed, for example:
    # {"id": "surface_oidc_login", "label": "OIDC login callback", "disposition": "reported"},
    # disposition: reported | no_issue_found | needs_follow_up | not_applicable | rejected
]
scan_dir = os.environ["CODEX_SECURITY_SCAN_DIR"]
scan_id = os.environ["CODEX_SECURITY_SCAN_ID"]
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
target = {
    "kind": os.environ["CODEX_SECURITY_TARGET_KIND"],
    "targetId": os.environ["CODEX_SECURITY_TARGET_ID"],
    "displayName": os.environ["CODEX_SECURITY_TARGET_DISPLAY_NAME"],
}
if os.environ.get("CODEX_SECURITY_TARGET_REVISION"):
    target["revision"] = os.environ["CODEX_SECURITY_TARGET_REVISION"]
if os.environ.get("CODEX_SECURITY_TARGET_SNAPSHOT_DIGEST") and target["kind"] != "git_revision":
    target["snapshotDigest"] = os.environ["CODEX_SECURITY_TARGET_SNAPSHOT_DIGEST"]
scope = ["src/chemin/exemple"]
manifest = {"documentType": "codex-security.scan-manifest", "schemaVersion": "1.0", "scan": {
    "id": scan_id, "producer": {"name": "codex-security-plugin", "version": "0.1.95"},
    "status": "completed", "startedAt": now, "completedAt": now, "target": target,
    "scope": {"includePaths": scope, "excludePaths": []},
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
        "provenance": {"source": "local_plugin"}} for f in FINDINGS]}
coverage = {"documentType": "codex-security.coverage", "schemaVersion": "1.0", "scanId": scan_id,
    "mode": "scoped_path", "completeness": "complete", "inventoryStrategy": "scoped_path",
    "includePaths": scope, "excludePaths": [],
    "surfaces": [dict(s, receiptRefs=[]) for s in SURFACES],
    "explicitExclusions": [], "deferred": []}
for name, doc in (("scan-manifest.json", manifest), ("findings.json", findings), ("coverage.json", coverage)):
    with open(os.path.join(scan_dir, name), "w", encoding="utf-8") as out:
        json.dump(doc, out, ensure_ascii=False, indent=2)
print("written", len(FINDINGS), "findings,", len(SURFACES), "surfaces")
```

Then bind the requested scope (exact command, one line):

```sh
"$PYTHON" "$CODEX_SECURITY_PLUGIN_ROOT/scripts/generate_rank_input.py" bind-repo-scopes --scopes-file "$CODEX_SECURITY_TARGET_PATHS_FILE" --manifest "$CODEX_SECURITY_SCAN_DIR/scan-manifest.json" --coverage "$CODEX_SECURITY_SCAN_DIR/coverage.json"
```

If either command fails, fix only the reported field and rerun, at most twice.

## Step 5: stop

Check that the three files exist with `ls "$CODEX_SECURITY_SCAN_DIR"`, then end your turn with a
short plain-text summary of the findings. Do not finalize, seal, or write report.md: the SDK does it.
