import type { ConfigurationProxy, ConteneurProxy } from '../ports/ConteneurProxy.ts';
import { executeCommande } from '../../noyau/infrastructure/processus.ts';
import { environnement } from '../../noyau/environnement.ts';

export class ConteneurProxyDockeurCC implements ConteneurProxy {
  async demarre(_configuration: ConfigurationProxy): Promise<void> {
    await executeCommande('clever', [
      'env',
      '--app',
      environnement.pourCodexSecurity().proxy().app!,
      'set',
      'FOURNISSEUR_BASE_URL',
      environnement.fournisseur().url,
    ]);
    await executeCommande('clever', [
      'env',
      '--app',
      environnement.pourCodexSecurity().proxy().app!,
      'set',
      'FOURNISSEUR_API_KEY',
      environnement.fournisseur().apiKey,
    ]);
    await executeCommande('clever', [
      'restart',
      '--app',
      environnement.pourCodexSecurity().proxy().app!,
    ]);
  }

  supprime(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
