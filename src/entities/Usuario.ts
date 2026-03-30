import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from './Rol';

@Entity('Usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid', { name: 'id_usuario' })
  id_usuario!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  correo!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'int', default: 0 })
  intentos_fallidos!: number;

  @Column({ type: 'timestamp', nullable: true })
  bloqueado_hasta?: Date;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol' })
  rol!: Rol;

  @Column({ type: 'uuid' })
  id_rol!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion!: Date;
}
