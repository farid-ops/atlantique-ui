import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {Autorite} from "../entity/autorite";
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
export class AutoriteService {
  private apiUrl = `${environment.apiUrl}/api/v1/autorites`;

  constructor(private http: HttpClient) { }

  getAllAutorites(): Observable<ApiResponse<Autorite[]>> {
    return this.http.get<ApiResponse<Autorite[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }


  getAutoriteById(id: string): Observable<ApiResponse<Autorite>> {
    return this.http.get<ApiResponse<Autorite>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  createAutorite(autorite: Autorite): Observable<ApiResponse<Autorite>> {
    return this.http.post<ApiResponse<Autorite>>(this.apiUrl, autorite).pipe(
      catchError(this.handleError)
    );
  }


  updateAutorite(id: string, autorite: Autorite): Observable<ApiResponse<Autorite>> {
    return this.http.put<ApiResponse<Autorite>>(`${this.apiUrl}/${id}`, autorite).pipe(
      catchError(this.handleError)
    );
  }

  deleteAutorite(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Autorite:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
