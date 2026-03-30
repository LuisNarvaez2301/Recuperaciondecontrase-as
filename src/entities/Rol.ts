import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Rol')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id_rol!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre_rol!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;
}
