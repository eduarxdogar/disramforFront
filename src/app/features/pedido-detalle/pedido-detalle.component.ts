import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Angular Material (Icons as Lucide replacement)
import { MatCardModule } from '@angular/material/card'; // Keeping for safety/legacy within template if needed, though mostly using UiCard
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services & Models
import { PedidoService } from '../../service/pedido.service';
import { PedidoDetallado } from '../../model/pedido.model';

// Shared UI
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiBadgeComponent } from '../../shared/ui/ui-badge/ui-badge.component';

// PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, CurrencyPipe,
    MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent
  ],
  templateUrl: './pedido-detalle.component.html',
})
export class PedidoDetalleComponent implements OnInit {
  pedido: PedidoDetallado | null = null;
  isLoading = true;
  isExportingPdf = false;

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

  // --- UI Helpers ---
  getStatusVariant(estado: string): 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'destructive' {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'ENVIADO': return 'secondary'; // Blue-ish equivalent
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'destructive';
      default: return 'secondary';
    }
  }

  getImagePath(imageName: string | undefined): string {
    return imageName ? `assets/${imageName}` : 'assets/images/placeholder.png'; // Fallback logic
  }

  // --- MÉTODOS PARA EXPORTAR (Funcionalidad preservada) ---

  private async getImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async exportarPDFCliente(): Promise<void> {
    if (!this.pedido) return;
    this.isExportingPdf = true;

    try {
      const doc = new jsPDF();
      const pedido = this.pedido;
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      // Logo
      try {
          const logoBase64 = await this.getImageAsBase64('assets/disramfor.jpg');
          doc.addImage(logoBase64, 'JPEG', 14, 15, 40, 15);
      } catch (e) {
          console.warn('Logo not found, skipping');
      }
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Pedido #${pedido.id}`, pageWidth - 14, 22, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de Emisión: ${new Date(pedido.fecha).toLocaleDateString()}`, pageWidth - 14, 28, { align: 'right' });

      const col1X = 14;
      const col2X = 110;
      let currentY = 50;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Cliente', col1X, currentY);
      doc.text('Datos del Pedido', col2X, currentY);
      doc.setLineWidth(0.2);
      doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const clienteNombreLines = doc.splitTextToSize(`Nombre: ${pedido.clienteNombre}`, 80);
      doc.text(clienteNombreLines, col1X, currentY);
      let clienteBlockHeight = (clienteNombreLines.length * 5) + 10;
      doc.text(`NIT: ${pedido.clienteNit}`, col1X, currentY + (clienteNombreLines.length * 5));
      doc.text(`Dirección: ${pedido.direccionEntrega}`, col1X, currentY + (clienteNombreLines.length * 5) + 5);
      doc.text(`Ciudad: ${pedido.ciudadEntrega}`, col1X, currentY + (clienteNombreLines.length * 5) + 10);
      doc.text(`Asesor: ${pedido.asesor}`, col2X, currentY);
      doc.text(`Estado: ${pedido.estado}`, col2X, currentY + 5);

      const tableStartY = currentY + clienteBlockHeight + 5;

      autoTable(doc, {
        startY: tableStartY,
        head: [['Código', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: pedido.items.map(item => [
          item.productoCodigo, item.productoNombre, item.cantidad,
          this.formatCurrency(item.precioUnitario), this.formatCurrency(item.subtotal)
        ]),
      });

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.text('Subtotal:', 140, finalY, { align: 'right' });
      doc.text(this.formatCurrency(pedido.subtotal), 200, finalY, { align: 'right' });
      finalY += 7;
      if (pedido.descuento > 0) {
        doc.text('Descuento:', 140, finalY, { align: 'right' });
        doc.text(`-${this.formatCurrency(pedido.descuento)}`, 200, finalY, { align: 'right' });
        finalY += 7;
      }
      doc.text('IVA (19%):', 140, finalY, { align: 'right' });
      doc.text(this.formatCurrency(pedido.iva), 200, finalY, { align: 'right' });
      finalY += 7;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', 140, finalY, { align: 'right' });
      doc.text(this.formatCurrency(pedido.total), 200, finalY, { align: 'right' });
      
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Documento generado por A.S.T. Catalog - DISRAMFOR', pageWidth / 2, footerY, { align: 'center' });

      doc.save(`pedido_cliente_${pedido.id}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      this.isExportingPdf = false;
    }
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

  editarPedido(): void {
    if (!this.pedido || this.pedido.estado !== 'PENDIENTE') return;
    this.router.navigate(['/nuevo-pedido'], { queryParams: { editarId: this.pedido.id } });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }
}

