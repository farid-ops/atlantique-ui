import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { Utilisateur } from 'src/app/entity/utilisateur';
import { Autorite } from 'src/app/entity/autorite';
import { Groupe } from 'src/app/entity/groupe';
import { Pays } from 'src/app/entity/pays';
import { Port } from 'src/app/entity/port';
import { GroupeService } from 'src/app/features/groupe.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoriteService } from 'src/app/features/autorite.service';
import { PaysService } from 'src/app/features/pays.service';
import { PortService } from 'src/app/features/port.service';
import { AuthService } from 'src/app/core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {

  @Output() formSubmitted = new EventEmitter<void>();
  @Output() cancelForm = new EventEmitter<void>();

  currentFormData: Utilisateur = {
    nom: '', prenom: '', email: '', telephone: '', adresse: '', password: '',
    idSite: '', idPays: '', cashBalance: 0, autoriteIds: [], enabled: true,
    idGroupe: ''
  };
  errorMessage: any | null = null;
  loading: boolean = false;

  isEditMode: boolean = false;
  utilisateurId: string | null = null;

  autoritesList: Autorite[] = [];
  groupesList: Groupe[] = [];
  paysList: Pays[] = [];
  portsList: Port[] = [];
  filteredPortsList: Port[] = [];

  currentUserRoles: Set<string> = new Set<string>();

  constructor(
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router,
    private autoriteService: AutoriteService,
    private groupeService: GroupeService,
    private paysService: PaysService,
    private portService: PortService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());

    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      autorites: this.autoriteService.getAllAutorites(),
      groupes: this.groupeService.findAllGroupes(),
      pays: this.paysService.getAllPays(),
      ports: this.portService.getAllPorts()
    }).subscribe({
      next: (results) => {
        if (results.autorites.status && results.autorites.data) {
          this.autoritesList = results.autorites.data;
        } else {
          console.error('Échec de la récupération des autorités:', results.autorites.message);
          this.errorMessage = 'Erreur de chargement des autorités.';
        }

        if (results.groupes.status && results.groupes.data) {
          this.groupesList = results.groupes.data;
        } else {
          console.error('Échec de la récupération des groupes:', results.groupes.message);
          this.errorMessage = 'Erreur de chargement des groupes.';
        }

        if (results.pays.status && results.pays.data) {
          this.paysList = results.pays.data;
        } else {
          console.error('Échec de la récupération des pays:', results.pays.message);
          this.errorMessage = 'Erreur de chargement des pays.';
        }

        if (results.ports.status && results.ports.data) {
          this.portsList = results.ports.data;
          this.filteredPortsList = [...this.portsList];
        } else {
          console.error('Échec de la récupération des ports:', results.ports.message);
          this.errorMessage = 'Erreur de chargement des ports.';
        }

        this.loading = false;
        this.route.paramMap.subscribe(params => {
          this.utilisateurId = params.get('id');
          if (this.utilisateurId && this.utilisateurId !== 'new') {
            this.isEditMode = true;
            this.loadUtilisateur(this.utilisateurId);
          } else {
            this.isEditMode = false;
            this.resetForm();
            if (!this.currentUserRoles.has('ADMIN')) {
              this.router.navigate(['/utilisateurs']);
              Swal.fire({
                icon: 'error',
                title: 'Accès Refusé',
                text: 'Vous n\'êtes pas autorisé à créer un utilisateur.',
                showConfirmButton: false,
                timer: 5000
              });
            }
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des données de référence.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur de chargement',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
      }
    });
  }

  loadUtilisateur(id: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.currentFormData = {
            ...res.data,
            autoriteIds: res.data.authorites?.map(auth => auth.id!) || []
          };
          this.filterPortsBySelectedPays();
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message || 'Utilisateur non trouvé.';
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            showConfirmButton: false,
            timer: 5000
          });
          this.router.navigate(['/utilisateurs']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement de l\'utilisateur.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage,
          showConfirmButton: false,
          timer: 5000
        });
        this.loading = false;
        this.router.navigate(['/utilisateurs']);
      }
    });
  }

  submitUtilisateur(): void {
    this.loading = true;
    this.errorMessage = null;

    if (!this.currentFormData.nom || !this.currentFormData.prenom || !this.currentFormData.email ||
      !this.currentFormData.telephone || !this.currentFormData.adresse || !this.currentFormData.idSite ||
      !this.currentFormData.idPays || !this.currentFormData.idGroupe ||
      (this.currentFormData.password === '' && !this.isEditMode)
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.currentFormData.email && !emailRegex.test(this.currentFormData.email)) {
      this.errorMessage = 'Le format de l\'email est invalide.';
      Swal.fire({
        icon: 'error',
        title: 'Email invalide',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      this.loading = false;
      return;
    }
    const phoneRegex = /^\+?[0-9. ()-]{7,25}$/;
    if (this.currentFormData.telephone && !phoneRegex.test(this.currentFormData.telephone)) {
      this.errorMessage = 'Le format du numéro de téléphone est invalide.';
      Swal.fire({
        icon: 'error',
        title: 'Téléphone invalide',
        text: this.errorMessage,
        showConfirmButton: false,
        timer: 5000
      });
      this.loading = false;
      return;
    }

    if (this.isEditMode) {
      this.utilisateurService.updateUtilisateur(this.utilisateurId!, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Utilisateur mis à jour avec succès !',
              showConfirmButton: false,
              timer: 3000
            });
            this.router.navigate(['/utilisateurs']);
          } else {
            this.errorMessage = res.message;
            Swal.fire({
              icon: 'error',
              title: 'Erreur de mise à jour',
              text: this.errorMessage,
              showConfirmButton: false,
              timer: 5000
            });
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
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
    } else {
      this.utilisateurService.createUtilisateur(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Utilisateur créé avec succès !',
              showConfirmButton: false,
              timer: 3000
            });
            this.router.navigate(['/utilisateurs']);
          } else {
            this.errorMessage = res.message;
            Swal.fire({
              icon: 'error',
              title: 'Erreur de création',
              text: this.errorMessage,
              showConfirmButton: false,
              timer: 5000
            });
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la création de l\'utilisateur.';
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
  }

  resetForm(): void {
    this.currentFormData = {
      nom: '', prenom: '', email: '', telephone: '', adresse: '', password: '',
      idSite: '', idPays: '', cashBalance: 0, autoriteIds: [], enabled: true,
      idGroupe: ''
    };
    this.errorMessage = null;
    this.loading = false;
    this.filteredPortsList = [...this.portsList];
  }

  cancel(): void {
    this.router.navigate(['/utilisateurs']);
  }


  onPaysSelected(event: Event): void {
    const selectedPaysId = (event.target as HTMLSelectElement).value;
    this.currentFormData.idPays = selectedPaysId;
    this.currentFormData.idSite = '';
    this.filterPortsBySelectedPays();
  }

  filterPortsBySelectedPays(): void {
    if (this.currentFormData.idPays && this.portsList) {
      this.filteredPortsList = this.portsList.filter(port => port.idPays === this.currentFormData.idPays);
    } else {
      this.filteredPortsList = [...this.portsList];
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.currentFormData.autoriteIds?.includes(roleId) || false;
  }

  onRoleCheckboxChange(roleId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.currentFormData.autoriteIds) {
      this.currentFormData.autoriteIds = [];
    }

    if (isChecked) {
      if (!this.currentFormData.autoriteIds.includes(roleId)) {
        this.currentFormData.autoriteIds.push(roleId);
      }
    } else {
      this.currentFormData.autoriteIds = this.currentFormData.autoriteIds.filter(id => id !== roleId);
    }
  }

  canEditUserFields(): boolean {
    return this.currentUserRoles.has('ADMIN');
  }
}
