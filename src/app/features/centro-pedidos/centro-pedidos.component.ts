import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, startWith, switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { PedidoService } from '../../service/pedido.service';
import { ClienteService } from '../../service/cliente.service';
import { AuthService } from '../../service/auth.service'; 
import { Producto, Page as PageProducto } from '../../model/producto.model';
import { Categoria } from '../../model/categoria.model';
import { ArticuloPedido, PedidoRequest } from '../../model/pedido.model';
import { Cliente } from '../../model/cliente.model';

@Component({
  selector: 'app-centro-pedidos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HttpClientModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, MatButtonModule, MatCardModule, MatPaginatorModule, MatTableModule, 
    MatIconModule, MatSnackBarModule, MatAutocompleteModule, MatProgressSpinnerModule
  ],
  templateUrl: './centro-pedidos.component.html',
})
export class CentroPedidosComponent implements OnInit {

  userRole: string | null = null;
  canSearchClients = false;
  asesorInfo: { id: number | null, nombre: string | null } = { id: null, nombre: null };
  
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

  isEditMode = false;
  pedidoIdParaEditar: number | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService 
  ) {
    this.filterForm = this.fb.group({
      termino: [''],
      categoriaId: [null]
    });
  }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfoFromToken();
    this.userRole = userInfo.rol;
    this.asesorInfo = { id: userInfo.id, nombre: userInfo.nombre };

    this.canSearchClients = this.userRole === 'ADMIN' || this.userRole === 'ASESOR';

    this.cargarCategorias();
    this.buscarProductos();

    if (this.canSearchClients) {
      this.iniciarBusquedaClientes();
    }
    
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
  }

  iniciarBusquedaClientes(): void {
    this.filteredClientes$ = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const term = typeof value === 'string' ? value : (value?.nombre || '');
        return this.clienteService.listarClientes(0, 10, term).pipe(
          map(page => page.content)
        );
      })
    );
  }
  
  finalizarPedido(): void {
    if (!this.selectedClient?.id) { return; }
    if (this.pedidoActual.length === 0) { return; }

    const asesorIdParaEnviar = this.asesorInfo.id;
    if (!asesorIdParaEnviar) {
      this.snackBar.open('Error: No se pudo identificar al asesor.', 'Cerrar', { duration: 3000 });
      return;
    }

    const pedidoRequest: PedidoRequest = {
      clienteId: this.selectedClient.id,
      asesorId: asesorIdParaEnviar,
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
        const message = this.isEditMode ? '¡Pedido actualizado!' : '¡Pedido creado!';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        const message = this.isEditMode ? 'Error al actualizar.' : 'Error al crear.';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        console.error(err);
      },
      complete: () => this.isLoading = false
    });
  }

  cargarPedidoParaEditar(id: number): void {
    this.isLoading = true;
    this.pedidoService.getPedidoById(id).subscribe({
      next: (pedidoDetallado) => {
        this.clienteService.getCliente(pedidoDetallado.clienteId).subscribe(cliente => {
          this.selectedClient = cliente;
          this.clienteControl.setValue(cliente);
        });
        this.pedidoActual = pedidoDetallado.items.map(item => ({
          ...item,
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
  
  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe((data: Categoria[]) => {
      this.categorias = data;
    });
  }

  buscarProductos(): void {
    const filtros = this.filterForm.value;
    this.productoService.buscarProductos(filtros, this.pageIndex, this.pageSize)
      .subscribe((pagina: PageProducto<Producto>) => { 
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