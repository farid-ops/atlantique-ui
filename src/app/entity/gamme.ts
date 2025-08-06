import { Marque } from './marque';

export interface Gamme {
  id?: string;
  designation: string;
  idPays: string;
  creationDate?: Date;
  modificationDate?: Date;
  marques?: Marque[];
}
