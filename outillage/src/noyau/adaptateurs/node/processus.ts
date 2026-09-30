import { spawn, type StdioOptions } from "node:child_process";
import { createWriteStream } from "node:fs";

// heritee : le terminal voit tout ; sansSortieStandard : seules les erreurs passent (« >/dev/null ») ;
// silencieuse : rien ne passe.
type Affichage = "heritee" | "sansSortieStandard" | "silencieuse";

type Options = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  affichage?: Affichage;
  // Équivalent de `2>&1 | tee <journal>` : sorties affichées ET journalisées.
  journal?: string;
};

const STDIO: Record<Affichage, StdioOptions> = {
  heritee: "inherit",
  sansSortieStandard: ["ignore", "ignore", "inherit"],
  silencieuse: "ignore",
};

// Lance une commande et renvoie son code de sortie.
export function lanceCommande(
  commande: string,
  args: string[],
  { cwd, env, affichage = "heritee", journal }: Options = {},
): Promise<number> {
  return new Promise((resoudre, rejeter) => {
    const stdio: StdioOptions = journal ? ["inherit", "pipe", "pipe"] : STDIO[affichage];
    const enfant = spawn(commande, args, { cwd, env, stdio });
    const fichier = journal ? createWriteStream(journal) : undefined;
    for (const flux of fichier ? [enfant.stdout, enfant.stderr] : []) {
      flux?.on("data", (morceau: Buffer) => {
        process.stdout.write(morceau);
        fichier?.write(morceau);
      });
    }
    enfant.on("error", rejeter);
    enfant.on("close", (code) => {
      if (fichier) fichier.end(() => resoudre(code ?? 1));
      else resoudre(code ?? 1);
    });
  });
}

// Comme lanceCommande, mais un code non nul est une erreur.
export async function executeCommande(commande: string, args: string[], options: Options = {}): Promise<void> {
  const code = await lanceCommande(commande, args, options);
  if (code !== 0) throw new Error(`Échec (code ${code}) : ${commande} ${args.join(" ")}`);
}
