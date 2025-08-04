import {Component, OnInit} from '@angular/core';
import {Autorite} from "../../entity/autorite";
import {AutoriteService} from "../../features/autorite.service";
import {CommonModule, DatePipe} from "@angular/common";
import {SharedModule} from "../../theme/shared/shared.module";
import {FormsModule} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-autorite',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './autorite-component.html',
  styleUrl: './autorite-component.scss'
})
export class AutoritesComponent implements OnInit {
  autorites: Autorite[] = [];
  selectedAutorite: Autorite | null = null;
  errorMessage: any | null = null;

  currentFormData: Autorite = { nom: '' };

  constructor(private autoriteService: AutoriteService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadAutorites();
    this.resetForm();
  }

  loadAutorites(): void {
    this.autoriteService.getAllAutorites().subscribe({
      next: (res) => {
        if (res.status) {
          this.autorites = res.data;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des autorités.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  addAutorite(): void {
    if (this.currentFormData.nom.trim()) {
      this.autoriteService.createAutorite(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.autorites.push(res.data);
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Autorité ajoutée avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout de l\'autorité.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editAutorite(autorite: Autorite): void {
    this.selectedAutorite = { ...autorite };
    this.currentFormData = { ...autorite };
  }

  updateAutorite(): void {
    if (this.selectedAutorite && this.selectedAutorite.id && this.currentFormData.nom.trim()) {
      this.autoriteService.updateAutorite(this.selectedAutorite.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            const index = this.autorites.findIndex(a => a.id === res.data.id);
            if (index !== -1) {
              this.autorites[index] = res.data;
            }
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Autorité mise à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour de l\'autorité.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteAutorite(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette autorité ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.autoriteService.deleteAutorite(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.autorites = this.autorites.filter(a => a.id !== id);
              this.errorMessage = null;
              this.snackBar.open('Autorité supprimée avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression de l\'autorité.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { nom: '' };
    this.selectedAutorite = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
