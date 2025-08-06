import { Gamme } from './gamme';

export interface Marque {
  id?: string;
  designation: string;
  dateCreation?: Date;
  dateModification?: Date;
  gamme?: Gamme | null;
}
