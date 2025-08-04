export interface Utilisateur {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  cashBalance: number;
  password?: string;
  idSite: string;
  idPays: string;
  dateCreation?: Date;
  dateModification?: Date;
  isAccountNonExpired?: boolean;
  isAccountNonLocked?: boolean;
  isCredentialsNonExpired?: boolean;
  enabled?: boolean;
  autoriteIds?: string[];
  authorites?: { id: string, nom: string }[];
  idGroupe?: string;
  isCashRegisterOpen?: boolean;
}
