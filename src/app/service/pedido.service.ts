// src/app/services/pedido.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Pedido, PedidoRequest } from '../model/pedido.model';
import { CarritoItem, } from '../model/carrito.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private base = 'http://localhost:8080/api/pedidos';
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.base);
  }
  crear(dto: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.base, dto);
  }
  actualizar(id: number, dto: PedidoRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, dto);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  /** ← Aquí el endpoint para obtener un pedido por su id */
  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.base}/${id}`);
  }

    // Carrito en memoria:
  agregarAlCarrito(item: CarritoItem) {
    const lista = [...this.carritoSubject.value];
    const i = lista.findIndex(x => x.productoCodigo === item.productoCodigo);
    if (i >= 0) lista[i].cantidad += item.cantidad;
    else       lista.push({ ...item });
    this.carritoSubject.next(lista);
  }
  vaciarCarrito() {
    this.carritoSubject.next([]);
  }
  crearDesdeCarrito(clienteId: number): Observable<Pedido> {
    const dto: PedidoRequest = {
      clienteId,
      items: this.carritoSubject.value.map(i => ({
        productoCodigo: Number(i.productoCodigo),
        cantidad: i.cantidad
      }))
    };
    return this.http.post<Pedido>(this.base, dto)
      .pipe(tap(() => this.vaciarCarrito()));
  }

}


