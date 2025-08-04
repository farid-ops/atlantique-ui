import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Subscription} from "rxjs";
import {AuthService} from "../../../../core/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-token-expiry-alert',
  imports: [CommonModule],
  templateUrl: './token-expiry-alert.component.html',
  styleUrl: './token-expiry-alert.component.scss'
})
export class TokenExpiryAlertComponent implements OnInit, OnDestroy{
  private subscription: Subscription = new Subscription();
  showAlert: boolean = false;

  constructor(private authService: AuthService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.subscription.add(
      this.authService.tokenAboutToExpire.subscribe(() => {
        console.log('tokenAboutToExpire événement reçu.');
        this.openModal();
      })
    );
  }

  openModal(): void {
    const modalRef = this.modalService.open(this.getModalContent(), { backdrop: 'static', keyboard: false, centered: true });

    modalRef.result.then((result) => {
      if (result === 'renew') {
        this.authService.renewToken().subscribe({
          next: (res) => console.log('Token renouvelé par l\'utilisateur', res),
          error: (err) => console.error('Erreur lors du renouvellement par l\'utilisateur', err)
        });
      } else if (result === 'cancel') {
        this.authService.logout();
      }
    }, (reason) => {
      console.warn('Modale d\'expiration fermée sans action explicite. Déconnexion automatique.');
      this.authService.logout();
    });
  }

  private getModalContent(): any {
    return document.getElementById('tokenExpiryModal');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
