import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {Router, RouterLink} from '@angular/router';
import { forkJoin } from 'rxjs';

import { MarchandiseStatus } from 'src/app/enum/marchandise-status';
import { Marchandise } from 'src/app/entity/marchandise';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { Groupe } from 'src/app/entity/groupe';
import { Pays } from 'src/app/entity/pays';
import { Port } from 'src/app/entity/port';
import { Autorite } from 'src/app/entity/autorite';

import { MarchandiseService } from 'src/app/features/marchandise.service';
import { AuthService } from 'src/app/core/auth.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/theme/shared/components/confirmation-dialog/confirmation-dialog.component';

import { NatureMarchandiseService } from 'src/app/features/nature-marchandise.service';
import { ArmateurService } from 'src/app/features/armateur.service';
import { TransitaireService } from 'src/app/features/transitaire.service';
import { ImportateurService } from 'src/app/features/importateur.service';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { ConsignataireService } from 'src/app/features/consignataire.service';
import { NavireService } from 'src/app/features/navire.service';
import { PortService } from 'src/app/features/port.service';
import { BillOfLoadingService } from 'src/app/features/bill-of-loading.service';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AutoriteService } from 'src/app/features/autorite.service';
import { BonExpeditionFormComponent } from '../bon-expedition-form/bon-expedition-form.component';
import {PaysService} from "../../../features/pays.service";
import {GroupeService} from "../../../features/groupe.service";
import {NatureMarchandise} from "../../../entity/natureMarchandise";
import {Armateur} from "../../../entity/armateur";
import {Transitaire} from "../../../entity/transitaire";
import {Importateur} from "../../../entity/importateur";
import {BillOfLoading} from "../../../entity/bill-of-loading";
import {Consignataire} from "../../../entity/consignatire";
import {Navire} from "../../../entity/navire";


@Component({
  selector: 'app-marchandise-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterLink],
  templateUrl: './marchandise-list.component.html',
  styleUrls: ['./marchandise-list.component.scss']
})
export class MarchandiseListComponent implements OnInit {
  marchandises: Marchandise[] = [];
  errorMessage: any | null = null;
  loading: boolean = false;

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'creationDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  natureMarchandisesList: NatureMarchandise[] = [];
  armateursList: Armateur[] = [];
  transitairesList: Transitaire[] = [];
  importateursList: Importateur[] = [];
  consignatairesList: Consignataire[] = [];
  naviresList: Navire[] = [];
  blsList: BillOfLoading[] = [];
  paysList: Pays[] = [];
  portsList: Port[] = [];
  groupesList: Groupe[] = [];
  utilisateursList: Utilisateur[] = [];
  autoritesList: Autorite[] = [];

  currentUserRoles: Set<string> = new Set<string>();

  constructor(
    private marchandiseService: MarchandiseService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,

    private natureMarchandiseService: NatureMarchandiseService,
    private armateurService: ArmateurService,
    private transitaireService: TransitaireService,
    private importateurService: ImportateurService,
    private utilisateurService: UtilisateurService,
    private consignataireService: ConsignataireService,
    private navireService: NavireService,
    private blService: BillOfLoadingService,
    private paysService: PaysService,
    private portService: PortService,
    private groupeService: GroupeService,
    private autoriteService: AutoriteService
  ) {}

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.loading = true;

    forkJoin({
      natureMarchandises: this.natureMarchandiseService.getAllNatureMarchandise(),
      armateurs: this.armateurService.getAllArmateurs(),
      transitairesPage: this.transitaireService.getPaginatedTransitaires(0, 1000),
      importateursPage: this.importateurService.getPaginatedImportateurs(0, 1000),
      utilisateursPage: this.utilisateurService.getPaginatedUtilisateurs(0, 1000),
      blsPage: this.blService.findAllBlsPaginated(0, 1000),
      consignataires: this.consignataireService.getAllConsignataires(),
      naviresPage: this.navireService.getPaginatedNavires(0, 1000),
      pays: this.paysService.getAllPays(),
      ports: this.portService.getAllPorts(),
      groupes: this.groupeService.findAllGroupes(),
      autorites: this.autoriteService.getAllAutorites()
    }).subscribe({
      next: (results) => {
        this.natureMarchandisesList =
          results.natureMarchandises.status && results.natureMarchandises.data ? results.natureMarchandises.data : [];
        this.armateursList = results.armateurs.status && results.armateurs.data ? results.armateurs.data : [];
        this.transitairesList =
          results.transitairesPage.status && results.transitairesPage.data ? results.transitairesPage.data.content : [];
        this.importateursList =
          results.importateursPage.status && results.importateursPage.data ? results.importateursPage.data.content : [];
        this.utilisateursList =
          results.utilisateursPage.status && results.utilisateursPage.data ? results.utilisateursPage.data.content : [];
        this.blsList = results.blsPage.status && results.blsPage.data ? results.blsPage.data.content : [];
        this.consignatairesList = results.consignataires.status && results.consignataires.data ? results.consignataires.data : [];
        this.naviresList = results.naviresPage.status && results.naviresPage.data ? results.naviresPage.data.content : [];
        this.paysList = results.pays.status && results.pays.data ? results.pays.data : [];
        this.portsList = results.ports.status && results.ports.data ? results.ports.data : [];
        this.groupesList = results.groupes.status && results.groupes.data ? results.groupes.data : [];
        this.autoritesList = results.autorites.status && results.autorites.data ? results.autorites.data : [];

        this.loadMarchandises();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des données de référence.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
      }
    });
  }

  loadMarchandises(): void {
    this.loading = true;
    this.marchandiseService.findAllMarchandisesPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.marchandises = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des marchandises.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des marchandises.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
      }
    });
  }

  getPaysDesignation(id: string | undefined): string {
    return id ? (this.paysList.find(p => p.id === id)?.designation || id) : 'N/A';
  }

  getPortDesignation(id: string | undefined): string {
    return id ? (this.portsList.find(p => p.id === id)?.designation || id) : 'N/A';
  }

  getGroupeDenomination(id: string | null | undefined): string {
    return id ? (this.groupesList.find(g => g.id === id)?.denomination || id) : 'N/A';
  }

  getUtilisateurName(id: string | undefined): string {
    if (!id) return 'N/A';
    const user = this.utilisateursList.find(u => u.id === id);
    return user ? `${user.nom} ${user.prenom}` : id;
  }

  getMarchandiseStatusDisplayName(status: MarchandiseStatus | undefined): string {
    switch (status) {
      case MarchandiseStatus.BROUILLON: return 'Brouillon';
      case MarchandiseStatus.SOUMIS_POUR_VALIDATION: return 'Soumis pour validation';
      case MarchandiseStatus.VALIDE: return 'Validé';
      case MarchandiseStatus.REJETE: return 'Rejeté';
      default: return 'Inconnu';
    }
  }

  getMarchandiseStatusClass(status: MarchandiseStatus | undefined): string {
    switch (status) {
      case MarchandiseStatus.BROUILLON: return 'btn-secondary';
      case MarchandiseStatus.SOUMIS_POUR_VALIDATION: return 'btn-info';
      case MarchandiseStatus.VALIDE: return 'btn-success';
      case MarchandiseStatus.REJETE: return 'btn-danger';
      default: return 'btn-light';
    }
  }

  getConteneurTypeDisplay(conteneurType: string | undefined): string {
    if (conteneurType === 'simple') { return 'Simple'; }
    if (conteneurType === 'groupage') { return 'Groupage'; }
    if (conteneurType === 'vrac') { return 'Vrac'; }
    return 'N/A';
  }

  // --- Fonctions de permission pour les actions sur la liste ---
  canEditMarchandise(marchandise: Marchandise): boolean {
    if (this.currentUserRoles.has('ADMIN')) { return true; }
    if (this.currentUserRoles.has('OPERATEUR')) {
      return (marchandise.idUtilisateur === this.authService.getIdUtilisateur()) &&
        (marchandise.status === MarchandiseStatus.BROUILLON || marchandise.status === MarchandiseStatus.REJETE);
    }
    return false;
  }

  canDeleteMarchandise(marchandise: Marchandise): boolean {
    return this.currentUserRoles.has('ADMIN');
  }

  canCreateBonExpedition(marchandise: Marchandise): boolean {
    if (!this.currentUserRoles.has('OPERATEUR') && !this.currentUserRoles.has('ADMIN')) { return false; }
    return marchandise.status === MarchandiseStatus.VALIDE && parseFloat(marchandise.be || '0') > 0;
  }

  getPagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    const ellipsis = '...';

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 0; i < this.totalPages; i++) { pages.push(i); }
    } else {
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
      if (startPage > 0 && startPage > 1) {
        pages.push(0);
        if (startPage > 1) { pages.push(ellipsis); }
      } else if (startPage === 1) { pages.push(0); }

      for (let i = startPage; i <= endPage; i++) { pages.push(i); }

      if (endPage < this.totalPages - 1) {
        if (endPage < this.totalPages - 2) { pages.push(ellipsis); }
        pages.push(this.totalPages - 1);
      }
    }
    return pages;
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') { return page + 1; }
    return page;
  }

  onPageChangeClick(pageNumber: number | string): void {
    if (typeof pageNumber === 'number') {
      this.currentPage = pageNumber;
      this.loadMarchandises();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0; // Réinitialiser à la première page
    this.loadMarchandises();
  }

  onSortChangeClick(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadMarchandises();
  }

  createNewMarchandise(): void {
    this.router.navigate(['/marchandises', 'new']);
  }

  editMarchandise(marchandise: Marchandise): void {
    this.router.navigate(['/marchandises', marchandise.id]);
  }

  deleteMarchandise(marchandiseId: string): void {
    if (!this.canDeleteMarchandise(this.marchandises.find(m => m.id === marchandiseId)!)) {
      this.snackBar.open('Vous n\'êtes pas autorisé à supprimer cette marchandise.', 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette marchandise ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.marchandiseService.deleteMarchandise(marchandiseId).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadMarchandises(); // Recharger la liste après suppression
              this.errorMessage = null;
              this.snackBar.open('Marchandise supprimée avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression de la marchandise.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  openCreateBonExpeditionDialog(marchandise: Marchandise): void {
    if (!marchandise.id) {
      this.snackBar.open('Impossible de créer un BE: ID de marchandise manquant.', 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }
    const importateur = this.importateursList.find(imp => imp.id === marchandise.idImportateur);
    const destinataireNomComplet = importateur ? `${importateur.nom} ${importateur.prenom}` : 'Destinataire inconnu';
    const destinataireNomCourt = importateur ? importateur.nom : '';
    const destinatairePrenomCourt = importateur ? importateur.prenom : '';

    const dialogRef = this.dialog.open(BonExpeditionFormComponent, {
      width: '600px',
      data: {
        marchandise: marchandise,
        marchandiseBeCount: parseFloat(marchandise.be || '0'),
        marchandisePoids: parseFloat(marchandise.poids || '0'),
        destinataireNom: destinataireNomComplet,
        destinataireNomCourt: destinataireNomCourt,
        destinatairePrenomCourt: destinatairePrenomCourt,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadMarchandises();
        this.snackBar.open('Bon d\'Expédition créé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
      } else if (result === false) {
        this.snackBar.open('Création du Bon d\'Expédition annulée ou échouée.', 'Fermer', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}
