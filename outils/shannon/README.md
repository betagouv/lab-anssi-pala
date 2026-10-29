# Shannon

Pentest agentique [Shannon](https://github.com/KeygraphHQ/shannon) (Keygraph) : contrairement à une
analyse de code, Shannon attaque une **application en marche** et peut exécuter de vrais exploits.
Il exige donc le code source **et** une instance joignable en HTTP. Règle « no exploit, no
report » : seules les vulnérabilités démontrées par un exploit sont retenues.

Les chemins ci-dessous sont relatifs à la racine du dépôt.

## Prérequis

- Node, clone du dépôt Shannon (sous-module `source/`), build local (image worker de plusieurs Go).
- Un conteneur Temporal permanent (orchestration des scans).
- **Une instance jetable de la cible, réellement en marche et accessible en HTTP.** En mode
  `exploit: true`, Shannon écrit et agit pour de vrai (comptes, données, e-mails) : base de données
  **jetable** obligatoire, jamais un environnement de production.
- Un modèle fiable en appels d'outils. Depuis un conteneur, viser l'application par
  `host.docker.internal` (jamais `localhost`, qui désigne le conteneur) ; sous Linux/macOS, une
  entrée `/etc/hosts` peut être nécessaire pour tester le même chemin réseau à la main.
- Pour un scan authentifié : un compte de **test**. Pour le SAST agentique : un vrai dépôt git
  (`.git` présent) dans le code fourni.

## Configuration du modèle

Shannon parle Chat Completions en direct (sans proxy) : `configs/models.*.json` décrit le modèle
(`api: openai-completions`), la clé vient de l'environnement. Dans `shannon.env` :
`SHANNON_AI_MODEL` et `SHANNON_AI_API_KEY` (dérivés des variables `FOURNISSEUR_*` du `.env` racine).
Le tool-calling d'un modèle se vérifie hors Shannon avec `scripts/verifie_appels_outils_llm.py`.

## Contenu de `outils/shannon/`

```
source/                sous-module : dépôt amont (jamais modifié)
configs/               models.*.json et config-<intention>-cible.template.yaml
scripts/               verifie_appels_outils_llm.py (test de tool-calling)
patches/               patchs réappliqués au bootstrap (pnpm bootstrap)
shannon.env.template   modèle ; shannon.env rempli (non versionné)
smoke-target/          cible triviale locale pour un passage de vérification
```

Les configurations couvrent plusieurs **intentions**, à copier et remplir par cible :

| Template | Scénario |
| --- | --- |
| `config-analyse-cible` | Analyse sans exploitation (`exploit: false`) |
| `config-authentification-cible` | Scan authentifié avec exploitation (login/mot de passe ou SSO) |
| `config-creation-compte-cible` | Parcours nécessitant la création d'un compte / premier login |
| `config-focus-cible` | Scan focalisé sur des routes ou fichiers précis |
| `config-sast-cible` | SAST agentique (Capella) activé, sans exploitation |

## Utilisation

Une CLI est disponible et est déclinée en 2 versions, une `bash` et une `TypeScript`.
L’exécution de la CLI s’opère depuis la racine du projet PALA.

### Vérifier la chaîne d’outils

Pour afficher l'aide et obtenir la liste des paramètres (et leurs valeurs par défaut) :
```bash
pnpm run shannon:vérifie-appels-outils-llm --help
```

```bash
pnpm run shannon:vérifie-appels-outils-llm
```

### Lancer un test de fumée (smoke test)


Pour afficher l'aide et obtenir la liste des paramètres (et leurs valeurs par défaut) :
```bash
pnpm run shannon:smoke-test --help
```

```bash
pnpm run shannon:smoke-test
```

#### ⚠️ Résultat du test de fumée
> En mode `--pipeline-testing`, la dernière étape échoue volontairement (le montage est validé en
> amont, mais le rapport minimal ne remplit pas l'`executive_summary`). 
> 
> Pour un passage de bout en bout qui réussit, utiliser `SMOKE_REAL=1`.

### Valider par la preuve une vulnérabilité découverte
Pour afficher l'aide et obtenir la liste des paramètres (et leurs valeurs par défaut) :
```bash
pnpm run shannon:pen-test --help
```

```bash
pnpm run shannon:pen-test --project <nom> --url <url de l’app à tester> --config <chemin vers le fichier de configuration>
```

Suivi : 
- `node shannon status|logs|scans|stop` depuis `outils/shannon/source` ; 
- interface Temporal sur `http://127.0.0.1:8233`; 
- Les workspaces (`Security-Assessment-Report.md`, `report.sarif`…) sont sous `outils/shannon/source/workspaces/<nom>/`,  **non versionnés**.

## Budget

Shannon n'a pas de plafond monétaire natif (ses budgets internes sont des délais). Pour un vrai
plafond : router Shannon via une passerelle LiteLLM budgétée (comme le proxy de Codex Security) ou
plafonner côté console du fournisseur. Sinon, jouer sur `exploit: false`, `rules.focus` et
`report.min_severity`.

## Note de prudence

Un rapport marqué « exploited » signifie que l'agent a obtenu une réponse, pas nécessairement que
la vulnérabilité est réelle : **rejouer indépendamment un échantillon des preuves d'impact** avant
de prendre un rapport pour argent comptant. Le jugement d'impact reste celui du modèle.
