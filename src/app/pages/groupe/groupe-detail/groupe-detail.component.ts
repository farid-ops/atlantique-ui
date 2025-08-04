import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupeService } from 'src/app/features/groupe.service';
import { Groupe } from 'src/app/entity/groupe';
import { AuthService } from 'src/app/core/auth.service';
import {CommonModule} from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './groupe-detail.component.html',
  styleUrls: ['./groupe-detail.component.scss']
})
export class GroupDetailComponent implements OnInit {
  groupId: string | null = null;
  groupe: Groupe | null = null;
  errorMessage: any | null = null;
  loading: boolean = false;

  currentUserRoles: Set<string> = new Set<string>();

  private IMAGE_BASE_SERVER_URL = 'http://localhost:7070/uploads/groupe/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupeService: GroupeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    if (!this.canViewDetails()) {
      Swal.fire({
        icon: 'error',
        title: 'Accès non autorisé',
        text: "Vous n'êtes pas autorisé à voir les détails de groupe.",
        timer: 3000
      });
      this.router.navigate(['/groupes']);
      return;
    }

    this.route.paramMap.subscribe((params) => {
      this.groupId = params.get('id');
      if (this.groupId) {
        this.loadGroupeDetails(this.groupId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'ID de groupe non fourni.',
          timer: 3000
        });
        this.router.navigate(['/groupes']);
      }
    });
  }

  loadGroupeDetails(id: string): void {
    this.loading = true;
    this.groupeService.getGroupeById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.groupe = res.data;
          this.errorMessage = null;
          console.log('Détails du groupe chargés:', this.groupe);
        } else {
          this.errorMessage = res.message || 'Groupe non trouvé.';
          Swal.fire({
            icon: 'error',
            title: 'Erreur de chargement',
            text: this.errorMessage,
            timer: 3000
          });
          this.router.navigate(['/groupes']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des détails du groupe.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: this.errorMessage,
          timer: 3000
        });
        this.loading = false;
        this.router.navigate(['/groupes']);
      }
    });
  }

  getLogoUrl(): string | null {
    if (this.groupe && this.groupe.logo) {
      return this.IMAGE_BASE_SERVER_URL + this.groupe.logo;
    }
    return null;
  }

  getSignatureUrl(): string | null {
    if (this.groupe && this.groupe.signatureImage) {
      return this.IMAGE_BASE_SERVER_URL + this.groupe.signatureImage;
    }
    return null;
  }

  canViewDetails(): boolean {
    return (
      this.currentUserRoles.has('ADMIN') ||
      this.currentUserRoles.has('ADMINISTRATEUR_GROUPE') ||
      this.currentUserRoles.has('OPERATEUR') ||
      this.currentUserRoles.has('CAISSIER') ||
      this.currentUserRoles.has('CSITE') ||
      this.currentUserRoles.has('STATICIEN')
    );
  }

  goBackToList(): void {
    this.router.navigate(['/groupes']);
  }
}
