# Stack technique

| Technologie | Usage           | Responsabilité                    |
| ----------- | --------------- | --------------------------------- |
| Node.js     | Runtime         | Exécution du backend              |
| TypeScript  | Langage         | Typage et structuration du code   |
| Svelte      | Frontend        | Interface utilisateur             |
| Express     | Backend         | API HTTP et middleware            |
| PostgreSQL  | Base de données | Persistance relationnelle         |
| Docker      | Environnement   | Reproductibilité du développement |

## Versions

| Technologie | Version retenue | Source de vérité                             |
| ----------- | --------------- | -------------------------------------------- |
| Node.js     | [À compléter]   | `../../.nvmrc`, `package.json` ou équivalent |
| TypeScript  | [À compléter]   | `../../package.json`                         |
| Svelte      | [À compléter]   | `../../package.json`                         |
| Express     | [À compléter]   | `../../package.json`                         |
| PostgreSQL  | [À compléter]   | Docker Compose / configuration               |
| Docker      | [À compléter]   | Environnement cible                          |

## Principes

- Activer le typage strict TypeScript.
- Éviter `any` ; justifier toute exception.
- Centraliser la configuration.
- Isoler les accès à la base de données derrière des adaptateurs.
- Ne pas rendre le domaine dépendant de Node.js, Express ou Svelte.
- Documenter toute nouvelle dépendance structurante.
