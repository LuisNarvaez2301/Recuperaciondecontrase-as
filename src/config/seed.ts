import { AppDataSource } from './database';
import { Rol } from '../entities/Rol';
import { ConfiguracionSistema } from '../entities/ConfiguracionSistema';

export const seedInitialData = async () => {
  console.log('🌱 Verificando datos maestros iniciales...');

  // 1. Verificar e insertar roles
  const rolRepo = AppDataSource.getRepository(Rol);
  const rolesCount = await rolRepo.count();
  
  if (rolesCount === 0) {
    console.log('⚠️ Tabla "Rol" vacía. Insertando roles por defecto...');
    const rolesToInsert = [
      { nombre_rol: 'ADMINISTRADOR', descripcion: 'Gestión total del sistema, moderación y analítica.' },
      { nombre_rol: 'ALBERGUE', descripcion: 'Entidad encargada de publicar mascotas y gestionar adopciones.' },
      { nombre_rol: 'ADOPTANTE', descripcion: 'Usuario interesado en buscar y adoptar mascotas.' }
    ];
    await rolRepo.save(rolesToInsert);
    console.log('✅ Roles insertados.');
  }

  // 2. Verificar e insertar Configuración de Sistema
  const configRepo = AppDataSource.getRepository(ConfiguracionSistema);
  const configCount = await configRepo.count();

  if (configCount === 0) {
    console.log('⚠️ Tabla "Configuracion_Sistema" vacía. Insertando configuración por defecto...');
    const configToInsert = [
      { clave: 'intentos_max_login', valor: '5', grupo: 'SEGURIDAD', es_critico: true },
      { clave: 'tiempo_bloqueo_minutos', valor: '15', grupo: 'SEGURIDAD', es_critico: true },
      { clave: 'umbral_match_minimo', valor: '40', grupo: 'MATCHING', es_critico: false },
      { clave: 'version_terminos', valor: '1.0', grupo: 'LEGAL', es_critico: true },
      { clave: 'max_fotos_mascota', valor: '6', grupo: 'NEGOCIO', es_critico: false }
    ];
    await configRepo.save(configToInsert);
    console.log('✅ Configuración del sistema insertada.');
  }

  console.log('✅ Verificación de datos maestros finalizada.');
};
