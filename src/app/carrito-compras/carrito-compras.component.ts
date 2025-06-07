import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CarritoItem } from '../model/carrito.model';
import { PedidoService } from '../service/pedido.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito-compras',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './carrito-compras.component.html',
  styleUrls: ['./carrito-compras.component.css']
})
export class CarritoComprasComponent implements OnInit {
  columnas = ['productoCodigo','cantidad','subtotal','actions'];
  carrito: CarritoItem[] = [];
  totalSinIva = 0;
  totalConIva = 0;
  private pedidoSvc = inject(PedidoService);
  private router     = inject(Router);

  ngOnInit() {
    this.pedidoSvc.carrito$.subscribe(items => {
      this.carrito = items;
      this.recalcularTotales();
    });
  }

  recalcularTotales() {
    // asume que CarritoItem incluye precioUnitario (ajusta si no)
    this.totalSinIva = this.carrito
      .reduce((acc, it) => acc + it.cantidad * (it as any).precioUnitario, 0);
    this.totalConIva = this.totalSinIva * 1.19;
  }

  eliminar(item: CarritoItem) {
    this.pedidoSvc.agregarAlCarrito({ productoCodigo: item.productoCodigo, cantidad: -item.cantidad });
  }

  finalizar() {
    // vamos a pantalla de selección de cliente
    this.router.navigate(['/clientes']);
  }
}
