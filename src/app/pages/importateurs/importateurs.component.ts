import {Component, OnInit} from '@angular/core';
import {Importateur} from "../../entity/importateur";
import {ImportateurService} from "../../features/importateur.service";
import {CommonModule, DatePipe} from "@angular/common";
import {SharedModule} from "../../theme/shared/shared.module";
import {FormsModule} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../../theme/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-importateurs',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './importateurs.component.html',
  styleUrl: './importateurs-component.scss'
})
export class ImportateursComponent implements OnInit {
  importateurs: Importateur[] = [];
  selectedImportateur: Importateur | null = null;
  errorMessage: any | null = null;
  loading: boolean = false;

  isEditMode: boolean = false;
  currentUserRoles: Set<string> = new Set<string>();

  currentFormData: Importateur = { nom: '', prenom: '', phone: '', nif: '', idGroupe: '' };

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private importateurService: ImportateurService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private authService: AuthService,) { }

  ngOnInit(): void {
    this.loadPaginatedImportateurs();
    this.resetForm();
  }

  loadPaginatedImportateurs(): void {
    this.loading = true;
    this.errorMessage = null;

    let idGroupe: string | null = null;
    if (this.currentUserRoles.has('ADMIN_GROUPE')) {
      idGroupe = this.authService.getLoggedInUserGroupId();
    }
    this.importateurService.getPaginatedImportateurs(this.currentPage, this.pageSize, this.sortBy, this.sortDirection, idGroupe).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.importateurs = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des importateurs.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des importateurs.';
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
      this.loadPaginatedImportateurs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPaginatedImportateurs();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPaginatedImportateurs();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadPaginatedImportateurs();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadPaginatedImportateurs();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  addImportateur(): void {
    if (this.currentFormData.nom.trim() && this.currentFormData.prenom.trim() &&
      this.currentFormData.phone.trim() && this.currentFormData.nif.trim()) {
      this.importateurService.createImportateur(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadPaginatedImportateurs();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Importateur ajouté avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout de l\'importateur.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editImportateur(importateur: Importateur): void {
    this.selectedImportateur = { ...importateur };
    this.currentFormData = { ...importateur };
  }

  updateImportateur(): void {
    if (this.selectedImportateur && this.selectedImportateur.id &&
      this.currentFormData.nom.trim() && this.currentFormData.prenom.trim() &&
      this.currentFormData.phone.trim() && this.currentFormData.nif.trim()) {
      this.importateurService.updateImportateur(this.selectedImportateur.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadPaginatedImportateurs();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Importateur mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour de l\'importateur.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteImportateur(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet importateur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.importateurService.deleteImportateur(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadPaginatedImportateurs();
              this.errorMessage = null;
              this.snackBar.open('Importateur supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression de l\'importateur.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentFormData = { nom: '', prenom: '', phone: '', nif: '', idGroupe: '' };
    this.selectedImportateur = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
