import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../entity/api-response';
import { Gamme } from '../entity/gamme';

@Injectable({
  providedIn: 'root'
})
export class GammeService {
  private apiUrl = `${environment.apiUrl}/api/v1/gammes`;

  constructor(private http: HttpClient) { }

  createGamme(gamme: Gamme): Observable<ApiResponse<Gamme>> {
    return this.http.post<ApiResponse<Gamme>>(this.apiUrl, gamme).pipe(
      catchError(this.handleError)
    );
  }

  findAllGammes(): Observable<ApiResponse<Gamme[]>> {
    return this.http.get<ApiResponse<Gamme[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findAllGammesPaginated(page: number, size: number, sortBy: string = 'nom', sortDirection: 'asc' | 'desc' = 'asc'): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  findGammeById(id: string): Observable<ApiResponse<Gamme>> {
    return this.http.get<ApiResponse<Gamme>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateGamme(id: string, gamme: Gamme): Observable<ApiResponse<Gamme>> {
    return this.http.put<ApiResponse<Gamme>>(`${this.apiUrl}/${id}`, gamme).pipe(
      catchError(this.handleError)
    );
  }

  deleteGamme(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Gamme:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
