import { describe, expect, test } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EnvironnementEnMemoire } from '../../doubles/EnvironnementEnMemoire.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ServeurCibleFumeeSimule } from '../../doubles/ServeurCibleFumeeSimule.ts';
import { ShannonSimule } from '../../doubles/ShannonSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { shannonSmoke } from '../../../src/shannon/cli/shannon-smoke.ts';

describe('shannon-smoke (ligne de commande)', () => {
  test('sort avec le statut du passage de fumée', async () => {
    const code = await shannonSmoke([], {
      racine: '/depot',
      shannon: new ShannonSimule({ statut: 4 }),
      serveur: new ServeurCibleFumeeSimule(),
      systemeDeFichier: new SystemeDeFichierEnMemoire({
        'outils/shannon/shannon.env':
          'SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\n',
        'outils/shannon/source/apps/cli/dist/index.mjs': '',
      }),
      horloge: new HorlogeFigee(new Date(1_790_000_000_000)),
      environnement: new EnvironnementEnMemoire(),
      console: new ConsoleEnMemoire(),
    });

    expect(code).toBe(4);
  });
});
