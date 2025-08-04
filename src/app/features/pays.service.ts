import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {Pays} from "../entity/pays";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
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
export class PaysService {
  private apiUrl = `${environment.apiUrl}/api/v1/pays`;

  private http=inject(HttpClient);

  constructor() { }

  getAllPays(): Observable<ApiResponse<Pays[]>> {
    return this.http.get<ApiResponse<Pays[]>>(`${this.apiUrl}`).pipe(catchError(this.handleError));
  }

  getPaginatedPays(page: number, size: number, sortBy?: string, sortDirection?: string): Observable<ApiResponse<Page<Pays>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }

    return this.http.get<ApiResponse<Page<Pays>>>(this.apiUrl.concat('/paginated'), { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPaysById(id: string): Observable<ApiResponse<Pays>> {
    return this.http.get<ApiResponse<Pays>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPays(pays: Pays): Observable<ApiResponse<Pays>> {
    return this.http.post<ApiResponse<Pays>>(this.apiUrl, pays).pipe(
      catchError(this.handleError)
    );
  }

  updatePays(id: string, pays: Pays): Observable<ApiResponse<Pays>> {
    return this.http.put<ApiResponse<Pays>>(`${this.apiUrl}/${id}`, pays).pipe(
      catchError(this.handleError)
    );
  }

  deletePays(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API PaysComponent:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue lors de la récupération des pays.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
