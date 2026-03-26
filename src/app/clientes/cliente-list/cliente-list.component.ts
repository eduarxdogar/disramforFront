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
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiBadgeComponent } from '../../shared/ui/ui-badge/ui-badge.component';
import { UiConfirmDialogComponent } from '../../shared/ui/ui-confirm-dialog/ui-confirm-dialog.component';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';
import { MatDialog } from '@angular/material/dialog';

import { ClienteService } from '../../service/cliente.service';
import { Cliente, Page } from '../../model/cliente.model';

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
    MatPaginatorModule,
    MatSnackBarModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardComponent,
    UiBadgeComponent,
    ClienteFormComponent
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombre', 'nit', 'direccion', 'ciudad', 'telefono', 'acciones'];
  dataSource = new MatTableDataSource<Cliente>();
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  term = '';
  
  // Sheet State
  showSheet = false;
  selectedClientId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargarClientes(): void {
    // Cambiamos 'getClientes' por el nuevo método 'listarClientes'
    this.clienteService.listarClientes(this.pageIndex, this.pageSize, this.term)
      .subscribe((data: Page<Cliente>) => {
        this.dataSource.data = data.content;
        this.totalElements = data.totalElements;
        this.paginator.length = data.totalElements; // Actualiza el paginador
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarClientes();
  }

  eliminar(id: number): void {
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      data: {
        title: 'Eliminar Cliente',
        message: '¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
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
      }
    });
  }

  // Sheet Logic
  openSheet(id: number | null): void {
    this.selectedClientId = id;
    this.showSheet = true;
  }

  closeSheet(): void {
    this.showSheet = false;
    this.selectedClientId = null;
  }

  handleSuccess(): void {
    this.closeSheet();
    this.cargarClientes();
  }

  onFiltrar(): void {
    this.pageIndex = 0;
    this.cargarClientes();
  }
}
