import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Utilisateur} from "../entity/utilisateur";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";


export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
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
export class UtilisateurService {
  private apiUrl = `${environment.apiUrl}/api/v1/utilisateurs`;
  private http=inject(HttpClient);

  constructor() { }

  getPaginatedUtilisateurs(page: number, size: number, sortBy: string = 'dateCreation', sortDirection: 'asc' | 'desc' = 'desc', idGroupe?: string | null, idSite?: string | null): Observable<ApiResponse<any>> {
    let url = `${this.apiUrl}/paginated?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;
    if (idGroupe) {
      url += `&idGroupe=${idGroupe}`;
    }
    if (idSite) {
      url += `&idSite=${idSite}`;
    }
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  findAllUtilisateursPaginatedByIdGroupe(idGroupe: string, pageable: { page: number, size: number, sort: string }): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${pageable.page}&size=${pageable.size}&sort=${pageable.sort}&idGroupe=${idGroupe}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  findAllUtilisateursPaginatedByIdSite(idSite: string, pageable: { page: number, size: number, sort: string }): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/paginated?page=${pageable.page}&size=${pageable.size}&sort=${pageable.sort}&idSite=${idSite}`;
    return this.http.get<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }


  getUtilisateurById(id: string): Observable<ApiResponse<Utilisateur>> {
    return this.http.get<ApiResponse<Utilisateur>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createUtilisateur(utilisateur: Utilisateur): Observable<ApiResponse<Utilisateur>> {
    const payload = { ...utilisateur, telephone: utilisateur.telephone,isEnabled: utilisateur.enabled };
    return this.http.post<ApiResponse<Utilisateur>>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  updateUtilisateur(id: string, utilisateur: Utilisateur): Observable<ApiResponse<Utilisateur>> {
    const payload = { ...utilisateur, telephone: utilisateur.telephone,isEnabled: utilisateur.enabled };
    return this.http.put<ApiResponse<Utilisateur>>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  deleteUtilisateur(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Utilisateur:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
