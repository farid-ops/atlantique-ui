import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { AuthService } from 'src/app/core/auth.service';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { DailyCashRegisterService } from 'src/app/features/daily-cash-register.service';

@Component({
  selector: 'app-cashier-management',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './cashier-management.component.html',
  styleUrls: ['./cashier-management.component.scss'],
  providers: [DatePipe]
})
export class CashierManagementComponent implements OnInit {
  cashiers: Utilisateur[] = [];
  loading: boolean = false;
  errorMessage: any | null = null;
  currentUserRoles: Set<string> = new Set<string>();

  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private utilisateurService: UtilisateurService,
    private dailyCashRegisterService: DailyCashRegisterService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    if (!this.currentUserRoles.has('ADMIN')) {
      Swal.fire({
        icon: 'error',
        title: 'Accès non autorisé',
        text: 'Vous n\'êtes pas autorisé à gérer les caissiers.',
        timer: 3000
      });
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadCashiers();
  }

  loadCashiers(): void {
    this.loading = true;
    this.errorMessage = null;
    this.utilisateurService.getPaginatedUtilisateurs(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const allUsers = res.data.content as Utilisateur[];
          this.cashiers = allUsers.filter(user =>
            user.authorites && user.authorites.some(auth => auth.nom === 'CAISSIER')
          );
          this.totalElements = this.cashiers.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);

        } else {
          this.cashiers = [];
          this.errorMessage = res.message || 'Aucun caissier trouvé.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des caissiers.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          timer: 3000
        });
        this.loading = false;
      }
    });
  }

  manageCashierRegister(userId: string, action: 'open' | 'close'): void {
    const actionText = action === 'open' ? 'ouvrir' : 'clôturer';
    const todayFormatted = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

    Swal.fire({
      title: `Confirmer l'opération ?`,
      text: `Voulez-vous ${actionText} la caisse de l'utilisateur ${userId} pour aujourd'hui (${todayFormatted}) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Oui, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        let operation$: Observable<any>;
        if (action === 'open') {
          operation$ = this.dailyCashRegisterService.openCashRegisterForUser(userId, todayFormatted);
        } else {
          operation$ = this.dailyCashRegisterService.closeCashRegisterForUser(userId, todayFormatted);
        }

        operation$.subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire('Succès!', res.message || `Caisse ${actionText} avec succès.`, 'success');
              this.loadCashiers(); // Recharger la liste pour mettre à jour les statuts
            } else {
              Swal.fire('Erreur!', res.message || `Échec de l'action de ${actionText}.`, 'error');
            }
          },
          error: (err) => {
            Swal.fire('Erreur!', err.error?.message || `Erreur de communication lors de l'action de ${actionText}.`, 'error');
          }
        });
      }
    });
  }

  goToPage(page: any): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCashiers();
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 0;
    this.loadCashiers();
  }

  changeSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }
    this.loadCashiers();
  }

  getPagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

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

      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 1) {
        if (endPage < this.totalPages - 2) pages.push('...');
        pages.push(this.totalPages - 1);
      }
    }
    return pages;
  }

  getDisplayPageNumber(page: number | string): string | number {
    return typeof page === 'number' ? page + 1 : page;
  }

  viewCashierDetails(userId: string): void {
    this.router.navigate(['/utilisateurs', userId, 'details']);
  }

  addCashier(): void {
    this.router.navigate(['/utilisateurs/new']);
    // Optionnel: vous pouvez passer un paramètre pour pré-sélectionner le rôle "CAISSIER"
    // this.router.navigate(['/utilisateurs/new'], { queryParams: { role: 'CAISSIER' } });
  }

  // (Optionnel) Gérer l'ouverture/fermeture de caisse directement depuis cette liste pour un admin
  // Cela nécessiterait des appels à DailyCashRegisterService.openCashRegister/closeCashRegister
  // et des vérifications de confirmation SweetAlert.
  // Example:
  // manageCashierRegister(userId: string, action: 'open' | 'close'): void {
  //   Swal.fire({
  //     title: `Confirmer l'action ?`,
  //     text: `Voulez-vous ${action === 'open' ? 'ouvrir' : 'clôturer'} la caisse de ${userId}?`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const today = new Date().toISOString().split('T')[0]; // Current date as YYYY-MM-DD
  //       const operation$: Observable<any> = action === 'open' ?
  //         this.dailyCashRegisterService.openCashRegister(userId, today) :
  //         this.dailyCashRegisterService.closeCashRegister(userId, today);
  //       operation$.subscribe({
  //         next: (res) => {
  //           if (res.status) {
  //             Swal.fire('Succès!', `Caisse ${action === 'open' ? 'ouverte' : 'clôturée'} avec succès.`, 'success');
  //             this.loadCashiers(); // Recharger la liste pour mettre à jour les statuts si affichés
  //           } else {
  //             Swal.fire('Erreur!', res.message || 'Échec de l\'opération.', 'error');
  //           }
  //         },
  //         error: (err) => Swal.fire('Erreur!', err.message || 'Erreur de communication.', 'error')
  //       });
  //     }
  //   });
  // }
}
