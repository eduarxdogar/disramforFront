import { Component, inject, OnInit } from '@angular/core';
import { PedidoRequest } from '../../model/pedido.model';
import { PedidoService } from '../../service/pedido.service';
import { CommonModule }               from '@angular/common';
import { MatTableModule }             from '@angular/material/table';
import { MatButtonModule }            from '@angular/material/button';
import { MatIconModule }              from '@angular/material/icon';
import { Router }                     from '@angular/router';

@Component({
  selector: 'app-pedido-list',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.css'
})
export class PedidoListComponent implements OnInit {
  pedidos: PedidoRequest[] = [];
  
  constructor(public router: Router, private svc: PedidoService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.listar().subscribe(p => this.pedidos = p);
  }

  nuevo() {
    this.router.navigate(['/pedidos/new']);
  }
  ver(id: number) {
    this.router.navigate(['/orden', id]);
  }
  borrar(id: number) {
    this.svc.eliminar(id).subscribe(() => this.load());
  }
}
