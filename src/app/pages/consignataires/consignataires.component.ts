import {Component, OnInit} from '@angular/core';
import {Consignataire} from "../../entity/consignatire";
import {ConsignataireService} from "../../features/consignataire.service";
import {SharedModule} from "../../theme/shared/shared.module";
import {FormsModule} from "@angular/forms";
import {CommonModule, DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from "../../theme/shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-consignataires',
  imports: [CommonModule, FormsModule, SharedModule, DatePipe],
  templateUrl: './consignataires.component.html',
  styleUrl: './consignataires.component.scss'
})
export class ConsignatairesComponent implements OnInit {

  consignataires: Consignataire[] = [];
  selectedConsignataire: Consignataire | null = null;
  errorMessage: any | null = null;

  currentFormData: Consignataire = { lettreManifeste: '', designation: '' };

  constructor(private consignataireService: ConsignataireService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadConsignataires();
    this.resetForm();
  }

  loadConsignataires(): void {
    this.consignataireService.getAllConsignataires().subscribe({
      next: (res) => {
        if (res.status) {
          this.consignataires = res.data;
          this.errorMessage = null;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des consignataires.';
        this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  addConsignataire(): void {
    if (this.currentFormData.lettreManifeste.trim() && this.currentFormData.designation.trim()) {
      this.consignataireService.createConsignataire(this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            this.consignataires.push(res.data);
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Consignataire ajouté avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de l\'ajout du consignataire.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  editConsignataire(consignataire: Consignataire): void {
    this.selectedConsignataire = { ...consignataire };
    this.currentFormData = { ...consignataire };
  }

  updateConsignataire(): void {
    if (this.selectedConsignataire && this.selectedConsignataire.id &&
      this.currentFormData.lettreManifeste.trim() && this.currentFormData.designation.trim()) {
      this.consignataireService.updateConsignataire(this.selectedConsignataire.id, this.currentFormData).subscribe({
        next: (res) => {
          if (res.status) {
            const index = this.consignataires.findIndex(c => c.id === res.data.id);
            if (index !== -1) {
              this.consignataires[index] = res.data;
            }
            this.resetForm();
            this.errorMessage = null;
            this.snackBar.open('Consignataire mis à jour avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
          } else {
            this.errorMessage = res.message;
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la mise à jour du consignataire.';
          this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
    }
  }

  deleteConsignataire(id: string): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce consignataire ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.consignataireService.deleteConsignataire(id).subscribe({
          next: (res) => {
            if (res.status) {
              this.consignataires = this.consignataires.filter(c => c.id !== id);
              this.errorMessage = null;
              this.snackBar.open('Consignataire supprimé avec succès !', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
            } else {
              this.errorMessage = res.message;
              this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
            }
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du consignataire.';
            this.snackBar.open(this.errorMessage, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        console.log('Suppression annulée.');
      }
    });
  }

  resetForm(): void {
    this.currentFormData = { lettreManifeste: '', designation: '' };
    this.selectedConsignataire = null;
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

}
