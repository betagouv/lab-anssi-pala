import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const CDN_LAB_ANSSI_UI_KIT =
  'https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com';
const rootPkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);
const versionUiKit: string | undefined =
  rootPkg.runtimeDependencies?.['@lab-anssi/ui-kit'];

const estampilleNonce = (): Plugin => ({
  name: 'pala-nonce-csp',
  enforce: 'post',
  transformIndexHtml(html) {
    return html
      .replace(/<script(?![^>]*\bnonce=)/g, '<script nonce="%%NONCE%%"')
      .replace(
        /<link((?=[^>]*\brel="(?:stylesheet|modulepreload)")(?![^>]*\bnonce=)[^>]*)>/g,
        '<link nonce="%%NONCE%%"$1>'
      );
  },
});

const injecteUiKitDev = (): Plugin => ({
  name: 'pala-ui-kit-dev',
  apply: 'serve',
  transformIndexHtml(html) {
    if (!versionUiKit) return html;
    const base = `${CDN_LAB_ANSSI_UI_KIT}/${versionUiKit}`;
    const balises =
      `<link rel="stylesheet" href="${base}/dsfr-variables.css">` +
      `<script src="${base}/lab-anssi-ui-kit.iife.js"></script>`;
    return html.replace('</head>', `${balises}</head>`);
  },
});

export default defineConfig({
  base: '/statique/',
  plugins: [svelte(), estampilleNonce(), injecteUiKitDev()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    modulePreload: { polyfill: false },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
});
