// Vérifie que le modèle de Shannon émet de vrais `tool_calls` structurés, avant de dépenser un scan.
// Portage TS de check_tool_calls.py, rendu agnostique du fournisseur : modèle de SHANNON_AI_MODEL,
// URL tirée de sa description pi, clé de Shannon.
import { join } from "node:path";
import { parseEnv } from "node:util";
import type { Console } from "../../noyau/ports/Console.ts";
import type { Environnement } from "../../noyau/ports/Environnement.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { DescriptionPi } from "../domaine/DescriptionPi.ts";
import { jugeAppelOutil, MESSAGES_SONDE } from "../domaine/SondeAppelsOutils.ts";
import { SpecModele } from "../domaine/SpecModele.ts";
import type { ApiChat } from "../ports/ApiChat.ts";

export type Dependances = {
  // Racine absolue du dépôt d'audit.
  racine: string;
  apiChat: ApiChat;
  systemeDeFichier: SystemeDeFichier;
  environnement: Environnement;
  console: Console;
};

type Destinataire = { url: string; cle: string; modele: string };
type ResultatEssai = { emission: boolean; multitour: boolean; details: Record<string, unknown> };

export class VerifieAppelsOutils {
  readonly #racine: string;
  readonly #apiChat: ApiChat;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #environnement: Environnement;
  readonly #console: Console;

  constructor({ racine, apiChat, systemeDeFichier, environnement, console }: Dependances) {
    this.#racine = racine;
    this.#apiChat = apiChat;
    this.#systemeDeFichier = systemeDeFichier;
    this.#environnement = environnement;
    this.#console = console;
  }

  // modele : force le modèle vérifié (« fournisseur:modèle ») ; défaut SHANNON_AI_MODEL.
  // modelsConfig : description pi à lire ; défaut : déduite du fournisseur.
  async execute({ modele, modelsConfig }: { modele?: string; modelsConfig?: string }): Promise<number> {
    const variables = this.#variables();
    const destinataire = this.#destinataire(variables, modele, modelsConfig);
    const essais = Number(variables.RUNS || "5");
    this.#console.affiche(`Modèle ${destinataire.modele} sur ${destinataire.url}, ${essais} essai(s)`);
    this.#console.affiche("");

    const resultats: ResultatEssai[] = [];
    for (let numero = 1; numero <= essais; numero++) {
      const resultat = await this.#unEssai(destinataire);
      resultats.push(resultat);
      const etat = (ok: boolean) => (ok ? "OK" : "KO");
      this.#console.affiche(
        `essai ${numero}: emission=${etat(resultat.emission)}  multi-tour=${etat(resultat.multitour)}  ${JSON.stringify(resultat.details)}`,
      );
    }
    return this.#bilan(resultats);
  }

  // Environnement du shell, complété par shannon.env s'il est renseigné.
  #variables(): Record<string, string | undefined> {
    const envShannon = "outils/shannon/shannon.env";
    return {
      ...this.#environnement.variables(),
      ...(this.#systemeDeFichier.existe(envShannon) && parseEnv(this.#systemeDeFichier.lit(envShannon))),
    };
  }

  // Le modèle que Shannon utilisera, chez son fournisseur, avec la clé de Shannon (jamais affichée).
  #destinataire(variables: Record<string, string | undefined>, modeleImpose?: string, modelsConfig?: string): Destinataire {
    const cle = variables.SHANNON_AI_API_KEY;
    if (!cle) throw new Error("Clé absente : définir SHANNON_AI_API_KEY (outils/shannon/shannon.env ou environnement).");
    const modele = SpecModele.exigee(modeleImpose || variables.SHANNON_AI_MODEL);
    return { url: this.#urlDuFournisseur(modele, modelsConfig), cle, modele: modele.identifiant };
  }

  // Statut 0 seulement si tous les essais passent les deux contrôles.
  #bilan(resultats: ResultatEssai[]): number {
    const emissions = resultats.filter((r) => r.emission).length;
    const multitours = resultats.filter((r) => r.multitour).length;
    this.#console.affiche("");
    this.#console.affiche(`Emission de tool_calls valides : ${emissions}/${resultats.length}`);
    this.#console.affiche(`Enchainement multi-tour        : ${multitours}/${resultats.length}`);
    return emissions === resultats.length && multitours === resultats.length ? 0 : 1;
  }

  // Deux contrôles : émission d'un appel d'outil valide, puis enchaînement après son résultat.
  async #unEssai(destinataire: Destinataire): Promise<ResultatEssai> {
    const premier = await this.#apiChat.complete({ ...destinataire, messages: MESSAGES_SONDE });
    if ("erreur" in premier) return { emission: false, multitour: false, details: { emission: premier.erreur } };
    const { message, finDeReponse, tokensDeSortie } = premier.reponse;
    const details: Record<string, unknown> = { finish: finDeReponse, tokens: tokensDeSortie };
    const emis = jugeAppelOutil(message);
    if ("raison" in emis) return { emission: false, multitour: false, details: { ...details, emission: emis.raison } };

    const second = await this.#apiChat.complete({
      ...destinataire,
      messages: [
        ...MESSAGES_SONDE,
        { role: "assistant", content: message.content ?? "", tool_calls: message.tool_calls },
        { role: "tool", tool_call_id: emis.appel.id, content: "README.md\nsrc\npackage.json\nexit_code=0" },
      ],
    });
    if ("erreur" in second) return { emission: true, multitour: false, details: { ...details, multitour: second.erreur } };
    const suite = second.reponse.message;
    // Le modèle répond au résultat de l'outil, ou enchaîne un nouvel appel valide.
    if (suite.content?.trim()) return { emission: true, multitour: true, details };
    const relance = jugeAppelOutil(suite);
    if ("appel" in relance) return { emission: true, multitour: true, details };
    return {
      emission: true,
      multitour: false,
      details: { ...details, multitour: `ni reponse ni nouvel appel valide (${relance.raison})` },
    };
  }

  // URL de l'API du fournisseur, lue dans sa description pi : la même source que Shannon.
  #urlDuFournisseur(modele: SpecModele, modelsConfig?: string): string {
    const description = modelsConfig ?? modele.descriptionPiDans(join(this.#racine, "outils/shannon/configs"));
    const url = description && DescriptionPi.depuisJson(this.#systemeDeFichier.lit(description)).urlDe(modele.fournisseur);
    if (!url) {
      throw new Error(
        `Aucune URL pour le fournisseur « ${modele.fournisseur} » : fournir sa description pi (--models-config)`,
      );
    }
    return url;
  }
}
