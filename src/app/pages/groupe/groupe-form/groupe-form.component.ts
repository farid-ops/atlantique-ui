import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { GroupeService } from 'src/app/features/groupe.service';
import { Groupe } from 'src/app/entity/groupe';
import { AuthService } from 'src/app/core/auth.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-groupe-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './groupe-form.component.html',
  styleUrls: ['./groupe-form.component.scss']
})
export class GroupeFormComponent implements OnInit {
  groupeForm!: FormGroup;
  isEditMode: boolean = false;
  groupeId: string | null = null;
  errorMessage: any | null = null;
  loading: boolean = false;

  logoFile: File | null = null;
  signatureFile: File | null = null;
  currentLogoUrl: string | null = null;
  currentSignatureUrl: string | null = null;

  currentUserRoles: Set<string> = new Set<string>();

  private IMAGE_BASE_SERVER_URL = 'http://localhost:7070/uploads';

  private readonly MAX_FILE_SIZE_MB = 5;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  constructor(
    private fb: FormBuilder,
    private groupeService: GroupeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserRoles = new Set(this.authService.getRoles());
    this.initForm();

    this.route.paramMap.subscribe(params => {
      this.groupeId = params.get('id');
      if (this.groupeId && this.groupeId !== 'new') {
        this.isEditMode = true;
        this.loadGroupe(this.groupeId);
      } else {
        this.isEditMode = false;
        if (!this.currentUserRoles.has('ADMIN')) {
          this.router.navigate(['/groupes']);
          Swal.fire({
            icon: 'error',
            title: 'Accès non autorisé',
            text: 'Vous n\'êtes pas autorisé à créer un groupe.',
            timer: 3000
          });
        }
      }
      this.setFormEditability();
    });
  }

  initForm(): void {
    this.groupeForm = this.fb.group({
      id: [null],
      denomination: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      siteWeb: [''],
      nif: [''],
      bp: [''],
      adresse: ['', Validators.required],
      prixBeStandard: [null, [Validators.required, Validators.min(0)]],
      visaVehiculeMoins5000kg: [null, [Validators.required, Validators.min(0)]],
      visaVehiculePlus5000kg: [null, [Validators.required, Validators.min(0)]],
      coutBSC: [null],
      tonnage: [null],
      valeurConteneur10Pieds: [null],
      valeurConteneur20Pieds: [null],
      valeurConteneur30Pieds: [null],

      logo: [null],
      signatureImage: [null]
    });
  }

  loadGroupe(id: string): void {
    this.loading = true;
    this.groupeService.getGroupeById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const groupeData: Groupe = res.data;
          this.groupeForm.patchValue(groupeData);

          console.log('Données du groupe chargées:', groupeData);

          if (groupeData.logo) {
            this.currentLogoUrl = this.IMAGE_BASE_SERVER_URL.concat('/groupe/') + groupeData.logo;
          } else {
            this.currentLogoUrl = null;
          }
          if (groupeData.signatureImage) {
            this.currentSignatureUrl = this.IMAGE_BASE_SERVER_URL.concat('/groupe/') + groupeData.signatureImage;
          } else {
            this.currentSignatureUrl = null;
          }

          this.errorMessage = null;
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
        this.setFormEditability();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement du groupe.';
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

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file, 'logo')) {
        this.logoFile = file;
        const reader = new FileReader();
        reader.onload = e => this.currentLogoUrl = reader.result as string;
        reader.readAsDataURL(file);
        this.groupeForm.get('logo')?.setValue(null);
        console.log('Nouveau logo sélectionné. currentLogoUrl (preview):', this.currentLogoUrl);
      } else {
        this.logoFile = null;
        this.currentLogoUrl = null;
        this.groupeForm.get('logo')?.setValue(null);
        input.value = '';
      }
    } else {
      this.logoFile = null;
      if (this.isEditMode && this.groupeForm.get('logo')?.value) {
        this.currentLogoUrl = this.IMAGE_BASE_SERVER_URL + this.groupeForm.get('logo')?.value;
        console.log('Logo existant restauré. currentLogoUrl:', this.currentLogoUrl);
      } else {
        this.currentLogoUrl = null;
      }
    }
  }

  onSignatureFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file, 'signature')) {
        this.signatureFile = file;
        const reader = new FileReader();
        reader.onload = e => this.currentSignatureUrl = reader.result as string;
        reader.readAsDataURL(file);
        this.groupeForm.get('signatureImage')?.setValue(null);
        console.log('Nouvelle signature sélectionnée. currentSignatureUrl (preview):', this.currentSignatureUrl);
      } else {
        this.signatureFile = null;
        this.currentSignatureUrl = null;
        this.groupeForm.get('signatureImage')?.setValue(null);
        input.value = '';
      }
    } else {
      this.signatureFile = null;
      if (this.isEditMode && this.groupeForm.get('signatureImage')?.value) {
        this.currentSignatureUrl = this.IMAGE_BASE_SERVER_URL + this.groupeForm.get('signatureImage')?.value;
        console.log('Signature existante restaurée. currentSignatureUrl:', this.currentSignatureUrl);
      } else {
        this.currentSignatureUrl = null;
      }
    }
  }

  private validateFile(file: File, type: 'logo' | 'signature'): boolean {
    const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier invalide',
        text: `Le fichier ${type} doit être une image JPEG, PNG ou JPG.`,
        timer: 3000
      });
      return false;
    }

    if (file.size > maxSizeBytes) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier trop volumineux',
        text: `Le fichier ${type} est trop volumineux (max ${this.MAX_FILE_SIZE_MB}MB).`,
        timer: 3000
      });
      return false;
    }
    return true;
  }

  removeExistingImage(type: 'logo' | 'signature'): void {
    if (type === 'logo') {
      this.groupeForm.get('logo')?.setValue(null);
      this.logoFile = null;
      this.currentLogoUrl = null;
      const logoInput = document.getElementById('logoFile') as HTMLInputElement;
      if (logoInput) logoInput.value = '';
      console.log('Logo existant supprimé. Form control "logo" est null.');
    } else {
      this.groupeForm.get('signatureImage')?.setValue(null);
      this.signatureFile = null;
      this.currentSignatureUrl = null;
      const signatureInput = document.getElementById('signatureFile') as HTMLInputElement;
      if (signatureInput) signatureInput.value = '';
      console.log('Signature existante supprimée. Form control "signatureImage" est null.');
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;

    if (this.groupeForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide !',
        text: 'Veuillez remplir tous les champs obligatoires et corriger les erreurs.',
        timer: 3000
      });
      this.groupeForm.markAllAsTouched();
      this.loading = false;
      return;
    }

    const groupeData: Groupe = this.groupeForm.value;

    const formData = new FormData();

    formData.append('id', groupeData.id || '');
    formData.append('denomination', groupeData.denomination || '');
    formData.append('telephone', groupeData.telephone || '');
    formData.append('email', groupeData.email || '');
    formData.append('siteWeb', groupeData.siteWeb || '');
    formData.append('nif', groupeData.nif || '');
    formData.append('bp', groupeData.bp || '');
    formData.append('adresse', groupeData.adresse || '');
    formData.append('prixBeStandard', (groupeData.prixBeStandard ?? 0).toString());
    formData.append('visaVehiculeMoins5000kg', (groupeData.visaVehiculeMoins5000kg ?? 0).toString());
    formData.append('visaVehiculePlus5000kg', (groupeData.visaVehiculePlus5000kg ?? 0).toString());

    // Nouveaux champs numériques
    formData.append('coutBSC', (groupeData.coutBSC ?? 0).toString());
    formData.append('tonnage', (groupeData.tonnage ?? 0).toString());
    formData.append('valeurConteneur10Pieds', (groupeData.valeurConteneur10Pieds ?? 0).toString());
    formData.append('valeurConteneur20Pieds', (groupeData.valeurConteneur20Pieds ?? 0).toString());
    formData.append('valeurConteneur30Pieds', (groupeData.valeurConteneur30Pieds ?? 0).toString());


    if (this.isEditMode) {
      if (!this.logoFile) {
        const currentLogoFormValue = this.groupeForm.get('logo')?.value;
        if (currentLogoFormValue === null) {
          formData.append('logo', 'null');
        } else if (currentLogoFormValue) {
          formData.append('logo', currentLogoFormValue);
        }
      }

      if (!this.signatureFile) {
        const currentSignatureFormValue = this.groupeForm.get('signatureImage')?.value;
        if (currentSignatureFormValue === null) {
          formData.append('signatureImage', 'null');
        } else if (currentSignatureFormValue) {
          formData.append('signatureImage', currentSignatureFormValue);
        }
      }
    }

    if (this.logoFile) {
      formData.append('logoFile', this.logoFile, this.logoFile.name);
    }
    if (this.signatureFile) {
      formData.append('signatureFile', this.signatureFile, this.signatureFile.name);
    }

    const operation$: Observable<any> = this.isEditMode
      ? this.groupeService.updateGroupe(this.groupeId!, formData)
      : this.groupeService.createGroupe(formData);

    operation$.subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Succès !',
            text: `Groupe ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès !`,
            showConfirmButton: false,
            timer: 2000
          });
          this.router.navigate(['/groupes']);
        } else {
          this.errorMessage = res.message || `Échec de l'opération sur le groupe.`;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            timer: 3000
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || `Erreur lors de l'opération sur le groupe.`;
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: err.error?.message || this.errorMessage,
          timer: 3000
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/groupes']);
  }

  setFormEditability(): void {
    const canManageGroups = this.currentUserRoles.has('ADMIN');
    if (canManageGroups) {
      this.groupeForm.enable();
    } else {
      this.groupeForm.disable();
      Swal.fire({
        icon: 'error',
        title: 'Accès non autorisé',
        text: 'Vous n\'êtes pas autorisé à modifier ce groupe.',
        timer: 3000
      });
    }
  }

  canViewDetails(): boolean {
    return this.currentUserRoles.has('ADMIN') ||
      this.currentUserRoles.has('ADMINISTRATEUR_GROUPE');
  }
}
