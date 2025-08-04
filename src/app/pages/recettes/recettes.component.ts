import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { DailyCashRegisterService } from 'src/app/features/daily-cash-register.service';
import { AuthService } from 'src/app/core/auth.service';
import { DailyCashRegister } from 'src/app/entity/daily-cash-register';
import Swal from 'sweetalert2';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { PortService } from 'src/app/features/port.service';
import { Port } from 'src/app/entity/port';
import { forkJoin, map, Observable } from 'rxjs';
import { GroupeService } from 'src/app/features/groupe.service';
import { Groupe } from 'src/app/entity/groupe';

@Component({
  selector: 'app-recettes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.scss'],
  providers: [DatePipe]
})
export class RecettesComponent implements OnInit {
  summaries: DailyCashRegister[] = [];
  loading: boolean = false;
  errorMessage: any | null = null;
  currentUserRoles: Set<string> = new Set<string>();

  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  selectedUserId: string | null = null;
  selectedSiteId: string | null = null;
  selectedGroupId: string | null = null;

  cashiersList: Utilisateur[] = [];
  sitesList: Port[] = [];
  groupsList: Groupe[] = [];

  constructor(
    private dailyCashRegisterService: DailyCashRegisterService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private portService: PortService,
    private groupeService: GroupeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.loadFiltersData();
    this.loadRecettes();
  }

  loadFiltersData(): void {
    const roles = this.authService.getRoles();
    const requests: Observable<any>[] = [];

    // Charger les listes de caissiers et de sites si l'utilisateur est ADMIN
    if (roles.includes('ADMIN')) {
      requests.push(this.utilisateurService.getPaginatedUtilisateurs(0, 1000, 'nom', 'asc'));
      requests.push(this.portService.getAllPorts());
    }
    // Charger la liste des caissiers et des sites pour les filtres ADMIN_GROUPE et CSITE
    if (roles.includes('ADMIN_GROUPE') || roles.includes('CSITE')) {
      let idGroupe: string | null = null;
      let idSite: string | null = null;

      if (roles.includes('ADMIN_GROUPE')) {
        idGroupe = this.authService.getLoggedInUserGroupId();
        requests.push(this.utilisateurService.findAllUtilisateursPaginatedByIdGroupe(idGroupe, {page: 0, size: 1000, sort: 'nom,asc'}));
        requests.push(this.portService.getAllPorts());
      } else if (roles.includes('CSITE')) {
        idSite = this.authService.getIdSiteUtilisateur();
        requests.push(this.utilisateurService.findAllUtilisateursPaginatedByIdSite(idSite, {page: 0, size: 1000, sort: 'nom,asc'}));
        requests.push(this.portService.getAllPorts());
      }
    }

    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: (results) => {
          if (roles.includes('ADMIN')) {
            const usersRes = results[0];
            const sitesRes = results[1];
            if (usersRes.status && usersRes.data) {
              this.cashiersList = usersRes.data.content.filter((user: Utilisateur) =>
                user.authorites?.some(auth => auth.nom === 'CAISSIER')
              );
            }
            if (sitesRes.status && sitesRes.data) {
              this.sitesList = sitesRes.data;
            }
          }
          if (roles.includes('ADMIN_GROUPE')) {
            const usersRes = results[0];
            const sitesRes = results[1];
            if (usersRes.status && usersRes.data) {
              this.cashiersList = usersRes.data.content.filter((user: Utilisateur) =>
                user.authorites?.some(auth => auth.nom === 'CAISSIER')
              );
            }
            if (sitesRes.status && sitesRes.data) {
              this.sitesList = sitesRes.data;
            }
          }
          if (roles.includes('CSITE')) {
            const usersRes = results[0];
            const sitesRes = results[1];
            if (usersRes.status && usersRes.data) {
              this.cashiersList = usersRes.data.content.filter((user: Utilisateur) =>
                user.authorites?.some(auth => auth.nom === 'CAISSIER')
              );
            }
            if (sitesRes.status && sitesRes.data) {
              this.sitesList = sitesRes.data;
            }
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des données pour les filtres.', err);
        }
      });
    }
  }

  loadRecettes(): void {
    this.loading = true;
    this.errorMessage = null;

    if (!this.startDate || !this.endDate) {
      this.errorMessage = "Les dates de début et de fin sont obligatoires.";
      this.loading = false;
      return;
    }

    let summaries$: Observable<any>;
    const roles = this.authService.getRoles();

    if (roles.includes('ADMIN_GROUPE')) {
      const groupId = this.authService.getLoggedInUserGroupId();
      summaries$ = this.dailyCashRegisterService.getDailySummariesForGroup(groupId, this.startDate, this.endDate);
    } else if (roles.includes('CSITE')) {
      const siteId = this.authService.getIdSiteUtilisateur();
      summaries$ = this.dailyCashRegisterService.getDailySummariesForSite(siteId, this.startDate, this.endDate);
    } else if (roles.includes('CAISSIER')) {
      const userId = this.authService.getIdUtilisateur();
      summaries$ = this.dailyCashRegisterService.getDailySummariesForCaissier(userId, this.startDate, this.endDate);
    } else {
      this.errorMessage = 'Accès non autorisé à cette ressource.';
      this.loading = false;
      return;
    }

    summaries$.subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.summaries = res.data;
        } else {
          this.summaries = [];
          this.errorMessage = res.message || 'Aucun résumé de caisse trouvé.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des résumés de caisse.';
        Swal.fire('Erreur!', this.errorMessage, 'error');
        this.loading = false;
      }
    });
  }

  exportReport(type: 'pdf' | 'csv'): void {
    if (this.summaries.length === 0) {
      Swal.fire('Information', 'Aucune donnée à exporter.', 'info');
      return;
    }

    const roles = this.authService.getRoles();
    const startDate = this.startDate;
    const endDate = this.endDate;
    const params: { [key: string]: string | null } = {};

    if (roles.includes('ADMIN')) {
      params['targetUserId'] = this.selectedUserId;
      params['targetSiteId'] = this.selectedSiteId;
      params['targetGroupId'] = this.selectedGroupId;
    } else if (roles.includes('ADMIN_GROUPE')) {
      params['groupId'] = this.authService.getLoggedInUserGroupId();
      params['targetUserId'] = this.selectedUserId;
    } else if (roles.includes('CSITE')) {
      params['siteId'] = this.authService.getIdSiteUtilisateur();
      params['targetUserId'] = this.selectedUserId;
    } else if (roles.includes('CAISSIER')) {
      params['targetUserId'] = this.authService.getIdUtilisateur();
    } else {
      Swal.fire('Erreur!', 'Action non autorisée.', 'error');
      return;
    }

    this.dailyCashRegisterService.exportReport(type, startDate, endDate, params).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `rapport_recettes_${startDate}_to_${endDate}.${type}`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur!', 'Échec de la génération du rapport.', 'error');
      }
    });
  }
}
