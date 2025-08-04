import { Component, Input, OnInit } from '@angular/core';
import { NavigationItem } from '../../navigation';
import { AuthService } from 'src/app/core/auth.service';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  imports: [RouterLinkActive, NgClass, RouterLink],
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit {
  @Input() item!: NavigationItem;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  hasRequiredRole(): boolean {
    if (!this.item.roles || this.item.roles.length === 0) {
      return true;
    }

    const userRoles = this.authService.getRoles();
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    return this.item.roles.some((requiredRole) => userRoles.includes(requiredRole));
  }

  closeOtherMenu(event: Event): void {
  }
}
