import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteRequest, Page } from '../model/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clientes`;

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

  /**
   * Smart Service Method:
   * Encapsula la lógica de decisión basada en el rol.
   * Si es edición (id existente), usa PUT. Si es creación, usa POST.
   */
  saveCliente(cliente: ClienteRequest, role: string | null, id?: number): Observable<Cliente> {
    const isEdit = !!id;

    if (isEdit) {
      if (role === 'ASESOR') {
         return this.actualizarClienteComoAsesor(id!, cliente);
      } else {
         return this.actualizarCliente(id!, cliente);
      }
    } else {
      if (role === 'ASESOR') {
        return this.agregarClienteComoAsesor(cliente);
      } else {
        return this.agregarCliente(cliente);
      }
    }
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

  actualizarClienteComoAsesor(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/asesor/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
