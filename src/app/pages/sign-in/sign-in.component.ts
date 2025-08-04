import { Component, OnInit } from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {AuthService} from "../../core/auth.service";

@Component({
  selector: 'app-sign-in',
  imports: [SharedModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  msisdn: string = '';
  password_login: string = '';
  rememberMe: boolean = false;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/analytics']);
    }
  }
  onSubmit(): void {
    this.errorMessage = null;
    this.loading = true;

    const payload = {
      msisdn: this.msisdn,
      password: this.password_login,
      grantType: 'password' as 'password',
      withRefreshToken: true
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.status) {
          this.router.navigate(['/analytics']);
        } else {
          this.errorMessage = response.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur de connexion:', error);
        this.errorMessage = error.message || 'Une erreur est survenue lors de la tentative de connexion.';
      }
    });
  }
}
