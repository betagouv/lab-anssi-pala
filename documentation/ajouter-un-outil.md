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
  patches/                optionnel : patchs appliqués sur source/ au bootstrap, idempotents
  configs/                optionnel : configurations de scan
  scripts/                optionnel : scripts annexes (Python, Node…)
  docs/                   optionnel : documentation détaillée propre à l'outil
```

Hors du dossier de l'outil :

- **Sorties brutes** : `resultats/brut/<outil>/` (non versionné).
- **Traces d'exploration** : conservées hors du dépôt (jamais versionnées).
- **Cible à scanner** : la copie de référence dans `cible/` n'est jamais modifiée ; un outil qui
  écrit dans le dépôt analysé travaille sur une copie de `cible/copies/`.
- **Clé du fournisseur** : la source de vérité reste le `.env` racine ; `pnpm génère-env` peut en
  dériver un `<outil>.env` pour les outils qui en ont besoin (voir Shannon). Un outil peut aussi
  tout lire directement du `.env` racine, sans fichier propre (voir Codex Security).

## Étapes

1. Ajouter le sous-module :
   ```bash
   git submodule add <url> outils/<outil>/source
   ```
   Utiliser dans `.gitmodules` une URL utilisable par les autres contributeurs, pas un
   alias SSH personnel.
2. Créer `README.md` et, si l'outil a un environnement propre, `<outil>.env.template`. Écrire une
   `PreparationOutil` (`../outillage/src/<outil>/application/`, testée avec des doubles)
   — préparation après clone (patchs, installation…), idempotente — et l'inscrire au registre de
   `../outillage/src/composition/bootstrap.ts`.
3. Écrire les commandes de lancement comme CLI TypeScript (`src/<outil>/cli/`, composées dans
   `src/composition/`) et les brancher en scripts `pnpm` dans le `package.json` racine.
4. Compléter `documentation/versions.md` et le tableau des outils du `README.md` racine.
5. Ajouter au `.gitignore` les fichiers remplis avec des identifiants (seuls les
   `*.template.*` sont versionnés) et les sorties que l'outil dépose dans son dossier.
