import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Utilisateur } from 'src/app/entity/utilisateur';

import { Pays } from 'src/app/entity/pays';
import { Port } from 'src/app/entity/port';
import { Groupe } from 'src/app/entity/groupe';
import { Autorite } from 'src/app/entity/autorite';

import { PaysService } from 'src/app/features/pays.service';
import { PortService } from 'src/app/features/port.service';
import { GroupeService } from 'src/app/features/groupe.service';
import { AutoriteService } from 'src/app/features/autorite.service';
import { AuthService } from 'src/app/core/auth.service';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from 'src/app/theme/shared/components/confirmation-dialog/confirmation-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  errorMessage: any | null = null;
  loading: boolean = false;

  autoritesList: Autorite[] = [];
  groupesList: Groupe[] = [];
  paysList: Pays[] = [];
  portsList: Port[] = [];
  filteredPortsList: Port[] = [];

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'dateCreation';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentUserRoles: Set<string> = new Set<string>();

  isFormVisible: boolean = false;
  isEditMode: boolean = false;
  utilisateurIdToEdit: string | null = null;
  currentFormData: Utilisateur = this.initializeNewUser();

  constructor(
    private utilisateurService: UtilisateurService,
    private autoriteService: AutoriteService,
    private groupeService: GroupeService,
    private paysService: PaysService,
    private portService: PortService,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.loading = true;

    forkJoin({
      autorites: this.autoriteService.getAllAutorites(),
      groupes: this.groupeService.findAllGroupes(),
      pays: this.paysService.getAllPays(),
      ports: this.portService.getAllPorts()
    }).subscribe({
      next: (results) => {
        if (results.autorites.status && results.autorites.data) {
          this.autoritesList = results.autorites.data;
        } else {
          console.error('Échec de la récupération des autorités:', results.autorites.message);
          this.errorMessage = 'Erreur de chargement des autorités.';
        }

        if (results.groupes.status && results.groupes.data) {
          this.groupesList = results.groupes.data;
        } else {
          console.error('Échec de la récupération des groupes:', results.groupes.message);
          this.errorMessage = 'Erreur de chargement des groupes.';
        }

        if (results.pays.status && results.pays.data) {
          this.paysList = results.pays.data;
        } else {
          console.error('Échec de la récupération des pays:', results.pays.message);
          this.errorMessage = 'Erreur de chargement des pays.';
        }

        if (results.ports.status && results.ports.data) {
          this.portsList = results.ports.data;
        } else {
          console.error('Échec de la récupération des ports:', results.ports.message);
          this.errorMessage = 'Erreur de chargement des ports.';
        }

        this.loadUtilisateurs();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des données de référence.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id === 'new') {
        this.showCreateForm();
      } else if (id) {
        this.showEditForm(id);
      } else {
        this.isFormVisible = false;
        this.isEditMode = false;
        this.utilisateurIdToEdit = null;
      }
    });
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.errorMessage = null;

    let idGroupe: string | null = null;
    let idSite: string | null = null;
    const roles = this.authService.getRoles();

    if (roles.includes('ADMIN_GROUPE')) {
      idGroupe = this.authService.getLoggedInUserGroupId();
    } else if (roles.includes('CSITE')) {
      idSite = this.authService.getIdSiteUtilisateur();
    }
    this.utilisateurService.getPaginatedUtilisateurs(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.utilisateurs = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des utilisateurs.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des utilisateurs.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
      }
    });
  }

  getPaysDesignation(id: string | undefined): string {
    return this.paysList.find((p) => p.id === id)?.designation || 'N/A';
  }

  getPortDesignation(id: string | undefined): string {
    return this.portsList.find((p) => p.id === id)?.designation || 'N/A';
  }

  getGroupeDenomination(id: string | undefined): string {
    return this.groupesList.find((g) => g.id === id)?.denomination || 'N/A';
  }

  getRoleNames(autoriteIds: { id: string, nom: string }[] | undefined ): string {
    if (!autoriteIds || autoriteIds.length === 0) {
      return 'Aucun rôle';
    }
    return autoriteIds
      .map((value) => this.autoritesList.find((autorite) => value.id === autorite.id)?.nom)
      .filter((name) => name)
      .join(', ');
  }

  onSortChangeClick(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadUtilisateurs();
  }

  onPageChangeClick(pageNumber: number | string): void {
    if (typeof pageNumber === 'number') {
      this.currentPage = pageNumber;
      this.loadUtilisateurs();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadUtilisateurs();
  }

  getPagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0); // First page
      if (this.currentPage > 1) {
        pages.push('...');
      }

      let start = Math.max(1, this.currentPage - Math.floor((maxPagesToShow - 3) / 2));
      let end = Math.min(this.totalPages - 2, this.currentPage + Math.ceil((maxPagesToShow - 3) / 2));

      if (this.currentPage <= 1) {
        end = maxPagesToShow - 2;
      } else if (this.currentPage >= this.totalPages - 2) {
        start = this.totalPages - (maxPagesToShow - 2);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      pages.push(this.totalPages - 1);
    }
    return pages;
  }

  getDisplayPageNumber(page: number | string): number | string {
    return typeof page === 'number' ? page + 1 : page;
  }

  canEditUser(user: Utilisateur): boolean {
    if (this.currentUserRoles.has('ADMIN')) {
      return true;
    }
    if (this.currentUserRoles.has('ADMIN_GROUPE')) {
      return user.idGroupe === this.authService.getLoggedInUserGroupId();
    }
    if (this.currentUserRoles.has('CSITE')) {
      return user.idSite === this.authService.getIdSiteUtilisateur();
    }
    return false;
  }

  canDeleteUser(user: Utilisateur): boolean {
    return this.currentUserRoles.has('ADMIN');
  }

  canEditUserFields(): boolean {
    return this.currentUserRoles.has('ADMIN');
  }

  private initializeNewUser(): Utilisateur {
    return {
      id: undefined,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      idPays: '',
      idSite: '',
      idGroupe: '',
      autoriteIds: [],
      password: '',
      enabled: true,
      cashBalance: 0,
      dateCreation: new Date(),
      dateModification: new Date()
    };
  }

  showCreateForm(): void {
    if (!this.currentUserRoles.has('ADMIN')) {
      Swal.fire({
        icon: 'error',
        title: 'Accès Refusé',
        text: "Vous n'êtes pas autorisé à créer un utilisateur.",
        showConfirmButton: false,
        timer: 5000
      });
      this.router.navigate(['/utilisateurs']);
      return;
    }
    this.isFormVisible = true;
    this.isEditMode = false;
    this.utilisateurIdToEdit = null;
    this.currentFormData = this.initializeNewUser();
    this.filteredPortsList = [];
  }

  showEditForm(userId: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(userId).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          if (!this.canEditUser(res.data)) {
            Swal.fire({
              icon: 'error',
              title: 'Accès Refusé',
              text: "Vous n'êtes pas autorisé à modifier cet utilisateur.",
              showConfirmButton: false,
              timer: 5000
            });
            this.router.navigate(['/utilisateurs']);
            this.loading = false;
            return;
          }
          this.isFormVisible = true;
          this.isEditMode = true;
          this.utilisateurIdToEdit = userId;
          this.currentFormData = { ...res.data, autoriteIds: res.data.autoriteIds || [] };
          this.onPaysSelected({ target: { value: this.currentFormData.idPays } } as any);
          this.loading = false;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: res.message || 'Utilisateur introuvable.',
            showConfirmButton: false,
            timer: 5000
          });
          this.router.navigate(['/utilisateurs']);
          this.loading = false;
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || "Erreur lors du chargement de l'utilisateur.",
          showConfirmButton: false,
          timer: 5000
        });
        this.router.navigate(['/utilisateurs']);
        this.loading = false;
      }
    });
  }

  createNewUtilisateur(): void {
    this.router.navigate(['/utilisateurs', 'new']);
  }

  editUtilisateur(user: Utilisateur): void {
    this.router.navigate(['/utilisateurs', user.id]);
  }

  deleteUtilisateur(userId: string): void {
    if (!this.currentUserRoles.has('ADMIN')) {
      Swal.fire({
        icon: 'error',
        title: 'Accès Refusé',
        text: "Vous n'êtes pas autorisé à supprimer cet utilisateur.",
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.utilisateurService.deleteUtilisateur(userId).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadUtilisateurs();
              this.errorMessage = null;
              Swal.fire({
                icon: 'success',
                title: 'Succès !',
                text: 'Utilisateur supprimé avec succès !',
                showConfirmButton: false,
                timer: 3000
              });
            } else {
              this.errorMessage = res.message;
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: this.errorMessage,
                showConfirmButton: false,
                timer: 5000
              });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || "Erreur lors de la suppression de l'utilisateur.";
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: this.errorMessage,
              showConfirmButton: false,
              timer: 5000
            });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  onPaysSelected(event: Event): void {
    const selectedPaysId = (event.target as HTMLSelectElement).value;
    if (selectedPaysId) {
      this.filteredPortsList = this.portsList.filter((port) => port.idPays === selectedPaysId);
    } else {
      this.filteredPortsList = [];
    }
    if (this.currentFormData.idSite && !this.filteredPortsList.some((p) => p.id === this.currentFormData.idSite)) {
      this.currentFormData.idSite = '';
    }
  }

  isRoleSelected(autoriteId: string): boolean {
    return this.currentFormData.autoriteIds?.includes(autoriteId) || false;
  }

  onRoleCheckboxChange(autoriteId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.currentFormData.autoriteIds) {
      this.currentFormData.autoriteIds = [];
    }

    if (isChecked) {
      if (!this.currentFormData.autoriteIds.includes(autoriteId)) {
        this.currentFormData.autoriteIds.push(autoriteId);
      }
    } else {
      this.currentFormData.autoriteIds = this.currentFormData.autoriteIds.filter((id) => id !== autoriteId);
    }
  }

  submitUtilisateur(): void {
    this.loading = true;
    this.errorMessage = null;

    if (!this.currentFormData.autoriteIds || this.currentFormData.autoriteIds.length === 0) {
      this.errorMessage = 'Au moins un rôle est obligatoire.';
      this.loading = false;
      return;
    }

    const operationObservable = this.isEditMode
      ? this.utilisateurService.updateUtilisateur(this.currentFormData.id!, this.currentFormData)
      : this.utilisateurService.createUtilisateur(this.currentFormData);

    operationObservable.subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: `Utilisateur ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès !`,
            showConfirmButton: false,
            timer: 3000
          });
          this.cancelEdit();
          this.loadUtilisateurs();
        } else {
          this.errorMessage = res.message || `Échec de l'opération sur l'utilisateur.`;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || `Erreur lors de l'opération sur l'utilisateur.`;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/utilisateurs']);
  }
}
