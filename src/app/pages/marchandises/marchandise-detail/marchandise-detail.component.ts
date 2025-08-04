import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Marchandise } from 'src/app/entity/marchandise';
import { MarchandiseService } from 'src/app/features/marchandise.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MarchandiseStatus } from 'src/app/enum/marchandise-status';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { Site } from 'src/app/entity/site';
import { Port } from 'src/app/entity/port';
import { Navire } from 'src/app/entity/navire';
import { Consignataire } from 'src/app/entity/consignatire';
import { ConsignataireService } from 'src/app/features/consignataire.service';
import { NavireService } from 'src/app/features/navire.service';
import { PortService } from 'src/app/features/port.service';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { forkJoin, map, Observable } from 'rxjs';

@Component({
  selector: 'app-marchandise-detail',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './marchandise-detail.component.html',
  styleUrls: ['./marchandise-detail.component.scss']
})
export class MarchandiseDetailComponent implements OnInit {
  marchandise: Marchandise | null = null;
  loading: boolean = true;
  errorMessage: any | null = null;

  consignatairesList: Consignataire[] = [];
  naviresList: Navire[] = [];
  portsList: Port[] = [];
  sitesList: Site[] = [];
  utilisateursList: Utilisateur[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marchandiseService: MarchandiseService,
    private snackBar: MatSnackBar,
    private consignataireService: ConsignataireService,
    private navireService: NavireService,
    private portService: PortService,
    private utilisateurService: UtilisateurService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.loadRelatedEntities().subscribe({
      next: () => {
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.loadMarchandiseDetails(id);
          } else {
            this.errorMessage = 'ID de marchandise manquant.';
            this.loading = false;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des données associées.';
        this.loading = false;
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  private loadRelatedEntities(): Observable<any> {
    const consignataires$ = this.consignataireService.getAllConsignataires().pipe(map(res => res.data));
    const navires$ = this.navireService.getPaginatedNavires(0, 1000).pipe(map(res => res.data.content));
    const ports$ = this.portService.getAllPorts().pipe(map(res => res.data));
    const sites$ = ports$;
    const utilisateurs$ = this.utilisateurService.getPaginatedUtilisateurs(0, 1000).pipe(map(res => res.data.content));

    return forkJoin([consignataires$, navires$, ports$, sites$, utilisateurs$]).pipe(
      map(([consignataires, navires, ports, sites, utilisateurs]) => {
        this.consignatairesList = consignataires;
        this.naviresList = navires;
        this.portsList = ports;
        this.sitesList = sites;
        this.utilisateursList = utilisateurs;
      })
    );
  }

  loadMarchandiseDetails(id: string): void {
    this.marchandiseService.findMarchandiseById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.marchandise = res.data;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Détails de marchandise non trouvés.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des détails de la marchandise.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
      }
    });
  }

  getConsignataireDesignation(id: string | undefined): string {
    return id ? (this.consignatairesList.find(c => c.id === id)?.designation || id) : 'N/A';
  }

  getNavireDesignation(id: string | undefined): string {
    return id ? (this.naviresList.find(n => n.id === id)?.designation || id) : 'N/A';
  }

  getPortDesignation(id: string | undefined): string {
    return id ? (this.portsList.find(p => p.id === id)?.designation || id) : 'N/A';
  }

  getSiteDesignation(id: string | undefined): string {
    return id ? (this.sitesList.find(s => s.id === id)?.designation || id) : 'N/A';
  }

  getUtilisateurName(id: string | undefined): string {
    if (!id) return 'N/A';
    const user = this.utilisateursList.find(u => u.id === id);
    return user ? `${user.nom} ${user.prenom}` : id;
  }

  getMarchandiseStatusDisplayName(status: MarchandiseStatus | undefined): string {
    switch (status) {
      case MarchandiseStatus.BROUILLON:
        return 'Brouillon';
      case MarchandiseStatus.SOUMIS_POUR_VALIDATION:
        return 'Soumis pour validation';
      case MarchandiseStatus.VALIDE:
        return 'Validé';
      case MarchandiseStatus.REJETE:
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  }

  getMarchandiseStatusClass(status: MarchandiseStatus | undefined): string {
    switch (status) {
      case MarchandiseStatus.BROUILLON:
        return 'btn-secondary';
      case MarchandiseStatus.SOUMIS_POUR_VALIDATION:
        return 'btn-info';
      case MarchandiseStatus.VALIDE:
        return 'btn-success';
      case MarchandiseStatus.REJETE:
        return 'btn-danger';
      default:
        return 'btn-light';
    }
  }

  goBack(): void {
    this.router.navigate(['/marchandises']);
  }

  editMarchandise(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/marchandises', id]);
    }
  }
}
