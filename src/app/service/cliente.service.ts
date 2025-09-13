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

  listarClientes(page: number, size: number, term: string = ''): Observable<Page<Cliente>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('term', term);
    
    return this.http.get<Page<Cliente>>(this.baseUrl, { params });
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  agregarCliente(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }

  agregarClienteComoAsesor(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/asesor`, cliente);
  }
  
  actualizarCliente(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }

  // --- ¡NUEVO MÉTODO PARA ACTUALIZAR COMO ASESOR! ---
  actualizarClienteComoAsesor(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/asesor/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
