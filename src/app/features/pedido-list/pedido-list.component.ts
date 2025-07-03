import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para notificaciones

// --- Importaciones de Angular Material ---
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// --- Servicios y Modelos ---
import { PedidoService } from '../../service/pedido.service';
import { PedidoResumen } from '../../model/pedido.model';
import { Page } from '../../model/producto.model';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [
 CommonModule, RouterModule, HttpClientModule, DatePipe, CurrencyPipe,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatSnackBarModule
   
  ],
  templateUrl: './pedido-list.component.html',
})
export class PedidoListComponent implements AfterViewInit {

  displayedColumns: string[] = ['id', 'fecha', 'clienteNombre', 'asesorNombre', 'total', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<PedidoResumen>();
  totalElements = 0;
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  snackBar: any;

  constructor(
      private pedidoService: PedidoService,
      private router: Router
  ) {}

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.cargarPedidos());
    this.cargarPedidos();
  }

  cargarPedidos() {
    const page = this.paginator ? this.paginator.pageIndex : 0;
    const size = this.paginator ? this.paginator.pageSize : this.pageSize;

    this.pedidoService.getPedidos(page, size).subscribe((data: Page<PedidoResumen>) => {
      this.dataSource.data = data.content;
      this.totalElements = data.totalElements;
    });
  }
  
  verDetalle(pedidoId: number) {
      console.log('Navegar a la vista de detalle para el pedido:', pedidoId);
     
       this.router.navigate(['/pedidos/detalle', pedidoId]);
  }
   eliminarPedido(pedidoId: number) {
    // Usamos una confirmación simple del navegador antes de borrar
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el pedido #${pedidoId}? Esta acción no se puede deshacer.`);

    if (confirmacion) {
      this.pedidoService.eliminar(pedidoId).subscribe({
        next: () => {
          this.snackBar.open(`Pedido #${pedidoId} eliminado con éxito.`, 'Cerrar', { duration: 3000 });
          this.cargarPedidos(); // Recargamos la lista para que desaparezca el pedido eliminado
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar el pedido.', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }
}
