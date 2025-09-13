import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// --- Importaciones de Angular Material ---
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; // <-- Módulo necesario para el dropdown
import { MatFormFieldModule } from '@angular/material/form-field';

// --- Servicios y Modelos ---
import { PedidoService } from '../../service/pedido.service';
import { PedidoResumen } from '../../model/pedido.model';
import { Page } from '../../model/producto.model';
import { EstadoPedido } from '../../model/estado-pedido.model'; // <-- Importamos nuestro nuevo enum

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, HttpClientModule, DatePipe, CurrencyPipe,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatSnackBarModule,
    MatSelectModule, MatFormFieldModule // <-- Añadimos los módulos para el dropdown
  ],
  templateUrl: './pedido-list.component.html',
})
export class PedidoListComponent implements AfterViewInit {

  displayedColumns: string[] = ['id', 'fecha', 'clienteNombre', 'asesorNombre', 'total', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<PedidoResumen>();
  totalElements = 0;
  pageSize = 10;

  // Hacemos el enum y sus valores accesibles desde la plantilla HTML
  EstadoPedido = EstadoPedido;
  estadosPedido = Object.values(EstadoPedido);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Inyección de dependencias moderna
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
     this.router.navigate(['/pedidos/detalle', pedidoId]);
  }

  eliminarPedido(pedidoId: number) {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el pedido #${pedidoId}? Esta acción no se puede deshacer.`);
    if (confirmacion) {
      this.pedidoService.eliminar(pedidoId).subscribe({
        next: () => {
          this.snackBar.open(`Pedido #${pedidoId} eliminado con éxito.`, 'Cerrar', { duration: 3000 });
          this.cargarPedidos();
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar el pedido.', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  // --- NUEVO MÉTODO PARA MANEJAR EL CAMBIO DE ESTADO ---
  onEstadoChange(pedido: PedidoResumen, nuevoEstado: EstadoPedido): void {
    const snackBarRef = this.snackBar.open(
      `¿Confirmas cambiar el estado del pedido #${pedido.id} a ${nuevoEstado}?`, 
      'Confirmar', 
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.pedidoService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
        next: () => {
          this.snackBar.open('Estado actualizado correctamente.', 'OK', { duration: 3000 });
          // Actualizamos el estado en la vista sin necesidad de recargar toda la lista
          const index = this.dataSource.data.findIndex(p => p.id === pedido.id);
          if (index > -1) {
            this.dataSource.data[index].estado = nuevoEstado;
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (err) => {
          this.snackBar.open('Error al actualizar el estado.', 'Cerrar', { duration: 3000 });
          console.error(err);
          // Opcional: recargar los pedidos para revertir el cambio visual si falla
          this.cargarPedidos();
        }
      });
    });
  }
}

