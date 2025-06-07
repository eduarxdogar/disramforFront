import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatGridListModule }  from '@angular/material/grid-list';
import { MatCardModule }      from '@angular/material/card';
import { MatIconModule }      from '@angular/material/icon';
import { ProductoService }    from '../../service/producto.service';
import { PedidoService }      from '../../service/pedido.service';
import { Producto }           from '../../model/producto.model';

@Component({
  selector: 'app-producto-list',
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
  templateUrl: './producto-list.component.html'
})
export class ProductoListComponent implements OnInit {
  filtro = '';
  productos: Producto[] = [];
  private svcProd = inject(ProductoService);
  private svcPed  = inject(PedidoService);

  ngOnInit() {
    this.svcProd.listar().subscribe(p => this.productos = p);
  }

  filtered(): Producto[] {
    const t = this.filtro.trim().toLowerCase();
    return t
      ? this.productos.filter(p =>
          p.codigo.toString().includes(t) ||
          p.nombre.toLowerCase().includes(t)
        )
      : this.productos;
  }

  agregar(p: Producto) {
    this.svcPed.agregarAlCarrito({ productoCodigo: p.codigo.toString(), cantidad: 1 });
  }
}
