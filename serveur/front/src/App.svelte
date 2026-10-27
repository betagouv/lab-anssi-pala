<script lang="ts">
  const depotUrl = 'https://github.com/betagouv/lab-anssi-pala';
  const codexUrl = 'https://github.com/openai/codex-security';
  const shannonUrl = 'https://github.com/KeygraphHQ/shannon';

  const toolLinks = JSON.stringify([{ label: 'GitHub', url: depotUrl, markup: 'a' }]);

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
      <dsfr-button label="Démarrer" kind="inverted-primary" markup="a" href="#demarrage"></dsfr-button>
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
    <div class="conteneur">
      <span class="barre-accent" aria-hidden="true"></span>
      <h2 class="titre-section">Deux agents, enchaînés</h2>
      <p class="intro">
        Codex Security d'abord — analyse statique, large et bon marché. Puis Shannon —
        validation dynamique, ponctuelle, sur les points qui méritent une preuve.
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
            <dsfr-badge label="Lit le code" type="status" status="success" has-no-icon="true"></dsfr-badge>
            <dsfr-badge label="Hors ligne" type="status" status="success" has-no-icon="true"></dsfr-badge>
            <dsfr-badge label="Proxy LiteLLM" type="status" status="info" has-no-icon="true"></dsfr-badge>
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
            <dsfr-badge label="Instance vivante" type="status" status="info" has-no-icon="true"></dsfr-badge>
            <dsfr-badge label="Toujours jetable" type="status" status="warning" has-no-icon="true"></dsfr-badge>
            <dsfr-badge label="Par intention" type="status" status="info" has-no-icon="true"></dsfr-badge>
          </div>
        </dsfr-card>
      </div>
    </div>
  </section>

  <!-- La chaîne -->
  <section id="chaine" class="section section--alt">
    <div class="conteneur">
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
    </div>
  </section>

  <!-- Sécurité -->
  <section id="securite" class="section">
    <div class="conteneur">
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
    </div>
  </section>

  <!-- Démarrage -->
  <section id="demarrage" class="section">
    <div class="conteneur">
      <div class="bloc-demarrage">
        <div class="bloc-demarrage__txt">
          <h2>Un scan complet en une commande</h2>
          <p>
            Après avoir renseigné le .env racine, une seule commande enchaîne bootstrap,
            configuration, analyse statique et validation.
          </p>
        </div>
        <div class="bloc-demarrage__cmd">
          <pre class="commande"><code>$ pnpm run scan-complet \
    --project api --url &lt;url-git&gt;</code></pre>
          <a class="btn-blanc" href={depotUrl} target="_blank" rel="noopener noreferrer">
            Lire le README
          </a>
        </div>
      </div>
    </div>
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
  .conteneur {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .section {
    padding: 64px 0;
  }
  .section--alt {
    background: #f6f6f6;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
  }

  .hero-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
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
    max-width: 640px;
  }

  .grille {
    display: grid;
    gap: 24px;
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
    background: #ffffff;
    border: 1px solid #dddddd;
    padding: 24px;
  }
  .etape__num {
    font-size: 26px;
    font-weight: 800;
    color: #000091;
    line-height: 1;
    margin-bottom: 14px;
  }
  .etape h3 {
    margin: 0 0 7px;
    font-size: 17px;
    font-weight: 700;
    color: #161616;
  }
  .etape p {
    margin: 0;
    font-size: 14.5px;
    color: #3a3a3a;
  }

  .bloc-demarrage {
    background: #000091;
    color: #ffffff;
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
  .bloc-demarrage h2 {
    margin: 0 0 10px;
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
  }
  .bloc-demarrage p {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #e8e8fa;
    max-width: 460px;
  }
  .commande {
    margin: 0;
    font-family: ui-monospace, 'Courier New', monospace;
    font-size: 13.5px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 16px 18px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .btn-blanc {
    display: inline-block;
    margin-top: 16px;
    background: #ffffff;
    color: #000091;
    font-weight: 500;
    font-size: 15px;
    padding: 11px 20px;
    text-decoration: none;
  }
  .btn-blanc:hover {
    background: #f5f5fe;
  }

  @media (max-width: 620px) {
    .bloc-demarrage {
      padding: 32px 24px;
    }
  }
</style>
