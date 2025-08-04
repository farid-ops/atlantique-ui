import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../entity/api-response';
import {DailyCashRegister} from "../entity/daily-cash-register";

@Injectable({
  providedIn: 'root'
})
export class DailyCashRegisterService {
  private apiUrl = `${environment.apiUrl}/api/v1/cash-register`;

  constructor(private http: HttpClient) { }

  getDailySummary(caissierId: string, date: string): Observable<ApiResponse<DailyCashRegister>> {
    return this.http.get<ApiResponse<DailyCashRegister>>(`${this.apiUrl}/summary/${date}`).pipe(
      catchError(this.handleError)
    );
  }

  getDailySummariesForCaissier(caissierId: string, startDate: string, endDate: string): Observable<ApiResponse<DailyCashRegister[]>> {
    const url = `${this.apiUrl}/summary-range?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<ApiResponse<DailyCashRegister[]>>(url).pipe(
      catchError(this.handleError)
    );
  }

  recordDeposit(caissierId: string, amount: number): Observable<ApiResponse<DailyCashRegister>> {
    const payload = { amount: amount };
    return this.http.post<ApiResponse<DailyCashRegister>>(`${this.apiUrl}/deposit`, payload).pipe(
      catchError(this.handleError)
    );
  }


  recordWithdrawal(caissierId: string, amount: number): Observable<ApiResponse<DailyCashRegister>> {
    const payload = { amount: amount };
    return this.http.post<ApiResponse<DailyCashRegister>>(`${this.apiUrl}/withdrawal`, payload).pipe(
      catchError(this.handleError)
    );
  }

  closeCashRegister(caissierId: string): Observable<ApiResponse<DailyCashRegister>> {
    return this.http.post<ApiResponse<DailyCashRegister>>(`${this.apiUrl}/close`, {}).pipe(
      catchError(this.handleError)
    );
  }

  openCashRegister(caissierId: string): Observable<ApiResponse<DailyCashRegister>> {
    return this.http.post<ApiResponse<DailyCashRegister>>(`${this.apiUrl}/open`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getDailySummariesForSite(siteId: string, startDate: string, endDate: string): Observable<ApiResponse<DailyCashRegister[]>> {
    const url = `${this.apiUrl}/site-summaries?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<ApiResponse<DailyCashRegister[]>>(url).pipe(
      catchError(this.handleError)
    );
  }

  openCashRegisterForUser(userId: string, date: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${userId}/open?date=${date}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  closeCashRegisterForUser(userId: string, date: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${userId}/close?date=${date}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getDailySummariesForGroup(groupId: string, startDate: string, endDate: string): Observable<ApiResponse<DailyCashRegister[]>> {
    const url = `${this.apiUrl}/summary/group?startDate=${startDate}&endDate=${endDate}&groupId=${groupId}`;
    return this.http.get<ApiResponse<DailyCashRegister[]>>(url).pipe(
      catchError(this.handleError)
    );
  }

  isCashRegisterOpen(caissierId: string, date: string): Observable<ApiResponse<boolean>> {
    return this.getDailySummary(caissierId, date).pipe(
      map(res => {
        const isOpen = res.status && res.data && !res.data.isClosed;
        return { ...res, data: isOpen };
      }),
      catchError(err => {
        if (err.message && err.message.includes("non trouvée")) {
          return throwError(() => new Error(err.message));
        }
        return this.handleError(err);
      })
    );
  }

  exportReport(type: 'pdf' | 'csv', startDate: string, endDate: string, params: { [key: string]: string | null }): Observable<Blob> {
    let url = `${this.apiUrl}/summary/export/${type}?startDate=${startDate}&endDate=${endDate}`;
    for (const key in params) {
      if (params[key]) {
        url += `&${key}=${params[key]}`;
      }
    }
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('Erreur API DailyCashRegister:', error);
    const backendErrorMessage = error.error?.message || 'Une erreur inconnue est survenue.';
    return throwError(() => new Error(backendErrorMessage));
  }
}
