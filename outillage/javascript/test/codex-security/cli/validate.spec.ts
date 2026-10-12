import { beforeEach, describe, expect, it } from 'vitest';
import { ScannerCodexSecuritySimulee } from '../../doubles/ScannerCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { ValidationCodexSimulee } from '../../doubles/ValidationCodexSimulee.ts';
import {
  type DependancesCli,
  validate,
} from '../../../src/codex-security/cli/validate.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { ENVIRONNEMENT_CODEX_SECURITY } from '../../doubles/environnement.ts';

const lesDependancesPourLaValidation = (
  doubles: Partial<DependancesCli> = {}
): DependancesCli => {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    'outils/codex-security/codex-security.env':
      'LITELLM_MASTER_KEY=sk-local-jeton\n',
  });
  systemeDeFichier.creeDossier('/depot/cible/copies/app');
  return {
    racine: '/depot',
    repertoireAppel: '/depot',
    scanner: new ScannerCodexSecuritySimulee(),
    validation: new ValidationCodexSimulee(),
    systemeDeFichier,
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30)),
    console: new ConsoleEnMemoire(),
    ...doubles,
  };
};

describe('validate (ligne de commande)', () => {
  it("exige --finding-file (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await validate([], lesDependancesPourLaValidation({ console }));

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      "error: required option '--finding-file <fichier>' not specified"
    );
  });

  it("exige --cible (erreur d'usage, code 2)", async () => {
    const { console, systemeDeFichier } = lesDependancesPourLaValidation();
    systemeDeFichier.ecritFichier(
      '/home/auditeur/findings/f1.json',
      '{"title":"Exemple de finding"}'
    );

    const code = await validate(
      ['--finding-file', 'f1.json'],
      lesDependancesPourLaValidation({ console, systemeDeFichier })
    );

    expect(code).toBe(2);
    expect((console as ConsoleEnMemoire).erreurs.map((l) => l.message)[0]).toBe(
      "error: required option '--cible <cible>' not specified"
    );
  });

  it("lit un --finding-file relatif depuis le répertoire d'appel", async () => {
    const validation = new ValidationCodexSimulee();
    const { systemeDeFichier } = lesDependancesPourLaValidation();
    systemeDeFichier.ecritFichier(
      '/home/auditeur/findings/f1.json',
      '{"title":"Exemple de finding"}'
    );
    systemeDeFichier.creeDossier('/depot/cible/copies/cible');

    const code = await validate(
      ['--finding-file', 'f1.json', '--cible', '/depot/cible/copies/cible'],
      lesDependancesPourLaValidation({
        validation,
        systemeDeFichier,
        repertoireAppel: '/home/auditeur/findings',
      })
    );

    expect(code).toBe(0);
    expect(validation.demandes[0].finding).toEqual({ title: 'Exemple de finding' });
  });

  it('fournit un fichier de config pour l’exécution de la validation', async () => {
    const validation = new ValidationCodexSimulee();
    const { systemeDeFichier } = lesDependancesPourLaValidation();
    systemeDeFichier.ecritFichier(
      '/home/auditeur/findings/le-finding.json',
      '{"title":"le contenu"}'
    );
    systemeDeFichier.creeDossier('/depot/cible/copies/cible');

    const code = await validate(
      [
        '--config',
        'outils/codex-security/configs/ma-config.yaml',
        '--cible',
        '/depot/cible/copies/cible',
        '--finding-file',
        '/home/auditeur/findings/le-finding.json',
      ],
      lesDependancesPourLaValidation({
        validation,
        systemeDeFichier,
        repertoireAppel: '/home/auditeur/findings',
      })
    );

    expect(code).toBe(0);
    expect(validation.demandes[0].config).toEqual(
      'outils/codex-security/configs/ma-config.yaml'
    );
  });

  it('utilise le fichier de config par défaut pour l’exécution de la validation s’il n’est pas fourni', async () => {
    const validation = new ValidationCodexSimulee();
    const { systemeDeFichier } = lesDependancesPourLaValidation();
    systemeDeFichier.ecritFichier(
      '/home/auditeur/findings/le-finding.json',
      '{"title":"le contenu"}'
    );
    systemeDeFichier.creeDossier('/depot/cible/copies/cible');

    const code = await validate(
      [
        '--cible',
        '/depot/cible/copies/cible',
        '--finding-file',
        '/home/auditeur/findings/le-finding.json',
      ],
      lesDependancesPourLaValidation({
        validation,
        systemeDeFichier,
        repertoireAppel: '/home/auditeur/findings',
      })
    );

    expect(code).toBe(0);
    expect(validation.demandes[0].config).toEqual(
      '/depot/outils/codex-security/configs/config-defaut.yaml'
    );
  });
});
