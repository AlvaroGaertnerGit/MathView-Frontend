import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { request } from 'https';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://mathview-backend.azurewebsites.net/api';
  

  constructor(private http: HttpClient) {}

  // Método para obtener datos de la API
  getData(route: string): Observable<any> {
    const url = `${this.apiUrl}/${route}`;
    return this.http.get(url);
  }
  calculateFunction(functionInput: string): Observable<any> {
    const url = this.apiUrl + '/calculateFunctionParam';
    const params = new HttpParams().set('function', functionInput);
    const request =  this.http.get(url, { params });
    return request;
  }
  getMandelbrot(exp: number): Observable<any> {
    const url = this.apiUrl + '/calculateMandelbrot/?function=' + exp;
    const request =  this.http.get(url);
    return request;
  }
    getFunctionInfo(expression: string): Observable<any> {
      const url = this.apiUrl + '/analyzeFunction';
    return this.http.get(url, {
      params: { expression }
    });
  }
}
