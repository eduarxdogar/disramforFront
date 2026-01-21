import { Component, OnInit, Input, numberAttribute, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

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
  // Dependencies using inject()
  private fb = inject(FormBuilder);
  private svc = inject(ClienteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Router Input Binding
  @Input({ transform: numberAttribute }) id?: number;

  form: FormGroup;
  isEdit = false;
  userRole: string | null = null;

  constructor(){
    this.form = this.fb.group({
      nit: ['', Validators.required],
      nombre: ['', Validators.required],
      direccion: [''],
      ciudad: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      // Mantenemos el campo oculto si es necesario para lógica interna, 
      // aunque idealmente esto vendría del modelo si se usa.
      asesorId: [''] 
    });
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    
    // Si tenemos ID gracias al Router Input binding
    if (this.id) {
      this.isEdit = true;
      this.svc.getCliente(this.id).subscribe(c => this.form.patchValue(c));
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
      asesorId: dto.asesorId // Pasamos asesorId si existe en el formulario (admin case)
    };

    // Delegamos la lógica "sucia" de roles al servicio (Smart Service)
    this.svc.saveCliente(clienteRequest, this.userRole, this.id).subscribe({
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
