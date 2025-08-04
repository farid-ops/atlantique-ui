import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { Page } from './utilisateur.service';
import {environment} from "../../environments/environment";
import {Marchandise} from "../entity/marchandise";

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
export class MarchandiseService {
  private apiUrl = `${environment.apiUrl}/api/v1/marchandises`;

  constructor(private http: HttpClient) { }

  findAllMarchandisesPaginated(page: number, size: number, sortBy?: string, sortDirection?: string): Observable<ApiResponse<Page<Marchandise>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }

    return this.http.get<ApiResponse<Page<Marchandise>>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  findMarchandiseById(id: string): Observable<ApiResponse<Marchandise>> {
    return this.http.get<ApiResponse<Marchandise>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée une nouvelle marchandise avec ses fichiers PDF.
   *
   * @param marchandise Le DTO de la marchandise.
   * @param blFile Fichier BL (PDF).
   * @param declarationDouaneFile Fichier Déclaration en douane (PDF).
   * @param factureCommercialeFile Fichier Facture commerciale (PDF).
   * @returns Un Observable de ApiResponse<Marchandise>.
   */
  createMarchandise(marchandise: Marchandise, blFile?: File | null, declarationDouaneFile?: File | null, factureCommercialeFile?: File | null): Observable<ApiResponse<Marchandise>> {
    const formData = new FormData();

    formData.append('marchandise', new Blob([JSON.stringify(marchandise)], {type: 'application/json'}));

    if (blFile) {
      formData.append('blFile', blFile, blFile.name);
    }
    if (declarationDouaneFile) {
      formData.append('declarationDouaneFile', declarationDouaneFile, declarationDouaneFile.name);
    }
    if (factureCommercialeFile) {
      formData.append('factureCommercialeFile', factureCommercialeFile, factureCommercialeFile.name);
    }

    return this.http.post<ApiResponse<Marchandise>>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour une marchandise existante avec ses fichiers PDF.
   *
   * @param id L'ID de la marchandise.
   * @param marchandise Le DTO de la marchandise.
   * @param blFile Fichier BL (PDF) optionnel.
   * @param declarationDouaneFile Fichier Déclaration en douane (PDF) optionnel.
   * @param factureCommercialeFile Fichier Facture commerciale (PDF) optionnel.
   * @returns Un Observable de ApiResponse<Marchandise>.
   */
  updateMarchandise(id: string, marchandise: Marchandise, blFile?: File | null, declarationDouaneFile?: File | null, factureCommercialeFile?: File | null): Observable<ApiResponse<Marchandise>> {
    const formData = new FormData();
    formData.append('marchandise', new Blob([JSON.stringify(marchandise)], { type: 'application/json' }));
    if (blFile) {
      formData.append('blFile', blFile, blFile.name);
    }
    if (declarationDouaneFile) {
      formData.append('declarationDouaneFile', declarationDouaneFile, declarationDouaneFile.name);
    }
    if (factureCommercialeFile) {
      formData.append('factureCommercialeFile', factureCommercialeFile, factureCommercialeFile.name);
    }
    return this.http.put<ApiResponse<Marchandise>>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteMarchandise(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  validateMarchandise(id: string, isValid: boolean): Observable<ApiResponse<Marchandise>> {
    return this.http.post<ApiResponse<Marchandise>>(`${this.apiUrl}/${id}/validate`, { isValid }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API Marchandise:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
