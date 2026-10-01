import type { Tarif } from "./Tarifs.ts";

// Tokens consommés par un run. L'entrée totale compte le cache au tarif plein (estimation haute).
export class ReleveDeTokens {
  readonly entree: number;
  readonly cache: number;
  readonly sortie: number;

  constructor({ entree, cache, sortie }: { entree: number; cache: number; sortie: number }) {
    this.entree = entree;
    this.cache = cache;
    this.sortie = sortie;
  }

  // Ligne type : "  TOKENS   777,656 uncached input, 348,672 cache reads, 0 cache writes, 31,639 output, 1,157,967 total"
  // Aucun relevé tant que le scan n'est pas terminé.
  static depuisLogCodex(log: string): ReleveDeTokens | null {
    const ligne = log
      .split("\n")
      .findLast((l) => l.includes("TOKENS") && l.includes("input") && l.includes("output"));
    if (!ligne) return null;
    const nombre = (motif: string) => {
      const trouve = ligne.match(new RegExp(`([\\d,]+)\\s+${motif}`));
      return trouve ? Number(trouve[1].replaceAll(",", "")) : null;
    };
    const entree = nombre("uncached input");
    const cache = nombre("cache reads");
    const sortie = nombre("output");
    if (entree === null || cache === null || sortie === null) return null;
    return new ReleveDeTokens({ entree, cache, sortie });
  }

  // Shannon ne distingue pas le cache : entrée et sortie sommées sur tous les agents du run.
  static depuisSessionShannon(session: string): ReleveDeTokens {
    type Agent = { total_input_tokens?: number; total_output_tokens?: number };
    const agents: Agent[] = Object.values(JSON.parse(session).metrics.agents);
    const somme = (champ: keyof Agent) => agents.reduce((total, agent) => total + (agent[champ] ?? 0), 0);
    return new ReleveDeTokens({ entree: somme("total_input_tokens"), cache: 0, sortie: somme("total_output_tokens") });
  }

  get entreeTotale(): number {
    return this.entree + this.cache;
  }

  // En euros : estimation volontairement HAUTE, le cache (souvent facturé moins cher) est compté
  // au tarif d'entrée plein.
  coutAu(tarif: Tarif): number {
    return (this.entreeTotale * tarif.entree) / 1e6 + (this.sortie * tarif.sortie) / 1e6;
  }
}
