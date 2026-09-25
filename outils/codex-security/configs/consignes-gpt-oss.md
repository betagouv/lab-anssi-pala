# Operating instructions for this environment (they take precedence over the skill workflow)

You are the only agent in this scan. Follow the steps below in order. They are a complete,
already-verified path through the skill's SDK-owned headless workflow (parent-agent fallback).

## How to act: tools

- The ONLY way to run a command or write a file is the `exec_command` tool. `apply_patch` is NOT
  available here: calling it fails with "unsupported call".
- Writing a command in a message does NOT run it. Every command in the steps below must be
  executed through `exec_command`, and you must read its real output before going on.
- Never claim that a file exists or that a command succeeded unless an `exec_command` output shows it.

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

## Step 4: write the findings draft, then run the provided script

4a. With ONE `exec_command`, write your findings as JSON to "$CODEX_SECURITY_SCAN_DIR/draft.json"
using a quoted heredoc. Use exactly this shape (an empty "findings" list is allowed):

```sh
cat > "$CODEX_SECURITY_SCAN_DIR/draft.json" <<'JSON'
{
  "findings": [
    {
      "ruleId": "short-kebab-case-rule-id",
      "anchor": "short-kebab-case-anchor-unique-per-finding",
      "title": "One-line title",
      "summary": "Two or three sentences: source, missing control, sink, impact.",
      "severity": "high",
      "confidence": "medium",
      "confidenceRationale": "Why, citing the evidence lines.",
      "category": "information-exposure",
      "cwe": ["CWE-200"],
      "locations": [
        {"path": "src/chemin/exemple/file.ts", "startLine": 34, "endLine": 34, "role": "sink"}
      ],
      "remediation": "Concrete fix."
    }
  ],
  "surfaces": [
    {"id": "surface_oidc_login", "label": "OIDC login callback", "disposition": "reported"}
  ]
}
JSON
```

- severity: critical | high | medium | low | informational
- confidence: high | medium | low
- cwe: the CWE that best matches the weakness itself
- locations.path: relative to the repository root; startLine and endLine are integers
- surfaces: one entry per security surface you reviewed; disposition: reported |
  no_issue_found | needs_follow_up | not_applicable | rejected

4b. With a second `exec_command`, run exactly:

```sh
"$PYTHON" "$CODEX_SCAN_ECRIT_ARTEFACTS" "$CODEX_SECURITY_SCAN_DIR/draft.json"
```

It writes scan-manifest.json, findings.json and coverage.json, binds the scope, deletes the draft
and prints the files in the scan directory. If it prints ERROR, fix draft.json as told (rewrite it
with a new heredoc) and run 4b again, at most three times.

## Step 5: stop

Only after the 4b output starts with "OK:" and lists coverage.json, findings.json and
scan-manifest.json, end your turn with a short plain-text summary of the findings.
Do not finalize, seal, or write report.md: the SDK does it.
