import { PassThrough } from "node:stream";
import { describe, expect, test } from "vitest";
import { ConsoleNode } from "../../../../src/noyau/adaptateurs/node/consoleNode.ts";

const tubeFerme = () => Object.assign(new Error("write EPIPE"), { code: "EPIPE" });

describe("ConsoleNode", () => {
  test("s'arrête proprement quand le lecteur de la sortie standard ferme le tube (ex. | head)", () => {
    const sortie = new PassThrough();
    let arretee = false;
    new ConsoleNode({ sortie, erreurs: new PassThrough(), auTubeFerme: () => (arretee = true) });

    expect(() => sortie.emit("error", tubeFerme())).not.toThrow();
    expect(arretee).toBe(true);
  });

  test("laisse remonter toute autre erreur d'écriture", () => {
    const sortie = new PassThrough();
    let arretee = false;
    new ConsoleNode({ sortie, erreurs: new PassThrough(), auTubeFerme: () => (arretee = true) });

    expect(() => sortie.emit("error", Object.assign(new Error("disque plein"), { code: "ENOSPC" }))).toThrow(
      "disque plein",
    );
    expect(arretee).toBe(false);
  });
});
