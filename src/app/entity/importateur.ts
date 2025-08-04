export interface Importateur {
  id?: string;
  nom: string;
  prenom: string;
  phone: string;
  nif: string;
  idGroupe?: string | undefined;
  creationDate?: Date;
  modificationDate?: Date;
}
