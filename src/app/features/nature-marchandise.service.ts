import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {catchError, Observable, throwError} from "rxjs";
import {NatureMarchandise} from "../entity/natureMarchandise";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Page} from "./utilisateur.service";
import {Importateur} from "../entity/importateur";

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
export class NatureMarchandiseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/nature-marchandises`;

  constructor() { }

  getPaginatedNatureMarchandises(page: number, size: number, sortBy?: string, sortDirection?: string): Observable<ApiResponse<Page<NatureMarchandise>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }

    return this.http.get<ApiResponse<Page<NatureMarchandise>>>(this.apiUrl.concat('/paginated'), { params }).pipe(
      catchError(this.handleError)
    );
  }

  getAllNatureMarchandise(): Observable<ApiResponse<NatureMarchandise[]>> {
    return this.http.get<ApiResponse<NatureMarchandise[]>>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }


  getNatureMarchandiseById(id: string): Observable<ApiResponse<NatureMarchandise>> {
    return this.http.get<ApiResponse<NatureMarchandise>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createNatureMarchandise(natureMarchandise: NatureMarchandise): Observable<ApiResponse<NatureMarchandise>> {
    return this.http.post<ApiResponse<NatureMarchandise>>(this.apiUrl, natureMarchandise).pipe(
      catchError(this.handleError)
    );
  }


  updateNatureMarchandise(id: string, natureMarchandise: NatureMarchandise): Observable<ApiResponse<NatureMarchandise>> {
    return this.http.put<ApiResponse<NatureMarchandise>>(`${this.apiUrl}/${id}`, natureMarchandise).pipe(
      catchError(this.handleError)
    );
  }

  deleteNatureMarchandise(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API NatureMarchandise:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
