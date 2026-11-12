import type { EntrepotScans } from '../../../../src/scans/entrepotScans.ts';
import type { Scan } from '../../../../src/scans/scan.ts';
import { EntrepotMemoire } from './entrepotMemoire.ts';

export class EntrepotScansEnMemoire
  extends EntrepotMemoire<Scan>
  implements EntrepotScans {}
