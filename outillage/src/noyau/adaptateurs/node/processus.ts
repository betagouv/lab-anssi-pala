import { spawn } from "node:child_process";

type Options = { cwd?: string; env?: NodeJS.ProcessEnv; silencieux?: boolean };

// Lance une commande en héritant du terminal et renvoie son code de sortie.
export function lanceCommande(commande: string, args: string[], { cwd, env, silencieux }: Options = {}): Promise<number> {
  return new Promise((resoudre, rejeter) => {
    const enfant = spawn(commande, args, { cwd, env, stdio: silencieux ? "ignore" : "inherit" });
    enfant.on("error", rejeter);
    enfant.on("close", (code) => resoudre(code ?? 1));
  });
}

// Comme lanceCommande, mais un code non nul est une erreur.
export async function executeCommande(commande: string, args: string[], options: Options = {}): Promise<void> {
  const code = await lanceCommande(commande, args, options);
  if (code !== 0) throw new Error(`Échec (code ${code}) : ${commande} ${args.join(" ")}`);
}
