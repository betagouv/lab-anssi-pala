import { beforeEach, describe, expect, it } from 'vitest';
import { ScannerCodexSecuritySimulee } from '../../doubles/ScannerCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EstimationDuCoutSimulee } from '../../doubles/EstimationDuCoutSimulee.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { AttenteInstantanee } from '../../doubles/AttenteInstantanee.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { BusEvenementsPALA } from '../../../src/noyau/adaptateurs/node/busEvenementsPALA.ts';
import type { ScanTermine } from '../../../src/codex-security/domaine/scanTermine.ts';
import type { ScanNonEffectue } from '../../../src/codex-security/domaine/scanNonEffectue.ts';
import {
  type Dependances,
  LanceScan,
} from '../../../src/codex-security/application/lanceScan.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const CIBLE = '/depot/cible/copies/app';
const CONFIG_PAR_DEFAUT = '/depot/outils/codex-security/configs/config-defaut.yaml';

const unDepotDeFichiersPret = () => {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    '/depot/outils/codex-security/configs/config-defaut.yaml':
      'codex:\n  model: deepseek-v4-flash-albert\n  model_provider: albert\n',
    '/depot/resultats/brut/codex-security/scan-20260930-140509.stdout.log':
      'LOG: \n TOKENS   100,000 uncached input, 10,000 cache reads, 0 cache writes, 10,500 output, 120,500 total',
  });
  systemeDeFichier.creeDossier(CIBLE);
  return systemeDeFichier;
};

const unScanCodex = (doubles: Partial<Dependances> = {}) =>
  new LanceScan({
    racine: '/depot',
    scanner: new ScannerCodexSecuritySimulee(),
    systemeDeFichier: unDepotDeFichiersPret(),
    reseau: new ReseauSimule(),
    attente: new AttenteInstantanee(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9)),
    estimation: new EstimationDuCoutSimulee(),
    console: new ConsoleEnMemoire(),
    busDEvenements: new BusEvenementsPALA(),
    ...doubles,
  });

const unDepotAuTarifScaleway = () => {
  const systemeDeFichier = unDepotDeFichiersPret();
  systemeDeFichier.fichiers.set(
    '/configs/scaleway.yaml',
    'codex:\n  model: glm-5.2\n  model_provider: scaleway\n'
  );
  return systemeDeFichier;
};

const collecteLesScansTermines = (bus: BusEvenementsPALA) => {
  const evenements: ScanTermine[] = [];
  bus.sabonne<ScanTermine>('SCAN_TERMINÉ', (evenement) =>
    evenements.push(evenement)
  );
  return evenements;
};

describe('Lance Scan Codex', () => {
  beforeEach(() => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
    });
  });

  it('refuse de scanner sans la CLI Codex Security', async () => {
    const scanner = new ScannerCodexSecuritySimulee({ installee: false });

    await expect(
      unScanCodex({ scanner: scanner }).execute({
        options: [],
        cible: CIBLE,
        config: 'config',
      })
    ).rejects.toThrow(
      'CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)'
    );
  });

  it('refuse de scanner sans cible désignée par CIBLE (aucune cible par défaut)', async () => {
    await expect(
      unScanCodex().execute({ options: [], cible: '', config: 'config' })
    ).rejects.toThrow(
      'CIBLE non défini : indiquer la cible, ex. CIBLE="$PWD/cible/copies/<nom>" (voir pnpm bootstrap --project <nom> --url <git-url>)'
    );
  });

  it('refuse de scanner une cible absente du disque', async () => {
    await expect(
      unScanCodex().execute({
        options: [],
        cible: '/depot/cible/copies/absente',
        config: 'config',
      })
    ).rejects.toThrow(
      'Cible manquante : /depot/cible/copies/absente (cloner via pnpm bootstrap --project <nom> --url <git-url>)'
    );
  });

  it('tolère un démarrage à froid du proxy : réessaie avant de renoncer', async () => {
    environnement.urlLiteLLMConfiguree = () => 'https://litellm.local';
    const reseau = new ReseauSimule([false, false, true]);
    const attente = new AttenteInstantanee();

    await unScanCodex({ reseau, attente }).execute({
      options: [],
      cible: CIBLE,
      config: 'config',
    });

    expect(reseau.urlsInterrogees).toEqual(
      Array(3).fill('https://litellm.local/health/liveliness')
    );
    expect(attente.attentes).toEqual([2000, 2000]);
  });

  it('refuse de scanner quand le proxy LiteLLM ne répond pas sur son URL', async () => {
    environnement.urlLiteLLMConfiguree = () => 'https://litellm.local';
    const reseau = new ReseauSimule([false]);

    await expect(
      unScanCodex({ reseau }).execute({
        options: [],
        cible: CIBLE,
        config: 'config',
      })
    ).rejects.toThrow(
      'Proxy LiteLLM injoignable sur https://litellm.local ' +
        '(démarrer le proxy local via pnpm démarre-proxy, ou vérifier LITELLM_BASE_URL)'
    );
    expect(reseau.urlsInterrogees).toEqual(
      Array(6).fill('https://litellm.local/health/liveliness')
    );
  });

  it('la variable de configuration impose la configuration du scan', async () => {
    const scanner = new ScannerCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.set(
      '/configs/ciblee.yaml',
      'codex:\n  model: glm-5.2\n  model_provider: scaleway\n'
    );

    await unScanCodex({ scanner: scanner, systemeDeFichier }).execute({
      options: [],
      cible: CIBLE,
      config: '/configs/ciblee.yaml',
    });

    expect(scanner.scans[0].config).toBe('/configs/ciblee.yaml');
  });

  it('sort dans un dossier horodaté privé, avec le log écrit à côté (Codex exige une sortie vide)', async () => {
    const scanner = new ScannerCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();
    const console = new ConsoleEnMemoire();
    const sortie = '/depot/resultats/brut/codex-security/scan-20260930-140509';

    await unScanCodex({ scanner: scanner, systemeDeFichier, console }).execute({
      options: [],
      cible: CIBLE,
      config: 'config',
    });

    expect(scanner.scans[0]).toMatchObject({
      sortie,
      journal: `${sortie}.stdout.log`,
    });
    expect(systemeDeFichier.dossiersPrives).toContain(sortie);
    expect(console.lignes.map((l) => l.message)[2]).toBe(`Sortie : ${sortie}`);
  });

  it('ne transmet à Codex que le jeton local du proxy, jamais une clé OpenAI', async () => {
    const scanner = new ScannerCodexSecuritySimulee();
    environnement.path = '/usr/bin';
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        jeton: 'sk-local-jeton',
      }),
    });

    await unScanCodex({ scanner: scanner }).execute({
      options: [],
      cible: CIBLE,
      config: 'config',
    });

    const transmis = scanner.scans[0].environnement;
    expect(transmis).toMatchObject({
      LITELLM_API_KEY: 'sk-local-jeton',
      CODEX_API_KEY: 'sk-local-jeton',
      PATH: '/usr/bin',
    });
    expect(transmis).not.toHaveProperty('OPENAI_API_KEY');
  });

  it("isole l'identité et l'historique de Codex dans des dossiers privés, et désigne le script d'artefacts", async () => {
    const scanner = new ScannerCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();

    await unScanCodex({ scanner: scanner, systemeDeFichier }).execute({
      options: [],
      cible: CIBLE,
      config: 'config',
    });

    expect(scanner.scans[0].environnement).toMatchObject({
      CODEX_HOME: '/depot/outils/codex-security/codex-home',
      CODEX_SECURITY_STATE_DIR: '/depot/outils/codex-security/state',
      CODEX_SECURITY_NO_UPDATE_NOTICE: '1',
      CODEX_SCAN_ECRIT_ARTEFACTS:
        '/depot/outils/codex-security/scripts/ecrit-artefacts-scan.py',
    });
    expect([...systemeDeFichier.dossiersPrives]).toEqual(
      expect.arrayContaining([
        '/depot/outils/codex-security/codex-home',
        '/depot/outils/codex-security/state',
      ])
    );
  });

  it('estime le coût du scan à partir de son log, avec le modèle, le fournisseur de la configuration et sans sortie', async () => {
    const estimation = new EstimationDuCoutSimulee();

    await unScanCodex({ estimation }).execute({
      options: [],
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
    });

    expect(estimation.releves).toEqual([
      {
        cache: 10000,
        entree: 100000,
        fournisseur: 'albert',
        modele: 'deepseek-v4-flash-albert',
        sortie: 10500,
      },
    ]);
  });

  it("renvoie le statut du scan même quand l'estimation du coût échoue", async () => {
    const scanner = new ScannerCodexSecuritySimulee({ statutDuScan: 42 });
    const console = new ConsoleEnMemoire();
    const estimation = new EstimationDuCoutSimulee({ console });

    const statut = await unScanCodex({
      scanner: scanner,
      estimation,
      console,
    }).execute({ options: [], cible: CIBLE, config: 'scan.stdout.log' }, () => {
      throw new Error('Fichier introuvable : scan.stdout.log');
    });

    expect(statut).toBe(42);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Estimation du coût impossible : Fichier introuvable : scan.stdout.log',
    ]);
  });

  it("suit par défaut les consignes de scan du dépôt, sans lesquelles DeepSeek n'écrit pas findings.json", async () => {
    const scanner = new ScannerCodexSecuritySimulee();

    await unScanCodex({ scanner: scanner }).execute({
      options: ['--dry-run'],
      cible: CIBLE,
      config: 'config',
    });

    expect(scanner.scans[0].options).toEqual(
      expect.arrayContaining([
        '--scan-prompt-file',
        '/depot/outils/codex-security/configs/consignes-scan.md',
      ])
    );
  });

  it("demande par défaut un log bavard, dont le relevé TOKENS permet d'estimer le coût", async () => {
    const scanner = new ScannerCodexSecuritySimulee();

    await unScanCodex({ scanner: scanner }).execute({
      options: [],
      cible: CIBLE,
      config: 'config',
    });

    expect(scanner.scans[0].options).toContain('--verbose');
  });

  it('publie un événement de fin de scan réussi, avec la cible et le coût estimé', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({
      scanner: new ScannerCodexSecuritySimulee({ statutDuScan: 0 }),
      systemeDeFichier: unDepotAuTarifScaleway(),
      busDEvenements: bus,
    }).execute({ options: [], cible: CIBLE, config: '/configs/scaleway.yaml' });

    expect(scansTermines).toEqual([
      {
        nom: 'SCAN_TERMINÉ',
        cible: CIBLE,
        resultat: 'Succès',
        cout: {
          type: 'estimé',
          montantEnEuros: ((100_000 + 10_000) * 1.8) / 1e6 + (10_500 * 5.5) / 1e6,
        },
        constats: [],
      },
    ]);
  });

  it('publie le hash du premier commit de la fenêtre scannée quand il est fourni', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({ busDEvenements: bus }).execute({
      options: [],
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
      premierCommit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    });

    expect(scansTermines[0].premierCommit).toBe(
      'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
    );
  });

  it('publie le hash du dernier commit de la fenêtre scannée quand il est fourni', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({ busDEvenements: bus }).execute({
      options: [],
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
      dernierCommit: '9f8e7d6c5b4a39281706f5e4d3c2b1a098765432',
    });

    expect(scansTermines[0].dernierCommit).toBe(
      '9f8e7d6c5b4a39281706f5e4d3c2b1a098765432'
    );
  });

  it('publie le nombre de jours de la fenêtre scannée quand il est fourni', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({ busDEvenements: bus }).execute({
      options: [],
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
      nombreDeJours: 7,
    });

    expect(scansTermines[0].nombreDeJours).toBe(7);
  });

  it('publie le nombre de fichiers du périmètre de la configuration', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.set(
      '/configs/deux-fichiers.yaml',
      'scan:\n  scope:\n    paths: [src/a.ts, src/b.ts]\n'
    );

    await unScanCodex({ systemeDeFichier, busDEvenements: bus }).execute({
      options: [],
      cible: CIBLE,
      config: '/configs/deux-fichiers.yaml',
    });

    expect(scansTermines[0].nombreDeFichiers).toBe(2);
  });

  describe('en ce qui concerne les constats', () => {
    it('les publie depuis le fichier de findings du scan', async () => {
      const bus = new BusEvenementsPALA();
      const scansTermines = collecteLesScansTermines(bus);
      const systemeDeFichier = unDepotDeFichiersPret();
      systemeDeFichier.fichiers.set(
        '/depot/resultats/brut/codex-security/scan-20260930-140509/findings.json',
        JSON.stringify({
          findings: [
            {
              title: 'UUID de conversation : seul contrôle de propriété',
              confidence: { level: 'high' },
              severity: { level: 'high' },
              taxonomy: { cwe: ['CWE-639'] },
              locations: [
                {
                  path: 'src/mon-fichier-impacte.ts',
                  startLine: 110,
                  endLine: 110,
                },
              ],
            },
          ],
        })
      );

      await unScanCodex({ systemeDeFichier, busDEvenements: bus }).execute({
        options: [],
        cible: CIBLE,
        config: CONFIG_PAR_DEFAUT,
      });

      expect(scansTermines[0].constats).toEqual([
        {
          titre: 'UUID de conversation : seul contrôle de propriété',
          confiance: 'high',
          severite: 'high',
          cwe: ['CWE-639'],
          emplacements: [
            {
              chemin: 'src/mon-fichier-impacte.ts',
              ligneDebut: 110,
              ligneFin: 110,
            },
          ],
        },
      ]);
    });

    it('publie une liste de constats vide quand le scan ne produit pas de findings', async () => {
      const bus = new BusEvenementsPALA();
      const scansTermines = collecteLesScansTermines(bus);

      await unScanCodex({ busDEvenements: bus }).execute({
        options: [],
        cible: CIBLE,
        config: CONFIG_PAR_DEFAUT,
      });

      expect(scansTermines[0].constats).toEqual([]);
    });
  });

  it("publie un coût indisponible quand l'estimation échoue, sans empêcher la publication", async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({ busDEvenements: bus }).execute(
      { options: [], cible: CIBLE, config: 'scan.stdout.log' },
      () => {
        throw new Error('Fichier introuvable : scan.stdout.log');
      }
    );

    expect(scansTermines).toEqual([
      {
        nom: 'SCAN_TERMINÉ',
        cible: CIBLE,
        resultat: 'Succès',
        cout: { type: 'indisponible' },
        constats: [],
      },
    ]);
  });

  it('publie un événement de fin de scan en échec quand le scanner renvoie un statut non nul', async () => {
    const bus = new BusEvenementsPALA();
    const scansTermines = collecteLesScansTermines(bus);

    await unScanCodex({
      scanner: new ScannerCodexSecuritySimulee({ statutDuScan: 42 }),
      busDEvenements: bus,
    }).execute({ options: [], cible: CIBLE, config: CONFIG_PAR_DEFAUT });

    expect(scansTermines).toMatchObject([{ cible: CIBLE, resultat: 'Échec' }]);
  });

  describe("quand il n'y a rien à scanner", () => {
    const CONFIG_PERIMETRE_VIDE = '/configs/perimetre-vide.yaml';
    const CONFIG_PERIMETRE_RENSEIGNE = '/configs/perimetre-renseigne.yaml';

    const unDepotAvecConfigsDePerimetre = () => {
      const systemeDeFichier = unDepotDeFichiersPret();
      systemeDeFichier.fichiers.set(
        CONFIG_PERIMETRE_VIDE,
        'scan:\n  scope:\n    paths: []\n'
      );
      systemeDeFichier.fichiers.set(
        CONFIG_PERIMETRE_RENSEIGNE,
        'scan:\n  scope:\n    paths: [src/a.ts]\ncodex:\n  model: glm-5.2\n  model_provider: scaleway\n'
      );
      return systemeDeFichier;
    };

    it("n'exécute pas le scan et lève un événement quand le périmètre est vide", async () => {
      const bus = new BusEvenementsPALA();
      const scansNonEffectues: ScanNonEffectue[] = [];
      bus.sabonne<ScanNonEffectue>('SCAN_NON_EFFECTUÉ', (evenement) =>
        scansNonEffectues.push(evenement)
      );
      const scanner = new ScannerCodexSecuritySimulee();

      const statut = await unScanCodex({
        scanner,
        systemeDeFichier: unDepotAvecConfigsDePerimetre(),
        busDEvenements: bus,
      }).execute({ options: [], cible: CIBLE, config: CONFIG_PERIMETRE_VIDE });

      expect(statut).toBe(0);
      expect(scanner.scans).toEqual([]);
      expect(scansNonEffectues).toEqual([
        { nom: 'SCAN_NON_EFFECTUÉ', cible: CIBLE },
      ]);
    });

    it('scanne normalement quand le périmètre liste des fichiers', async () => {
      const scanner = new ScannerCodexSecuritySimulee();

      await unScanCodex({
        scanner,
        systemeDeFichier: unDepotAvecConfigsDePerimetre(),
      }).execute({
        options: [],
        cible: CIBLE,
        config: CONFIG_PERIMETRE_RENSEIGNE,
      });

      expect(scanner.scans).toHaveLength(1);
    });
  });

  it("respecte les consignes de l'utilisateur, même écrites --scan-prompt-file=<fichier>", async () => {
    const scanner = new ScannerCodexSecuritySimulee();

    await unScanCodex({ scanner: scanner }).execute({
      options: ['--scan-prompt-file=/mes-consignes.md'],
      cible: CIBLE,
      config: 'config',
    });

    expect(scanner.scans[0].options).toEqual([
      '--verbose',
      '--scan-prompt-file=/mes-consignes.md',
    ]);
  });
});
