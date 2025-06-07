import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../model/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private base = 'http://localhost:8080/api/productos';
  constructor(private http: HttpClient) {}
  listar(): Observable<Producto[]> { return this.http.get<Producto[]>(this.base); }
}