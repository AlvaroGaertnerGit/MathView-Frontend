import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = API_URL;


  constructor(private http: HttpClient) { }

  // Método para obtener datos de la API
  getData(route: string): Observable<any> {
    const url = `${this.apiUrl}/${route}`;
    return this.http.get(url);
  }
  calculateFunction(functionInput: string): Observable<any> {
    const url = this.apiUrl + '/calculateFunctionParam';
    const params = new HttpParams().set('function', functionInput);
    const request = this.http.get(url, { params });
    return request;
  }
  getMandelbrot(exp: number): Observable<any> {
    // The API reads the exponent from `d` (calculateMandelbrot); `?function=` was ignored, so it was always 2.
    const url = this.apiUrl + '/calculateMandelbrot/?d=' + exp;
    const request = this.http.get(url);
    return request;
  }
  getFunctionInfo(expression: string): Observable<any> {
    const url = this.apiUrl + '/analyzeFunction';
    return this.http.get(url, {
      params: { expression }
    });
  }
}
