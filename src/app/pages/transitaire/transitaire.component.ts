import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../theme/shared/shared.module";
import {Transitaire} from "../../entity/transitaire";
import {TransitaireService} from "../../features/transitaire.service";
import {
  ConfirmationDialogComponent, ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transitaire',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './transitaire.component.html',
  styleUrl: './transitaire.component.scss'
})
export class TransitaireComponent implements OnInit{
  transitaires: Transitaire[] = [];
  selectedTransitaire: Transitaire | null = null;
  errorMessage: any | null = null;
  loading: boolean = false;
  newTransitaire: Transitaire = { designation: '', idGroupe: undefined };

  currentFormData: Transitaire = { designation: '' , idGroupe: ''};

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  sortBy: string = 'designation';
  sortDirection: 'asc' | 'desc' = 'asc';

  isEditMode: boolean = false;
  currentUserRoles: Set<string> = new Set<string>();

  constructor(
    private transitaireService: TransitaireService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadTransitaires();
    this.resetForm();
  }

  loadTransitaires(): void {

    let idGroupe: string | null = null;
    if (this.currentUserRoles.has('ADMIN_GROUPE')) {
      idGroupe = this.authService.getLoggedInUserGroupId();
    }

    this.transitaireService.getPaginatedTransitaires(this.currentPage, this.pageSize, this.sortBy, this.sortDirection, idGroupe).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.transitaires = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des transitaires.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des transitaires.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }



  getPagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    const ellipsis = '...';

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
      if (startPage > 0 && startPage > 1) {
        pages.push(0);
        if (startPage > 1) {
          pages.push(ellipsis);
        }
      } else if (startPage === 1) {
        pages.push(0);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 1) {
        if (endPage < this.totalPages - 2) {
          pages.push(ellipsis);
        }
        pages.push(this.totalPages - 1);
      }
    }
    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTransitaires();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTransitaires();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTransitaires();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadTransitaires();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadTransitaires();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  createTransitaire(): void {
    this.loading = true;
    this.errorMessage = null;
    this.transitaireService.createTransitaire(this.newTransitaire).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire('Succès!', 'Transitaire créé avec succès.', 'success');
          this.resetForm();
          this.loadTransitaires();
        } else {
          this.errorMessage = res.message;
          Swal.fire('Erreur!', this.errorMessage, 'error');
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de la création du transitaire.';
        Swal.fire('Erreur!', this.errorMessage, 'error');
        this.loading = false;
      }
    });
  }

  editTransitaire(transitaire: Transitaire): void {
    this.isEditMode = true;
    this.selectedTransitaire = { ...transitaire }; // Crée une copie pour l'édition
    this.newTransitaire = { ...transitaire }; // Prépare le formulaire d'édition
  }

  updateTransitaire(): void {
    if (this.selectedTransitaire && this.selectedTransitaire.id && this.currentFormData.designation.trim()) {
      this.transitaireService.updateTransitaire(this.selectedTransitaire.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadTransitaires();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Transitaire mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour du transitaire.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteTransitaire(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce transitaire ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.transitaireService.deleteTransitaire(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadTransitaires();
              this.errorMessage = null;
              this.snackBar.open('Transitaire supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du transitaire.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { designation: '' };
    this.selectedTransitaire = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
