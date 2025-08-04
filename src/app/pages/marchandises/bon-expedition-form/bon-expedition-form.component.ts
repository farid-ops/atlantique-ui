import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';

import { AuthService } from 'src/app/core/auth.service';
import { BonExpeditionService } from 'src/app/features/bon-expedition.service';
import { Marchandise } from 'src/app/entity/marchandise';
import { BonExpedition } from 'src/app/entity/bon-expedition';
import {MatButton} from "@angular/material/button";


@Component({
  selector: 'app-bon-expedition-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, MatDialogActions, MatDialogContent, MatDialogTitle, MatButton],
  templateUrl: './bon-expedition-form.component.html',
  styleUrls: ['./bon-expedition-form.component.scss']
})
export class BonExpeditionFormComponent implements OnInit {
  bonExpeditionForm!: FormGroup;
  marchandiseId!: string;
  marchandiseBeCount!: number;
  marchandisePoids!: number;
  errorMessage: any | null = null;
  loading: boolean = false;

  marchandiseDetails: Marchandise;
  destinataireNomComplet: string;
  destinataireNomCourt: string;
  destinatairePrenomCourt: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BonExpeditionFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      marchandise: Marchandise;
      marchandiseBeCount: number;
      marchandisePoids: number;
      destinataireNom: string;
      destinataireNomCourt: string;
      destinatairePrenomCourt: string;
    },
    private bonExpeditionService: BonExpeditionService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.marchandiseId = data.marchandise.id!;
    this.marchandiseBeCount = data.marchandiseBeCount;
    this.marchandisePoids = data.marchandisePoids;
    this.marchandiseDetails = data.marchandise;
    this.destinataireNomComplet = data.destinataireNom;
    this.destinataireNomCourt = data.destinataireNomCourt;
    this.destinatairePrenomCourt = data.destinatairePrenomCourt;
  }

  ngOnInit(): void {
    this.bonExpeditionForm = this.fb.group({
      nombreColis: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      immatriculation: ['', Validators.required],
      nom: [this.destinataireNomCourt, Validators.required],
      prenom: [this.destinatairePrenomCourt, Validators.required],
      destinataire: [this.destinataireNomComplet, Validators.required],
      poids: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), Validators.max(this.marchandisePoids)]],
      valeur: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      observation: ['']
    });

    this.bonExpeditionForm.get('poids')?.valueChanges.subscribe((value) => {
      const currentPoidsBE = parseFloat(value);
      if (currentPoidsBE > this.marchandisePoids) {
        this.bonExpeditionForm.get('poids')?.setErrors({ maxPoids: true });
        this.errorMessage = `Le poids du BE ne peut excéder le poids restant de la marchandise (${this.marchandisePoids} kg).`;
      } else {
        if (this.bonExpeditionForm.get('poids')?.hasError('maxPoids')) {
          this.bonExpeditionForm.get('poids')?.updateValueAndValidity();
          this.errorMessage = null;
        }
      }
    });

    if (this.marchandiseBeCount < 1) {
      this.errorMessage = "Impossible de créer un Bon d'Expédition : Nombre de BE disponibles est insuffisant.";
      this.bonExpeditionForm.disable();
    } else {
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;

    if (this.bonExpeditionForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires et corriger les erreurs.';
      this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      this.loading = false;
      this.bonExpeditionForm.markAllAsTouched();
      return;
    }

    const idUtilisateur = this.authService.getIdUtilisateur();

    const bonExpeditionDto: BonExpedition = {
      ...this.bonExpeditionForm.value,
      idMarchandise: this.marchandiseId,
      idUtilisateur: idUtilisateur,
      valide: false
    };

    this.bonExpeditionService.createBonExpeditionFromMarchandise(this.marchandiseId, bonExpeditionDto).subscribe({
      next: (res) => {
        if (res.status) {
          this.snackBar.open("Bon d'Expédition créé avec succès !", 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          this.dialogRef.close(true);
        } else {
          this.errorMessage = res.message || "Échec de la création du Bon d'Expédition.";
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          this.dialogRef.close(false);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || "Erreur lors de la création du Bon d'Expédition.";
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
        this.dialogRef.close(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
