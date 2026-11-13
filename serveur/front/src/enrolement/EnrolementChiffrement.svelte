<script lang="ts">
  import { storeEnrolement } from './enrolement.store.ts';

  const depotUrl = 'https://github.com/betagouv/lab-anssi-pala';
  const toolLinks = JSON.stringify([
    { label: 'GitHub', url: depotUrl, markup: 'a' },
  ]);
  const bottomLinks = JSON.stringify([
    { label: 'Mentions légales', href: '#', markup: 'a' },
    { label: 'Code source', href: depotUrl, markup: 'a' },
  ]);

  let nom = $state('');
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
    <div class="conteneur">
      <span class="barre-accent" aria-hidden="true"></span>
      <h1 class="titre-section">Enrôlement — chiffrement</h1>
      <p class="intro">
        Crée une identité cryptographique protégée par votre YubiKey (WebAuthn PRF).
        Le serveur émet et vérifie les challenges ; la clé privée reste chiffrée et
        le secret PRF ne quitte jamais le navigateur.
      </p>

      <form class="formulaire" onsubmit={(e) => e.preventDefault()}>
        <label for="nom">Nom d’utilisateur</label>
        <input id="nom" type="text" bind:value={nom} autocomplete="off" />

        <button
          type="button"
          class="bouton"
          onclick={() => storeEnrolement.enrole(nom)}
          disabled={$storeEnrolement.statut === 'en-cours' || nom.trim() === ''}
        >
          {$storeEnrolement.statut === 'en-cours'
            ? 'Enrôlement en cours…'
            : 'Enrôler'}
        </button>
      </form>

      {#if $storeEnrolement.message}
        <p class="message {$storeEnrolement.statut}">{$storeEnrolement.message}</p>
      {/if}

      {#if $storeEnrolement.enveloppe}
        <h2>Identité cryptographique</h2>
        <pre>{JSON.stringify($storeEnrolement.enveloppe, null, 2)}</pre>
      {/if}
    </div>
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
  .conteneur {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .section {
    padding: 48px 0;
  }
  .barre-accent {
    display: block;
    width: 40px;
    height: 4px;
    background: #000091;
    margin-bottom: 16px;
  }
  .titre-section {
    margin: 0 0 8px;
    font-size: 30px;
    font-weight: 700;
    color: #161616;
  }
  .intro {
    margin: 0 0 32px;
    font-size: 17px;
    color: #3a3a3a;
  }
  .formulaire {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  label {
    font-weight: 600;
  }
  input {
    width: 100%;
    max-width: 360px;
    padding: 10px 12px;
    font-size: 15px;
    border: 1px solid #929292;
    border-radius: 4px;
  }
  .bouton {
    background: #000091;
    color: #fff;
    border: 0;
    padding: 11px 20px;
    font-size: 15px;
    cursor: pointer;
    border-radius: 4px;
  }
  .bouton:disabled {
    background: #929292;
    cursor: not-allowed;
  }
  .message {
    margin-top: 24px;
    padding: 12px 14px;
    border-radius: 4px;
    background: #f6f6f6;
  }
  pre {
    background: #1b1b35;
    color: #e8e8fa;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 13px;
  }
</style>
