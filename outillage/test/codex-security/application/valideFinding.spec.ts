import { beforeEach, describe, expect, it } from 'vitest';
import { ScannerCodexSecuritySimulee } from '../../doubles/ScannerCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { AttenteInstantanee } from '../../doubles/AttenteInstantanee.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { ValidationCodexSimulee } from '../../doubles/ValidationCodexSimulee.ts';
import {
  type Dependances,
  ValideFinding,
} from '../../../src/codex-security/application/valideFinding.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { ENVIRONNEMENT_CODEX_SECURITY } from '../../doubles/environnement.ts';

const CIBLE = '/depot/cible/copies/app';
const CONFIG_PAR_DEFAUT = '/depot/outils/codex-security/configs/config-defaut.yaml';
const FINDING = { title: 'Exemple de finding', cwe: ['CWE-200'] };
const SORTIE = '/depot/resultats/brut/codex-security/validate-20260930-140509';

const unDepotDeFichiersPret = () => {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    'finding.json': JSON.stringify(FINDING),
  });
  systemeDeFichier.creeDossier(CIBLE);
  return systemeDeFichier;
};

const uneValidation = (doubles: Partial<Dependances> = {}) =>
  new ValideFinding({
    racine: '/depot',
    scanner: new ScannerCodexSecuritySimulee(),
    validation: new ValidationCodexSimulee(),
    systemeDeFichier: unDepotDeFichiersPret(),
    reseau: new ReseauSimule(),
    attente: new AttenteInstantanee(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9)),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Valide Finding', () => {
  beforeEach(() => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      config: CONFIG_PAR_DEFAUT,
    });
  });

  it('valide le finding sur la cible, avec la config, vers une sortie horodatée', async () => {
    const validation = new ValidationCodexSimulee();

    await uneValidation({ validation }).execute({
      findingFile: 'finding.json',
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(validation.demandes).toEqual([
      expect.objectContaining({
        cible: CIBLE,
        config: CONFIG_PAR_DEFAUT,
        finding: FINDING,
        sortie: SORTIE,
      }),
    ]);
  });

  it('écrit le résumé validation-result.json, avec la durée de la validation arrondie en secondes', async () => {
    const horloge = new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9));
    const validation = new ValidationCodexSimulee({ horloge, dureeMs: 42_600 });
    const systemeDeFichier = unDepotDeFichiersPret();

    await uneValidation({ horloge, validation, systemeDeFichier }).execute({
      findingFile: 'finding.json',
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(
      JSON.parse(systemeDeFichier.lit(`${SORTIE}/validation-result.json`))
    ).toEqual({
      disposition: 'confirmed',
      threadId: 'fil-1',
      outputDir: SORTIE,
      durationSeconds: 43,
      finding: FINDING,
    });
  });

  it('écrit le rapport de validation validation-report.md', async () => {
    const systemeDeFichier = unDepotDeFichiersPret();

    await uneValidation({ systemeDeFichier }).execute({
      findingFile: 'finding.json',
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(
      systemeDeFichier.lit(
        '/depot/resultats/brut/codex-security/validate-20260930-140509/validation-report.md'
      )
    ).toBe('# Rapport\n');
  });

  it("affiche sur la sortie standard une synthèse JSON d'une ligne", async () => {
    const horloge = new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9));
    const validation = new ValidationCodexSimulee({ horloge, dureeMs: 42_600 });
    const console = new ConsoleEnMemoire();

    await uneValidation({ horloge, validation, console }).execute({
      findingFile: 'finding.json',
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(console.lignes.map((l) => l.message)[3]).toEqual(
      '{"disposition":"confirmed","outputDir":"/depot/resultats/brut/codex-security/validate-20260930-140509","durationSeconds":43}'
    );
  });

  it('annonce cible, config et sortie en traces, hors de la sortie standard réservée à la synthèse', async () => {
    const console = new ConsoleEnMemoire();

    await uneValidation({ console }).execute({
      findingFile: 'finding.json',
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(console.lignes.map((l) => l.message).splice(0, 3)).toEqual([
      `Cible  : ${CIBLE}`,
      'Config : /depot/outils/codex-security/configs/config-defaut.yaml',
      'Sortie : /depot/resultats/brut/codex-security/validate-20260930-140509',
    ]);
  });

  it('ferme la validation même quand elle échoue', async () => {
    const validation = new ValidationCodexSimulee({
      echec: new Error('réponse rejetée par le SDK'),
    });

    await expect(
      uneValidation({ validation }).execute({
        findingFile: 'finding.json',
        cible: CIBLE,
        config: CONFIG_PAR_DEFAUT,
      })
    ).rejects.toThrow('réponse rejetée par le SDK');
    expect(validation.fermee).toBe(true);
  });

  it("refuse un finding qui n'est pas du JSON, sans lancer de validation", async () => {
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.ecritFichier('finding.json', 'titre: exemple de finding');
    const validation = new ValidationCodexSimulee();

    await expect(
      uneValidation({ systemeDeFichier, validation }).execute({
        findingFile: 'finding.json',
        cible: CIBLE,
        config: CONFIG_PAR_DEFAUT,
      })
    ).rejects.toThrow("Finding illisible : finding.json n'est pas un JSON valide");
    expect(validation.demandes).toEqual([]);
  });
});
