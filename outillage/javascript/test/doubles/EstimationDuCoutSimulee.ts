import  { EstimationDuCout} from "../../src/cout/application/estimationDuCout.ts";
import type {ConsommationDeTokens} from "../../src/cout/domaine/consommationDeTokens.ts";
import type {Console} from "../../src/noyau/ports/Console.ts";
import {ConsoleEnMemoire} from "./ConsoleEnMemoire.ts";

export class EstimationDuCoutSimulee extends EstimationDuCout {
  readonly releves: ConsommationDeTokens[] = [];

  constructor({  console }: {console: Console, } = {console: new ConsoleEnMemoire()}) {
    super({console});
  }

  rapporte(releve: ConsommationDeTokens | null): void {
    this.releves.push(releve!);
  }
}
