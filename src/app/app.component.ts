import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import {TokenExpiryAlertComponent} from "./theme/shared/components/token-expiry-alert/token-expiry-alert.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, SpinnerComponent, TokenExpiryAlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
