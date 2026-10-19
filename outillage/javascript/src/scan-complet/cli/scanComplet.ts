import { Command, Option } from 'commander';
import { ErreurUsage, executeCommande } from '../../noyau/ligne-de-commande.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import {
  type Dependances,
  LanceScanComplet,
} from '../application/lanceScanComplet.ts';
import {
  type CibleScan,
  ciblesDepuisJson,
  ciblesEnLigne,
} from '../domaine/cibles.ts';

export type DependancesCli = Dependances & {
  proxyLocal: boolean;
  systemeDeFichier: SystemeDeFichier;
};

const DESCRIPTION = `
Lance un scan complet, du bootstrap au scan, pour une ou plusieurs cibles.
(Enchaîne génère-env → proxy local si besoin, puis par cible : bootstrap → génère-config → scan) 
pour une ou plusieurs cibles. 
Le nom de chaque cible est dérivé de l'URL de son dépôt. 
On poursuit malgré l'échec d'une cible ; le code de sortie est le nombre de cibles en échec.

Les cibles sont fournies soit en ligne, soit via un fichier JSON`;

const accumule = (valeur: string, acc: string[]): string[] => [...acc, valeur];

export const scanComplet = async (
  argv: string[],
  dependances: DependancesCli
): Promise<number> => {
  const programme = new Command('scan complet')
    .description(DESCRIPTION)
    .addOption(
      new Option(
        '--cible <git-url>',
        'URL git d’une cible à cloner et scanner (--cible <cible-a> --cible <cible-b>)'
      )
        .argParser(accumule)
        .default([])
        .conflicts('cibles')
    )
    .addOption(
      new Option(
        '--cibles <fichier>',
        'fichier JSON : tableau d’URLs des cibles (format: ["<cible-a>", "<cible-b>"])'
      ).conflicts('cible')
    )
    .option(
      '--branch <nom>',
      'branche à cloner pour toutes les cibles (défaut : branche par défaut du dépôt)'
    )
    .option(
      '--jours <n>',
      'fenêtre glissante du git diff délimitant le périmètre du scan, en jours'
    );

  return executeCommande(programme, argv, dependances.console, () => {
    const {
      cible: urls,
      cibles: fichier,
      branch,
      jours,
    } = programme.opts<{
      cible: string[];
      cibles?: string;
      branch?: string;
      jours?: string;
    }>();

    const cibles = resousLesCibles(
      dependances.systemeDeFichier,
      urls,
      fichier,
      branch
    );
    return new LanceScanComplet(dependances).execute({
      cibles,
      jours: jours === undefined ? undefined : Number(jours),
      proxyLocal: dependances.proxyLocal,
    });
  });
};

const resousLesCibles = (
  systemeDeFichier: SystemeDeFichier,
  urls: string[],
  fichier: string | undefined,
  branche: string | undefined
): CibleScan[] => {
  if (urls.length === 0 && !fichier)
    throw new ErreurUsage(
      'Erreur : fournir au moins une --cible <url>, ou --cibles <fichier.json>.'
    );
  try {
    return fichier
      ? ciblesDepuisJson(systemeDeFichier.lit(fichier), branche)
      : ciblesEnLigne(urls, branche);
  } catch (erreur) {
    throw new ErreurUsage(erreur instanceof Error ? erreur.message : String(erreur));
  }
};
