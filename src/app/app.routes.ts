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


export const routes: Routes = [
  // Clientes
  { path: 'clientes',          component: ClienteListComponent },
  { path: 'clientes/new',      component: ClienteFormComponent },
  { path: 'clientes/edit/:id', component: ClienteFormComponent },


  



  // --- ¡NUESTRA RUTA ESTRELLA PARA EL MVP! ---
  // Reemplaza la antigua ruta 'pedidos/new' por esta, que es mucho más potente.
  { path: 'nuevo-pedido',      component: CentroPedidosComponent },
    // --- ¡NUESTRA RUTA ESTRELLA PARA EL MVP! ---
  { path: 'nuevo-pedido',      component: CentroPedidosComponent },

  // --- ¡AÑADIMOS LA RUTA PARA VER EL HISTORIAL DE PEDIDOS! ---
  { path: 'pedidos',           component: PedidoListComponent },
   { path: 'pedidos/detalle/:id', component: PedidoDetalleComponent },


  // redirección por defecto a nuestro nuevo componente
  { path: '**', redirectTo: 'nuevo-pedido' }
];

export const appRouting = [
  provideRouter(routes)
];