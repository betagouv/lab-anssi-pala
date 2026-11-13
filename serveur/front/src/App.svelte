<script lang="ts">
  const depotUrl = 'https://github.com/betagouv/lab-anssi-pala';
  const codexUrl = 'https://github.com/openai/codex-security';
  const shannonUrl = 'https://github.com/KeygraphHQ/shannon';

  const toolLinks = JSON.stringify([
    { label: 'GitHub', url: depotUrl, markup: 'a' },
  ]);

  const bottomLinks = JSON.stringify([
    { label: 'Mentions légales', href: '#', markup: 'a' },
    { label: 'Accessibilité : non conforme', href: '#', markup: 'a' },
    { label: 'Code source', href: depotUrl, markup: 'a' },
  ]);

  const etapes = [
    {
      n: '01',
      titre: 'Bootstrap',
      texte:
        'Sous-modules Codex et Shannon, puis clone de la cible dans un espace local non versionné.',
    },
    {
      n: '02',
      titre: 'Configuration',
      texte:
        "Génération de l'environnement et du config.yaml à partir du .env racine et de la cible.",
    },
    {
      n: '03',
      titre: 'Analyse statique',
      texte:
        'Codex Security balaie le code et publie un compte rendu. Large et bon marché.',
    },
    {
      n: '04',
      titre: 'Validation dynamique',
      texte:
        'Shannon confronte les points sensibles à une instance jetable et apporte la preuve.',
    },
  ];

  const securite = [
    {
      titre: "Rien n'est versionné",
      texte:
        'Aucune cible, aucun identifiant, aucune sortie de scan dans le dépôt. Les secrets vivent hors du suivi.',
      accent: undefined as string | undefined,
    },
    {
      titre: 'Instances jetables',
      texte:
        'Shannon agit réellement — écritures, comptes, e-mails. Toujours une base et une app jetables, jamais la production.',
      accent: 'orange-terre-battue',
    },
    {
      titre: 'Bac à sable en lecture',
      texte:
        "Codex Security a un accès en lecture au disque : ne pas le lancer sur une machine portant d'autres secrets.",
      accent: undefined,
    },
    {
      titre: 'Proxy local',
      texte:
        "LiteLLM traduit l'API et garde la clé du fournisseur hors de l'environnement de l'agent.",
      accent: undefined,
    },
  ];
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
  <!-- Hero -->
  <lab-anssi-bandeau-page
    titre="L'audit de sécurité piloté par des agents LLM"
    description="PALA enchaîne analyse statique et pentest dynamique sur une cible que vous fournissez, avec des modèles souverains — Albert (DINUM) et Scaleway."
    mention="Modèles souverains · Albert · Scaleway"
    sans-image="true"
  >
    <div slot="buttonsgroup" class="hero-btns">
      <dsfr-button
        label="Démarrer"
        kind="inverted-primary"
        markup="a"
        href="#demarrage"
      ></dsfr-button>
      <dsfr-button
        label="Découvrir les outils"
        kind="inverted-secondary"
        markup="a"
        href="#outils"
      ></dsfr-button>
    </div>
  </lab-anssi-bandeau-page>

  <!-- Les outils -->
  <section id="outils" class="section">
    <dsfr-container>
      <span class="barre-accent" aria-hidden="true"></span>
      <h2 class="titre-section">Deux agents, enchaînés</h2>
      <p class="intro">
        Codex Security d'abord — analyse statique, large et bon marché. Puis Shannon
        — validation dynamique, ponctuelle, sur les points qui méritent une preuve.
      </p>
      <div class="grille grille-2">
        <dsfr-card
          title="Codex Security"
          has-detail-start="true"
          detail-start="OpenAI · analyse statique"
          has-description="true"
          description="Analyse de code agentique : repère des faiblesses potentielles et les documente. Large, en premier, sur l'ensemble du dépôt."
          href={codexUrl}
          blank="true"
          enlarge="true"
          has-tag="true"
        >
          <div slot="tagsgroup">
            <dsfr-badge
              label="Lit le code"
              type="status"
              status="success"
              has-no-icon="true"
            ></dsfr-badge>
            <dsfr-badge
              label="Hors ligne"
              type="status"
              status="success"
              has-no-icon="true"
            ></dsfr-badge>
            <dsfr-badge
              label="Proxy LiteLLM"
              type="status"
              status="info"
              has-no-icon="true"
            ></dsfr-badge>
          </div>
        </dsfr-card>

        <dsfr-card
          title="Shannon"
          has-detail-start="true"
          detail-start="Keygraph · pentest dynamique"
          has-description="true"
          description="Pentest agentique sur une application en marche : il valide les points sensibles par la preuve, en exploitation réelle."
          href={shannonUrl}
          blank="true"
          enlarge="true"
          has-tag="true"
        >
          <div slot="tagsgroup">
            <dsfr-badge
              label="Instance vivante"
              type="status"
              status="info"
              has-no-icon="true"
            ></dsfr-badge>
            <dsfr-badge
              label="Toujours jetable"
              type="status"
              status="warning"
              has-no-icon="true"
            ></dsfr-badge>
            <dsfr-badge
              label="Par intention"
              type="status"
              status="info"
              has-no-icon="true"
            ></dsfr-badge>
          </div>
        </dsfr-card>
      </div>
    </dsfr-container>
  </section>

  <!-- La chaîne -->
  <section id="chaine" class="section section--alt">
    <dsfr-container>
      <span class="barre-accent" aria-hidden="true"></span>
      <h2 class="titre-section">Du dépôt à la preuve, en quatre temps</h2>
      <div class="grille grille-4">
        {#each etapes as etape (etape.n)}
          <div class="etape">
            <div class="etape__num" aria-hidden="true">{etape.n}</div>
            <h3>{etape.titre}</h3>
            <p>{etape.texte}</p>
          </div>
        {/each}
      </div>
    </dsfr-container>
  </section>

  <!-- Sécurité -->
  <section id="securite" class="section">
    <dsfr-container>
      <span class="barre-accent" aria-hidden="true"></span>
      <h2 class="titre-section">Pensé pour ne rien exposer</h2>
      <div class="grille grille-2">
        {#each securite as point (point.titre)}
          <dsfr-callout
            has-title="true"
            title={point.titre}
            text={point.texte}
            accent={point.accent}
          ></dsfr-callout>
        {/each}
      </div>
    </dsfr-container>
  </section>

  <!-- Démarrage -->
  <section id="demarrage" class="section">
    <dsfr-container>
      <div class="bloc-demarrage">
        <div class="bloc-demarrage__txt">
          <h2>Un scan complet en une commande</h2>
          <p>
            Après avoir renseigné le .env racine, une seule commande enchaîne
            bootstrap, configuration, analyse statique et validation.
          </p>
        </div>
        <div class="bloc-demarrage__cmd">
          <pre class="commande"><code
              >$ pnpm run scan-complet \
    --project api --url &lt;url-git&gt;</code
            ></pre>
          <div class="bloc-demarrage__action">
            <dsfr-button
              label="Lire le README"
              kind="inverted-primary"
              markup="a"
              href={depotUrl}
              target="_blank"
            ></dsfr-button>
          </div>
        </div>
      </div>
    </dsfr-container>
  </section>
</main>

<dsfr-footer
  has-description="true"
  content-description="PALA — Pentest agentique, Lab ANSSI. Outillage d'audit de sécurité piloté par des agents LLM sur modèles souverains."
  partner-title=""
  bottom-links={bottomLinks}
  bottom-copyright="© Lab ANSSI — sauf mention contraire, le contenu est sous licence du dépôt."
></dsfr-footer>

<style>
  .hero-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .grille-2 {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  .grille-4 {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  /* Les web components sont inline par défaut : on les force en bloc et on les étire. */
  dsfr-card,
  dsfr-callout {
    display: block;
    height: 100%;
  }

  .etape {
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    padding: 24px;
  }
  .etape__num {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-title-blue-france);
    line-height: 1;
    margin-bottom: 14px;
  }
  .etape h3 {
    margin: 0 0 7px;
    font-size: 17px;
    font-weight: 700;
    color: var(--text-title-grey);
  }
  .etape p {
    margin: 0;
    font-size: 14.5px;
    color: var(--text-default-grey);
  }

  .bloc-demarrage {
    background: var(--background-action-high-blue-france);
    color: var(--text-inverted-blue-france);
    padding: 44px 40px;
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    align-items: center;
    justify-content: space-between;
  }
  .bloc-demarrage__txt {
    flex: 1 1 420px;
    min-width: 0;
  }
  .bloc-demarrage__cmd {
    flex: 1 1 360px;
    min-width: 0;
  }
  .bloc-demarrage__action {
    margin-top: 16px;
  }
  .bloc-demarrage h2 {
    margin: 0 0 10px;
    font-size: 26px;
    font-weight: 700;
  }
  .bloc-demarrage p {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    max-width: 460px;
  }
  .commande {
    margin: 0;
    font-family: ui-monospace, 'Courier New', monospace;
    font-size: 13.5px;
    background: color-mix(in srgb, currentColor 8%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    padding: 16px 18px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 620px) {
    .bloc-demarrage {
      padding: 32px 24px;
    }
  }
</style>
