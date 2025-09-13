import { Rol } from '../model/rol.model';



export interface RegistroRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: Rol;
}