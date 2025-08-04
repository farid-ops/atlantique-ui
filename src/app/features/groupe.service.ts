import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../entity/api-response';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private apiUrl = `${environment.apiUrl}/api/v1/groupes`;

  constructor(private http: HttpClient) { }

  createGroupe(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  getGroupeById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findAllGroupes(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findAllGroupesPaginated(page: number, size: number, sortBy: string = 'creationDate', sortDirection: string = 'desc'): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateGroupe(id: string, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteGroupe(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Groupe:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
