import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PedidoService } from '../../service/pedido.service';
import { PedidoDetallado } from '../../model/pedido.model';
import { Producto } from '../../model/producto.model';

// ¡Importaciones para PDF!
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, CurrencyPipe,
    MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule
  ],
  templateUrl: './pedido-detalle.component.html',
})
export class PedidoDetalleComponent implements OnInit {
   imgUrl: string = ''; 
  pedido: PedidoDetallado | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pedidoService.getPedidoById(+id).subscribe(data => {
        this.pedido = data;
        this.isLoading = false;
      });
    }
  }

  // --- MÉTODOS PARA EXPORTAR ---

  exportarPDFCliente(): void {
    if (!this.pedido) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Pedido #${this.pedido.id}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Cliente: ${this.pedido.clienteNombre}`, 14, 30);
    doc.text(`Fecha: ${new Date(this.pedido.fecha).toLocaleDateString()}`, 14, 36);

    autoTable(doc, {
      startY: 50,
      head: [['Código', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: this.pedido.items.map(item => [
        item.productoCodigo,
        item.productoNombre,
        item.cantidad,
        this.formatCurrency(item.precioUnitario),
        this.formatCurrency(item.subtotal)
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text(`Total: ${this.formatCurrency(this.pedido.total)}`, 14, finalY + 15);

    doc.save(`pedido_cliente_${this.pedido.id}.pdf`);
  }

  exportarPDFBodega(): void {
    if (!this.pedido) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Orden de Bodega - Pedido #${this.pedido.id}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Cliente: ${this.pedido.clienteNombre}`, 14, 30);
    doc.text(`Estado: APROBADO`, 14, 36);

    autoTable(doc, {
      startY: 50,
      head: [['Código', 'Producto', 'Cantidad', 'Ubicación (P-N-E)']],
      body: this.pedido.items.map(item => [
        item.productoCodigo,
        item.productoNombre,
        item.cantidad,
        `${item.pasillo || 'N/A'}-${item.nivel || 'N/A'}-${item.espacio || 'N/A'}`
      ]),
    });
    
    doc.save(`orden_bodega_${this.pedido.id}.pdf`);
  }

  // --- LÓGICA PARA EDITAR ---
  editarPedido(): void {
    if (!this.pedido || this.pedido.estado !== 'PENDIENTE') return;
    // Navegamos al centro de pedidos y pasamos el ID del pedido a editar
    this.router.navigate(['/nuevo-pedido'], { queryParams: { editarId: this.pedido.id } });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }
}
