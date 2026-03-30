import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './Usuario';

@Entity('recuperacion_password')
export class RecuperacionPassword {
  @PrimaryGeneratedColumn({ name: 'id_token' })
  id_token!: number;

  @Column({ type: 'uuid', name: 'id_usuario' })
  id_usuario!: string;

  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'timestamp' })
  fecha_expiracion!: Date;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
