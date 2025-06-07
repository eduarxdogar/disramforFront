// src/app/pedidos/orden-pedido/orden-pedido.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { PedidoService }   from '../../service/pedido.service';
import { ActivatedRoute }  from '@angular/router';
import jsPDF               from 'jspdf';
import html2canvas        from 'html2canvas';
import * as XLSX          from 'xlsx';
import { saveAs }         from 'file-saver';
import { DetallePedido } from '../../model/pedido.model';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-orden-pedido',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule ],
  templateUrl: './orden-pedido.component.html',
  styleUrls: ['./orden-pedido.component.css']
})
export class OrdenPedidoComponent implements OnInit {
  pedido: any;
  detalles: any[] = [];
  total = 0;
  ivaPct = 0.19;
  entregaDias = 3;

  private pedidoSvc = inject(PedidoService);
  private route     = inject(ActivatedRoute);

 ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pedidoSvc.obtenerPedido(id).subscribe(p => {
      this.pedido = p;
      // aquí ya tienes datos: p.clienteId, p.items, p.total, p.fecha…
      // puedes calcular totales con IVA etc.
    });
  }
    get items(): DetallePedido[] {
    return this.pedido.items || [];
  }
    get totalConIva(): number {
    return this.pedido.total * (1 + this.ivaPct/100);
  }


  exportPDF() {
    const el = document.getElementById('orden')!;
    html2canvas(el).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = canvas.height * w / canvas.width;
      pdf.addImage(img,'PNG',0,0,w,h);
      pdf.save(`Orden-${this.pedido.id}.pdf`);
    });
  }

  exportXLS() {
    // Construir datos en formato AOA (array of arrays)
    const wsData = [
      ['CANT','CODIGO','DESCRIPCION','V.UNIT','V.TOTAL'],
      ...this.detalles.map(d => [
        d.cantidad,
        d.productoCodigo,
        d.productoNombre,
        d.precioUnitario,
        d.precioUnitario * d.cantidad
      ]),
      [],
      ['TOTAL SIN IVA', this.total],
      ['TOTAL CON IVA', this.totalConIva.toFixed(0)]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orden');
    const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([wbout],{type:'application/octet-stream'}), `Orden-${this.pedido.id}.xlsx`);
  }
}
