import { type Request, type Response, Router } from 'express';
import type { Enveloppe } from '../enrolement/enveloppe.ts';
import type { Entrepots } from '../infra/entrepots.ts';

type CorpsDeReponseScan = {
  id: string;
  cible: string;
  date: Date;
  rapport?: {
    enveloppes: { keyId: string }[];
  };
  destinataires?: {
    identifiantAppareil: string;
    enveloppe: Enveloppe;
  }[];
};

export const creeRouteScans = (entrepots: Entrepots): Router => {
  const routeur = Router();

  routeur.get('/:id', async (requete: Request, reponse: Response) => {
    const scan = await entrepots.scans.lis(requete.params.id as string);

    if (!scan) {
      reponse.status(404).json({ erreur: 'Aucun rapport pour ce scan.' });
      return;
    }

    const corpsdeReponse: CorpsDeReponseScan = {
      id: scan.id,
      cible: scan.cible,
      date: scan.date,
    };
    if (scan.rapport) {
      const rapport = JSON.parse(scan.rapport) as {
        enveloppes: { keyId: string }[];
      };
      const destinataires = await entrepots.utilisateurs.parKeyIds(
        rapport.enveloppes.map((enveloppe) => enveloppe.keyId)
      );
      corpsdeReponse['rapport'] = rapport;
      corpsdeReponse['destinataires'] = destinataires.map((utilisateur) => ({
        identifiantAppareil: utilisateur.appareil.identifiant,
        enveloppe: utilisateur.enveloppe,
      }));
    }
    reponse.json(corpsdeReponse);
  });

  return routeur;
};
