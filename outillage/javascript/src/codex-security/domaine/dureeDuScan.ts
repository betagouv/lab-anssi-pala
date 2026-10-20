type ManifesteBrut = { scan?: { startedAt?: string; completedAt?: string } };

export const extraitLaDuree = (contenuJson: string): number | undefined => {
  const { scan } = JSON.parse(contenuJson) as ManifesteBrut;
  if (!scan?.startedAt || !scan.completedAt) return undefined;
  return Date.parse(scan.completedAt) - Date.parse(scan.startedAt);
};
