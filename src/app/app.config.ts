import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './service/interceptors/auth.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // --- CONFIGURACIÓN CORRECTA Y COMPLETA DEL INTERCEPTOR ---
    // 1. Provee el sistema HttpClient de Angular.
    provideHttpClient(withInterceptorsFromDi()), 

    // 2. Registra tu AuthInterceptor como un proveedor de interceptores HTTP.
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true 
    }
  ]
};
