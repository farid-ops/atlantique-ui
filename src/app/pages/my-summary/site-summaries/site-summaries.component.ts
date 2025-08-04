import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DailyCashRegisterService } from 'src/app/features/daily-cash-register.service';
import { AuthService } from 'src/app/core/auth.service';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { DailyCashRegister } from 'src/app/entity/daily-cash-register';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-site-summaries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  templateUrl: './site-summaries.component.html',
  styleUrls: ['./site-summaries.component.scss']
})
export class SiteSummariesComponent implements OnInit {
  siteSummaries: DailyCashRegister[] = [];
  loading: boolean = true;
  errorMessage: any | null = null;

  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  currentUserSiteId: string = '';
  currentUserId: string = '';

  constructor(
    private dailyCashRegisterService: DailyCashRegisterService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getIdUtilisateur();
    this.utilisateurService.getUtilisateurById(this.currentUserId).subscribe({
      next: (userRes) => {
        if (userRes.status && userRes.data && userRes.data.idSite) {
          this.currentUserSiteId = userRes.data.idSite;
          this.loadSiteSummaries();
        } else {
          this.errorMessage = 'Impossible de récupérer l\'ID du site de l\'utilisateur.';
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de la récupération des informations de l\'utilisateur.';
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

  loadSiteSummaries(): void {
    if (!this.currentUserSiteId) {
      this.errorMessage = 'ID du site non disponible pour le chargement des résumés.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    if (!this.startDate || !this.endDate) {
      this.errorMessage = "Veuillez sélectionner une date de début et une date de fin.";
      Swal.fire({
        icon: 'error',
        title: 'Champs manquants',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      this.loading = false;
      return;
    }
    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.errorMessage = "La date de début ne peut pas être postérieure à la date de fin.";
      Swal.fire({
        icon: 'error',
        title: 'Erreur de date',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      this.loading = false;
      return;
    }

    this.dailyCashRegisterService.getDailySummariesForSite(this.currentUserSiteId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.siteSummaries = res.data;
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Résumés de caisse du site chargés.',
            showConfirmButton: false,
            timer: 2000
          });
        } else {
          this.errorMessage = res.message || `Aucun résumé de caisse trouvé pour ce site entre ${this.startDate} et ${this.endDate}.`;
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
          this.siteSummaries = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des résumés de caisse du site.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
        this.siteSummaries = [];
      }
    });
  }

  getCashRegisterStatusClass(isClosed: boolean | undefined): string {
    return isClosed ? 'bg-danger text-white' : 'bg-success text-white';
  }

  getCashRegisterStatusDisplayName(isClosed: boolean | undefined): string {
    return isClosed ? 'Clôturée' : 'Ouverte';
  }
}
