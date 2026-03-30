import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Adopción de Mascotas - Módulo Auth',
      version: '1.0.0',
      description:
        'API para la recuperación de contraseña (HU-AUTH-03) de la plataforma de adopción de mascotas.',
      contact: {
        name: 'Equipo Backend',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/modules/auth/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
