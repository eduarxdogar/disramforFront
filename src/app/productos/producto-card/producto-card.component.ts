import { Component, inject, Input } from '@angular/core';
import { Producto } from '../../model/producto.model';
import { PedidoService } from '../../service/pedido.service';
import { MatGridListModule }          from '@angular/material/grid-list';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { CommonModule }               from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';



@Component({
  selector: 'app-producto-card',
  imports: [ MatGridListModule, MatFormFieldModule, MatInputModule, CommonModule, MatCardModule, MatIcon ],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.css'
})
export class ProductoCardComponent {
  filtro: string = '';
@Input() producto!: Producto;
  private pedidoSvc = inject(PedidoService);

  addToCart() {
    this.pedidoSvc.agregarAlCarrito({
      productoCodigo: this.producto.codigo.toString(),
      cantidad: 1
    });
  }
}
