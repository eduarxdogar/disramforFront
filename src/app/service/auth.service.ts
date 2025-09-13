import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegistroRequest } from '../model/registrorequest.model';
import { AuthenticationRequest } from '../model/authentication-request.model';
import { AuthenticationResponse } from '../model/authentication-response.model';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth';
const TOKEN_KEY = 'jwt_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(credentials: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
        }
      })
    );
  }

  register(userData: RegistroRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${API_URL}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const userInfo = this.getUserInfoFromToken();
    return userInfo.rol;
  }

  getUserInfoFromToken(): { id: number | null, nombre: string | null, rol: string | null } {
    const token = this.getToken();
    if (!token) {
      return { id: null, nombre: null, rol: null };
    }
    try {
      const decodedToken: any = jwtDecode(token);
      return {
        id: decodedToken.userId || null,
        nombre: decodedToken.nombreUsuario || decodedToken.sub, // 'sub' (email) como fallback
        rol: decodedToken.rol || null
      };
    } catch (error) {
      console.error("Error decodificando el token:", error);
      return { id: null, nombre: null, rol: null };
    }
  }
}