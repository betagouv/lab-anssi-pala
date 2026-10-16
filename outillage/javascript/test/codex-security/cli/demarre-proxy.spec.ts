import { describe, expect, it } from 'vitest';
import { AttenteInstantanee } from '../../doubles/AttenteInstantanee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { ConteneurProxySimule } from '../../doubles/ConteneurProxySimule.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { demarreProxy } from '../../../src/codex-security/cli/demarre-proxy.ts';

describe('démarre-proxy (ligne de commande)', () => {
  it("signale l'échec du démarrage et sort en code 1", async () => {
    const console = new ConsoleEnMemoire();

    const code = await demarreProxy([], {
      conteneur: new ConteneurProxySimule(),
      reseau: new ReseauSimule([false]),
      attente: new AttenteInstantanee(),
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm',
    ]);
  });
});
