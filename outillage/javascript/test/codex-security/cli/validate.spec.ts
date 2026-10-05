import { describe, expect, test } from 'vitest';
import { CliCodexSecuritySimulee } from '../../doubles/CliCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EnvironnementEnMemoire } from '../../doubles/EnvironnementEnMemoire.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { ValidationCodexSimulee } from '../../doubles/ValidationCodexSimulee.ts';
import {
  type DependancesCli,
  validate,
} from '../../../src/codex-security/cli/validate.ts';

function dependances(doubles: Partial<DependancesCli> = {}): DependancesCli {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    'outils/codex-security/codex-security.env':
      'LITELLM_MASTER_KEY=sk-local-jeton\n',
  });
  systemeDeFichier.creeDossier('/depot/cible/copies/app');
  return {
    racine: '/depot',
    repertoireAppel: '/depot',
    cli: new CliCodexSecuritySimulee(),
    validation: new ValidationCodexSimulee(),
    systemeDeFichier,
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30)),
    environnement: new EnvironnementEnMemoire({
      CODEX_TARGET: '/depot/cible/copies/app',
    }),
    console: new ConsoleEnMemoire(),
    ...doubles,
  };
}

describe('validate (ligne de commande)', () => {
  test("exige --finding-file (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await validate([], dependances({ console }));

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      "error: required option '--finding-file <fichier>' not specified"
    );
  });

  test("lit un --finding-file relatif depuis le répertoire d'appel", async () => {
    const validation = new ValidationCodexSimulee();
    const { systemeDeFichier } = dependances();
    systemeDeFichier.ecritFichier(
      '/home/auditeur/findings/f1.json',
      '{"title":"Exemple de finding"}'
    );

    const code = await validate(
      ['--finding-file', 'f1.json'],
      dependances({
        validation,
        systemeDeFichier,
        repertoireAppel: '/home/auditeur/findings',
      })
    );

    expect(code).toBe(0);
    expect(validation.demandes[0].finding).toEqual({ title: "Exemple de finding" });
  });
});
