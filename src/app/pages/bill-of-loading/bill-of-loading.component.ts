import { Component } from '@angular/core';
import {BillOfLoading} from "../../entity/bill-of-loading";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BillOfLoadingService} from "../../features/bill-of-loading.service";
import {CommonModule, DatePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../theme/shared/shared.module";

@Component({
  selector: 'app-bill-of-loading',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './bill-of-loading.component.html',
  styleUrl: './bill-of-loading.component.scss'
})
export class BillOfLoadingComponent {
  bls: BillOfLoading[] = [];
  selectedBl: BillOfLoading | null = null;
  errorMessage: any | null = null;

  currentFormData: BillOfLoading = { designation: '' };

  selectedFile: File | null = null;
  fileUploadProgress: number = 0;
  isUploading: boolean = false;

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  sortBy: string = 'designation';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private blService: BillOfLoadingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBls();
    this.resetForm();
  }

  loadBls(): void {
    this.blService.findAllBlsPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.bls = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des BLs.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des BLs.';
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
      this.loadBls();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBls();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBls();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadBls();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadBls();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
    }
  }

  submitBl(): void {
    if (!this.currentFormData.designation.trim()) {
      this.errorMessage = 'La désignation est obligatoire.';
      this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }

    if (this.selectedFile) {
      this.isUploading = true;
      this.blService.uploadBlDocument(this.selectedFile, this.currentFormData.designation).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res.status) {
            this.loadBls();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Fichier BL uploadé et BL créé/mis à jour !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = err.message || 'Erreur lors de l\'upload du fichier BL.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    } else if (this.selectedBl && this.selectedBl.id) {
      this.blService.updateBl(this.selectedBl.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadBls();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('BL mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour du BL.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    } else {
      this.errorMessage = 'Veuillez sélectionner un fichier BL ou éditer un BL existant.';
      this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
    }
  }

  editBl(bl: BillOfLoading): void {
    this.selectedBl = { ...bl };
    this.currentFormData = { ...bl };
    this.selectedFile = null;
  }

  deleteBl(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce BL et son document ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.blService.deleteBl(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadBls();
              this.errorMessage = null;
              this.snackBar.open('BL supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du BL.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  downloadBl(id: string, filename: string): void {
    this.blService.downloadBlDocument(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = filename || `BL_document_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Téléchargement du BL initié !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du téléchargement du document BL.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { designation: '' };
    this.selectedBl = null;
    this.selectedFile = null;
    this.errorMessage = null;
    this.isUploading = false;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
