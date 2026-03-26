// src/app/services/pedido.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {  PedidoRequest,PedidoDetallado } from '../model/pedido.model';
import { PedidoResumen } from '../model/pedido.model';
import { Page } from '../model/producto.model';
import { EstadoPedido } from '../model/estado-pedido.model'; 


import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pedidos`;


   actualizarPedido(id: number, pedido: PedidoRequest): Observable<any> {
    return this.http.put(`${this.base}/${id}`, pedido);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  crearPedido(pedido: PedidoRequest): Observable<any> { // <-- Acepta el tipo correcto
    return this.http.post(this.base, pedido);
  }
  getPedidos(page: number, size: number): Observable<Page<PedidoResumen>> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('sort', 'fecha,desc');
    return this.http.get<Page<PedidoResumen>>(this.base, { params });
}

  getPedidoById(id: number): Observable<PedidoDetallado> {
        return this.http.get<PedidoDetallado>(`${this.base}/${id}`);
    }
      actualizarEstado(id: number, estado: EstadoPedido): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/estado`, { estado });
  }

}


