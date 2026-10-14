export type NiveauDeConfiance = 'low' | 'medium' | 'high';
export type NiveauDeSeverite = 'low' | 'medium' | 'high';

export type Emplacement = {
  chemin: string;
  ligneDebut: number;
  ligneFin: number;
};

export type Constat = {
  titre: string;
  confiance: NiveauDeConfiance;
  severite: NiveauDeSeverite;
  cwe: string[];
  emplacements: Emplacement[];
};

type FindingBrut = {
  title: string;
  confidence: { level: NiveauDeConfiance };
  severity: { level: NiveauDeSeverite };
  taxonomy?: { cwe?: string[] };
  locations?: { path: string; startLine: number; endLine: number }[];
};

export const extraitLesConstats = (contenuJson: string): Constat[] => {
  const { findings } = JSON.parse(contenuJson) as { findings?: FindingBrut[] };
  return (findings ?? []).map((finding) => ({
    titre: finding.title,
    confiance: finding.confidence.level,
    severite: finding.severity.level,
    cwe: finding.taxonomy?.cwe ?? [],
    emplacements: (finding.locations ?? []).map((emplacement) => ({
      chemin: emplacement.path,
      ligneDebut: emplacement.startLine,
      ligneFin: emplacement.endLine,
    })),
  }));
};
