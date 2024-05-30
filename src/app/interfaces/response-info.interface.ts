import { Folio } from "./folios.interface";

export interface ResponseInfo {
  nationalFolios: Folio[];
  internationalFolios: Folio[];
  mergedFolios: Folio[];
  temporaryApplied: boolean;
  definitiveApplied: boolean;
  Apto: string;
  AptoDefinitivo: string;
}

