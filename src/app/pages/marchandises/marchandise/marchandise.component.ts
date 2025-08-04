// app/pages/marchandises/marchandise/marchandise.component.ts
import { Component, OnInit } from '@angular/core';
import { Marchandise } from 'src/app/entity/marchandise';
import { NatureMarchandise } from 'src/app/entity/natureMarchandise';
import { Armateur } from 'src/app/entity/armateur';
import { Transitaire } from 'src/app/entity/transitaire';
import { Importateur } from 'src/app/entity/importateur';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { Consignataire } from "src/app/entity/consignatire";
import { Navire } from 'src/app/entity/navire';
import { Port } from 'src/app/entity/port';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MarchandiseService } from "src/app/features/marchandise.service";
import { ArmateurService } from 'src/app/features/armateur.service';
import { TransitaireService } from 'src/app/features/transitaire.service';
import { ImportateurService } from 'src/app/features/importateur.service';
import { UtilisateurService } from "src/app/features/utilisateur.service";
import { ConsignataireService } from "src/app/features/consignataire.service";
import { NavireService } from "src/app/features/navire.service";
import { PortService } from "src/app/features/port.service";
import { BillOfLoading } from "src/app/entity/bill-of-loading";
import { BillOfLoadingService } from "src/app/features/bill-of-loading.service";
import { AuthService } from "src/app/core/auth.service";
import { MarchandiseStatus } from 'src/app/enum/marchandise-status';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NatureMarchandiseService } from 'src/app/features/nature-marchandise.service';
import { Observable } from 'rxjs';

export interface MarchandiseItem {
  id?: string;
  poids: string;
  nombreColis: string;
  numeroBl: string;
}

// Nouvelle interface pour les détails de chaque véhicule en groupage
export interface VehiculeItem {
  poids: string;
  caf: string;
  numeroChassis: string;
  visa: string;
  numeroDouane: string;
  coutBsc: string,
  total: string;
}

@Component({
  selector: 'app-marchandise',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './marchandise.component.html',
  styleUrl: './marchandise.component.scss'
})
export class MarchandiseComponent implements OnInit {
  marchandises: Marchandise[] = [];
  selectedMarchandise: Marchandise | null = null;
  errorMessage: any | null = null;
  protected readonly MarchandiseStatus = MarchandiseStatus;

  natureMarchandisesList: NatureMarchandise[] = [];
  armateursList: Armateur[] = [];
  transitairesList: Transitaire[] = [];
  importateursList: Importateur[] = [];
  utilisateursList: Utilisateur[] = [];
  blsList: BillOfLoading[] = [];
  consignatairesList: Consignataire[] = [];
  naviresList: Navire[] = [];
  portsList: Port[] = [];

  currentFormData: Marchandise = {
    typeMarchandiseSelect: '',
    caf: '',
    poids: '',
    type: 'Import',
    nombreColis: '',
    numeroChassis: '',
    numeroDouane: '',
    nombreConteneur: '',
    regularisation: false,
    exoneration: false,
    conteneur: 'vrac',
    typeConteneur: '',
    volume: '',
    observation: '',
    numVoyage: '',
    totalQuittance: '0',
    be: '0',
    visa: '0',
    status: MarchandiseStatus.BROUILLON,
    coutBsc: '0',
    totalBePrice: '0',
    idNatureMarchandise: '',
    idArmateur: '',
    idTransitaire: '',
    idImportateur: '',
    idUtilisateur: '',

    idBl: '',
    manifesteCargaison: '',
    idConsignataireCargaison: '',
    transporteurCargaison: '',
    idNavireCargaison: '',
    dateDepartureNavireCargaison: undefined,
    dateArriveNavireCargaison: undefined,
    idPortEmbarquementCargaison: '',
    idSiteCargaison: '',
    lieuEmissionCargaison: '',
    idPortDebarquementCargaison: '',

    submittedByUserId: undefined,
    validatedByUserId: undefined,
    submissionDate: undefined,
    validationDate: undefined,
    creationDate: undefined,
    modificationDate: undefined,

    blFile: undefined,
    declarationDouaneFile: undefined,
    factureCommercialeFile: undefined,

    nombreVehicule: '',
    vehiculesGroupage: undefined,
    codeMarchandise: undefined
  };

  marchandisesGroupage: MarchandiseItem[] = [];
  vehiculesGroupage: VehiculeItem[] = [];

  typeMarchandiseOptions = ['marchandise', 'vehicule', 'hydrocarbure'];

  private _typeMarchandise: 'marchandise' | 'vehicule' | 'hydrocarbure' = 'marchandise';
  get typeMarchandise(): string {
    return this._typeMarchandise;
  }
  set typeMarchandise(value: string) {
    this._typeMarchandise = value as 'marchandise' | 'vehicule' | 'hydrocarbure';
  }

  localCoutBsc: string = '';
  localTotalBePrice: string = '0';

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'idUtilisateur';
  sortDirection: 'asc' | 'desc' = 'asc';

  isFormEditable: boolean = true;
  currentUserRoles: Set<string> = new Set<string>();

  isEditMode: boolean = false;

  selectedBlFile: File | null = null;
  selectedDeclarationFile: File | null = null;
  selectedFactureFile: File | null = null;

  existingBlFileUrl: string | null = null;
  existingDeclarationFileUrl: string | null = null;
  existingFactureFileUrl: string | null = null;

  private IMAGE_BASE_SERVER_URL = 'http://localhost:7070/uploads/';
  private readonly ALLOWED_PDF_TYPES = ['application/pdf'];
  private readonly MAX_FILE_SIZE_MB = 5;


  constructor(
    private authService: AuthService,
    private marchandiseService: MarchandiseService,
    private natureMarchandiseService: NatureMarchandiseService,
    private armateurService: ArmateurService,
    private transitaireService: TransitaireService,
    private importateurService: ImportateurService,
    private utilisateurService: UtilisateurService,
    private blService: BillOfLoadingService,
    private consignataireService: ConsignataireService,
    private navireService: NavireService,
    private portService: PortService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserRoles = new Set<string>(this.authService.getRoles());
    this.loadRelatedEntities();

    this.route.paramMap.subscribe(params => {
      const idFromUrl = params.get('id');

      if (idFromUrl && idFromUrl !== 'new') {
        this.isEditMode = true;
        this.selectedMarchandise = { id: idFromUrl } as Marchandise;
        this.loadMarchandiseData(idFromUrl);
      } else {
        this.isEditMode = false;
        this.resetForm();
        this.currentFormData.idUtilisateur = this.getLoggedInUserId();
        this.utilisateurService.getUtilisateurById(this.getLoggedInUserId()).subscribe((userRes) => {
          if (userRes.status && userRes.data) {
            this.currentFormData.idSiteCargaison = userRes.data.idPays;
            this.currentFormData.lieuEmissionCargaison = userRes.data.idSite;
            this.currentFormData.idPortDebarquementCargaison = userRes.data.idSite;
          }
        });
      }
    });
  }

  private getLoggedInUserId(): string {
    return this.authService.getIdUtilisateur();
  }

  loadMarchandiseData(id: string): void {
    this.marchandiseService.findMarchandiseById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.selectedMarchandise = res.data;
          this.currentFormData = { ...res.data };

          if (this.currentFormData.blFile) this.existingBlFileUrl = this.IMAGE_BASE_SERVER_URL + this.currentFormData.blFile;
          if (this.currentFormData.declarationDouaneFile) this.existingDeclarationFileUrl = this.IMAGE_BASE_SERVER_URL + this.currentFormData.declarationDouaneFile;
          if (this.currentFormData.factureCommercialeFile) this.existingFactureFileUrl = this.IMAGE_BASE_SERVER_URL + this.currentFormData.factureCommercialeFile;

          if (this.currentFormData.dateDepartureNavireCargaison) {
            this.currentFormData.dateDepartureNavireCargaison = new Date(this.currentFormData.dateDepartureNavireCargaison).toISOString().split('T')[0] as any;
          }
          if (this.currentFormData.dateArriveNavireCargaison) {
            this.currentFormData.dateArriveNavireCargaison = new Date(this.currentFormData.dateArriveNavireCargaison).toISOString().split('T')[0] as any;
          }

          if (this.currentFormData.marchandisesGroupage) {
            this.marchandisesGroupage = [...this.currentFormData.marchandisesGroupage];
          } else {
            this.marchandisesGroupage = [];
          }

          if (this.currentFormData.typeMarchandiseSelect === 'vehicule' && this.currentFormData.vehiculesGroupage && this.currentFormData.vehiculesGroupage.length > 0) {
            this.vehiculesGroupage = [...this.currentFormData.vehiculesGroupage];
            this.currentFormData.nombreVehicule = this.vehiculesGroupage.length.toString();
          } else {
            this.vehiculesGroupage = [];
            this.currentFormData.nombreVehicule = (this.currentFormData.vehiculesGroupage && this.currentFormData.vehiculesGroupage.length === 1) ? '1' : '';
          }


          this.localCoutBsc = this.currentFormData.coutBsc || '0';
          this.localTotalBePrice = this.currentFormData.totalBePrice || '0';
          this.typeMarchandise = this.currentFormData.typeMarchandiseSelect as 'marchandise' | 'vehicule' | 'hydrocarbure';

          this.isFormEditable = this.canModifyForm(this.selectedMarchandise);

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur !',
            text: res.message || 'Marchandise non trouvée.',
            showConfirmButton: false,
            timer: 5000
          });
          this.router.navigate(['/marchandises']);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur !',
          text: err.message || 'Erreur lors du chargement de la marchandise.',
          showConfirmButton: false,
          timer: 5000
        });
        this.router.navigate(['/marchandises']);
      }
    });
  }

  loadRelatedEntities(): void {
    this.natureMarchandiseService.getAllNatureMarchandise().subscribe(res => { if (res.status) this.natureMarchandisesList = res.data; });
    this.armateurService.getAllArmateurs().subscribe(res => { if (res.status) this.armateursList = res.data; });
    this.transitaireService.getPaginatedTransitaires(0, 1000).subscribe(res => { if (res.status && res.data) this.transitairesList = res.data.content; });
    this.importateurService.getPaginatedImportateurs(0, 1000).subscribe(res => { if (res.status && res.data) this.importateursList = res.data.content; });
    this.utilisateurService.getPaginatedUtilisateurs(0, 1000).subscribe(res => { if (res.status && res.data) this.utilisateursList = res.data.content; });
    this.blService.findAllBlsPaginated(0, 1000).subscribe(res => { if (res.status && res.data) this.blsList = res.data.content; });
    this.consignataireService.getAllConsignataires().subscribe(res => { if (res.status) this.consignatairesList = res.data; });
    this.navireService.getPaginatedNavires(0, 1000).subscribe(res => { if (res.status && res.data) this.naviresList = res.data.content; });
    this.portService.getAllPorts().subscribe(res => { if (res.status) this.portsList = res.data; });
  }

  addMarchandiseItem(): void {
    this.marchandisesGroupage.push({
      poids: '',
      nombreColis: '',
      numeroBl: ''
    });
    this.calculateGroupageTotals();
  }

  removeMarchandiseItem(index: number): void {
    this.marchandisesGroupage.splice(index, 1);
    this.calculateGroupageTotals();
  }

  addVehiculeItem(): void {
    this.vehiculesGroupage.push({
      poids: '',
      caf: '',
      numeroChassis: '',
      visa: '',
      numeroDouane: '',
      coutBsc: '',
      total: ''
    });
    // Pas besoin de recalculer ici, car les calculs sont déclenchés par `onNombreVehiculeChange` ou `onPoidsChange`
  }

  removeVehiculeItem(index: number): void {
    this.vehiculesGroupage.splice(index, 1);
    const currentNombre = parseInt(this.currentFormData.nombreVehicule || '0');
    if (currentNombre > 0) {
      this.currentFormData.nombreVehicule = (currentNombre - 1).toString();
    }
    this.calculateVehiculeGroupageTotals();
  }

  onNombreVehiculeChange(): void {
    const nombre = parseInt(this.currentFormData.nombreVehicule || '0');
    if (nombre > 1) {
      while (this.vehiculesGroupage.length < nombre) {
        this.addVehiculeItem();
      }
      while (this.vehiculesGroupage.length > nombre) {
        this.vehiculesGroupage.pop();
      }
      this.currentFormData.poids = '';
      this.currentFormData.caf = '';
      this.currentFormData.numeroChassis = '';
      this.currentFormData.visa = '';
      this.currentFormData.numeroDouane = '';
    } else {
      this.vehiculesGroupage = [];
    }
    this.calculateVehiculeGroupageTotals();
  }

  canModifyForm(marchandise?: Marchandise | null | undefined): boolean {
    if (!marchandise) {
      return this.currentUserRoles.has('OPERATEUR') || this.currentUserRoles.has('ADMIN');
    }
    if (this.currentUserRoles.has('ADMIN')) {
      return true;
    }
    if (this.currentUserRoles.has('OPERATEUR') || this.currentUserRoles.has('CAISSIER')) {
      const isCreator = marchandise.idUtilisateur === this.getLoggedInUserId();
      return isCreator && (
        marchandise.status === MarchandiseStatus.BROUILLON ||
        marchandise.status === MarchandiseStatus.REJETE
      );
    }
    return false;
  }

  canSubmitForValidation(): boolean {
    if (!this.selectedMarchandise) {
      return this.currentUserRoles.has('OPERATEUR') || this.currentUserRoles.has('ADMIN');
    }
    if (!this.currentUserRoles.has('OPERATEUR') && !this.currentUserRoles.has('ADMIN')) {
      return false;
    }
    const isCreator = this.selectedMarchandise.idUtilisateur === this.getLoggedInUserId();
    return isCreator && (
      this.selectedMarchandise.status === MarchandiseStatus.BROUILLON ||
      this.selectedMarchandise.status === MarchandiseStatus.REJETE
    );
  }

  canValidateReject(): boolean {
    if (!this.selectedMarchandise) {
      return false;
    }
    return (this.currentUserRoles.has('CAISSIER') || this.currentUserRoles.has('ADMIN')) &&
      this.selectedMarchandise.status === MarchandiseStatus.SOUMIS_POUR_VALIDATION;
  }

  onRegularisationChange(): void {
    if (this.currentFormData.regularisation) {
      this.currentFormData.be = '0';
      this.localCoutBsc = '0';
      this.localTotalBePrice = '0';
      this.currentFormData.totalQuittance = '0';
      this.currentFormData.visa = '0';
    } else {
      if (this.currentFormData.conteneur === 'groupage') {
        this.calculateGroupageTotals();
      } else {
        this.calculateVracSimpleTotals();
      }
    }
    this.currentFormData.coutBsc = this.localCoutBsc;
    this.currentFormData.totalBePrice = this.localTotalBePrice;
  }

  hasAvailableBe(marchandise: Marchandise): boolean {
    return parseFloat(marchandise.be || '0') > 0;
  }

  calculateGroupageTotals(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      this.currentFormData.be = '0';
      this.localCoutBsc = '0';
      this.localTotalBePrice = '0';
      this.currentFormData.totalQuittance = '0';
      this.currentFormData.visa = '0';
      this.currentFormData.coutBsc = '0';
      this.currentFormData.totalBePrice = '0';
      return;
    }
    this.currentFormData.be = '0';
    this.localCoutBsc = (50000 * this.marchandisesGroupage.length).toString();
    this.localTotalBePrice = '0';
    const coutBsc = parseFloat(this.localCoutBsc);
    const total = coutBsc + parseFloat(this.currentFormData.visa || '0');
    this.currentFormData.totalQuittance = total.toString();
    this.currentFormData.coutBsc = this.localCoutBsc;
    this.currentFormData.totalBePrice = this.localTotalBePrice;
  }

  calculateVehiculeGroupageTotals(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      this.currentFormData.be = '0';
      this.localCoutBsc = '0';
      this.localTotalBePrice = '0';
      this.currentFormData.totalQuittance = '0';
      this.currentFormData.visa = '0';
      this.currentFormData.coutBsc = '0';
      this.currentFormData.totalBePrice = '0';
      return;
    }

    let totalCoutBsc = 0.0;
    let totalVisa = 0.0;
    let totalQuittance = 0.0;

    this.vehiculesGroupage.forEach(item => {
      let poids = parseFloat(item.poids || '0');
      let coutBsc = 50000.0;
      let visa = 0.0;
      if (poids > 0) {
        if (poids < 5000) {
          visa = 15000.0;
        } else {
          visa = 20000.0;
        }
      }
      item.coutBsc = coutBsc.toString();
      item.visa = visa.toString();
      item.numeroDouane = this.currentFormData.numeroDouane || ''; // A revoir avec la logique des véhicules
      item.caf = this.currentFormData.caf || ''; // A revoir
      item.numeroChassis = this.currentFormData.numeroChassis || ''; // A revoir
      //item.total = (coutBsc + visa).toString(); // Pas de champ 'total' dans votre interface actuelle
      totalCoutBsc += coutBsc;
      totalVisa += visa;
      totalQuittance += (coutBsc + visa);
    });

    this.localCoutBsc = totalCoutBsc.toString();
    this.currentFormData.visa = totalVisa.toString();
    this.currentFormData.totalQuittance = totalQuittance.toString();
  }


  onPoidsChange(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      return;
    }
    if (this.currentFormData.conteneur === 'groupage') {
      this.calculateGroupageTotals();
      return;
    }
    this.calculateVracSimpleTotals();
  }

  onNombreConteneurChange(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      return;
    }
    if (this.currentFormData.conteneur === 'simple') {
      this.calculateVracSimpleTotals();
    }
  }

  calculateVracSimpleTotals(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      this.currentFormData.be = '0';
      this.localCoutBsc = '0';
      this.localTotalBePrice = '0';
      this.currentFormData.totalQuittance = '0';
      this.currentFormData.visa = '0';
    } else {
      if (this.typeMarchandise === 'vehicule') {
        const coutBsc = 50000;
        this.calculateVisa();
        const visa = parseFloat(this.currentFormData.visa || '0');
        const total = coutBsc + visa;
        this.currentFormData.totalQuittance = total.toString();
        this.currentFormData.coutBsc = coutBsc.toString();
        this.currentFormData.be = '0';
        this.currentFormData.totalBePrice = '0';
        return;
      }

      const poids = parseFloat(this.currentFormData.poids || '0');

      if (this.currentFormData.conteneur === 'simple') {
        this.currentFormData.be = '0';
        this.localCoutBsc = '50000';
        this.localTotalBePrice = '0';
      } else if (this.currentFormData.conteneur === 'vrac') {
        let beValue = 0;
        if (!isNaN(poids) && poids > 0) {
          beValue = Math.floor(poids / 30000);
          if (beValue < 1) {
            beValue = 1;
          }
        }
        this.currentFormData.be = beValue.toString();
        this.localCoutBsc = ((poids / 1000) * 3000).toString();
        this.localTotalBePrice = (beValue * 10000).toString();
      }

      this.calculateVisa();
      this.calculateTotalQuittance();
      this.currentFormData.coutBsc = this.localCoutBsc;
      this.currentFormData.totalBePrice = this.localTotalBePrice;
    }
  }

  calculateVisa(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      this.currentFormData.visa = '0';
    } else {
      if (this.currentFormData.typeMarchandiseSelect === 'vehicule') {
        if (this.currentFormData.nombreVehicule && Number(this.currentFormData.nombreVehicule) > 1) {
          this.calculateVehiculeGroupageTotals();
          return;
        }

        const poids = parseFloat(this.currentFormData.poids || '0');
        if (!isNaN(poids)) {
          if (poids < 5000) {
            this.currentFormData.visa = '15000';
          } else {
            this.currentFormData.visa = '20000';
          }
        } else {
          this.currentFormData.visa = '0';
        }
      } else {
        this.currentFormData.visa = '0';
      }
    }
  }

  calculateTotalQuittance(): void {
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      this.currentFormData.totalQuittance = '0';
    } else {
      if (this.currentFormData.conteneur === 'groupage') {
        this.calculateGroupageTotals();
      } else if (this.currentFormData.typeMarchandiseSelect === 'vehicule' && this.currentFormData.nombreVehicule && Number(this.currentFormData.nombreVehicule) > 1) {
        this.calculateVehiculeGroupageTotals();
      } else {
        const coutBsc = parseFloat(this.localCoutBsc || '0');
        const totalBePrice = parseFloat(this.localTotalBePrice || '0');
        const visa = parseFloat(this.currentFormData.visa || '0');
        const total = coutBsc + totalBePrice + visa;
        this.currentFormData.totalQuittance = total.toString();
      }
      this.currentFormData.coutBsc = this.localCoutBsc;
      this.currentFormData.totalBePrice = this.localTotalBePrice;
    }
  }


  onTypeMarchandiseChange(event: any): void {
    this.typeMarchandise = this.currentFormData.typeMarchandiseSelect as 'marchandise' | 'vehicule' | 'hydrocarbure';

    // Réinitialiser les champs et les listes pour éviter la confusion
    this.currentFormData.be = '0';
    this.currentFormData.totalBePrice = '0';
    this.currentFormData.nombreConteneur = '';
    this.currentFormData.conteneur = '';
    this.currentFormData.numeroChassis = '';
    this.currentFormData.poids = '';
    this.currentFormData.caf = '';
    this.currentFormData.visa = '';
    this.currentFormData.numeroDouane = '';
    this.currentFormData.nombreVehicule = '';
    this.marchandisesGroupage = [];
    this.vehiculesGroupage = [];

    this.calculateVisa();
    this.calculateTotalQuittance();
  }

  onExonerationChange(): void {
    if (this.currentFormData.exoneration) {
      this.currentFormData.be = '0';
      this.localCoutBsc = '0';
      this.localTotalBePrice = '0';
      this.currentFormData.totalQuittance = '0';
      this.currentFormData.visa = '0';
    } else {
      if (this.currentFormData.conteneur === 'groupage') {
        this.calculateGroupageTotals();
      } else {
        this.calculateVracSimpleTotals();
      }
    }
    this.currentFormData.coutBsc = this.localCoutBsc;
    this.currentFormData.totalBePrice = this.localTotalBePrice;
  }

  onConteneurTypeChange(type: 'simple' | 'groupage' | 'vrac' | ''): void {
    this.currentFormData.conteneur = type;
    if (this.currentFormData.exoneration || this.currentFormData.regularisation) {
      return;
    }
    if (type === 'groupage') {
      this.calculateGroupageTotals();
    } else {
      this.calculateVracSimpleTotals();
    }
    this.currentFormData.coutBsc = this.localCoutBsc;
    this.currentFormData.totalBePrice = this.localTotalBePrice;
  }

  submitMarchandise(status: MarchandiseStatus): void {
    if (this.selectedMarchandise && !this.canModifyForm(this.selectedMarchandise)) {
      Swal.fire({
        icon: 'error',
        title: 'Accès Refusé !',
        text: 'Vous n\'êtes pas autorisé à modifier cette marchandise.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }
    if (status === MarchandiseStatus.SOUMIS_POUR_VALIDATION && !this.canSubmitForValidation()) {
      Swal.fire({
        icon: 'error',
        title: 'Accès Refusé !',
        text: 'Vous n\'êtes pas autorisé à soumettre cette marchandise pour validation.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    if (typeof this.currentFormData.dateDepartureNavireCargaison === 'string') {
      this.currentFormData.dateDepartureNavireCargaison = new Date(this.currentFormData.dateDepartureNavireCargaison);
    }
    if (typeof this.currentFormData.dateArriveNavireCargaison === 'string') {
      this.currentFormData.dateArriveNavireCargaison = new Date(this.currentFormData.dateArriveNavireCargaison);
    }

    if (this.currentFormData.dateDepartureNavireCargaison && this.currentFormData.dateArriveNavireCargaison) {
      const departureDate = new Date(this.currentFormData.dateDepartureNavireCargaison);
      const arrivalDate = new Date(this.currentFormData.dateArriveNavireCargaison);

      if (departureDate >= arrivalDate) {
        this.errorMessage = "La date de départ du navire doit être antérieure à la date d'arrivée.";
        Swal.fire({
          icon: 'error',
          title: 'Erreur de Date !',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        return;
      }
    } else if (this.currentFormData.conteneur !== 'groupage' && this.currentFormData.typeMarchandiseSelect !== 'vehicule') {
      this.errorMessage = "Les dates de départ et d'arrivée du navire sont obligatoires.";
      Swal.fire({
        icon: 'error',
        title: 'Champs Obligatoires !',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    this.currentFormData.status = status;
    this.currentFormData.idUtilisateur = this.getLoggedInUserId();
    this.currentFormData.coutBsc = this.localCoutBsc;
    this.currentFormData.totalBePrice = this.localTotalBePrice;

    if (this.currentFormData.typeMarchandiseSelect === 'vehicule' && this.currentFormData.nombreVehicule && parseInt(this.currentFormData.nombreVehicule) > 1) {
      this.currentFormData.vehiculesGroupage = this.vehiculesGroupage;
      this.currentFormData.poids = '';
      this.currentFormData.caf = '';
      this.currentFormData.numeroChassis = '';
      this.currentFormData.visa = '';
      this.currentFormData.numeroDouane = '';
    } else {
      this.currentFormData.vehiculesGroupage = [];
    }


    const formData = new FormData();
    const marchandiseDtoBlob = new Blob([JSON.stringify(this.currentFormData)], { type: 'application/json' });
    formData.append('marchandise', marchandiseDtoBlob);

    if (this.selectedBlFile) formData.append('blFile', this.selectedBlFile, this.selectedBlFile.name);
    if (this.selectedDeclarationFile) formData.append('declarationDouaneFile', this.selectedDeclarationFile, this.selectedDeclarationFile.name);
    if (this.selectedFactureFile) formData.append('factureCommercialeFile', this.selectedFactureFile, this.selectedFactureFile.name);


    if (this.isEditMode && this.selectedMarchandise?.id) {
      this.marchandiseService.updateMarchandise(this.selectedMarchandise.id, this.currentFormData, this.selectedBlFile, this.selectedDeclarationFile, this.selectedFactureFile).subscribe({
        next: (res) => {
          if (res.status) {
            this.errorMessage = null;
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Marchandise mise à jour avec succès.',
              showConfirmButton: false,
              timer: 2000
            });
            if (this.selectedMarchandise) {
              this.selectedMarchandise.status = status;
            }
            this.router.navigate(['/marchandises']);
          } else {
            this.errorMessage = res.message;
            Swal.fire({
              icon: 'error',
              title: 'Erreur de Mise à Jour !',
              text: this.errorMessage,
              showConfirmButton: false,
              timer: 5000
            });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || `Erreur lors de la mise à jour de la marchandise (${status}).`;
          Swal.fire({
            icon: 'error',
            title: 'Erreur !',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
      });
    } else {
      this.marchandiseService.createMarchandise(this.currentFormData, this.selectedBlFile, this.selectedDeclarationFile, this.selectedFactureFile).subscribe({
        next: (res) => {
          if (res.status) {
            this.resetForm();
            this.errorMessage = null;
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: `Marchandise créée (${status}) avec succès !`,
              showConfirmButton: false,
              timer: 2000
            });

          } else {
            this.errorMessage = res.message;
            Swal.fire({
              icon: 'error',
              title: 'Erreur de Création !',
              text: this.errorMessage,
              showConfirmButton: false,
              timer: 5000
            });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || `Erreur lors de la création de la marchandise (${status}).`;
          Swal.fire({
            icon: 'error',
            title: 'Erreur !',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
      });
    }
  }


  onValidateOrReject(isValid: boolean): void {
    if (!this.selectedMarchandise || !this.selectedMarchandise.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur !',
        text: 'Aucune marchandise sélectionnée pour validation/rejet.',
        timer: 3000
      });
      return;
    }

    if (!this.canValidateReject()) {
      Swal.fire({
        icon: 'error',
        title: 'Accès Refusé !',
        text: 'Vous n\'êtes pas autorisé à valider ou rejeter cette marchandise.',
        timer: 3000
      });
      return;
    }

    const action = isValid ? 'valider' : 'rejeter';
    Swal.fire({
      title: `Confirmer ${action} la marchandise ?`,
      text: `Vous êtes sur le point de ${action} la marchandise ${this.selectedMarchandise.id}. Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isValid ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: isValid ? 'Oui, valider' : 'Oui, rejeter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.marchandiseService.validateMarchandise(this.selectedMarchandise!.id!, isValid).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Succès !',
                text: res.message || `Marchandise ${action} avec succès.`,
                showConfirmButton: false,
                timer: 2000
              });
              if (this.selectedMarchandise) {
                this.selectedMarchandise.status = isValid ? MarchandiseStatus.VALIDE : MarchandiseStatus.REJETE;
                this.isFormEditable = this.canModifyForm(this.selectedMarchandise);
              }
              this.router.navigate(['/cash-register/validation-list']);
            } else {
              Swal.fire({
                icon: 'error',
                title: `Erreur ${action} !`,
                text: res.message || `Échec de l'action de ${action}.`,
                timer: 3000
              });
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur API !',
              text: err.error?.message || `Une erreur est survenue lors de l'action de ${action}.`,
              timer: 3000
            });
          }
        });
      }
    });
  }


  resetForm(): void {
    this.currentFormData = {
      typeMarchandiseSelect: '',
      caf: '',
      poids: '',
      type: 'Import',
      nombreColis: '',
      numeroChassis: '',
      numeroDouane: '',
      nombreConteneur: '',
      regularisation: false,
      exoneration: false,
      conteneur: 'vrac',
      typeConteneur: '',
      volume: '',
      observation: '',
      numVoyage: '',
      totalQuittance: '0',
      be: '0',
      visa: '0',
      status: MarchandiseStatus.BROUILLON,
      coutBsc: '0',
      totalBePrice: '0',
      idNatureMarchandise: '',
      idArmateur: '',
      idTransitaire: '',
      idImportateur: '',
      idUtilisateur: '',
      idBl: '',
      manifesteCargaison: '',
      idConsignataireCargaison: '',
      transporteurCargaison: '',
      idNavireCargaison: '',
      dateDepartureNavireCargaison: undefined,
      dateArriveNavireCargaison: undefined,
      idPortEmbarquementCargaison: '',
      idSiteCargaison: '',
      lieuEmissionCargaison: '',
      submittedByUserId: undefined,
      validatedByUserId: undefined,
      submissionDate: undefined,
      validationDate: undefined,
      creationDate: undefined,
      modificationDate: undefined,
      blFile: undefined,
      declarationDouaneFile: undefined,
      factureCommercialeFile: undefined,
      nombreVehicule: '',
      vehiculesGroupage: undefined,
      codeMarchandise: undefined
    };
    this.marchandisesGroupage = [];
    this.vehiculesGroupage = [];
    this.selectedMarchandise = null;
    this.errorMessage = null;
    this.typeMarchandise = 'marchandise';
    this.localCoutBsc = '0';
    this.localTotalBePrice = '0';
    this.isFormEditable = true;
    this.currentFormData.idUtilisateur = this.getLoggedInUserId();

    (document.getElementById('blFile') as HTMLInputElement).value = '';
    (document.getElementById('declarationFile') as HTMLInputElement).value = '';
    (document.getElementById('factureCommercialeFile') as HTMLInputElement).value = '';
    this.selectedBlFile = null;
    this.selectedDeclarationFile = null;
    this.selectedFactureFile = null;
    this.existingBlFileUrl = null;
    this.existingDeclarationFileUrl = null;
    this.existingFactureFileUrl = null;
  }


  cancelEdit(): void {
    this.resetForm();
    this.router.navigate(['/marchandises']);
  }

  onFileSelected(event: Event, fileType: 'blFile' | 'declarationDouaneFile' | 'factureCommercialeFile'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        if (fileType === 'blFile') this.selectedBlFile = file;
        if (fileType === 'declarationDouaneFile') this.selectedDeclarationFile = file;
        if (fileType === 'factureCommercialeFile') this.selectedFactureFile = file;

        if (fileType === 'blFile') this.currentFormData.blFile = file.name;
        if (fileType === 'declarationDouaneFile') this.currentFormData.declarationDouaneFile = file.name;
        if (fileType === 'factureCommercialeFile') this.currentFormData.factureCommercialeFile = file.name;

      } else {
        if (fileType === 'blFile') this.selectedBlFile = null;
        if (fileType === 'declarationDouaneFile') this.selectedDeclarationFile = null;
        if (fileType === 'factureCommercialeFile') this.selectedFactureFile = null;
        input.value = '';
      }
    } else {
      if (fileType === 'blFile') this.selectedBlFile = null;
      if (fileType === 'declarationDouaneFile') this.selectedDeclarationFile = null;
      if (fileType === 'factureCommercialeFile') this.selectedFactureFile = null;
    }
  }
  private validateFile(file: File): boolean {
    const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!this.ALLOWED_PDF_TYPES.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier invalide',
        text: `Le fichier doit être un document PDF.`,
        timer: 3000
      });
      return false;
    }

    if (file.size > maxSizeBytes) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier trop volumineux',
        text: `Le fichier est trop volumineux (max ${this.MAX_FILE_SIZE_MB}MB).`,
        timer: 3000
      });
      return false;
    }
    return true;
  }

  getFileUrl(fileType: 'blFile' | 'declarationDouaneFile' | 'factureCommercialeFile'): string | null {
    if (!this.currentFormData) return null;
    const filename = this.currentFormData[fileType];
    return filename ? `${this.IMAGE_BASE_SERVER_URL}${filename}` : null;
  }

  removeFile(fileType: 'blFile' | 'declarationDouaneFile' | 'factureCommercialeFile'): void {
    Swal.fire({
      title: 'Confirmer la suppression?',
      text: 'Voulez-vous vraiment supprimer ce fichier ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        if (fileType === 'blFile') {
          this.currentFormData.blFile = null;
          this.selectedBlFile = null;
          (document.getElementById('blFile') as HTMLInputElement).value = '';
        } else if (fileType === 'declarationDouaneFile') {
          this.currentFormData.declarationDouaneFile = null;
          this.selectedDeclarationFile = null;
          (document.getElementById('declarationFile') as HTMLInputElement).value = '';
        } else if (fileType === 'factureCommercialeFile') {
          this.currentFormData.factureCommercialeFile = null;
          this.selectedFactureFile = null;
          (document.getElementById('factureCommercialeFile') as HTMLInputElement).value = '';
        }
        Swal.fire('Supprimé!', 'Le fichier a été supprimé du formulaire.', 'success');
      }
    });
  }

  protected readonly Number = Number;
}
