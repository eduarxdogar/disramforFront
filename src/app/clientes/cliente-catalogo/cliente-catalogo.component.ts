import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatListModule }      from '@angular/material/list';
import { MatCardModule }      from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

import { ClienteService }     from '../../service/cliente.service';
import { ClienteRequest }    from '../../model/cliente.model';

@Component({
  selector: 'app-cliente-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatIcon
  ],
  templateUrl: './cliente-catalogo.component.html',
  styleUrls: ['./cliente-catalogo.component.css']
})
export class ClienteCatalogoComponent implements OnInit {
  private svc = inject(ClienteService);

  clientes: ClienteRequest[] = [];
  filtro = '';

  ngOnInit() {
    this.svc.getClientes(0, 100, '').subscribe(page => this.clientes = page.content);
  }

  clientesFiltrados(): ClienteRequest[] {
    const term = this.filtro.toLowerCase().trim();
    if (!term) return this.clientes;
    return this.clientes.filter(c =>
      (c.nit?.toLowerCase().includes(term) ?? false) ||
      (c.nombre?.toLowerCase().includes(term) ?? false)
    );
  }
    seleccionar(c: any) {
    // Podrías guardar el cliente en el carrito o en el formulario de pedido
    console.log('Cliente seleccionado:', c);
  }
}
