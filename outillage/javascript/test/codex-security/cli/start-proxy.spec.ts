import { describe, expect, it } from 'vitest';
import { AttenteInstantanee } from '../../doubles/AttenteInstantanee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { ConteneurProxySimule } from '../../doubles/ConteneurProxySimule.ts';
import { EnvironnementEnMemoire } from '../../doubles/EnvironnementEnMemoire.ts';
import { GenerationEnvironnementSimulee } from '../../doubles/GenerationEnvironnementSimulee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { startProxy } from '../../../src/codex-security/cli/start-proxy.ts';

describe('start-proxy (ligne de commande)', () => {
  it("signale l'échec du démarrage et sort en code 1", async () => {
    const console = new ConsoleEnMemoire();

    const code = await startProxy([], {
      generation: new GenerationEnvironnementSimulee(),
      conteneur: new ConteneurProxySimule(),
      reseau: new ReseauSimule([false]),
      attente: new AttenteInstantanee(),
      environnement: new EnvironnementEnMemoire(),
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm',
    ]);
  });
});
