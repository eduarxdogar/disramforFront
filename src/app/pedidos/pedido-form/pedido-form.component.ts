import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule, AbstractControl, FormControl } from '@angular/forms';
import { ClienteService }     from '../../service/cliente.service';
import { ProductoService }    from '../../service/producto.service';
import { PedidoService }      from '../../service/pedido.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente }            from '../../model/cliente.model';
import { Producto }           from '../../model/producto.model';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input'; 
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatLabel } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedido-form',
  imports: [  MatFormFieldModule,  MatAutocompleteModule, CommonModule,           // para *ngIf, *ngFor, pipes (currency)
    ReactiveFormsModule,    // para formGroup, formControl
    FormsModule, MatIcon, MatCard, MatInput, MatButton, MatAutocomplete, MatLabel],
  templateUrl: './pedido-form.component.html',
  styleUrls: ['./pedido-form.component.css']
})
export class PedidoFormComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private cliSvc   = inject(ClienteService);
  private prodSvc  = inject(ProductoService);
  private pedSvc   = inject(PedidoService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);

  form = this.fb.group({
    cliente:      [null as Cliente | null, Validators.required],
    clienteInput: [''],
    items:        this.fb.array<FormArray>([])
  });

  clientes: Cliente[]    = [];
  clientesFiltrados: Cliente[] = [];
  productos: Producto[]  = [];
  productosFiltrados: Producto[] = [];

  productoSearch = '';
  asesor = 'Juan Pérez';   // <-- Puedes inyectar tu AuthService para obtener el usuario real
  isEdit = false;
  pedidoId?: number;

  ngOnInit() {
    // cargar clientes y productos
    this.cliSvc.getClientes().subscribe(c => this.clientes = c);
    this.prodSvc.listar().subscribe(p => this.productos = p);

    // ¿edición?
   const id = +this.route.snapshot.params['id'];
if (id) {
  this.isEdit = true;
  this.pedidoId = id;
  this.pedSvc.obtenerPedido(id).subscribe(p => {
    const cli = this.clientes.find(c => c.id === p.clienteId)!;
    this.form.patchValue({
      cliente: cli,
      clienteInput: `${cli.nit} – ${cli.nombre}`
    });
    p.items.forEach(i => this.addItem(i.productoCodigo.toString(), i.cantidad));
  });
}
  }

  get items() {
    return this.form.get('items') as FormArray;
  }

  // Autocomplete clientes
// 1) Filtrar clientes a cada input:
filtrarClientes(term: string) {
  const t = term.toLowerCase();
  this.clientesFiltrados = this.clientes.filter(c =>
    (c.nit ? c.nit.toLowerCase().includes(t) : false) ||
    (c.nombre ? c.nombre.toLowerCase().includes(t) : false)
  );
}
onClienteSelected(cli: Cliente) {
  // Control cliente: guardamos el objeto
  this.form.get('cliente')!.setValue(cli);
  // Control clienteInput: ponemos la etiqueta que queremos ver
  this.form.get('clienteInput')!.setValue(`${cli.nit} – ${cli.nombre}`);
  // opcional: vaciar la lista filtrada
  this.clientesFiltrados = [];
}



getCantidadControl(i: number): FormControl {
  return this.items.controls[i].get('cantidad') as FormControl;
}

  // Autocomplete productos
  filtrarProductos(term: string) {
    const t = term.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.codigo.toString().toLowerCase().includes(t) ||
      p.nombre.toLowerCase().includes(t)
    );
  }
 onProductoSelected(prod: Producto) {
  this.addItem(prod.codigo.toString(), 1);
  this.productoSearch = '';           // limpia el input
  this.productosFiltrados = [];       // cierra el panel
}

  clearProductoSearch() {
    this.productoSearch = '';
    this.productosFiltrados = [];
    
  }

  // ítems
  addItem(codigo: string, qty: number) {
    const group = this.fb.group({
      productoCodigo: [codigo, Validators.required],
      cantidad:        [qty, [Validators.required, Validators.min(1)]]
    });
    this.items.push(group);
  }
  removeItem(i: number) {
    this.items.removeAt(i);
  }
  increaseQty(i: number) {
    const ctrl = this.items.at(i).get('cantidad')!;
    ctrl.setValue(ctrl.value + 1);
  }
  decreaseQty(i: number) {
    const ctrl = this.items.at(i).get('cantidad')!;
    if (ctrl.value > 1) ctrl.setValue(ctrl.value - 1);
  }

  getProducto(i: number) {
    const code = this.items.at(i).get('productoCodigo')!.value;
    return this.productos.find(p => p.codigo === code);
  }

  getSubtotal(i: number) {
    const p = this.getProducto(i);
    const qty = this.items.at(i).get('cantidad')!.value;
    return (p?.precioUnitario || 0) * qty;
  }

  get total() {
    return this.items.controls
      .map((_, i) => this.getSubtotal(i))
      .reduce((a, b) => a + b, 0);
  }
  get totalConIva() {
    return this.total * 1.19;  // si IVA es 19%
  }

  // envío
  save() {
    if (this.form.invalid || this.items.length === 0) return;

   const dto = {
  clienteId: (this.form.value.cliente as Cliente).id!,
  items: this.items.value.map((it: any) => ({
    productoCodigo: it.productoCodigo,
    cantidad: it.cantidad
  }))
};

const obs = this.isEdit
  ? this.pedSvc.actualizar(this.pedidoId!, dto)
  : this.pedSvc.crear(dto);

(obs as any).subscribe(() => this.router.navigate(['/pedidos']));
  }
}
