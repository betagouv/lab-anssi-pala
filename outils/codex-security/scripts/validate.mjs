// Valide un finding avec Codex Security (SDK), en appliquant la configuration du fichier projet.
//
// Pourquoi le SDK plutôt que `codex-security validate` : la CLI lance Codex avec
// --ignore-user-config et ne transmet que model / effort / analytics ; le fournisseur Albert
// (model_providers) y est donc impossible. La méthode validate() du SDK, elle, applique les
// codexOverrides du constructeur, issus ici de loadProjectConfig().
//
// Usage (via outillage/bash/codex-security/validate.sh, qui prépare l'environnement) :
//   node validate.mjs --config FILE --repository DIR --output DIR --finding-file finding.json
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
  },
});

for (const requis of ["config", "repository", "output"]) {
  if (!args[requis]) throw new Error(`--${requis} est obligatoire`);
}

async function chargeFinding() {
  if (!args["finding-file"]) throw new Error("Fournir --finding-file");
  return JSON.parse(await readFile(args["finding-file"], "utf8"));
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