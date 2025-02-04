import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { request } from 'https';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api'; // Cambia esto a la URL de tu API

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
}
