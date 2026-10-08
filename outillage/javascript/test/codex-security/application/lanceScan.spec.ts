import { beforeEach, describe, expect, it } from 'vitest';
import { CliCodexSecuritySimulee } from '../../doubles/CliCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EstimationDuCoutSimulee } from '../../doubles/EstimationDuCoutSimulee.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
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
    'outils/codex-security/codex-security.env':
      'FOURNISSEUR_API_KEY=cle-fournisseur\nLITELLM_MASTER_KEY=sk-local-jeton\n',
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
    cli: new CliCodexSecuritySimulee(),
    systemeDeFichier: unDepotDeFichiersPret(),
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9)),
    estimation: new EstimationDuCoutSimulee(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Lance Scan Codex', () => {
  beforeEach(() => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
    });
  });

  it('refuse de scanner sans la CLI Codex Security', async () => {
    const cli = new CliCodexSecuritySimulee({ installee: false });

    await expect(unScanCodex({ cli }).execute({ options: [] })).rejects.toThrow(
      'CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)'
    );
  });

  it("refuse de scanner sans l'environnement du proxy", async () => {
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.delete('outils/codex-security/codex-security.env');

    await expect(
      unScanCodex({ systemeDeFichier }).execute({ options: [] })
    ).rejects.toThrow(
      'Fichier manquant : outils/codex-security/codex-security.env (lancer pnpm start-proxy)'
    );
  });

  // TODO: la cible n’est pas une variable elle doit être calculée
  it.skip('refuse de scanner sans cible désignée par CIBLE (aucune cible par défaut)', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      // cible: undefined,
    });

    await expect(unScanCodex().execute({ options: [] })).rejects.toThrow(
      'CIBLE non défini : indiquer la cible, ex. CIBLE="$PWD/cible/copies/<nom>" (voir pnpm bootstrap --project <nom> --url <git-url>)'
    );
  });

  it('refuse de scanner une cible absente du disque', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: '/depot/cible/copies/absente',
    });

    await expect(unScanCodex().execute({ options: [] })).rejects.toThrow(
      'Cible manquante : /depot/cible/copies/absente (cloner via pnpm bootstrap --project <nom> --url <git-url>)'
    );
  });

  it('refuse de scanner quand le proxy LiteLLM ne répond pas sur son port', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        portLiteLLM: 4100,
      }),
    });
    const reseau = new ReseauSimule([false]);

    await expect(unScanCodex({ reseau }).execute({ options: [] })).rejects.toThrow(
      'Proxy LiteLLM injoignable sur 127.0.0.1:4100 (lancer pnpm start-proxy)'
    );
    expect(reseau.urlsInterrogees).toEqual([
      'http://127.0.0.1:4100/health/liveliness',
    ]);
  });

  // TODO: la cible n’est pas une variable elle doit être calculée
  it.skip("scanne la cible avec la config par défaut, en transmettant les options de l'utilisateur", async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      // config: undefined,
    });

    const cli = new CliCodexSecuritySimulee();
    const console = new ConsoleEnMemoire();

    await unScanCodex({ cli, console }).execute({
      options: ['--verbose', '--mode', 'deep'],
    });

    expect(cli.scans[0]).toMatchObject({
      cible: CIBLE,
      config: '/depot/outils/codex-security/configs/config-defaut.yaml',
    });
    expect(cli.scans[0].options).toEqual(
      expect.arrayContaining(['--verbose', '--mode', 'deep'])
    );
    expect(console.lignes.map((l) => l.message).slice(0, 2)).toEqual([
      `Cible  : ${CIBLE}`,
      'Config : /depot/outils/codex-security/configs/config-defaut.yaml',
    ]);
  });

  it('la variable de configuration impose la configuration du scan', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      config: '/configs/ciblee.yaml',
    });
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.set(
      '/configs/ciblee.yaml',
      'codex:\n  model: glm-5.2\n  model_provider: scaleway\n'
    );

    await unScanCodex({ cli, systemeDeFichier }).execute({ options: [] });

    expect(cli.scans[0].config).toBe('/configs/ciblee.yaml');
  });

  it('sort dans un dossier horodaté privé, avec le log écrit à côté (Codex exige une sortie vide)', async () => {
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();
    const console = new ConsoleEnMemoire();
    const sortie = '/depot/resultats/brut/codex-security/scan-20260930-140509';
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      sortie,
    });

    await unScanCodex({ cli, systemeDeFichier, console }).execute({ options: [] });

    expect(cli.scans[0]).toMatchObject({ sortie, journal: `${sortie}.stdout.log` });
    expect(systemeDeFichier.dossiersPrives).toContain(sortie);
    expect(console.lignes.map((l) => l.message)[2]).toBe(`Sortie : ${sortie}`);
  });

  it('la variable de sortie impose la sortie, sans y placer le log même avec un / final', async () => {
    const cli = new CliCodexSecuritySimulee();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      sortie: '/tmp/scan-a',
    });

    await unScanCodex({ cli }).execute({ options: [] });

    expect(cli.scans[0]).toMatchObject({
      sortie: '/tmp/scan-a',
      journal: '/tmp/scan-a.stdout.log',
    });
  });

  it('ne transmet à Codex que le jeton local du proxy, jamais une clé OpenAI', async () => {
    const cli = new CliCodexSecuritySimulee();
    environnement.path = '/usr/bin';
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        LITELLM_MASTER_KEY: 'sk-local-jeton',
        CODEX_API_KEY: 'sk-local-jeton',
      }),
    });

    await unScanCodex({ cli }).execute({ options: [] });

    const transmis = cli.scans[0].environnement;
    expect(transmis).toMatchObject({
      LITELLM_API_KEY: 'sk-local-jeton',
      CODEX_API_KEY: 'sk-local-jeton',
      PATH: '/usr/bin',
    });
    expect(transmis).not.toHaveProperty('OPENAI_API_KEY');
  });

  it("isole l'identité et l'historique de Codex dans des dossiers privés, et désigne le script d'artefacts", async () => {
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotDeFichiersPret();

    await unScanCodex({ cli, systemeDeFichier }).execute({ options: [] });

    expect(cli.scans[0].environnement).toMatchObject({
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

  // TODO: la sortie n’est pas une variable elle doit être calculée
  it.skip('estime le coût du scan à partir de son log, avec le modèle, le fournisseur de la configuration et sans sortie', async () => {
    const estimation = new EstimationDuCoutSimulee();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      config: CONFIG_PAR_DEFAUT,
      // sortie: undefined,
    });

    await unScanCodex({ estimation }).execute({ options: [] });

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
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: CIBLE,
      config: 'scan.stdout.log',
    });
    const cli = new CliCodexSecuritySimulee({ statutDuScan: 42 });
    const console = new ConsoleEnMemoire();
    const estimation = new EstimationDuCoutSimulee({ console });

    const statut = await unScanCodex({ cli, estimation, console }).execute(
      { options: [] },
      () => {
        throw new Error('Fichier introuvable : scan.stdout.log');
      }
    );

    expect(statut).toBe(42);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Estimation du coût impossible : Fichier introuvable : scan.stdout.log',
    ]);
  });

  it("suit par défaut les consignes de scan du dépôt, sans lesquelles DeepSeek n'écrit pas findings.json", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScanCodex({ cli }).execute({ options: ['--dry-run'] });

    expect(cli.scans[0].options).toEqual(
      expect.arrayContaining([
        '--scan-prompt-file',
        '/depot/outils/codex-security/configs/consignes-scan.md',
      ])
    );
  });

  it("demande par défaut un log bavard, dont le relevé TOKENS permet d'estimer le coût", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScanCodex({ cli }).execute({ options: [] });

    expect(cli.scans[0].options).toContain('--verbose');
  });

  it("respecte les consignes de l'utilisateur, même écrites --scan-prompt-file=<fichier>", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScanCodex({ cli }).execute({
      options: ['--scan-prompt-file=/mes-consignes.md'],
    });

    expect(cli.scans[0].options).toEqual([
      '--verbose',
      '--scan-prompt-file=/mes-consignes.md',
    ]);
  });
});
