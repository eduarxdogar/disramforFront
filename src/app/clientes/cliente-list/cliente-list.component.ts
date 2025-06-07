// cliente-list.component.ts
import { Component, OnInit }       from '@angular/core';
import { ClienteService }          from '../../service/cliente.service';
import { Cliente, ClienteRequest }         from '../../model/cliente.model';
import { MatTableModule }          from '@angular/material/table';
import { MatButtonModule }         from '@angular/material/button';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatCardModule }           from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FormsModule }             from '@angular/forms';
import { RouterModule }            from '@angular/router';
import { CommonModule }            from '@angular/common';

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
    MatIcon
  ],
  templateUrl: './cliente-list.component.html'
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  term = '';

  constructor(private svc: ClienteService) {}

  ngOnInit(){
    this.svc.getClientes()
      .subscribe(list => {
        this.clientes = list;
        this.clientesFiltrados = [...list];
      });
  }

  filtrar(){
    const t = this.term.toLowerCase().trim();
    this.clientesFiltrados = this.clientes.filter(c =>
      (c.nit || '').toLowerCase().includes(t) ||
      (c.nombre ? c.nombre.toLowerCase() : '').includes(t)
    );
  }

  eliminar(id: number){
    if(!confirm('¿Eliminar este cliente?')) return;
    this.svc.eliminarCliente(id)
      .subscribe(() => {
        this.clientes = this.clientes.filter(c=> c.id!==id);
        this.filtrar();
      });
  }
}
