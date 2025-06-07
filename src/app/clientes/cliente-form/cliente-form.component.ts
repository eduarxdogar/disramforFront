import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../service/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';


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
    ReactiveFormsModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  form;
  isEdit = false;
  constructor(
    private fb: FormBuilder,
    private svc: ClienteService,
    private route: ActivatedRoute,
    private router: Router
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

  ngOnInit(){
    const id = this.route.snapshot.params['id'];
    if(id){
      this.isEdit = true;
      this.svc.getCliente(+id).subscribe(c=> this.form.patchValue(c));
    }
  }

  save(){
    const dto = this.form.value;
    const cliente = {
      nit: dto.nit ? dto.nit : undefined,
      nombre: dto.nombre ? dto.nombre : undefined,
      direccion: dto.direccion ? dto.direccion : undefined,
      ciudad: dto.ciudad ? dto.ciudad : undefined,
      telefono: dto.telefono ? dto.telefono : undefined,
      email: dto.email ? dto.email : undefined,
    };
    (this.isEdit
      ? this.svc.actualizarCliente(+this.route.snapshot.params['id'], cliente)
      : this.svc.agregarCliente(cliente)
    ).subscribe(()=> this.router.navigate(['/clientes']));
  }
}
