import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { pool } from './config/db';
import { swaggerSpec } from './config/swagger';
import evaluacionesRouter from './routes/evaluaciones.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de estado
app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 Servidor del SAT Educational activo y funcionando correctamente.',
    documentacion: `http://localhost:${PORT}/api-docs`
  });
});

// Rutas de la API
app.use('/api/v1', evaluacionesRouter);

// Inicio del servidor
app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`🟢 Servidor SAT corriendo en: http://localhost:${PORT}`);
  console.log(`📄 Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`🔵 Base de datos conectada correctamente a las: ${res.rows[0].now}`);
  } catch (err) {
    console.error('🔴 Error de conexión a PostgreSQL:', (err as Error).message);
  }
  
  console.log(`==================================================`);
});