<script lang="ts">
  import { onMount } from 'svelte';
  import { storeRapport, type Statut } from './rapport.store.ts';

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

          <h2>Scan chiffré</h2>
          <pre>{JSON.stringify($storeRapport.scan, null, 2)}</pre>
        {/if}
      </div>
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
  pre {
    background: var(--background-contrast-grey);
    color: var(--text-default-grey);
    padding: 16px;
    overflow-x: auto;
    font-size: 13px;
  }
</style>
