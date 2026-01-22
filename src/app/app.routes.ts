import { provideRouter, Routes } from '@angular/router';
import { ClienteFormComponent } from './clientes/cliente-form/cliente-form.component';
import { ClienteListComponent } from './clientes/cliente-list/cliente-list.component';
import { PedidoListComponent } from './features/pedido-list/pedido-list.component';
import { PedidoDetalleComponent } from './features/pedido-detalle/pedido-detalle.component';
import { CentroPedidosComponent } from './features/centro-pedidos/centro-pedidos.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';



export const routes: Routes = [
  // Ruta de autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Layout Principal para rutas autenticadas
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' }, // Redirect root to pedidos or dashboard
      
      // Rutas de Clientes
      { path: 'clientes', component: ClienteListComponent },
      { path: 'clientes/new', component: ClienteFormComponent },
      { path: 'clientes/edit/:id', component: ClienteFormComponent },

      // Rutas de Pedidos
      { path: 'nuevo-pedido', component: CentroPedidosComponent },
      { path: 'pedidos', component: PedidoListComponent },
      { path: 'pedidos/detalle/:id', component: PedidoDetalleComponent },
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: 'login' }
];

export const appRouting = [
  provideRouter(routes)
];