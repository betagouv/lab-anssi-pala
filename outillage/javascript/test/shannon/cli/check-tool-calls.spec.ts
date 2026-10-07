import { beforeEach, describe, expect, it } from 'vitest';
import { ApiChatSimulee } from '../../doubles/ApiChatSimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { checkToolCalls } from '../../../src/shannon/cli/check-tool-calls.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_FOURNISSEUR,
  ENVIRONNEMENT_SHANNON,
} from '../../doubles/environnement.ts';

describe('check-tool-calls (ligne de commande)', () => {
  beforeEach(() => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
    });
    environnement.fournisseur = () => ENVIRONNEMENT_FOURNISSEUR;
  });

  it('vérifie le modèle fourni en paramètre, chez le fournisseur', async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

    const code = await checkToolCalls(
      ['--model', 'scaleway:deepseek-v4-flash-0731'],
      {
        racine: '/depot',
        apiChat,
        systemeDeFichier,
        console: new ConsoleEnMemoire(),
      }
    );

    expect(code).toBe(0);
    expect(apiChat.demandes[0]).toMatchObject({
      url: 'http://fournisseur.local',
      modele: 'deepseek-v4-flash-0731',
    });
  });
});
