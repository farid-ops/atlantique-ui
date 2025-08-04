import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { BonExpeditionService } from 'src/app/features/bon-expedition.service';
import { BonExpedition } from 'src/app/entity/bon-expedition';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/theme/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-bon-expedition-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  templateUrl: './bon-expedition-list.component.html',
  styleUrls: ['./bon-expedition-list.component.scss']
})
export class BonExpeditionListComponent implements OnInit {
  bonExpeditions: BonExpedition[] = [];
  errorMessage: any | null = null;
  loading: boolean = false;

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'creationDate'; // Tri par défaut
  sortDirection: 'asc' | 'desc' = 'desc'; // Du plus récent au plus ancien

  currentUserRoles: Set<string> = new Set<string>();

  constructor(
    private bonExpeditionService: BonExpeditionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.loadBonExpeditions();
  }

  loadBonExpeditions(): void {
    this.loading = true;
    this.bonExpeditionService.findAllBonExpeditionsPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.bonExpeditions = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des Bons d\'Expédition.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des Bons d\'Expédition.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
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
      this.loadBonExpeditions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBonExpeditions();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBonExpeditions();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadBonExpeditions();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadBonExpeditions();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  editBonExpedition(bonExpedition: BonExpedition): void {
    this.snackBar.open('La modification des Bons d\'Expédition n\'est pas encore implémentée directement depuis la liste.', 'Fermer', { duration: 3000 });
  }

  deleteBonExpedition(id: string): void {
    if (!this.currentUserRoles.has('SCOPE_ADMIN')) {
      this.snackBar.open('Vous n\'êtes pas autorisé à supprimer ce Bon d\'Expédition.', 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce Bon d\'Expédition ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.bonExpeditionService.deleteBonExpedition(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadBonExpeditions();
              this.snackBar.open('Bon d\'Expédition supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du Bon d\'Expédition.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  viewBonExpeditionDetails(bonExpedition: BonExpedition): void {
    this.snackBar.open('L\'affichage des détails pour les Bons d\'Expédition n\'est pas encore implémenté.', 'Fermer', { duration: 3000 });
  }

  getBonExpeditionStatusClass(valide: boolean | undefined): string {
    return valide ? 'btn-success' : 'btn-secondary';
  }

  getBonExpeditionStatusDisplayName(valide: boolean | undefined): string {
    return valide ? 'Validé' : 'Non Validé';
  }
}
