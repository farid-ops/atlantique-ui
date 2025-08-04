import {MarchandiseStatus} from "../enum/marchandise-status";
import {MarchandiseItem, VehiculeItem} from '../pages/marchandises/marchandise/marchandise.component';

export interface Marchandise {
  id?: string;

  caf?: string;
  typeMarchandiseSelect?: string;
  poids?: string;
  type?: string;
  nombreColis?: string;
  numeroChassis?: string;
  numeroDouane?: string;
  nombreConteneur?: string;

  regularisation?: boolean;
  exoneration?: boolean;
  conteneur?: string;
  typeConteneur?: string;
  volume?: string;
  observation?: string;
  numVoyage?: string;
  be?: string;
  visa?: string;
  status?: MarchandiseStatus;
  totalQuittance?: string;
  coutBsc?: string;
  totalBePrice: string;

  idNatureMarchandise: string;
  idArmateur?: string;
  idTransitaire?: string;
  idImportateur?: string;
  idUtilisateur?: string;

  idBl?: string;
  manifesteCargaison?: string;
  idConsignataireCargaison?: string;
  transporteurCargaison?: string;
  idNavireCargaison?: string;
  dateDepartureNavireCargaison?: Date;
  dateArriveNavireCargaison?: Date;
  idPortEmbarquementCargaison?: string;
  idSiteCargaison?:string;
  lieuEmissionCargaison?: string;

  marchandisesGroupage?: MarchandiseItem[];

  submittedByUserId?: string;
  validatedByUserId?: string;
  submissionDate?: Date;
  validationDate?: Date;
  creationDate?: Date;
  modificationDate?: Date

  idPortDebarquementCargaison?: string;

  blFile?: string | null;
  declarationDouaneFile?: string | null;
  factureCommercialeFile?: string | null;

  nombreVehicule?: string | null;
  vehiculesGroupage: VehiculeItem[] | undefined,
  codeMarchandise: undefined
}
