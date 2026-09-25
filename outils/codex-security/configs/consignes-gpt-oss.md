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
"$PYTHON" "$CODEX_SCAN_ECRIT_ARTEFACTS" --liste-perimetre
```

It prints one repository-relative path per line: these are the files in scope.

Then print on its own line (N = number of files listed):
CODEX_SECURITY_SCAN_PROGRESS {"phase":"discovery","filesCompleted":0,"filesTotal":N}

## Step 2: read every file in scope completely

Read each file with line numbers, for example `nl -ba "$CODEX_SECURITY_REPOSITORY/<path>"`.
To understand a data flow you may open at most 15 other repository files (routes, middlewares,
access-control helpers, command handlers, adapters) that the scoped files import, call or are
mounted by; locate them with `rg -n` inside "$CODEX_SECURITY_REPOSITORY" only. After each file in scope is fully read, print the
progress line again with the updated filesCompleted.

## Step 3: decide, file by file

For EACH file in scope, decide one disposition and write down why:
- "reported": the file contains at least one vulnerability supported by specific lines;
- "no_issue_found": you checked the file against the list below and nothing applies;
- "rejected": you suspected an issue but the code shows it is not exploitable (say which lines).

For each suspected vulnerability, check in the code: attacker-controlled or leakable data,
missing or bypassable control, reachable sink, concrete impact. For web routes and APIs, check at
least (OWASP API Security Top 10): broken object-level authorization, broken authentication,
broken object property-level authorization (including mass assignment), unrestricted resource
consumption, broken function-level authorization (compare the controls applied to each route),
server-side request forgery, security misconfiguration, input validation and injection, error
handling that leaks data or leaves a request unanswered, and secrets or tokens placed in URLs or
logs. For authentication flows (OIDC, sessions), also check state and nonce validation, open
redirects, session fixation or regeneration, cookie attributes and logout.
Every such pattern you saw while reading must end up either in a finding or, with the reason,
in the notes of a "rejected" or "no_issue_found" file. Do not dismiss a pattern without a reason.

Then print:
CODEX_SECURITY_SCAN_PROGRESS {"phase":"reporting","filesCompleted":N,"filesTotal":N}

## Step 4: write the findings draft, then run the provided script

4a. With ONE `exec_command`, write the draft with `printf` (heredocs FAIL in this sandbox: they
need a temporary file). Put the whole JSON between single quotes, on one line, and never use a
single quote (apostrophe) inside any text: write "does not", not "doesn't".

```sh
printf '%s\n' '{"findings":[{"ruleId":"short-kebab-case-rule-id","anchor":"short-kebab-case-anchor-unique-per-finding","title":"One-line title","summary":"Two or three sentences: source, missing control, sink, impact.","severity":"high","confidence":"medium","confidenceRationale":"Why, citing the evidence lines.","category":"information-exposure","cwe":["CWE-200"],"locations":[{"path":"path/to/file-a.ts","startLine":34,"endLine":34,"role":"sink"}],"remediation":"Concrete fix."}],"surfaces":[{"id":"surface_file_a","label":"path/to/file-a.ts","disposition":"reported","riskArea":"token handling","notes":"Line 34 puts the session token in the redirect URL, see the finding above."},{"id":"surface_file_b","label":"path/to/file-b.ts","disposition":"no_issue_found","riskArea":"session handling","notes":"Checked state, nonce, redirects and cookies: lines 10 to 25 validate state and nonce."}]}' > "$CODEX_SECURITY_SCAN_DIR/draft.json"
```

- findings: one object per vulnerability (the list is empty only if every file is "no_issue_found"
  or "rejected" with notes that justify it)
- severity: critical | high | medium | low | informational ; confidence: high | medium | low
- cwe: the CWE that best matches the weakness itself
- locations.path: relative to the repository root; startLine and endLine are integers
- surfaces: exactly one per file in scope, label = the file path as listed in step 1,
  disposition = your step 3 decision, notes = your justification (one or two sentences)

4b. With a second `exec_command`, run exactly:

```sh
"$PYTHON" "$CODEX_SCAN_ECRIT_ARTEFACTS" "$CODEX_SECURITY_SCAN_DIR/draft.json"
```

It checks the draft, writes scan-manifest.json, findings.json and coverage.json, binds the scope,
deletes the draft and prints the files in the scan directory. If it prints ERROR, rewrite
draft.json with a new `printf` fixing what it says, and run 4b again, at most three times.

## Step 5: stop

Only after the 4b output starts with "OK:" and lists coverage.json, findings.json and
scan-manifest.json, end your turn with a short plain-text summary of the findings.
Do not finalize, seal, or write report.md: the SDK does it.
