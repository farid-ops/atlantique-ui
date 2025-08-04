import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {Router, RouterLink} from '@angular/router';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { GroupeService } from 'src/app/features/groupe.service';
import { Groupe } from 'src/app/entity/groupe';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/theme/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-groupe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterLink],
  templateUrl: './groupe-list.component.html',
  styleUrls: ['./groupe-list.component.scss']
})
export class GroupeListComponent implements OnInit {
  groupes: Groupe[] = [];
  errorMessage: any | null = null;
  loading: boolean = false;

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'denomination';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentUserRoles: Set<string> = new Set<string>();

  constructor(
    private groupeService: GroupeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.loadGroupes();
  }

  loadGroupes(): void {
    this.loading = true;
    this.groupeService.findAllGroupesPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const pageData = res.data;
          this.groupes = pageData.content;
          this.totalElements = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          this.currentPage = pageData.number;
          this.errorMessage = null;
          console.log(this.groupes);
        } else {
          this.errorMessage = res.message || 'Échec de la récupération des groupes.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des groupes.';
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
      this.loadGroupes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGroupes();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGroupes();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadGroupes();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadGroupes();
  }

  getDisplayPageNumber(page: number | string): string | number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return page;
  }

  createGroupe(): void {
    this.router.navigate(['/groupes', 'new']);
  }

  editGroupe(groupe: Groupe): void {
    this.router.navigate(['/groupes', groupe.id]);
  }

  viewGroupeDetails(groupe: Groupe): void {
    this.router.navigate(['/groupes', groupe.id]);
    this.snackBar.open("L'affichage des détails spécifiques pour les groupes n'est pas encore distinct.", 'Fermer', { duration: 3000 });
  }

  deleteGroupe(id: string): void {
    if (!this.currentUserRoles.has('SUPERUTILISATEUR')) {
      this.snackBar.open("Vous n'êtes pas autorisé à supprimer un groupe.", 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message:
        'Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible et impossible si des utilisateurs y sont associés.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.groupeService.deleteGroupe(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.loadGroupes();
              this.errorMessage = null;
              this.snackBar.open('Groupe supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du groupe.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }
}
