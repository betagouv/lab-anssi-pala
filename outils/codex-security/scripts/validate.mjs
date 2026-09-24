// Valide un finding avec Codex Security (SDK), en appliquant la configuration du fichier projet.
//
// Pourquoi le SDK plutôt que `codex-security validate` : la CLI lance Codex avec
// --ignore-user-config et ne transmet que model / effort / analytics ; le fournisseur Albert
// (model_providers) y est donc impossible. La méthode validate() du SDK, elle, applique les
// codexOverrides du constructeur, issus ici de loadProjectConfig().
//
// Usage (via validate.sh, qui prépare l'environnement) :
//   node validate.mjs --config FILE --repository DIR --output DIR --finding-file finding.json
//   node validate.mjs --config FILE --repository DIR --output DIR --outil-tiers findings.json --id hunter-xxx
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { CodexSecurity, loadProjectConfig } from "@openai/codex-security";

const { values: args } = parseArgs({
  options: {
    config: { type: "string" },
    repository: { type: "string" },
    output: { type: "string" },
    "finding-file": { type: "string" },
    outil-tiers: { type: "string" },
    id: { type: "string" },
  },
});

for (const requis of ["config", "repository", "output"]) {
  if (!args[requis]) throw new Error(`--${requis} est obligatoire`);
}

async function chargeFinding() {
  if (args["finding-file"]) {
    return JSON.parse(await readFile(args["finding-file"], "utf8"));
  }
  if (!args.outil-tiers || !args.id) {
    throw new Error("Fournir --finding-file, ou --outil-tiers et --id");
  }
  const document = JSON.parse(await readFile(args.outil-tiers, "utf8"));
  const findings = Array.isArray(document) ? document : document.findings;
  const trouve = findings.find((f) => f.id === args.id);
  if (!trouve) throw new Error(`Finding ${args.id} absent de ${args.outil-tiers}`);
  // Seuls les éléments descriptifs sont transmis : ni statut de vérification ni PoC un outil tiers,
  // pour que la validation reste indépendante.
  return {
    title: `${trouve.cwe ?? ""} ${trouve.finding_type ?? trouve.category ?? ""}`.trim(),
    location: `${trouve.file}:${trouve.line_number ?? trouve.line}`,
    cwe: trouve.cwe,
    reported_severity: trouve.severity,
    description: trouve.description,
    source: `un outil tiers analyse, finding ${trouve.id}`,
  };
}

const finding = await chargeFinding();
const { config } = await loadProjectConfig(args.config);
const security = new CodexSecurity(config);
const debut = Date.now();
try {
  const result = await security.validate({
    repositoryPath: args.repository,
    finding,
    outputDir: args.output,
    auth: "api-key",
  });
  const resume = {
    disposition: result.disposition,
    threadId: result.threadId,
    outputDir: result.outputDir,
    durationSeconds: Math.round((Date.now() - debut) / 1000),
    finding,
  };
  await writeFile(join(args.output, "validation-result.json"), `${JSON.stringify(resume, null, 2)}\n`);
  await writeFile(join(args.output, "validation-report.md"), result.report);
  console.log(JSON.stringify({ disposition: result.disposition, outputDir: result.outputDir, durationSeconds: resume.durationSeconds }));
} finally {
  await security.close();
}