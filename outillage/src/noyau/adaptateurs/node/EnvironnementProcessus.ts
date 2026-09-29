import type { Environnement } from "../../ports/Environnement.ts";

export class EnvironnementProcessus implements Environnement {
  variables(): Record<string, string | undefined> {
    return { ...process.env };
  }
}
