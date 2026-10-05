# Ajouter un outil

Chaque outil d'audit vit dans son propre dossier `outils/<outil>/`, qui sépare le
code amont (sous-module, jamais modifié) de notre outillage.

## Convention

```
outils/<outil>/
  source/                 sous-module : dépôt amont de l'outil
  README.md               objectif, installation, lancement, retour d'expérience
  <outil>.env.template    modèle du fichier d'environnement (versionné, sans secret)
  <outil>.env             fichier rempli (ignoré par git : règle outils/*/*.env)
  patches/                optionnel : patchs appliqués sur source/ par bootstrap.sh
  configs/                optionnel : configurations de scan
  scripts/                optionnel : scripts annexes non bash (Python, Node…)
  docs/                   optionnel : documentation détaillée propre à l'outil

outillage/bash/<outil>/
  bootstrap.sh            optionnel : préparation après clone (patchs…), idempotent
  *.sh                    scripts de lancement bash
```

Hors du dossier de l'outil :

- **Sorties brutes** : `resultats/brut/<outil>/` (non versionné).
- **Rapports** : `resultats/rapports/` (versionnés, anonymisés).
- **Cible à scanner** : `cible/cible-exemple` n'est jamais modifié ; un outil qui écrit
  dans le dépôt analysé travaille sur une copie de `cible/copies/`.
- **Clé Albert** : la source de vérité reste le `.env` racine ; un script
  `outillage/bash/<outil>/generate-env.sh` peut en dériver `<outil>.env` (voir Codex Security).

## Étapes

1. Ajouter le sous-module :
   ```bash
   git submodule add <url> outils/<outil>/source
   ```
   Utiliser dans `.gitmodules` une URL utilisable par les autres contributeurs, pas un
   alias SSH personnel.
2. Créer `README.md` et `<outil>.env.template` ; si nécessaire
   `outillage/bash/<outil>/bootstrap.sh` (exécutable, idempotent), il sera appelé
   automatiquement par `outillage/bash/bootstrap.sh`. Pour la chaîne TypeScript, écrire une
   `PreparationOutil` (`../outillage/javascript/src/<outil>/application/`, testée avec des doubles) et l'inscrire au registre de `../outillage/javascript/src/composition/bootstrap.ts`.
3. Scripts de lancement bash (`outillage/bash/<outil>/`) : calculer les chemins à partir de
   l'emplacement du script (`racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"`,
   puis `outil="$racine/outils/<outil>"`), jamais depuis le répertoire courant.
4. Compléter `documentation/versions.md` et le tableau des outils du `README.md` racine.
5. Ajouter au `.gitignore` les fichiers remplis avec des identifiants (seuls les
   `*.template.*` sont versionnés) et les sorties que l'outil dépose dans son dossier.
