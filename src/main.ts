import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {JwtInterceptor} from "./app/core/jwt.interceptor";
import {MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, MatDialogModule, MatSnackBarModule),
    provideAnimations(),
    provideHttpClient(withInterceptors([
      JwtInterceptor
    ])),
  ]
}).catch((err) => console.error(err));
