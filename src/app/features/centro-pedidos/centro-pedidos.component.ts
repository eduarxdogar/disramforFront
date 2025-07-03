// /features/centro-pedidos/centro-pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

// --- Importaciones de Angular Material ---
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// --- Servicios y Modelos ---
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
// CORRECCIÓN: Asegúrate de que las rutas a tus servicios y modelos sean correctas.
import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { PedidoService } from '../../service/pedido.service';
import { Producto,Page } from '../../model/producto.model';
import { Categoria } from '../../model/categoria.model';
import { ArticuloPedido } from '../../model/pedido.model';
import { PedidoRequest } from '../../model/pedido.model';
import { ClienteService } from '../../service/cliente.service';
import { Cliente } from '../../model/cliente.model';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-centro-pedidos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HttpClientModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatPaginatorModule, MatTableModule, MatIconModule, MatSnackBarModule ,MatAutocompleteModule
  ],
  templateUrl: './centro-pedidos.component.html',
})
export class CentroPedidosComponent implements OnInit {

  clienteControl = new FormControl('');
  filteredClientes$: Observable<Cliente[]> | undefined;
  selectedClient: Cliente | null = null;
  productos: Producto[] = [];
  totalElements = 0;
  pageSize = 8;
  pageIndex = 0;
  pedidoActual: ArticuloPedido[] = [];
  displayedColumns: string[] = ['nombre', 'cantidad', 'precioUnitario', 'total', 'acciones'];
  categorias: Categoria[] = [];
  filterForm: FormGroup;
  editMode = false;
  pedidoIdParaEditar: number | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private pedidoService: PedidoService,
     private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      termino: [''],
      categoriaId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.buscarProductos();
    
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.buscarProductos();
    });
       this.filteredClientes$ = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.clienteService.buscar(value || ''))
    );
  }
    displayCliente(cliente: Cliente): string {
    return cliente && cliente.nombre ? cliente.nombre : '';
  }

  onClientSelected(event: any): void {
    this.selectedClient = event.option.value;
    const nombre = this.selectedClient && this.selectedClient.nombre ? this.selectedClient.nombre : null;
    this.clienteControl.setValue(nombre, { emitEvent: false });
  }

  clearClientSelection(): void {
      this.selectedClient = null;
      this.clienteControl.setValue('');
  }

  // --- MÉTODO FINALIZAR PEDIDO ACTUALIZADO ---
  finalizarPedido(): void {
    // ¡Validación clave!
    if (!this.selectedClient || this.selectedClient.id === undefined) {
      this.snackBar.open('Debe seleccionar un cliente con un ID válido para crear el pedido.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.pedidoActual.length === 0) {
      this.snackBar.open('El pedido no puede estar vacío.', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevoPedido: PedidoRequest = {
      clienteId: this.selectedClient.id, // Usamos el ID del cliente seleccionado
      asesorId: 1, // Temporal
      items: this.pedidoActual.map(item => ({
        productoCodigo: item.codigo,
        cantidad: item.cantidad
      }))
    };
    
    this.pedidoService.crearPedido(nuevoPedido).subscribe({
      next: (respuesta: any) => {
        this.snackBar.open('¡Pedido creado exitosamente!', 'Cerrar', { duration: 3000 });
        this.limpiarPedido();
        this.clearClientSelection(); // Limpiamos el cliente para el siguiente pedido
      },
      error: (err: any) => { /* ... tu manejo de errores ... */ }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe((data: Categoria[]): void => {
      this.categorias = data;
    });
  }

  buscarProductos(): void {
    const filtros = this.filterForm.value;
    this.productoService.buscarProductos(filtros, this.pageIndex, this.pageSize)
      .subscribe((pagina: Page<Producto>) => { // <-- Tipo explícito
        this.productos = pagina.content;
        this.totalElements = pagina.totalElements;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarProductos();
  }

  agregarAlPedido(producto: Producto): void {
    const itemExistente = this.pedidoActual.find(item => item.codigo === producto.codigo);
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.pedidoActual.push({ ...producto, cantidad: 1 });
    }
    this.pedidoActual = [...this.pedidoActual];
  }

  actualizarCantidad(codigo: string, event: Event): void {
    const nuevaCantidad = parseInt((event.target as HTMLInputElement).value, 10);
    const item = this.pedidoActual.find(item => item.codigo === codigo);
    if (item) {
      if (nuevaCantidad > 0) {
        item.cantidad = nuevaCantidad;
      } else {
        this.eliminarDelPedido(codigo);
      }
      this.pedidoActual = [...this.pedidoActual];
    }
  }

  eliminarDelPedido(codigo: string): void {
    this.pedidoActual = this.pedidoActual.filter(item => item.codigo !== codigo);
  }

  limpiarPedido(): void {
      this.pedidoActual = [];
  }

  getSubtotal(): number {
    return this.pedidoActual.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  }
  
}
