import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAT Educational API',
      version: '1.0.0',
      description: 'Documentación de la API para el Sistema de Alertas Tempranas (SAT) Educational.'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor Local de Desarrollo'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);