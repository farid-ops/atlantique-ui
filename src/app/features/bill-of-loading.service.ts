import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {BillOfLoading} from "../entity/bill-of-loading";
import { Page } from './utilisateur.service';

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
export class BillOfLoadingService {
  private apiUrl = `${environment.apiUrl}/api/v1/bls`;

  constructor(private http: HttpClient) { }


  findAllBlsPaginated(page: number, size: number, sortBy?: string, sortDirection?: string): Observable<ApiResponse<Page<BillOfLoading>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortDirection) {
      params = params.set('sort', `${sortBy},${sortDirection}`);
    }

    return this.http.get<ApiResponse<Page<BillOfLoading>>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }


  findBlById(id: string): Observable<ApiResponse<BillOfLoading>> {
    return this.http.get<ApiResponse<BillOfLoading>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  createBl(bl: BillOfLoading): Observable<ApiResponse<BillOfLoading>> {
    return this.http.post<ApiResponse<BillOfLoading>>(this.apiUrl, bl).pipe(
      catchError(this.handleError)
    );
  }

  updateBl(id: string, bl: BillOfLoading): Observable<ApiResponse<BillOfLoading>> {
    return this.http.put<ApiResponse<BillOfLoading>>(`${this.apiUrl}/${id}`, bl).pipe(
      catchError(this.handleError)
    );
  }

  deleteBl(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  uploadBlDocument(file: File, designation: string): Observable<ApiResponse<BillOfLoading>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('designation', designation);
    return this.http.post<ApiResponse<BillOfLoading>>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  downloadBlDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API BL:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }

}
