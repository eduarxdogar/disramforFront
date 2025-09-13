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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para feedback de carga

// --- Servicios y Modelos ---
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { PedidoService } from '../../service/pedido.service';
import { Producto,Page } from '../../model/producto.model';
import { Categoria } from '../../model/categoria.model';
import { ArticuloPedido, PedidoRequest } from '../../model/pedido.model';
import { ClienteService } from '../../service/cliente.service';
import { Cliente } from '../../model/cliente.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-centro-pedidos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HttpClientModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatPaginatorModule, MatTableModule, MatIconModule, MatSnackBarModule, MatAutocompleteModule,
    MatProgressSpinnerModule // No olvides importar el spinner
  ],
  templateUrl: './centro-pedidos.component.html',
})
export class CentroPedidosComponent implements OnInit {

  clienteControl = new FormControl<string | Cliente>('');
  filteredClientes$?: Observable<Cliente[]>;
  selectedClient: Cliente | null = null;

  productos: Producto[] = [];
  totalElements = 0;
  pageSize = 8;
  pageIndex = 0;
  
  pedidoActual: ArticuloPedido[] = [];
  displayedColumns: string[] = ['nombre', 'cantidad', 'precioUnitario', 'total', 'acciones'];
  categorias: Categoria[] = [];
  filterForm: FormGroup;

  // --- NUEVAS PROPIEDADES PARA EL MODO EDICIÓN ---
  isEditMode = false;
  pedidoIdParaEditar: number | null = null;
  isLoading = false; // Para feedback de carga

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

    this.route.queryParams.subscribe(params => {
        const editarId = params['editarId'];
        if (editarId) {
            this.isEditMode = true;
            this.pedidoIdParaEditar = +editarId;
            this.cargarPedidoParaEditar(this.pedidoIdParaEditar);
        }
    });
    
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
      switchMap(value => {
        const term = typeof value === 'string' ? value : (value?.nombre || '');
        return this.clienteService.buscar(term);
      })
    );
  }

  cargarPedidoParaEditar(id: number): void {
      this.isLoading = true;
      this.pedidoService.getPedidoById(id).subscribe({
          next: (pedidoDetallado) => {
              // 1. Cargar el cliente
              this.clienteService.getCliente(pedidoDetallado.clienteId).subscribe(cliente => {
                  this.selectedClient = cliente;
                  this.clienteControl.setValue(cliente);
              });
              
              // 2. Cargar los artículos del pedido
              this.pedidoActual = pedidoDetallado.items.map(item => ({
                  ...item, // Mantiene los datos del item
                  codigo: item.productoCodigo,
                  nombre: item.productoNombre,
                  precioUnitario: item.precioUnitario
              }));

              this.isLoading = false;
          },
          error: () => {
              this.snackBar.open('Error al cargar el pedido para editar.', 'Cerrar', { duration: 3000 });
              this.isLoading = false;
              this.router.navigate(['/pedidos']);
          }
      });
  }

  displayCliente(cliente: Cliente): string {
    return cliente && cliente.nombre ? cliente.nombre : '';
  }

  onClientSelected(event: any): void {
    this.selectedClient = event.option.value;
  }

  clearClientSelection(): void {
      this.selectedClient = null;
      this.clienteControl.setValue('');
      this.limpiarPedido();
  }

  finalizarPedido(): void {
    if (!this.selectedClient || this.selectedClient.id === undefined) {
      this.snackBar.open('Debe seleccionar un cliente.', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.pedidoActual.length === 0) {
      this.snackBar.open('El pedido no puede estar vacío.', 'Cerrar', { duration: 3000 });
      return;
    }

    const pedidoRequest: PedidoRequest = {
      clienteId: this.selectedClient.id,
      asesorId: 1, // Ajustar si tienes lógica de asesores
      items: this.pedidoActual.map(item => ({
        productoCodigo: item.codigo,
        cantidad: item.cantidad
      }))
    };
    
    this.isLoading = true;

    const operation = this.isEditMode && this.pedidoIdParaEditar
      ? this.pedidoService.actualizarPedido(this.pedidoIdParaEditar, pedidoRequest)
      : this.pedidoService.crearPedido(pedidoRequest);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode ? '¡Pedido actualizado exitosamente!' : '¡Pedido creado exitosamente!';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        const message = this.isEditMode ? 'Error al actualizar el pedido.' : 'Error al crear el pedido.';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe((data: Categoria[]) => {
      this.categorias = data;
    });
  }

  buscarProductos(): void {
    const filtros = this.filterForm.value;
    this.productoService.buscarProductos(filtros, this.pageIndex, this.pageSize)
      .subscribe((pagina: Page<Producto>) => {
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