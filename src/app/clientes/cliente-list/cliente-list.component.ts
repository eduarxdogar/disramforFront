import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ClienteService } from '../../service/cliente.service';
import { Cliente, ClienteRequest, Page } from '../../model/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente-list.component.html',
})
export class ClienteListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombre', 'nit', 'direccion', 'ciudad', 'telefono', 'acciones'];
  dataSource = new MatTableDataSource<Cliente>();
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  term = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clienteService: ClienteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Al inicio, cargamos la primera página de clientes
    this.cargarClientes();
  }

  // Este método se ejecuta DESPUÉS de que la vista se inicializa
  ngAfterViewInit(): void {
    // La línea clave para conectar el dataSource con el paginador
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe((event) => this.onPageChange(event));
  }

  cargarClientes(): void {
    this.clienteService.getClientes(this.pageIndex, this.pageSize, this.term)
      .subscribe((data: Page<Cliente>) => {
        this.dataSource.data = data.content;
        this.totalElements = data.totalElements;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarClientes();
  }

  eliminar(id: number): void {
    const snackBarRef = this.snackBar.open(
      `¿Estás seguro de que quieres eliminar este cliente?`,
      'Confirmar',
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado con éxito.', 'Cerrar', { duration: 3000 });
          this.cargarClientes();
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar el cliente.', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    });
  }

  onFiltrar(): void {
    this.pageIndex = 0;
    this.cargarClientes();
  }
}
