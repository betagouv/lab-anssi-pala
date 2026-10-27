# Front PALA — Svelte + DSFR (kit Lab ANSSI en web components)

SPA **Svelte 5** construite avec **Vite**. L'interface utilise le design system de l'État via les
**web components** du [kit Lab ANSSI](https://github.com/betagouv/lab-anssi-ui-kit)
(`dsfr-header`, `lab-anssi-bandeau-page`, `dsfr-button`, `dsfr-footer`, …).

## Chargement du kit (CDN + nonce)

Le kit n'est **pas** bundlé : il est servi depuis le CDN Clever et injecté dans le `<head>` :

- `<script src=".../<version>/lab-anssi-ui-kit.iife.js">` enregistre les web components ;
- `<link href=".../<version>/dsfr-variables.css">` fournit les variables DSFR globales.

La `<version>` provient d'un seul endroit : le champ `runtimeDependencies["@lab-anssi/ui-kit"]`
du **package.json racine**. L'injection se fait :

- **en prod** par le back (`serveur/back/src/serveur.ts`), avec le `nonce` de la requête sur
  chaque balise — le bundle IIFE relit ce nonce (`document.currentScript.nonce`) et le reporte sur
  les `<style>` qu'il injecte dans le Shadow DOM ⇒ la CSP reste stricte (`'self'` + `'nonce-…'`,
  pas d'`unsafe-inline`) ;
- **en dev** par Vite (`serveur/front/vite.config.ts`, plugin `apply: 'serve'`), sans nonce
  (le serveur Vite n'applique pas de CSP).

Le host CDN est autorisé dans la CSP (`serveur/back/src/http/middleware.ts`) sur `script-src`,
`style-src`, `style-src-elem`, `img-src` et `font-src`.

**Police Marianne** : `dsfr-variables.css` déclare `font-family: Marianne` mais ne charge pas la
police. Elle est donc **auto-hébergée** (`src/marianne.css` + `@gouvfr/dsfr`) : Vite bundle les
woff2 sous `/statique/assets/`, servis en `'self'` (aucun CDN tiers, `font-src 'self'` suffit).

Le build produit `serveur/front/dist/` (servi par le back : `index.html` sur toutes les routes,
`dist/assets/…` sous `/statique/`). `dist/` et `node_modules/` ne sont **pas versionnés**.

## Développement

```bash
# 1) Serveur de dev Vite, HMR, http://localhost:3001 (kit injecté par Vite, pas de CSP)
pnpm dev:front

# 2) Via le back Express (CSP réelle, nonce). Builder d'abord, puis :
pnpm build:front
SVELTE_DEV_LOCAL_AVEC_HOT_RELOAD=1 NB_REQUETES_MAX_PAR_MINUTE=1000 pnpm dev:back
# → http://localhost:8086 (ou $PORT)
```

> ⚠️ Le rate-limit bloque toute navigation si `NB_REQUETES_MAX_PAR_MINUTE` vaut `0` (défaut).
> Renseigner une valeur > 0 (les routes `/statique/` et `/favicon.ico` ne sont pas limitées).

## Build

```bash
pnpm build:front   # = pnpm --dir serveur/front install && pnpm --dir serveur/front build
```

## Déploiement (Clever Cloud — app `lab-anssi-pala`)

Le back lit `serveur/front/dist/index.html` sur disque : builder le front **au déploiement** via un
hook post-build Clever, p. ex. `CC_POST_BUILD_HOOK=pnpm build:front`
(**nom exact de la variable/hook à vérifier** selon la doc Clever en vigueur).

Pour faire évoluer la version du kit : changer `runtimeDependencies["@lab-anssi/ui-kit"]` dans le
`package.json` racine (le back et Vite lisent cette valeur).

## Contenu

Starter minimal : `dsfr-header`, `lab-anssi-bandeau-page` (hero + boutons `dsfr-button`),
`dsfr-footer`. À enrichir avec les sections complètes (outils Codex/Shannon, chaîne en 4 temps,
sécurité, démarrage) conformément au design validé.
