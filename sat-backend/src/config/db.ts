import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('🔵 Conexión exitosa a la base de datos PostgreSQL.');
});

pool.on('error', (err) => {
  console.error('🔴 Error inesperado en la base de datos:', err);
});