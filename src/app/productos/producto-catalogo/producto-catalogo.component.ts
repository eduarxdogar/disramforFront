import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { MatGridListModule }          from '@angular/material/grid-list';
import { MatCardModule }              from '@angular/material/card';
import { MatIconModule }              from '@angular/material/icon';

import { ProductoService }            from '../../service/producto.service';
import { Producto }                   from '../../model/producto.model';
import { CarritoComprasService } from '../../service/carrito-compras.service';

@Component({
  selector: 'app-producto-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './producto-catalogo.component.html',
  styleUrls: ['./producto-catalogo.component.css']
})
export class ProductoCatalogoComponent implements OnInit {
    productos: Producto[] = [];
    filtro = '';

  // Inyectar el servicio de productos y el carrito de compras
  private svc = inject(ProductoService);
  private carrito: CarritoComprasService = inject(CarritoComprasService);



  ngOnInit() {
    this.svc.listar().subscribe(list => this.productos = list);
  }

  productosFiltrados(): Producto[] {
    const term = this.filtro.toLowerCase().trim();
    if (!term) return this.productos;
    return this.productos.filter(p =>
      p.codigo.toString().toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term)
    );
  }
  
  agregar(p: any) {
    this.carrito.agregarLinea({
      productoCodigo: p.codigo,
      productoNombre: p.nombre,
      precioUnitario: p.precioUnitario,
      cantidad: 1
    });
  }
}
