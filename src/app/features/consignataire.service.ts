import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { Consignataire } from '../entity/consignatire';

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
export class ConsignataireService {
  private apiUrl = `${environment.apiUrl}/api/v1/consignataires`;

  constructor(private http: HttpClient) {
  }

  getAllConsignataires(): Observable<ApiResponse<Consignataire[]>> {
    return this.http.get<ApiResponse<Consignataire[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getConsignataireById(id: string): Observable<ApiResponse<Consignataire>> {
    return this.http.get<ApiResponse<Consignataire>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createConsignataire(consignataire: Consignataire): Observable<ApiResponse<Consignataire>> {
    return this.http.post<ApiResponse<Consignataire>>(this.apiUrl, consignataire).pipe(
      catchError(this.handleError)
    );
  }

  updateConsignataire(id: string, consignataire: Consignataire): Observable<ApiResponse<Consignataire>> {
    return this.http.put<ApiResponse<Consignataire>>(`${this.apiUrl}/${id}`, consignataire).pipe(
      catchError(this.handleError)
    );
  }

  deleteConsignataire(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Consignataire:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
