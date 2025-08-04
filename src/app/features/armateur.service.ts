import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {Armateur} from "../entity/armateur";
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
export class ArmateurService {
  private apiUrl = `${environment.apiUrl}/api/v1/armateurs`;

  constructor(private http: HttpClient) { }

  getAllArmateurs(): Observable<ApiResponse<Armateur[]>> {
    return this.http.get<ApiResponse<Armateur[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getArmateurById(id: string): Observable<ApiResponse<Armateur>> {
    return this.http.get<ApiResponse<Armateur>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createArmateur(armateur: Armateur): Observable<ApiResponse<Armateur>> {
    return this.http.post<ApiResponse<Armateur>>(this.apiUrl, armateur).pipe(
      catchError(this.handleError)
    );
  }

  updateArmateur(id: string, armateur: Armateur): Observable<ApiResponse<Armateur>> {
    return this.http.put<ApiResponse<Armateur>>(`${this.apiUrl}/${id}`, armateur).pipe(
      catchError(this.handleError)
    );
  }

  deleteArmateur(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API ArmateurComponent:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur de service ArmateurComponent est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
