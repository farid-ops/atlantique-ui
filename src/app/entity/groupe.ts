export interface Groupe {
  id?: string;
  denomination: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  nif?: string;
  bp?: string;
  adresse: string;

  prixBeStandard: number;
  visaVehiculeMoins5000kg: number;
  visaVehiculePlus5000kg: number;

  coutBSC: number;
  tonnage: number;
  valeurConteneur10Pieds: number;
  valeurConteneur20Pieds: number;
  valeurConteneur30Pieds: number;

  signatureImage?: string | null;
  logo?: string | null;

  creationDate?: Date;
  modificationDate?: Date;
}
