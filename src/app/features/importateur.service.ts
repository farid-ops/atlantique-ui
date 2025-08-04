import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, Observable, throwError} from 'rxjs';
import {Importateur} from "../entity/importateur";
import {Page} from "./utilisateur.service";

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
export class ImportateurService {
  private apiUrl = `${environment.apiUrl}/api/v1/importateurs`;

  constructor(private http: HttpClient) { }

  getAllImportateurs(): Observable<ApiResponse<Importateur[]>> {
    return this.http.get<ApiResponse<Importateur[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getPaginatedImportateurs(page: number, size: number, sortBy: string = 'nom', sortDirection: 'asc' | 'desc' = 'asc', idGroupe?: string | null): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    if (idGroupe) {
      url += `&idGroupe=${idGroupe}`;
    }
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }


  getImportateurById(id: string): Observable<ApiResponse<Importateur>> {
    return this.http.get<ApiResponse<Importateur>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createImportateur(importateur: Importateur): Observable<ApiResponse<Importateur>> {
    return this.http.post<ApiResponse<Importateur>>(this.apiUrl, importateur).pipe(
      catchError(this.handleError)
    );
  }

  updateImportateur(id: string, importateur: Importateur): Observable<ApiResponse<Importateur>> {
    return this.http.put<ApiResponse<Importateur>>(`${this.apiUrl}/${id}`, importateur).pipe(
      catchError(this.handleError)
    );
  }

  deleteImportateur(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Importateur:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
