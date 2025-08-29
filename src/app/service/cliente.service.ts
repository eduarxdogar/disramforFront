// Archivo: src/app/service/cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteRequest, Page } from '../model/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  /** Trae los clientes de forma paginada y con un término de búsqueda */
  getClientes(page: number, size: number, term: string = ''): Observable<Page<Cliente>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('term', term);
    
    return this.http.get<Page<Cliente>>(this.baseUrl, { params });
  }

  /** Trae un cliente por su ID */
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  /** Crear un nuevo cliente */
  agregarCliente(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }

  /** Actualizar un cliente existente */
  actualizarCliente(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }

  /** Eliminar un cliente */
  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Búsqueda parcial por NIT o nombre */
  buscar(term: string): Observable<Cliente[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Cliente[]>(`${this.baseUrl}/search`, { params });
  }
}
