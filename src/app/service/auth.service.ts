import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// **Importante:** Aquí debes usar la URL de tu backend desplegado en Azure.
//const API_URL = 'https://disramfor-api-qa.azurewebsites.net/api/auth/';
 const apiUrl = 'http://localhost:8080/api/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Al iniciar la aplicación, intenta cargar el token guardado en el navegador.
    this.token = localStorage.getItem('jwt_token');
  }

  // Este método se conecta con el endpoint de login del backend.
  // Cuando el backend responde, guarda el token en el almacenamiento local del navegador.
  login(credentials: any): Observable<any> {
    return this.http.post<any>(apiUrl + 'login', credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.token = response.token;
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  // Este método elimina el token del navegador para cerrar la sesión.
  logout() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  // Este método te da el token si existe.
  getToken(): string | null {
    return this.token;
  }

  // Este método te dice si el usuario tiene un token válido.
  isAuthenticated(): boolean {
    return !!this.token;
  }
}
