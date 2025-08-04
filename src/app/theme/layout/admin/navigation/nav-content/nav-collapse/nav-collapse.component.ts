// app/theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-nav-collapse',
  imports: [SharedModule, NavItemComponent],
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss']
})
export class NavCollapseComponent implements OnInit {
  @Input() item!: NavigationItem;
  private authService = inject(AuthService);

  // Nouvelle propriété pour gérer l'état d'ouverture/fermeture du collapse
  isOpen: boolean = false;

  ngOnInit(): void {
    // Aucune logique DOM complexe ici
  }

  // Nouvelle méthode pour basculer l'état d'ouverture du collapse
  toggleCollapse(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Détermine si le sous-menu (collapse) doit être affiché.
   * Un collapse est affiché si :
   * 1. Il n'a pas de rôles définis (visible pour tous les connectés).
   * 2. OU si l'utilisateur a au moins un des rôles du collapse.
   * 3. ET si le collapse a des enfants, au moins un de ces enfants doit être visible.
   * Cette fonction gère la visibilité récursivement.
   */
  hasRequiredRole(): boolean {
    const currentCollapse = this.item;
    const userRoles = this.authService.getRoles();

    if (currentCollapse.hidden) {
      return false;
    }
    if (!userRoles || userRoles.length === 0) {
      if (!currentCollapse.roles || currentCollapse.roles.length === 0) {
        return this.checkChildrenVisibility(currentCollapse.children, userRoles);
      }
      return false;
    }

    let collapseAllowedByItself = false;
    if (!currentCollapse.roles || currentCollapse.roles.length === 0) {
      collapseAllowedByItself = true;
    } else {
      collapseAllowedByItself = currentCollapse.roles.some(requiredRole => userRoles.includes(requiredRole));
    }

    if (!collapseAllowedByItself && currentCollapse.children && currentCollapse.children.length > 0) {
      return this.checkChildrenVisibility(currentCollapse.children, userRoles);
    }

    if (collapseAllowedByItself && currentCollapse.children && currentCollapse.children.length > 0) {
      return this.checkChildrenVisibility(currentCollapse.children, userRoles);
    }

    return collapseAllowedByItself;
  }

  // Cette fonction est la même que dans NavGroupComponent
  private checkChildrenVisibility(children: NavigationItem[] | undefined, userRoles: string[]): boolean {
    if (!children || children.length === 0) {
      return false;
    }

    for (const child of children) {
      if (child.type === 'item') {
        if (!child.roles || child.roles.length === 0 || child.roles.some(role => userRoles.includes(role))) {
          return true;
        }
      } else if (child.type === 'collapse') {
        const collapseAllowedByRoles = (!child.roles || child.roles.length === 0 || child.roles.some(role => userRoles.includes(role)));
        if (collapseAllowedByRoles && this.checkChildrenVisibility(child.children, userRoles)) {
          return true;
        }
      }
    }
    return false;
  }
}
