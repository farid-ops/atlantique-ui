import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Port} from "../entity/port";
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
export class PortService {

  private apiUrl = `${environment.apiUrl}/api/v1/ports`;

  private http=inject(HttpClient);

  constructor() { }

  getAllPorts(): Observable<ApiResponse<Port[]>> {
    return this.http.get<ApiResponse<Port[]>>(`${this.apiUrl}`).pipe(catchError(this.handleError));
  }

  getPortsByPaysId(paysId: string): Observable<ApiResponse<Port[]>> {
    return this.http.get<ApiResponse<Port[]>>(`${this.apiUrl}/by-pays/${paysId}`).pipe(
      catchError(this.handleError)
    );
  }

  getPaginatedPorts(page: number, size: number, sortBy?: string, sortDirection?: string, idPays?: string): Observable<ApiResponse<Page<Port>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }
    if (idPays) {
      params = params.set('idPays', idPays);
    }

    return this.http.get<ApiResponse<Page<Port>>>(this.apiUrl.concat('/paginated'), { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPortById(id: string): Observable<ApiResponse<Port>> {
    return this.http.get<ApiResponse<Port>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPort(port: Port): Observable<ApiResponse<Port>> {
    return this.http.post<ApiResponse<Port>>(this.apiUrl, port).pipe(
      catchError(this.handleError)
    );
  }

  updatePort(id: string, port: Port): Observable<ApiResponse<Port>> {
    return this.http.put<ApiResponse<Port>>(`${this.apiUrl}/${id}`, port).pipe(
      catchError(this.handleError)
    );
  }

  deletePort(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API PortComponent:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue lors de la récupération des ports.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
