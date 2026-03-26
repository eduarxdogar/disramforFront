import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { PedidoService } from '../../service/pedido.service';
import { ClienteService } from '../../service/cliente.service';
import { AuthService } from '../../service/auth.service'; 
import { CartService } from '../../service/cart.service';
import { CatalogService } from '../../service/catalog.service';
import { Producto } from '../../model/producto.model';
import { PedidoRequest } from '../../model/pedido.model';
import { Cliente } from '../../model/cliente.model';
import { SearchCriteria } from '../../model/catalog.model';
import { CascadeSearchComponent } from './components/cascade-search/cascade-search.component';
import { ProductCardComponent } from './components/product-card/product-card.component';

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

  // Inyección de dependencias moderna
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public catalogService = inject(CatalogService);
  private pedidoService = inject(PedidoService);
  private clienteService = inject(ClienteService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  public cartService = inject(CartService);

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
  
  currentFilters: Partial<SearchCriteria> = {};

  isEditMode = false;
  pedidoIdParaEditar: number | null = null;
  isLoading = false;
  showMobileFilters = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfoFromToken();
    this.userRole = userInfo.rol;
    this.asesorInfo = { id: userInfo.id, nombre: userInfo.nombre };

    this.canSearchClients = this.userRole === 'ADMIN' || this.userRole === 'ASESOR';

    // Carga inicial de productos
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
    if (!this.selectedClient?.id) { 
      this.snackBar.open('Por favor, selecciona un cliente.', 'Cerrar', { duration: 3000 });
      return; 
    }
    
    const items = this.cartService.items();
    if (items.length === 0) { 
      this.snackBar.open('El carrito está vacío.', 'Cerrar', { duration: 3000 });
      return; 
    }

    const asesorIdParaEnviar = this.asesorInfo.id;
    if (!asesorIdParaEnviar) {
      this.snackBar.open('Error: No se pudo identificar al asesor.', 'Cerrar', { duration: 3000 });
      return;
    }

    const pedidoRequest: PedidoRequest = {
      clienteId: this.selectedClient.id,
      asesorId: asesorIdParaEnviar,
      items: items.map(item => ({
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
        this.cartService.limpiarPedido();
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        const message = this.isEditMode ? 'Error al actualizar.' : 'Error al crear.';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      },
      complete: () => this.isLoading = false
    });
  }

  cancelarPedido(): void {
    const backupPedido = [...this.cartService.items()];
    this.cartService.limpiarPedido();
    if (!this.isEditMode) {
      this.selectedClient = null;
      this.clienteControl.setValue('');
    }

    const snackBarRef = this.snackBar.open('Pedido limpiado', 'DESHACER', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      // Restauración manual si es necesario, o via CartService
      backupPedido.forEach(item => this.cartService.actualizarCantidad(item, item.cantidad));
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
        
        this.cartService.limpiarPedido();
        pedidoDetallado.items.forEach(item => {
          this.cartService.actualizarCantidad({
            codigo: item.productoCodigo,
            nombre: item.productoNombre,
            precioUnitario: item.precioUnitario,
            descripcion: item.productoNombre, // Falta en DTO detallado a veces
            imagenUrl: item.imagenUrl
          }, item.cantidad);
        });
        
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
    this.cartService.limpiarPedido();
  }

  onFilterChange(filters: SearchCriteria): void {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.pageIndex = 0;
    this.buscarProductos();
  }

  buscarProductos(): void {
    this.catalogService.searchParts(this.currentFilters, this.pageIndex, this.pageSize)
      .subscribe((pagina) => { 
        // ✅ Uso de Adaptador centralizado en CatalogService
        this.productos = pagina.content.map(part => this.catalogService.mapToProducto(part));
        this.totalElements = pagina.totalElements;
        
        if (this.paginator) {
          this.paginator.length = this.totalElements;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarProductos();
  }

  handleQuantityChange(event: { product: Producto, quantity: number }): void {
     this.cartService.actualizarCantidad(event.product, event.quantity);
  }

  eliminarDelPedido(codigo: string): void {
    this.cartService.eliminarDelPedido(codigo);
  }
}