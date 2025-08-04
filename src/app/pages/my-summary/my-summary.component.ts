import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Removed MatSnackBar import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DailyCashRegisterService } from 'src/app/features/daily-cash-register.service';
import { AuthService } from 'src/app/core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DailyCashRegister } from 'src/app/entity/daily-cash-register';
import Swal from 'sweetalert2'; // Added SweetAlert2 import

@Component({
  selector: 'app-my-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  templateUrl: './my-summary.component.html',
  styleUrls: ['./my-summary.component.scss']
})
export class MySummaryComponent implements OnInit {

  summaries: DailyCashRegister[] = [];
  loading: boolean = true;
  errorMessage: any | null = null;
  depositAmount: number | null = null;
  withdrawalAmount: number | null = null;

  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  currentUserRoles: Set<string> = new Set<string>();
  currentUserId: string = '';

  summaryForToday: DailyCashRegister | null = null;


  constructor(
    private dailyCashRegisterService: DailyCashRegisterService,
    // Removed private snackBar: MatSnackBar,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.currentUserId = this.authService.getIdUtilisateur();

    this.route.paramMap.subscribe(params => {
      const dateParam = params.get('date');
      if (dateParam) {
        this.startDate = dateParam;
        this.endDate = dateParam;
      }
      this.loadDailySummaries();
    });

    this.loadSummaryForToday();
  }

  loadSummaryForToday(): void {
    this.dailyCashRegisterService.getDailySummary(this.currentUserId, new Date().toISOString().split('T')[0]).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaryForToday = res.data;
        } else {
          this.summaryForToday = null;
        }
      },
      error: (err) => {
        this.summaryForToday = null;
        console.error("Erreur lors du chargement du résumé du jour:", err);
      }
    });
  }

  loadDailySummaries(): void {
    this.loading = true;
    this.errorMessage = null;

    if (!this.startDate || !this.endDate) {
      this.errorMessage = "Veuillez sélectionner une date de début et une date de fin.";
      this.loading = false;
      this.summaries = [];
      return;
    }
    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.errorMessage = "La date de début ne peut pas être postérieure à la date de fin.";
      // Replaced snackBar.open with Swal.fire
      Swal.fire({
        icon: 'error',
        title: 'Erreur de date',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      this.loading = false;
      this.summaries = [];
      return;
    }

    this.dailyCashRegisterService.getDailySummariesForCaissier(this.currentUserId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaries = res.data;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Résumés de caisse chargés.',
            showConfirmButton: false,
            timer: 2000
          });
        } else {
          this.errorMessage = res.message || `Résumés de caisse non trouvés entre ${this.startDate} et ${this.endDate}.`;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
          this.summaries = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des résumés de caisse.';
        // Replaced snackBar.open with Swal.fire
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
        this.summaries = [];
      }
    });
  }

  recordDeposit(): void {
    if (this.depositAmount === null || this.depositAmount <= 0) {
      // Replaced snackBar.open with Swal.fire
      Swal.fire({
        icon: 'warning',
        title: 'Montant invalide',
        text: 'Veuillez entrer un montant de dépôt valide.',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    this.loading = true;
    this.dailyCashRegisterService.recordDeposit(this.currentUserId, this.depositAmount).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaryForToday = res.data;
          this.depositAmount = null;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Dépôt enregistré avec succès !',
            showConfirmButton: false,
            timer: 3000
          });
          this.loadDailySummaries();
        } else {
          this.errorMessage = res.message || 'Échec de l\'enregistrement du dépôt.';
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de l\'enregistrement du dépôt.';
        // Replaced snackBar.open with Swal.fire
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

  recordWithdrawal(): void {
    if (this.withdrawalAmount === null || this.withdrawalAmount <= 0) {
      // Replaced snackBar.open with Swal.fire
      Swal.fire({
        icon: 'warning',
        title: 'Montant invalide',
        text: 'Veuillez entrer un montant de retrait valide.',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    this.loading = true;
    this.dailyCashRegisterService.recordWithdrawal(this.currentUserId, this.withdrawalAmount).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaryForToday = res.data;
          this.withdrawalAmount = null;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Retrait enregistré avec succès !',
            showConfirmButton: false,
            timer: 3000
          });
          this.loadDailySummaries();
        } else {
          this.errorMessage = res.message || 'Échec de l\'enregistrement du retrait.';
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de l\'enregistrement du retrait.';
        // Replaced snackBar.open with Swal.fire
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

  closeCashRegister(): void {
    if (this.summaryForToday?.isClosed) {
      // Replaced snackBar.open with Swal.fire
      Swal.fire({
        icon: 'warning',
        title: 'Caisse déjà fermée',
        text: 'La caisse est déjà clôturée.',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    this.loading = true;
    this.dailyCashRegisterService.closeCashRegister(this.currentUserId).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaryForToday = res.data;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Caisse clôturée avec succès !',
            showConfirmButton: false,
            timer: 3000
          });
          this.loadDailySummaries();
        } else {
          this.errorMessage = res.message || 'Échec de la clôture de la caisse.';
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de la clôture de la caisse.';
        // Replaced snackBar.open with Swal.fire
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

  openCashRegister(): void {
    if (this.summaryForToday && !this.summaryForToday.isClosed) {
      // Replaced snackBar.open with Swal.fire
      Swal.fire({
        icon: 'warning',
        title: 'Caisse déjà ouverte',
        text: 'La caisse est déjà ouverte pour aujourd\'hui.',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    this.loading = true;
    this.dailyCashRegisterService.openCashRegister(this.currentUserId).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaryForToday = res.data;
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: 'Caisse ouverte avec succès !',
            showConfirmButton: false,
            timer: 3000
          });
          this.loadDailySummaries();
        } else {
          this.errorMessage = res.message || 'Échec de l\'ouverture de la caisse.';
          // Replaced snackBar.open with Swal.fire
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de l\'ouverture de la caisse.';
        // Replaced snackBar.open with Swal.fire
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

  isCashOpen(): boolean | null {
    return this.summaryForToday && !this.summaryForToday.isClosed;
  }

  getCashRegisterStatusClass(isClosed: boolean | undefined): string {
    return isClosed ? 'bg-danger text-white' : 'bg-success text-white';
  }

  getCashRegisterStatusDisplayName(isClosed: boolean | undefined): string {
    return isClosed ? 'Clôturée' : 'Ouverte';
  }
}
