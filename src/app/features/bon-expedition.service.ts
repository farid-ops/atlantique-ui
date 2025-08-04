import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BonExpedition } from '../entity/bon-expedition';
import { ApiResponse } from '../entity/api-response';


@Injectable({
  providedIn: 'root'
})
export class BonExpeditionService {
  private apiUrl = `${environment.apiUrl}/api/v1/bon-expeditions`;

  constructor(private http: HttpClient) { }


  createBonExpedition(bonExpedition: BonExpedition): Observable<ApiResponse<BonExpedition>> {
    return this.http.post<ApiResponse<BonExpedition>>(this.apiUrl, bonExpedition).pipe(
      catchError(this.handleError)
    );
  }

  createBonExpeditionFromMarchandise(marchandiseId: string, bonExpedition: BonExpedition): Observable<ApiResponse<BonExpedition>> {
    const url = `${this.apiUrl}/from-marchandise/${marchandiseId}`;
    return this.http.post<ApiResponse<BonExpedition>>(url, bonExpedition).pipe(
      catchError(this.handleError)
    );
  }

  findAllBonExpeditions(): Observable<ApiResponse<BonExpedition[]>> {
    return this.http.get<ApiResponse<BonExpedition[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }


  findAllBonExpeditionsPaginated(page: number, size: number, sortBy: string = 'id', sortDirection: string = 'asc'): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  findBonExpeditionById(id: string): Observable<ApiResponse<BonExpedition>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<BonExpedition>>(url).pipe(
      catchError(this.handleError)
    );
  }


  updateBonExpedition(id: string, bonExpedition: BonExpedition): Observable<ApiResponse<BonExpedition>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ApiResponse<BonExpedition>>(url, bonExpedition).pipe(
      catchError(this.handleError)
    );
  }

  deleteBonExpedition(id: string): Observable<ApiResponse<void>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ApiResponse<void>>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API BonExpedition:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
