import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ChatUserListComponent } from './chat-user-list/chat-user-list.component';
import { ChatMsgComponent } from './chat-msg/chat-msg.component';
import {AuthService} from "../../../../../core/auth.service";
import {Router} from "@angular/router";
import { UtilisateurService } from 'src/app/features/utilisateur.service';
import { Utilisateur } from 'src/app/entity/utilisateur';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, ChatUserListComponent, ChatMsgComponent],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent implements OnInit {

  visibleUserList: boolean;
  chatMessage: boolean;
  friendId!: number;

  currentUser: Utilisateur | null = null;
  userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {
    this.visibleUserList = false;
    this.chatMessage = false;
  }

  ngOnInit(): void {
    const userId = this.authService.getIdUtilisateur();
    this.userRoles = this.authService.getRoles();

    if (userId) {
      this.utilisateurService.getUtilisateurById(userId).subscribe({
        next: (res) => {
          if (res.status && res.data) {
            this.currentUser = res.data;
          } else {
            console.warn('Impossible de charger les détails de l\'utilisateur:', res.message);
            this.authService.logout();
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des détails de l\'utilisateur:', err);
          this.authService.logout();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onLogout(): void {
    this.authService.logout();
    console.log('Déconnexion réussie');
    this.router.navigate(['/login']);
  }

  onProfile(id?: string){
    this.router.navigate(['/utilisateurs', id, 'details']);
  }

  onChatToggle(friendID: any) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }
}
