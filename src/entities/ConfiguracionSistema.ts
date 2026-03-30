import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('Configuracion_Sistema')
export class ConfiguracionSistema {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  clave!: string;

  @Column({ type: 'varchar', length: 255 })
  valor!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo?: string;

  @Column({ type: 'boolean', default: false })
  es_critico!: boolean;
}
