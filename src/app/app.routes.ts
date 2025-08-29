// src/app/app.routes.ts
import { provideRouter, Routes } from '@angular/router';

// --- Tus componentes existentes ---
import { ClienteFormComponent } from './clientes/cliente-form/cliente-form.component';
import { ClienteListComponent } from './clientes/cliente-list/cliente-list.component';
// import { PedidoFormComponent } from './pedidos/pedido-form/pedido-form.component'; // Ya no lo necesitas para crear
import { PedidoListComponent } from './features/pedido-list/pedido-list.component';
import { PedidoDetalleComponent } from './features/pedido-detalle/pedido-detalle.component';

// --- ¡IMPORTAMOS NUESTRO NUEVO COMPONENTE! ---
import { CentroPedidosComponent } from './features/centro-pedidos/centro-pedidos.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';



export const routes: Routes = [
  // Ruta de autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rutas de Clientes (protegidas en el futuro)
  { path: 'clientes', component: ClienteListComponent },
  { path: 'clientes/new', component: ClienteFormComponent },
  { path: 'clientes/edit/:id', component: ClienteFormComponent },

  // Rutas de Pedidos (protegidas en el futuro)
  { path: 'nuevo-pedido', component: CentroPedidosComponent },
  { path: 'pedidos', component: PedidoListComponent },
  { path: 'pedidos/detalle/:id', component: PedidoDetalleComponent },

  // Redirección por defecto a la ruta de login
  // Esto asegura que el usuario vea el login al entrar
  { path: '**', redirectTo: 'login' }
];

export const appRouting = [
  provideRouter(routes)
];