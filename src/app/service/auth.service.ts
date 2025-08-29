import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegistroRequest } from '../../app/model/registrorequest.model'; // Corregida la ruta
import { AuthenticationRequest } from '../model/authentication-request.model';
import { AuthenticationResponse } from '../model/authentication-response.model';

const apiUrl = 'http://localhost:8080/api/auth/'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('jwt_token');
  }

  login(credentials: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(apiUrl + 'login', credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.token = response.token;
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  register(userData: RegistroRequest): Observable<any> {
    // Al registrar, no guardamos el token para forzar al usuario a hacer login
    return this.http.post<any>(apiUrl + 'register', userData);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
