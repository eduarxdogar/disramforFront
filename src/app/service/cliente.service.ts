import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../model/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  /** Trae todos los clientes */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  /** Trae un cliente por su ID */
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  /** Crear un nuevo cliente */
  agregarCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }

  /** Actualizar un cliente existente */
  actualizarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }

  /** Eliminar un cliente */
  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Buscar un cliente exacto por NIT */
  buscarPorNit(nit: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/nit/${nit}`);
  }

  /** Búsqueda parcial por NIT o nombre */
  buscar(term: string): Observable<Cliente[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Cliente[]>(`${this.baseUrl}/search`, { params });
  }
}
