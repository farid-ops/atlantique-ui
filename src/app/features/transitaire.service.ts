import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {Transitaire} from "../entity/transitaire";
import {Page} from "./utilisateur.service";
import {environment} from "../../environments/environment";

interface ApiResponse<T> {
  code: string;
  status: boolean;
  message: string;
  date: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TransitaireService {
  private apiUrl = `${environment.apiUrl}/api/v1/transitaires`;

  constructor(private http: HttpClient) { }

  getPaginatedTransitaires(page: number, size: number, sortBy: string = 'designation', sortDirection: 'asc' | 'desc' = 'asc', idGroupe?: string | null): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    if (idGroupe) {
      url += `&idGroupe=${idGroupe}`;
    }
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  getTransitaireById(id: string): Observable<ApiResponse<Transitaire>> {
    return this.http.get<ApiResponse<Transitaire>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createTransitaire(transitaire: Transitaire): Observable<ApiResponse<Transitaire>> {
    return this.http.post<ApiResponse<Transitaire>>(this.apiUrl, transitaire).pipe(
      catchError(this.handleError)
    );
  }

  updateTransitaire(id: string, transitaire: Transitaire): Observable<ApiResponse<Transitaire>> {
    return this.http.put<ApiResponse<Transitaire>>(`${this.apiUrl}/${id}`, transitaire).pipe(
      catchError(this.handleError)
    );
  }

  deleteTransitaire(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Transitaire:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
