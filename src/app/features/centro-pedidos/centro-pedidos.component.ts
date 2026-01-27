import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith, switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Angular Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Shared UI
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiBadgeComponent } from '../../shared/ui/ui-badge/ui-badge.component';

// Services & Models
import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from '../../service/categoria.service';
import { PedidoService } from '../../service/pedido.service';
import { ClienteService } from '../../service/cliente.service';
import { AuthService } from '../../service/auth.service'; 
import { Producto, Page as PageProducto } from '../../model/producto.model';
import { ArticuloPedido, PedidoRequest } from '../../model/pedido.model';
import { Cliente } from '../../model/cliente.model';
import { SearchCriteria, AutoPartDTO } from '../../model/catalog.model';
import { CascadeSearchComponent } from './components/cascade-search/cascade-search.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CatalogService } from '../../service/catalog.service';

@Component({
  selector: 'app-centro-pedidos',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatSnackBarModule, 
    MatAutocompleteModule, 
    MatProgressSpinnerModule,
    MatPaginatorModule,
    UiButtonComponent,
    UiBadgeComponent,
    CascadeSearchComponent,
    ProductCardComponent
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
  pageSize = 12; 
  pageIndex = 0;
  pageSizeOptions = [8, 12, 24, 48];
  
  pedidoActual: ArticuloPedido[] = [];
  // categorias removed
  
  // Search State
  currentFilters: Partial<SearchCriteria> = {};

  // Additional Search Term Control


  isEditMode = false;
  pedidoIdParaEditar: number | null = null;
  isLoading = false;
  
  // Mobile Responsiveness
  showMobileFilters = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private catalogService: CatalogService,
    private productoService: ProductoService,
    // categoriaService removed
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    // fb removed (or kept if needed for other things, but filterForm is gone)
    private snackBar: MatSnackBar,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfoFromToken();
    this.userRole = userInfo.rol;
    this.asesorInfo = { id: userInfo.id, nombre: userInfo.nombre };

    this.canSearchClients = this.userRole === 'ADMIN' || this.userRole === 'ASESOR';

    // Initial Load (Optional: maybe wait for search? but let's load all or none)
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

    // Listen to text search changes removed - Handled by CascadeSearchComponent
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
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

  cancelarPedido(): void {
    const backupPedido = [...this.pedidoActual];
    this.limpiarPedido();
    if (!this.isEditMode) {
      this.selectedClient = null;
      this.clienteControl.setValue('');
    }

    const snackBarRef = this.snackBar.open('Pedido limpiado', 'DESHACER', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      this.pedidoActual = backupPedido;
      this.snackBar.open('Pedido restaurado', 'OK', { duration: 2000 });
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

  // New method for Cascade Search
  onFilterChange(filters: SearchCriteria): void {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.pageIndex = 0;
    this.buscarProductos();
  }

  buscarProductos(): void {
    this.catalogService.searchParts(this.currentFilters, this.pageIndex, this.pageSize)
      .subscribe((pagina) => { 
        // TAREA 1: Debugging Inmediato (Espía)
        if (pagina.content && pagina.content.length > 0) {
          console.log('DATA CRUDA RECIBIDA:', pagina.content[0]);
        }

        // Map AutoPartDTO to Producto for compatibility
        this.productos = pagina.content.map(part => ({
          // Fix: Fallback for different backend DTO field names
          // TAREA 2: Mapeo Exhaustivo (Fix)
          codigo: (part as any).codigo || (part as any).id || (part as any).partNumber || (part as any).part_number || part.internalCode || 'ERR-CODIGO',
          nombre: part.name,
          precioUnitario: part.price,
          imagenUrl: part.imageUrl,
          descripcion: part.description || part.name // Fallback to name if description is empty
        }));
        this.totalElements = pagina.totalElements;
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = this.totalElements;
            this.paginator.pageSize = this.pageSize;
            this.paginator.pageIndex = this.pageIndex;
          }
        });
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarProductos();
  }

  comprobarCantidad(producto: Producto): number {
    const item = this.pedidoActual.find(p => p.codigo === producto.codigo);
    return item ? item.cantidad : 0;
  }

  // New Handler for ProductCardComponent
  handleQuantityChange(event: { product: Producto, quantity: number }): void {
     const { product, quantity } = event;
     const itemIndex = this.pedidoActual.findIndex(p => p.codigo === product.codigo);
     
     if (quantity > 0) {
       if (itemIndex > -1) {
         // Update existing
         this.pedidoActual[itemIndex].cantidad = quantity;
         this.pedidoActual = [...this.pedidoActual]; // Trigger change detection
       } else {
         // Add new
         this.pedidoActual.push({ ...product, cantidad: quantity });
         this.pedidoActual = [...this.pedidoActual];
       }
     } else {
       // Remove if quantity is 0
       if (itemIndex > -1) {
         this.eliminarDelPedido(product.codigo);
       }
     }
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
  
  quitarDelPedido(producto: Producto): void {
    const itemExistente = this.pedidoActual.find(item => item.codigo === producto.codigo);
    if (itemExistente) {
      if (itemExistente.cantidad > 1) {
        itemExistente.cantidad--;
      } else {
        this.eliminarDelPedido(itemExistente.codigo);
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