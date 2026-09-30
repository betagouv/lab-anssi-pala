import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { HorlogeFigee } from "../../../test/doubles/HorlogeFigee.ts";
import { ServeurCibleFumeeSimule } from "../../../test/doubles/ServeurCibleFumeeSimule.ts";
import { ShannonSimule } from "../../../test/doubles/ShannonSimule.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { shannonSmoke } from "./shannon-smoke.ts";

describe("shannon-smoke (ligne de commande)", () => {
  test("sort avec le statut du passage de fumée", async () => {
    const code = await shannonSmoke([], {
      racine: "/depot",
      shannon: new ShannonSimule({ statut: 4 }),
      serveur: new ServeurCibleFumeeSimule(),
      systemeDeFichier: new SystemeDeFichierEnMemoire({
        "outils/shannon/shannon.env": "SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\n",
        "outils/shannon/source/apps/cli/dist/index.mjs": "",
      }),
      horloge: new HorlogeFigee(new Date(1_790_000_000_000)),
      environnement: new EnvironnementEnMemoire(),
      console: new ConsoleEnMemoire(),
    });

    expect(code).toBe(4);
  });
});
