import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import { seedInitialData } from './config/seed';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middlewares Globales
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// Documentación Swagger
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// Rutas
// ============================================
app.use('/auth', authRoutes);

// Ruta de salud
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// Inicialización
// ============================================
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Ejecutar semilla de datos maestros
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📄 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  });

export default app;
