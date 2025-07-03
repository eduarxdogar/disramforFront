import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { PedidoService } from '../../service/pedido.service';
import { PedidoRequest,PedidoDetallado } from '../../model/pedido.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pedido-detalle',
  imports: [ CommonModule, RouterLink, DatePipe, CurrencyPipe,
    MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './pedido-detalle.component.html',
  styleUrl: './pedido-detalle.component.css'
})
export class PedidoDetalleComponent implements OnInit {
  pedido: PedidoDetallado | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    // Obtenemos el 'id' de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pedidoService.getPedidoById(+id).subscribe(data => {
        this.pedido = data;
        this.isLoading = false;
      });
    }
  }

  exportarPDF() {
    console.log('Lógica para exportar a PDF...');
  }

  editarPedido() {
    console.log('Lógica para editar el pedido...');
  }

}
