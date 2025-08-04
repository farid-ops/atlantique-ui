import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Navire } from '../entity/navire';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Page } from './utilisateur.service';
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
export class NavireService {

  private apiUrl = `${environment.apiUrl}/api/v1/navires`;

  constructor(private http: HttpClient) { }

  getPaginatedNavires(page: number, size: number, sortBy?: string, sortDirection?: string): Observable<ApiResponse<Page<Navire>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }

    return this.http.get<ApiResponse<Page<Navire>>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getNavireById(id: string): Observable<ApiResponse<Navire>> {
    return this.http.get<ApiResponse<Navire>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createNavire(navire: Navire): Observable<ApiResponse<Navire>> {
    return this.http.post<ApiResponse<Navire>>(this.apiUrl, navire).pipe(
      catchError(this.handleError)
    );
  }

  updateNavire(id: string, navire: Navire): Observable<ApiResponse<Navire>> {
    return this.http.put<ApiResponse<Navire>>(`${this.apiUrl}/${id}`, navire).pipe(
      catchError(this.handleError)
    );
  }

  deleteNavire(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Navire:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
