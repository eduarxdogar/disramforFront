import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from './service/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),

    // --- CONFIGURACIÓN CORRECTA Y COMPLETA DEL INTERCEPTOR ---
    // 1. Provee el sistema HttpClient de Angular con interceptores funcionales
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi() // Mantenemos soporte para interceptores legacy si alguna librería lo requiere
    ), 
  ]
};
