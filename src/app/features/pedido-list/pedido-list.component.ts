import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// --- Importaciones de Angular Material ---
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// --- Servicios y Modelos ---
import { PedidoService } from '../../service/pedido.service';
import { PedidoResumen } from '../../model/pedido.model';
import { Page } from '../../model/producto.model';
import { EstadoPedido } from '../../model/estado-pedido.model';

// --- Shared UI ---
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiBadgeComponent } from '../../shared/ui/ui-badge/ui-badge.component';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, HttpClientModule, DatePipe, CurrencyPipe,
    MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatSnackBarModule,
    MatSelectModule, MatFormFieldModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent
  ],
  templateUrl: './pedido-list.component.html',
})
export class PedidoListComponent implements AfterViewInit {

  // ... existing properties

  displayedColumns: string[] = ['id', 'fecha', 'clienteNombre', 'asesorNombre', 'total', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<PedidoResumen>();
  totalElements = 0;
  pageSize = 10;
  
  EstadoPedido = EstadoPedido;
  estadosPedido = Object.values(EstadoPedido);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  
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
      this.dataSource.paginator = this.paginator; // Re-assign logic to ensure length detection
      this.totalElements = data.totalElements;
    });
  }
  
  verDetalle(pedidoId: number) {
     this.router.navigate(['/pedidos/detalle', pedidoId]);
  }

  eliminarPedido(pedidoId: number) {
    // ... existing logic
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

  onEstadoChange(pedido: PedidoResumen, nuevoEstado: EstadoPedido): void {
     // ... existing logic
      const snackBarRef = this.snackBar.open(
      `¿Confirmas cambiar el estado del pedido #${pedido.id} a ${nuevoEstado}?`, 
      'Confirmar', 
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.pedidoService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
        next: () => {
          this.snackBar.open('Estado actualizado correctamente.', 'OK', { duration: 3000 });
          const index = this.dataSource.data.findIndex(p => p.id === pedido.id);
          if (index > -1) {
            this.dataSource.data[index].estado = nuevoEstado;
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (err) => {
          this.snackBar.open('Error al actualizar el estado.', 'Cerrar', { duration: 3000 });
          console.error(err);
          this.cargarPedidos();
        }
      });
    });
  }

  getInitials(nameOrEmail: string | null | undefined): string {
    if (!nameOrEmail) return '??';
    const parts = nameOrEmail.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getStatusVariant(estado: EstadoPedido | string): 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'destructive' {
    switch (estado) {
      case this.EstadoPedido.PENDIENTE: return 'warning';
      case this.EstadoPedido.ENVIADO: return 'secondary'; // Using secondary for ENVIADO (Blue-ish in default theme usually, or just slate)
      case this.EstadoPedido.ENTREGADO: return 'success';
      case this.EstadoPedido.CANCELADO: return 'destructive';
      default: return 'secondary';
    }
  }
}

