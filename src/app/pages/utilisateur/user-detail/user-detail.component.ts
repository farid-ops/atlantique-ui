import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { DailyCashRegisterService } from 'src/app/features/daily-cash-register.service';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DailyCashRegister } from 'src/app/entity/daily-cash-register';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  providers: [DatePipe]
})
export class UserDetailComponent implements OnInit {
  userId: string | null = null;
  utilisateur: Utilisateur | null = null;
  isCaissier: boolean = false;
  dailySummaries: DailyCashRegister[] = [];
  errorMessage: any | null = null;

  startDate: string;
  endDate: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private dailyCashRegisterService: DailyCashRegisterService,
    private datePipe: DatePipe
  ) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.startDate = this.datePipe.transform(sevenDaysAgo, 'yyyy-MM-dd') || '';
    this.endDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.loadUserDetails(this.userId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'ID utilisateur non fourni.',
        });
        this.router.navigate(['/utilisateurs']);
      }
    });
  }

  loadUserDetails(id: string): void {
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.utilisateur = res.data;
          this.isCaissier = this.utilisateur.authorites?.some(
            auth => auth.nom === 'CAISSIER'
          ) || false;

          if (this.isCaissier) {
            this.loadCashSummaries();
          }
        } else {
          this.errorMessage = res.message || 'Utilisateur non trouvé.';
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
          });
          this.router.navigate(['/utilisateurs']);
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des détails de l\'utilisateur.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
        });
        this.router.navigate(['/utilisateurs']);
      }
    });
  }

  loadCashSummaries(): void {
    if (!this.userId || !this.isCaissier) {
      return;
    }

    const formattedStartDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    const formattedEndDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');

    if (!formattedStartDate || !formattedEndDate) {
      this.errorMessage = 'Veuillez sélectionner une plage de dates valide.';
      Swal.fire({
        icon: 'warning',
        title: 'Dates invalides',
        text: this.errorMessage,
      });
      return;
    }

    this.dailyCashRegisterService.getDailySummariesForCaissier(this.userId, formattedStartDate, formattedEndDate).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.dailySummaries = res.data;
          this.errorMessage = null;
        } else {
          this.dailySummaries = [];
          this.errorMessage = res.message || 'Aucun résumé de caisse trouvé pour cette période.';
        }
      },
      error: (err) => {
        this.dailySummaries = [];
        this.errorMessage = err.message || 'Erreur lors du chargement des résumés de caisse.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
        });
      }
    });
  }

  applyDateFilter(): void {
    this.loadCashSummaries();
  }
}
