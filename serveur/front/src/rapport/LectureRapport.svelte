<script lang="ts">
  import { onMount } from 'svelte';
  import { type Statut, storeRapport } from './rapport.store.ts';
  import DOMPurify from 'dompurify';

  const depotUrl = 'https://github.com/betagouv/lab-anssi-pala';
  const toolLinks = JSON.stringify([
    { label: 'GitHub', url: depotUrl, markup: 'a' },
  ]);
  const bottomLinks = JSON.stringify([
    { label: 'Mentions légales', href: '#', markup: 'a' },
    { label: 'Code source', href: depotUrl, markup: 'a' },
  ]);

  const typeAlerte: Record<Statut, string> = {
    pret: 'info',
    chargement: 'info',
    charge: 'info',
    dechiffrement: 'info',
    dechiffre: 'success',
    erreur: 'error',
  };

  const identifiantScan = () =>
    decodeURIComponent(
      window.location.pathname.split('/').filter(Boolean).at(-1) ?? ''
    );

  const enDechiffrement = $derived($storeRapport.statut === 'dechiffrement');

  onMount(() => {
    storeRapport.charge(identifiantScan());
  });
</script>

<dsfr-header
  brand-service="PALA"
  has-brand-tagline="true"
  brand-tagline="Pentest agentique — Lab ANSSI"
  brand-link-href="/"
  has-tool-links="true"
  tool-links={toolLinks}
></dsfr-header>

<main id="contenu">
  <section class="section">
    <dsfr-container>
      <div class="colonne">
        <span class="barre-accent" aria-hidden="true"></span>
        <h1 class="titre-section">Rapport de scan</h1>

        {#if $storeRapport.message}
          <dsfr-alert
            size="sm"
            type={typeAlerte[$storeRapport.statut]}
            text={$storeRapport.message}
          ></dsfr-alert>
        {/if}

        {#if $storeRapport.scan}
          <dl class="resume">
            <dt>Cible</dt>
            <dd>{$storeRapport.scan.cible}</dd>
            <dt>Date du scan</dt>
            <dd>{new Date($storeRapport.scan.date).toLocaleString('fr-FR')}</dd>
          </dl>

          <form
            onsubmit={(e) => {
              e.preventDefault();
              storeRapport.dechiffre();
            }}
          >
            <dsfr-button
              label={enDechiffrement ? 'Déchiffrement en cours…' : 'Déchiffrer'}
              type="submit"
              disabled={enDechiffrement}
            ></dsfr-button>
          </form>
        {/if}
      </div>

      {#if $storeRapport.scan}
        {#if $storeRapport.contenu !== null}
          <div class="rapport">
            <h2>Rapport déchiffré</h2>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- contenu assaini par DOMPurify -->
            {@html DOMPurify.sanitize($storeRapport.contenu)}
          </div>
        {:else}
          <div class="colonne">
            <h2>Scan chiffré</h2>
            <div class="rapport">
              <pre>{$storeRapport.scan.rapport.document.ciphertext}</pre>
            </div>
          </div>
        {/if}
      {/if}
    </dsfr-container>
  </section>
</main>

<dsfr-footer
  has-description="true"
  content-description="PALA — Pentest agentique, Lab ANSSI."
  partner-title=""
  bottom-links={bottomLinks}
  bottom-copyright="© Lab ANSSI — contenu sous licence du dépôt."
></dsfr-footer>

<style>
  .colonne {
    max-width: 720px;
    margin: 0 auto;
  }
  .resume {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 16px;
    margin: 0 0 24px;
  }
  .resume dt {
    font-weight: 700;
  }
  .resume dd {
    margin: 0;
  }
  .rapport {
    pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
    margin: 24px 0;
    overflow-x: auto;
  }
  pre {
    background: var(--background-contrast-grey);
    color: var(--text-default-grey);
    padding: 16px;
    overflow-x: auto;
    font-size: 13px;
  }
</style>
