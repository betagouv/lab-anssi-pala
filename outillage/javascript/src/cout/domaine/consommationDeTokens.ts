export type ConsommationDeTokens = {
  entree: number;
  cache: number;
  sortie: number;
  fournisseur: any;
  modele: any;
}

export const unReleveDeConsommationDeTokensCodex = (log: string, fournisseur: string, modele: string) => {
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
  return {entree, cache, sortie,fournisseur, modele};
};

type Agent = { total_input_tokens?: number; total_output_tokens?: number };

export const unReleveDeConsommationDeTokensShannon = (session: string, modelSpec: string) => {
  const [fournisseur, ...modele] = modelSpec.split(":");
  const agents: Agent[] = Object.values(JSON.parse(session).metrics.agents);
  const somme = (champ: keyof Agent) => agents.reduce((total, agent) => total + (agent[champ] ?? 0), 0);
  return {
    entree: somme("total_input_tokens"),
    cache: 0,
    sortie: somme("total_output_tokens"),

  fournisseur,
      modele: modele.join(":")};
};
