import type { Horloge } from '../../ports/Horloge.ts';

export class HorlogeSysteme implements Horloge {
  maintenant(): Date {
    return new Date();
  }
}
