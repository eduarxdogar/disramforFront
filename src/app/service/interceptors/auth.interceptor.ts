import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // --- LÍNEA DE DEPURACIÓN #1 ---
  console.log('AuthInterceptor: Interceptando petición a ->', req.url);

  const token = authService.getToken();

  if (token) {
    // --- LÍNEA DE DEPURACIÓN #2 ---
    console.log('AuthInterceptor: Token encontrado. Adjuntando a la petición.');
    
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  } else {
    // --- LÍNEA DE DEPURACIÓN #3 ---
    console.warn('AuthInterceptor: No se encontró token en AuthService.');
    return next(req);
  }
};
