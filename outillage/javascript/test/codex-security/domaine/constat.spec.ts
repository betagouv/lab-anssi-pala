import { describe, expect, it } from 'vitest';
import { extraitLesConstats } from '../../../src/codex-security/domaine/constat.ts';

const unFindingsJson = (findings: unknown[]) =>
  JSON.stringify({ documentType: 'codex-security.findings', findings });

const unFinding = (details: Record<string, unknown> = {}) => ({
  title: 'UUID de conversation : seul contrôle de propriété',
  confidence: { level: 'high' },
  severity: { level: 'medium' },
  taxonomy: { category: 'broken-access-control', cwe: ['CWE-639'] },
  locations: [{ path: 'src/mon-fichier-impacte.ts', startLine: 110, endLine: 110 }],
  ...details,
});

describe('Constat', () => {
  it("extrait le titre, la confiance, la sévérité et les CWE d'un constat", () => {
    const constats = extraitLesConstats(unFindingsJson([unFinding()]));

    expect(constats).toHaveLength(1);
    expect(constats[0]).toMatchObject({
      titre: 'UUID de conversation : seul contrôle de propriété',
      confiance: 'high',
      severite: 'medium',
      cwe: ['CWE-639'],
    });
  });

  it('extrait chaque emplacement impacté avec son chemin et ses lignes', () => {
    const constats = extraitLesConstats(
      unFindingsJson([
        unFinding({
          locations: [
            { path: 'src/mon-fichier-impacte.ts', startLine: 84, endLine: 113 },
            {
              path: 'infra/mon-fichier-impacte.ts',
              startLine: 102,
              endLine: 113,
            },
          ],
        }),
      ])
    );

    expect(constats[0].emplacements).toEqual([
      { chemin: 'src/mon-fichier-impacte.ts', ligneDebut: 84, ligneFin: 113 },
      { chemin: 'infra/mon-fichier-impacte.ts', ligneDebut: 102, ligneFin: 113 },
    ]);
  });

  it('projette chaque finding du rapport en un constat', () => {
    const constats = extraitLesConstats(
      unFindingsJson([
        unFinding({ title: 'Premier' }),
        unFinding({ title: 'Deuxième' }),
      ])
    );

    expect(constats.map((c) => c.titre)).toEqual(['Premier', 'Deuxième']);
  });

  it('renvoie une liste vide quand le rapport ne contient aucun finding', () => {
    expect(extraitLesConstats(unFindingsJson([]))).toEqual([]);
  });

  it('renvoie une liste vide quand le rapport ne mentionne pas de findings', () => {
    expect(extraitLesConstats(JSON.stringify({ schemaVersion: '1.0' }))).toEqual([]);
  });
});
