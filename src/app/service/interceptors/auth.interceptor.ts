import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service'; // Asegúrate que esta ruta es correcta

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // --- LÍNEA DE DEPURACIÓN #1 ---
    // Este mensaje aparecerá en la consola del navegador por CADA petición HTTP.
    console.log('AuthInterceptor: Interceptando petición a ->', request.url);

    const token = this.authService.getToken();

    if (token) {
      // --- LÍNEA DE DEPURACIÓN #2 ---
      // Si encontramos un token, lo mostraremos aquí.
      console.log('AuthInterceptor: Token encontrado. Adjuntando a la petición.');

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // --- LÍNEA DE DEPURACIÓN #3 ---
      // Si NO encontramos un token, lo sabremos.
      console.warn('AuthInterceptor: No se encontró token en AuthService.');
    }

    return next.handle(request);
  }
}
