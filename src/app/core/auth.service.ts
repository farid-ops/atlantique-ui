import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, Subject, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {LoginPayload} from "../entity/login-payload";
import {AuthResponse} from "../entity/auth-response";
import { jwtDecode } from 'jwt-decode';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/v1/oauth2/token';
  private logoutUrl = '/api/v1/oauth2/logout';
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$: Observable<string | null> = this.accessTokenSubject.asObservable();
  private http = inject(HttpClient)
  public tokenAboutToExpire = new Subject<void>();

  private autoLogoutTimer: any;
  private tokenTimer: any;

  constructor(private router: Router) {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      this.accessTokenSubject.next(storedToken);
      this.startTokenTimer();
    }
  }

  renewToken(): Observable<AuthResponse> {
    this.stopTokenTimer();
    this.stopAutoLogoutTimer();

    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.error('Aucun refresh token disponible pour le renouvellement.');
      this.logout();
      return throwError(() => new Error('Refresh token manquant.'));
    }

    const payload: LoginPayload = {
      grantType: 'refreshToken',
      refreshToken: refreshToken,
      withRefreshToken: true
    };

    return this.http.post<AuthResponse>(this.apiUrl, payload).pipe(
      tap(response => {
        if (response.status && response.data?.access_token) {
          const newAccessToken = response.data.access_token;
          const newRefreshToken = response.data.refresh_token;

          localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
          this.accessTokenSubject.next(newAccessToken);
          this.startTokenTimer(); // R
          console.log('Token renouvelé avec succès !');
        } else {
          console.error('Échec du renouvellement du token:', response.message);
          this.logout();
        }
      }),
      catchError(err => {
        console.error('Erreur lors du renouvellement du token:', err);
        this.logout();
        return throwError(() => new Error('Échec du renouvellement du token.'));
      })
    );
  }

  private stopAutoLogoutTimer(): void {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
      this.autoLogoutTimer = null;
      console.log('Minuteur de déconnexion automatique après alerte arrêté.');
    }
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}${this.apiUrl}`, payload).pipe(
      tap(response => {
        if (response.status && response.data?.access_token) {
          const accessToken = response.data.access_token;
          const refreshToken = response.data.refresh_token;

          localStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          this.accessTokenSubject.next(accessToken);
          this.startTokenTimer();
        }
      }),
      catchError(this.handleError)
    );
  }

  getAccessToken(): any {
    return this.accessTokenSubject.value;
  }

  logout(): void{
    console.log('Déconnexion.');
    this.stopTokenTimer();
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessTokenSubject.next(null);
  }


  getDecodedToken(): any {
    const token = this.getAccessToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
        return null;
      }
    }
    return null;
  }

  private startTokenTimer(): void {
    this.stopTokenTimer();

    const decodedToken = this.getDecodedToken();
    if (decodedToken && decodedToken.exp) {
      const expirationTimeMs = decodedToken.exp * 1000;
      const currentTimeMs = new Date().getTime();
      const expiresInMs = expirationTimeMs - currentTimeMs;

      if (expiresInMs < 5000) {
        console.warn('Le token est déjà expiré ou expire trop tôt. Déconnexion immédiate.');
        this.logout();
      } else {
        console.log(`Token expirera dans ${expiresInMs / 1000} secondes. Minuteur démarré.`);
        this.tokenTimer = setTimeout(() => {
          console.log('Minuteur de token expiré. Déconnexion automatique.');
          this.logout();
        }, expiresInMs);
      }
    } else {
      console.warn('Impossible de démarrer le minuteur: token non trouvé ou pas de date d\'expiration.');
    }
  }

  private stopTokenTimer(): void {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
      this.tokenTimer = null;
      console.log('Minuteur de token arrêté.');
    }
  }

  getIdUtilisateur(): string {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.id : "";
  }

  getLoggedInUserGroupId(): string{
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.idGroupe : "";
  }

  getIdSiteUtilisateur(): string{
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.idSite : "";
  }

  getRoles(): string[] {
    const decodedToken = this.getDecodedToken();
    if (decodedToken && decodedToken.scope) {
      return (decodedToken.scope as string).split(' ');
    }
    return [];
  }

  private handleError(error: any) {
    console.error('Erreur API:', error);
    return throwError(() => new Error(error.error?.message || 'Une erreur inconnue est survenue.'));
  }

}
