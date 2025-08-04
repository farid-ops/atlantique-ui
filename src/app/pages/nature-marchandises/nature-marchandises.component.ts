import {Component, OnInit} from '@angular/core';
import {NatureMarchandise} from "../../entity/natureMarchandise";
import {NatureMarchandiseService} from "../../features/nature-marchandise.service";
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../theme/shared/shared.module";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-nature-marchandises',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './nature-marchandises.component.html',
  styleUrl: './nature-marchandises.component.scss'
})
export class NatureMarchandisesComponent implements OnInit {

  natureMarchandises: NatureMarchandise[] = [];
  selectedNatureMarchandise: NatureMarchandise | null = null;
  errorMessage: any | null = null;

  currentFormData: NatureMarchandise = { designation: '', codeNatureMarchandise: '' };

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  sortBy: string = 'designation';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private natureMarchandiseService: NatureMarchandiseService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadNatureMarchandises();
    this.resetForm();
  }

  loadNatureMarchandises(): void {
    this.natureMarchandiseService.getPaginatedNatureMarchandises(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.natureMarchandises = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des natures de marchandise.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des natures de marchandise.';
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
      this.loadNatureMarchandises();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadNatureMarchandises();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadNatureMarchandises();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadNatureMarchandises();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadNatureMarchandises();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  addNatureMarchandise(): void {
    if (this.currentFormData.designation.trim() && this.currentFormData.codeNatureMarchandise.trim()) {
      this.natureMarchandiseService.createNatureMarchandise(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadNatureMarchandises();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Nature de Marchandise ajoutée avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout de la nature de marchandise.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editNatureMarchandise(natureMarchandise: NatureMarchandise): void {
    this.selectedNatureMarchandise = { ...natureMarchandise };
    this.currentFormData = { ...natureMarchandise };
  }

  updateNatureMarchandise(): void {
    if (this.selectedNatureMarchandise && this.selectedNatureMarchandise.id &&
      this.currentFormData.designation.trim() && this.currentFormData.codeNatureMarchandise.trim()) {
      this.natureMarchandiseService.updateNatureMarchandise(this.selectedNatureMarchandise.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            const index = this.natureMarchandises.findIndex(n => n.id === res.data.id);
            if (index !== -1) {
              this.natureMarchandises[index] = res.data;
            }
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Nature de Marchandise mise à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour de la nature de marchandise.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteNatureMarchandise(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette nature de marchandise ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.natureMarchandiseService.deleteNatureMarchandise(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.natureMarchandises = this.natureMarchandises.filter(n => n.id !== id);
              this.errorMessage = null;
              this.snackBar.open('Nature de Marchandise supprimée avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression de la nature de marchandise.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { designation: '', codeNatureMarchandise: '' };
    this.selectedNatureMarchandise = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
