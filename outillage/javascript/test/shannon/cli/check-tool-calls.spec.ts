import { beforeEach, describe, expect, it } from 'vitest';
import { ApiChatSimulee } from '../../doubles/ApiChatSimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { checkToolCalls } from '../../../src/shannon/cli/check-tool-calls.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { ENVIRONNEMENT_SHANNON } from '../../doubles/environnement.ts';

describe('check-tool-calls (ligne de commande)', () => {
  beforeEach(() => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
    });
  });

  it("vérifie le modèle fourni en paramètre et la description pi désignés (chemin relatif au répertoire d'appel)", async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '/home/auditeur/modeles.json': JSON.stringify({
        providers: { scaleway: { baseUrl: 'https://scaleway.example/v1' } },
      }),
    });

    const code = await checkToolCalls(
      [
        '--model',
        'scaleway:deepseek-v4-flash-0731',
        '--models-config',
        'modeles.json',
      ],
      {
        racine: '/depot',
        repertoireAppel: '/home/auditeur',
        apiChat,
        systemeDeFichier,
        console: new ConsoleEnMemoire(),
      }
    );

    expect(code).toBe(0);
    expect(apiChat.demandes[0]).toMatchObject({
      url: 'https://scaleway.example/v1',
      modele: 'deepseek-v4-flash-0731',
    });
  });
});
