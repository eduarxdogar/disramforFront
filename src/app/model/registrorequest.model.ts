import { Rol } from '../model/rol.model';



export interface RegistroRequest {
  username: string;
  email: string;
  password: string;
  rol: Rol;
}