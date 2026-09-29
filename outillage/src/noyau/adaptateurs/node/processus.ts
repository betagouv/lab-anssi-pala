import { spawn, type StdioOptions } from "node:child_process";

// heritee : le terminal voit tout ; sansSortieStandard : seules les erreurs passent (« >/dev/null ») ;
// silencieuse : rien ne passe.
type Affichage = "heritee" | "sansSortieStandard" | "silencieuse";

type Options = { cwd?: string; env?: NodeJS.ProcessEnv; affichage?: Affichage };

const STDIO: Record<Affichage, StdioOptions> = {
  heritee: "inherit",
  sansSortieStandard: ["ignore", "ignore", "inherit"],
  silencieuse: "ignore",
};

// Lance une commande et renvoie son code de sortie.
export function lanceCommande(
  commande: string,
  args: string[],
  { cwd, env, affichage = "heritee" }: Options = {},
): Promise<number> {
  return new Promise((resoudre, rejeter) => {
    const enfant = spawn(commande, args, { cwd, env, stdio: STDIO[affichage] });
    enfant.on("error", rejeter);
    enfant.on("close", (code) => resoudre(code ?? 1));
  });
}

// Comme lanceCommande, mais un code non nul est une erreur.
export async function executeCommande(commande: string, args: string[], options: Options = {}): Promise<void> {
  const code = await lanceCommande(commande, args, options);
  if (code !== 0) throw new Error(`Échec (code ${code}) : ${commande} ${args.join(" ")}`);
}
