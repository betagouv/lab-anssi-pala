<script lang="ts">
  import { storeEnrolement, type Statut } from './enrolement.store.ts';

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
    'en-cours': 'info',
    ok: 'success',
    erreur: 'error',
  };

  let nom = $state('');
  const enCours = $derived($storeEnrolement.statut === 'en-cours');
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
        <h1 class="titre-section">Enrôlement — chiffrement</h1>
        <p class="intro">
          Crée une identité cryptographique protégée par votre YubiKey (WebAuthn
          PRF). Le serveur émet et vérifie les challenges ; la clé privée reste
          chiffrée et le secret PRF ne quitte jamais le navigateur.
        </p>

        <form
          class="formulaire"
          onsubmit={(e) => {
            e.preventDefault();
            storeEnrolement.enrole(nom);
          }}
        >
          <dsfr-input
            id="nom"
            label="Nom d’utilisateur"
            value={nom}
            autocomplete="off"
            onvaluechanged={(e: CustomEvent<string>) => (nom = e.detail)}
          ></dsfr-input>

          <dsfr-button
            label={enCours ? 'Enrôlement en cours…' : 'Enrôler'}
            type="submit"
            disabled={enCours || nom.trim() === ''}
          ></dsfr-button>
        </form>

        {#if $storeEnrolement.message}
          <dsfr-alert
            size="sm"
            type={typeAlerte[$storeEnrolement.statut]}
            text={$storeEnrolement.message}
          ></dsfr-alert>
        {/if}

        {#if $storeEnrolement.enveloppe}
          <h2>Identité cryptographique</h2>
          <pre>{JSON.stringify($storeEnrolement.enveloppe, null, 2)}</pre>
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
  .formulaire {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
  }
  dsfr-input {
    display: block;
    width: 100%;
    max-width: 360px;
  }
  pre {
    background: var(--background-contrast-grey);
    color: var(--text-default-grey);
    padding: 16px;
    overflow-x: auto;
    font-size: 13px;
  }
</style>
