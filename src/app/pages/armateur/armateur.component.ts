import {Component, OnInit} from '@angular/core';
import {Armateur} from "../../entity/armateur";
import {ArmateurService} from "../../features/armateur.service";
import { CommonModule, DatePipe } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../theme/shared/shared.module";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {
  ConfirmationDialogComponent, ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-armateur',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './armateur.component.html',
  styleUrl: './armateur.component.scss'
})
export class ArmateurComponent implements OnInit {
  armateurs: Armateur[] = [];
  selectedArmateur: Armateur | null = null;
  errorMessage: any;

  currentFormData: Armateur = { designation: '' };

  constructor(private armateurService: ArmateurService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadArmateurs();
    this.resetForm();
  }

  loadArmateurs(): void {
    this.armateurService.getAllArmateurs().subscribe({
      next: (res) => {
        if (res.status) {
          this.armateurs = res.data;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des armateurs.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  addArmateur(): void {
    if (this.currentFormData.designation.trim()) {
      this.armateurService.createArmateur(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.armateurs.push(res.data);
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Armateur ajouté avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout de l\'armateur.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editArmateur(armateur: Armateur): void {
    this.selectedArmateur = { ...armateur };
    this.currentFormData = { ...armateur };
  }

  updateArmateur(): void {
    if (this.selectedArmateur && this.selectedArmateur.id && this.currentFormData.designation.trim()) {
      this.armateurService.updateArmateur(this.selectedArmateur.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            const index = this.armateurs.findIndex(a => a.id === res.data.id);
            if (index !== -1) {
              this.armateurs[index] = res.data;
            }
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Armateur mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour de l\'armateur.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteArmateur(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet armateur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.armateurService.deleteArmateur(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.armateurs = this.armateurs.filter(a => a.id !== id);
              this.errorMessage = null;
              this.snackBar.open('Armateur supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression de l\'armateur.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { designation: '' };
    this.selectedArmateur = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
