// src/app/services/producto.service.ts (o donde lo tengas)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// ¡Importante! Importamos los nuevos modelos que acabamos de crear.
import { Producto, Page } from '../model/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  // Este es el nuevo método que reemplaza a tu antiguo `listar()`
buscarProductos(filtros: any, page: number, size: number): Observable<Page<Producto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Ahora enviamos un solo "termino" si existe
    if (filtros.termino) {
      params = params.set('termino', filtros.termino);
    }
    if (filtros.categoriaId) {
      params = params.set('categoriaId', filtros.categoriaId.toString());
    }
    return this.http.get<Page<Producto>>(this.apiUrl, { params });
}
}