import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../entity/api-response';
import { Marque } from '../entity/marque';

@Injectable({
  providedIn: 'root'
})
export class MarqueService {
  private apiUrl = `${environment.apiUrl}/api/v1/marques`;

  constructor(private http: HttpClient) { }

  createMarque(marque: Marque): Observable<ApiResponse<Marque>> {
    return this.http.post<ApiResponse<Marque>>(this.apiUrl, marque).pipe(
      catchError(this.handleError)
    );
  }

  findAllMarques(): Observable<ApiResponse<Marque[]>> {
    return this.http.get<ApiResponse<Marque[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findAllMarquesPaginated(page: number, size: number, sortBy: string = 'nom', sortDirection: 'asc' | 'desc' = 'asc'): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  findMarqueById(id: string): Observable<ApiResponse<Marque>> {
    return this.http.get<ApiResponse<Marque>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateMarque(id: string, marque: Marque): Observable<ApiResponse<Marque>> {
    return this.http.put<ApiResponse<Marque>>(`${this.apiUrl}/${id}`, marque).pipe(
      catchError(this.handleError)
    );
  }

  deleteMarque(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Marque:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
