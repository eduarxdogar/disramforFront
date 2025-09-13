import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

// Tus modelos y servicios
import { Cliente, ClienteRequest } from '../../model/cliente.model';
import { ClienteService } from '../../service/cliente.service';
import { AuthService } from '../../service/auth.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  clienteId: number | null = null;
  userRole: string | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: ClienteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ){
    this.form = this.fb.group({
      nit: ['', Validators.required],
      nombre: ['', Validators.required],
      direccion: [''],
      ciudad: [''],
      telefono: [''],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.clienteId = +id;
      this.svc.getCliente(this.clienteId).subscribe(c => this.form.patchValue(c));
    }
  }

  save() {
    if (this.form.invalid) {
      this.snackBar.open('Por favor, revisa los campos del formulario.', 'Cerrar', { duration: 3000 });
      return;
    }

    const confirmationMessage = this.isEdit
      ? '¿Confirmas la actualización de este cliente?'
      : '¿Confirmas la creación de este nuevo cliente?';
    
    const snackBarRef = this.snackBar.open(confirmationMessage, 'Confirmar', { duration: 5000 });

    snackBarRef.onAction().subscribe(() => {
      this.proceedToSave();
    });
  }

  private proceedToSave() {
    const dto = this.form.value;
    const clienteRequest: ClienteRequest = {
      nit: dto.nit,
      nombre: dto.nombre,
      direccion: dto.direccion,
      ciudad: dto.ciudad,
      telefono: dto.telefono,
      email: dto.email,
    };

    let operation: Observable<Cliente>;

    if (this.isEdit && this.clienteId) {
      // --- LÓGICA DE ROLES PARA ACTUALIZAR ---
      if (this.userRole === 'ASESOR') {
        console.log(`Rol ASESOR. Actualizando cliente ${this.clienteId} por endpoint de asesor.`);
        operation = this.svc.actualizarClienteComoAsesor(this.clienteId, clienteRequest);
      } else {
        console.log(`Rol ADMIN. Actualizando cliente ${this.clienteId} por endpoint de admin.`);
        // Para que esto funcione, el admin necesita poder setear el asesorId.
        // Por ahora, asumimos que no se cambia y lo enviamos si existe.
        const originalCliente = this.form.getRawValue(); // Podríamos necesitar el asesorId original
        clienteRequest.asesorId = originalCliente.asesorId;
        operation = this.svc.actualizarCliente(this.clienteId, clienteRequest);
      }
    } else {
      // Lógica de creación (ya funcional)
      if (this.userRole === 'ASESOR') {
        console.log("Rol ASESOR. Creando cliente por endpoint de asesor.");
        operation = this.svc.agregarClienteComoAsesor(clienteRequest);
      } else {
        console.log("Rol ADMIN. Creando cliente por endpoint de admin.");
        // Aquí se necesitaría un campo en el form para asignar asesorId
        operation = this.svc.agregarCliente(clienteRequest);
      }
    }

    operation.subscribe({
      next: () => {
        const successMessage = this.isEdit ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.';
        this.snackBar.open(successMessage, 'OK', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Ocurrió un error al guardar el cliente.';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 4000 });
        console.error('Error al guardar:', err);
      }
    });
  }

  cancel() {
    if (this.form.dirty) {
      const snackBarRef = this.snackBar.open('Los cambios no guardados se perderán. ¿Desea continuar?', 'Sí, Cancelar', {
        duration: 5000,
      });

      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/clientes']);
      });
    } else {
      this.router.navigate(['/clientes']);
    }
  }
}
