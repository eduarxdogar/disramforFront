
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // <-- 1. IMPORTA tu configuración

// --- 2. ASEGÚRATE DE PASAR appConfig COMO SEGUNDO ARGUMENTO ---
// bootstrapApplication le dice a Angular cómo construir y configurar tu aplicación.
bootstrapApplication(AppComponent, appConfig) // <-- ESTA LÍNEA ES LA CLAVE
  .catch((err) => console.error(err));