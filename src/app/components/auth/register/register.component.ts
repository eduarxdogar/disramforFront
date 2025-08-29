import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// Importamos la interfaz y el enum que creamos
import { RegistroRequest } from '../../../model/registrorequest.model';
import { Rol } from '../../../model/rol.model';

// Importa el servicio de autenticación
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  // El listado de roles ahora viene directamente del enum para evitar errores
  roles = Object.values(Rol);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.snackBar.open('Por favor, completa todos los campos correctamente.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;
    const userData: RegistroRequest = this.registerForm.value;
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('¡Registro exitoso! Ya puedes iniciar sesión.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/login']); // <-- Aquí está la redirección clave
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Error en el registro. Inténtalo de nuevo.', 'Cerrar', { duration: 3000 });
        console.error('Error de registro', err);
      }
    });
  }
}
