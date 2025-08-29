import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../service/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteRequest } from '../../model/cliente.model';



import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
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
    MatListModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  form;
  isEdit = false;
  clienteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: ClienteService,
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
      nit: dto.nit || undefined,
      nombre: dto.nombre || undefined,
      direccion: dto.direccion || undefined,
      ciudad: dto.ciudad || undefined,
      telefono: dto.telefono || undefined,
      email: dto.email || undefined,
    };

    const operation = this.isEdit && this.clienteId
      ? this.svc.actualizarCliente(this.clienteId, clienteRequest)
      : this.svc.agregarCliente(clienteRequest);

    operation.subscribe({
      next: () => {
        const successMessage = this.isEdit ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.';
        this.snackBar.open(successMessage, 'OK', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.snackBar.open('Ocurrió un error al guardar el cliente.', 'Cerrar', { duration: 3000 });
        console.error(err);
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
      // Si no hay cambios, simplemente navega hacia atrás.
      this.router.navigate(['/clientes']);
    }
  }

}
