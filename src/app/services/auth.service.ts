import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // ajusta tu URL base

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const body = { username, password };
    return this.http.post(url, body);
  }

  register(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/register`;
    const body = { username, password };
    return this.http.post(url, body);
  }
}
