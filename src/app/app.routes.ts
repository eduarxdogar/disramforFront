// src/app/app.routes.ts
import { provideRouter, Routes } from '@angular/router';
import { OrdenPedidoComponent } from './pedidos/orden-pedido/orden-pedido.component';
import { ClienteFormComponent } from './clientes/cliente-form/cliente-form.component';
import { ClienteListComponent } from './clientes/cliente-list/cliente-list.component';
import { ProductoListComponent } from './productos/producto-list/producto-list.component';
import { PedidoListComponent } from './pedidos/pedido-list/pedido-list.component';
import { PedidoFormComponent } from './pedidos/pedido-form/pedido-form.component';
import { CarritoComprasComponent } from './carrito-compras/carrito-compras.component';

export const routes: Routes = [
  // Clientes
  { path: 'clientes',          component: ClienteListComponent  },
  { path: 'clientes/new',      component: ClienteFormComponent  },
  { path: 'clientes/edit/:id', component: ClienteFormComponent  },

  // Productos (catálogo)
  { path: 'productos',         component: ProductoListComponent },
  { path: 'carrito',           component: CarritoComprasComponent },

  // Pedidos (lista, creación, edición)
  { path: 'pedidos',           component: PedidoListComponent    },
  { path: 'pedidos/new',       component: PedidoFormComponent    },  // <-- AQUÍ
  { path: 'pedidos/edit/:id',  component: PedidoFormComponent    },

  // Orden de pedido (detalle PDF/XLS)
  { path: 'orden/:id',         component: OrdenPedidoComponent   },

  // redirección por defecto
  { path: '**', redirectTo: 'productos' }
];

export const appRouting = [
  provideRouter(routes)
];
