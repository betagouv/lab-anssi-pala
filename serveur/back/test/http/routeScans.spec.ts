import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID, type UUID } from 'node:crypto';
import { testeurPALA } from '../testeurPALA.ts';
import { adaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement';
import type { Scan } from '../../src/scans/scan.ts';
import type { Utilisateur } from '../../src/utilisateurs/utilisateur.ts';

const ID_SCAN: UUID = '0b0f7d3c-6a5e-4d0e-9a39-7d1f0c2b8e11';

const unRapport = (keyIds: string[] = []) => ({
  documentId: ID_SCAN,
  document: { iv: 'iv', ciphertext: 'contenu-chiffre' },
  enveloppes: keyIds.map((keyId) => ({
    keyId,
    enc: `enc-${keyId}`,
    ciphertext: `cle-${keyId}`,
  })),
});

const unScan = (rapport?: Record<string, unknown>): Scan => ({
  id: ID_SCAN,
  cible: 'mon-service-securise',
  date: new Date('2026-11-12T10:00:00.000Z'),
  rapport: !rapport ? undefined : JSON.stringify(rapport),
});

const unUtilisateur = (nom: string): Utilisateur => ({
  id: randomUUID(),
  nom,
  appareil: {
    identifiant: `appareil-${nom}`,
    clePublique: 'cle-publique-appareil',
    compteur: 1,
  },
  enveloppe: {
    keyId: `cle-${nom}`,
    clePublique: 'cle-publique',
    clePriveeChiffree: { iv: 'iv', ciphertext: 'cle-privee-chiffree' },
    prf: { salt: 'sel', hkdfSalt: 'sel-hkdf', version: 1 },
  },
});

describe('Routes des scans', () => {
  let testeur: ReturnType<typeof testeurPALA>;

  beforeEach(() => {
    adaptateurEnvironnement.verifieLesVariablesNecessaires = () => {};
    testeur = testeurPALA();
    testeur.initialise();
  });

  describe('GET /scans/:id', () => {
    it('renvoie la cible et la date du scan', async () => {
      await testeur.entrepots().scans.persiste(unScan(unRapport()));

      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.status).toBe(200);
      expect(reponse.body).toMatchObject({
        id: ID_SCAN,
        cible: 'mon-service-securise',
        date: '2026-11-12T10:00:00.000Z',
      });
    });

    it('renvoie le rapport chiffré', async () => {
      await testeur.entrepots().scans.persiste(unScan(unRapport(['cle-jeanne'])));

      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.body.rapport).toEqual(unRapport(['cle-jeanne']));
    });

    it('renvoie l’appareil et l’enveloppe des destinataires du rapport', async () => {
      const jeanne = unUtilisateur('jeanne');
      await testeur.entrepots().utilisateurs.persiste(jeanne);
      await testeur.entrepots().scans.persiste(unScan(unRapport(['cle-jeanne'])));

      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.body.destinataires).toEqual([
        { identifiantAppareil: 'appareil-jeanne', enveloppe: jeanne.enveloppe },
      ]);
    });

    it('ne renvoie pas un utilisateur qui n’est pas destinataire du rapport', async () => {
      await testeur.entrepots().utilisateurs.persiste(unUtilisateur('jeanne'));
      await testeur.entrepots().utilisateurs.persiste(unUtilisateur('paul'));
      await testeur.entrepots().scans.persiste(unScan(unRapport(['cle-jeanne'])));

      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.body.destinataires).toHaveLength(1);
      expect(reponse.body.destinataires[0].identifiantAppareil).toBe(
        'appareil-jeanne'
      );
    });

    it('répond 404 si le scan n’existe pas', async () => {
      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.status).toBe(404);
      expect(reponse.body).toEqual({ erreur: 'Aucun rapport pour ce scan.' });
    });

    it('retourne un rapport vide s’il n’a pu être généré', async () => {
      const jeanne = unUtilisateur('jeanne');
      await testeur.entrepots().utilisateurs.persiste(jeanne);
      const element = unScan(undefined);
      await testeur.entrepots().scans.persiste(element);

      const reponse = await testeur.get(`/scans/${ID_SCAN}`);

      expect(reponse.status).toBe(200);
      expect(reponse.body.rapport).toBeUndefined();
    });
  });
});
