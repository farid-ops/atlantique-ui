import { Component, OnInit, inject, input } from '@angular/core';
import { Location } from '@angular/common';

import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { NavCollapseComponent } from '../nav-collapse/nav-collapse.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-nav-group',
  imports: [SharedModule, NavItemComponent, NavCollapseComponent],
  templateUrl: './nav-group.component.html',
  styleUrls: ['./nav-group.component.scss']
})
export class NavGroupComponent implements OnInit {
  private location = inject(Location);
  private authService = inject(AuthService);

  item = input.required<NavigationItem>();

  ngOnInit() {
    let current_url = this.location.path();
    // eslint-disable-next-line
    // @ts-ignore
    if (this.location['_baseHref']) {
      // eslint-disable-next-line
      // @ts-ignore
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const pre_parent = up_parent?.parentElement;
      const last_parent = up_parent?.parentElement?.parentElement?.parentElement?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (pre_parent?.classList.contains('pcoded-hasmenu')) {
        pre_parent.classList.add('pcoded-trigger');
        pre_parent.classList.add('active');
      }
      if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        if (pre_parent?.classList.contains('pcoded-hasmenu')) {
          pre_parent.classList.add('pcoded-trigger');
        }
        last_parent.classList.add('active');
      }
    }
  }


  hasRequiredRole(): boolean {
    const currentGroup = this.item();
    const userRoles = this.authService.getRoles();

    if (currentGroup.hidden) {
      return false;
    }
    if (!userRoles || userRoles.length === 0) {
      if (!currentGroup.roles || currentGroup.roles.length === 0) {
        return this.checkChildrenVisibility(currentGroup.children, userRoles);
      }
      return false;
    }


    let groupAllowedByItself = false;
    if (!currentGroup.roles || currentGroup.roles.length === 0) {
      groupAllowedByItself = true;
    } else {
      groupAllowedByItself = currentGroup.roles.some(requiredRole => userRoles.includes(requiredRole));
    }

    if (!groupAllowedByItself && currentGroup.children && currentGroup.children.length > 0) {
      return this.checkChildrenVisibility(currentGroup.children, userRoles);
    }

    if (groupAllowedByItself && currentGroup.children && currentGroup.children.length > 0) {
      return this.checkChildrenVisibility(currentGroup.children, userRoles);
    }

    return groupAllowedByItself;
  }

  private checkChildrenVisibility(children: NavigationItem[] | undefined, userRoles: string[]): boolean {
    if (!children || children.length === 0) {
      return false;
    }

    for (const child of children) {
      if (child.type === 'item') {
        if (!child.roles || child.roles.length === 0 || child.roles.some(role => userRoles.includes(role))) {
          return true; // Item visible
        }
      }
      else if (child.type === 'collapse') {
        const collapseAllowedByRoles = (!child.roles || child.roles.length === 0 || child.roles.some(role => userRoles.includes(role)));
        if (collapseAllowedByRoles && this.checkChildrenVisibility(child.children, userRoles)) {
          return true;
        }
      }
    }
    return false;
  }
}
