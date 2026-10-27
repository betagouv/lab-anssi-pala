<script lang="ts">
  const depotUrl = 'https://github.com/betagouv/lab-anssi-ui-kit';

  const toolLinks = JSON.stringify([{ label: 'GitHub', url: depotUrl, markup: 'a' }]);

  const bottomLinks = JSON.stringify([
    { label: 'Mentions légales', href: '#', markup: 'a' },
    { label: 'Accessibilité : non conforme', href: '#', markup: 'a' },
    { label: 'Code source', href: depotUrl, markup: 'a' },
  ]);
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
  <lab-anssi-bandeau-page
    titre="L'audit de sécurité piloté par des agents LLM"
    description="PALA enchaîne analyse statique et pentest dynamique sur une cible que vous fournissez, avec des modèles souverains — Albert (DINUM) et Scaleway."
    mention="Modèles souverains · Albert · Scaleway"
    sans-image="true"
  >
    <div slot="buttonsgroup" class="fr-btns-group fr-btns-group--inline-md">
      <dsfr-button label="Démarrer" markup="a" href="#demarrage"></dsfr-button>
      <dsfr-button
        label="Découvrir les outils"
        kind="secondary"
        markup="a"
        href="#outils"
      ></dsfr-button>
    </div>
  </lab-anssi-bandeau-page>
</main>

<dsfr-footer
  has-description="true"
  content-description="PALA — Pentest agentique, Lab ANSSI. Outillage d'audit de sécurité piloté par des agents LLM sur modèles souverains."
  partner-title=""
  bottom-links={bottomLinks}
  bottom-copyright="© Lab ANSSI — sauf mention contraire, le contenu est sous licence du dépôt."
></dsfr-footer>
