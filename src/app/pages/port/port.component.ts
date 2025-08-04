import {Component, OnInit} from '@angular/core';
import { Port } from 'src/app/entity/port';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../theme/shared/shared.module";
import {FormsModule} from "@angular/forms";
import {Pays} from "../../entity/pays";
import {PortService} from "../../features/port.service";
import {PaysService} from "../../features/pays.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-port',
  imports: [CommonModule, FormsModule, SharedModule,],
  templateUrl: './port.component.html',
  styleUrl: './port.component.scss'
})
export class PortComponent implements OnInit{
  portsList: Port[] = [];
  paysList: Pays[] = [];
  selectedPort: Port | null = null;
  errorMessage: any | null = null;

  currentFormData: Port = { designation: '', idPays: '' };

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  sortBy: string = 'designation';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedCountryFilter: string = '';

  constructor(
    private portService: PortService,
    private paysService: PaysService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPorts();
    this.loadPaysForDropdown();
    this.resetForm();
  }

  loadPorts(): void {
    this.portService.getPaginatedPorts(this.currentPage, this.pageSize, this.sortBy, this.sortDirection, this.selectedCountryFilter).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.portsList = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des ports.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des ports.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  loadPaysForDropdown(): void {
    this.paysService.getAllPays().subscribe({
      next: (res) => {
        if (res.status) {
          this.paysList = res.data;
        } else {
          console.error('Erreur lors du chargement des pays pour la dropdown:', res.message);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des pays pour la dropdown:', err);
      }
    });
  }

  getPaysDesignation(idPays: string | undefined): string {
    const pays = this.paysList.find(p => p.id === idPays);
    return pays ? pays.designation : 'N/A';
  }

  onCountryFilterChange(event: Event): void {
    this.selectedCountryFilter = (event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadPorts();
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
      this.loadPorts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPorts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPorts();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadPorts();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadPorts();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  addPort(): void {
    if (this.currentFormData.designation.trim() && this.currentFormData.idPays.trim()) {
      this.portService.createPort(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadPorts();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Port ajouté avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout du port.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editPort(port: Port): void {
    this.selectedPort = { ...port };
    this.currentFormData = { ...port };
  }

  updatePort(): void {
    if (this.selectedPort && this.selectedPort.id &&
      this.currentFormData.designation.trim() && this.currentFormData.idPays.trim()) {
      this.portService.updatePort(this.selectedPort.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadPorts();
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Port mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour du port.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deletePort(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce port ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.portService.deletePort(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadPorts();
              this.errorMessage = null;
              this.snackBar.open('Port supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du port.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { designation: '', idPays: '' };
    this.selectedPort = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
