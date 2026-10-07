import { describe, expect, test } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EstimationDuCoutSimulee } from '../../doubles/EstimationDuCoutSimulee.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { ShannonSimule } from '../../doubles/ShannonSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { type DependancesCli, shannon } from '../../../src/shannon/cli/shannon.ts';

function dependances(doubles: Partial<DependancesCli> = {}): DependancesCli {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    'outils/shannon/shannon.env': 'SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\n',
    'outils/shannon/source/apps/cli/dist/index.mjs': '',
  });
  systemeDeFichier.creeDossier('/depot/cible/copies/app');
  return {
    racine: '/depot',
    repertoireAppel: '/depot',
    shannon: new ShannonSimule(),
    systemeDeFichier,
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(1_790_000_000_000)),
    estimation: new EstimationDuCoutSimulee(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  };
}

describe('shannon (ligne de commande)', () => {
  test("exige --project, --url et --config (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await shannon(
      ['--project', 'app', '--url', 'http://localhost:8081'],
      dependances({ console })
    );

    expect(code).toBe(2);
    expect(console.erreurs.map((e) => e.message)[0]).toBe(
      "error: required option '--config <fichier>' not specified"
    );
  });

  test('transmet le dépôt, le workspace, la description pi et le modèle demandés', async () => {
    const lanceur = new ShannonSimule();
    const { systemeDeFichier } = dependances();
    systemeDeFichier.ecritFichier('/configs/app.yaml', '');
    systemeDeFichier.creeDossier('/sources/app');

    await shannon(
      [
        '--project',
        'app',
        '--url',
        'http://localhost:8081',
        '--config',
        '/configs/app.yaml',
        '--repo',
        '/sources/app',
        '--workspace',
        'app-reprise',
        '--models-config',
        '/mes-modeles.json',
        '--model',
        'scaleway:glm-5.2',
      ],
      dependances({ shannon: lanceur, systemeDeFichier })
    );

    expect(lanceur.lancements[0]).toMatchObject({
      depot: '/sources/app',
      workspace: 'app-reprise',
      modelsConfig: '/mes-modeles.json',
      environnement: expect.objectContaining({
        SHANNON_AI_MODEL: 'scaleway:glm-5.2',
      }),
    });
  });

  test("résout --config, --repo et --models-config relatifs depuis le répertoire d'appel", async () => {
    const lanceur = new ShannonSimule();
    const { systemeDeFichier } = dependances();
    systemeDeFichier.ecritFichier('/home/auditeur/audit/app.yaml', '');
    systemeDeFichier.creeDossier('/home/auditeur/audit/sources');

    await shannon(
      [
        '--project',
        'app',
        '--url',
        'http://localhost:8081',
        '--config',
        'app.yaml',
        '--repo',
        'sources',
        '--models-config',
        'modeles.json',
      ],
      dependances({
        shannon: lanceur,
        systemeDeFichier,
        repertoireAppel: '/home/auditeur/audit',
      })
    );

    expect(lanceur.lancements[0]).toMatchObject({
      config: '/home/auditeur/audit/app.yaml',
      depot: '/home/auditeur/audit/sources',
      modelsConfig: '/home/auditeur/audit/modeles.json',
    });
  });

  test('affiche une aide avec un exemple de lancement, sans rien lancer', async () => {
    const lanceur = new ShannonSimule();
    const console = new ConsoleEnMemoire();

    const code = await shannon(
      ['--help'],
      dependances({ shannon: lanceur, console })
    );

    expect(code).toBe(0);
    expect(lanceur.lancements).toEqual([]);
    expect(console.lignes.map((l) => l.message)).toContain(
      '  pnpm shannon --project <nom> --url http://localhost:8081 \\'
    );
  });
});
