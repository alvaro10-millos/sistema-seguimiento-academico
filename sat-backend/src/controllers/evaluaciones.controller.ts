import { Request, Response } from 'express';
import { pool } from '../config/db';

// 1. Obtener todas las evaluaciones
export const obtenerEvaluaciones = async (req: Request, res: Response) => {
  try {
    const resultado = await pool.query('SELECT * FROM evaluaciones ORDER BY fecha_registro DESC;');
    return res.status(200).json({
      status: 'success',
      total_registros: resultado.rowCount,
      datos: resultado.rows
    });
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor al consultar las evaluaciones.'
    });
  }
};

// 2. Obtener una evaluación por ID
export const obtenerEvaluacionPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM evaluaciones WHERE id = $1;', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró ninguna evaluación con el ID ${id}.`
      });
    }

    return res.status(200).json({
      status: 'success',
      datos: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al consultar evaluación por ID:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor al obtener la evaluación.'
    });
  }
};

// 3. Crear una nueva evaluación
export const crearEvaluacion = async (req: Request, res: Response) => {
  const { id_estudiante, asignatura, nota, retroalimentacion_evidencia } = req.body;

  let semaforo = '🟢 VERDE (Aprobado / Desempeño Alto)';
  if (nota < 3.0) {
    semaforo = '🔴 ROJO (Alerta Crítica / Reprobado)';
  } else if (nota < 4.5) {
    semaforo = '🟡 AMARILLO (Desempeño Básico)';
  }

  const retroalimentacionFinal = retroalimentacion_evidencia || 'Sin observaciones requeridas.';

  try {
    const query = `
      INSERT INTO evaluaciones (id_estudiante, asignatura, nota, retroalimentacion_evidencia, semaforo_asignado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id_estudiante, asignatura, nota, retroalimentacionFinal, semaforo];

    const resultado = await pool.query(query, values);

    return res.status(201).json({
      status: 'success',
      mensaje: 'Calificación registrada y guardada exitosamente en la base de datos.',
      datos_guardados: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar en la base de datos:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor al procesar el registro.'
    });
  }
};

// 4. Actualizar una evaluación existente por ID
export const actualizarEvaluacion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id_estudiante, asignatura, nota, retroalimentacion_evidencia } = req.body;

  let semaforo = '🟢 VERDE (Aprobado / Desempeño Alto)';
  if (nota < 3.0) {
    semaforo = '🔴 ROJO (Alerta Crítica / Reprobado)';
  } else if (nota < 4.5) {
    semaforo = '🟡 AMARILLO (Desempeño Básico)';
  }

  const retroalimentacionFinal = retroalimentacion_evidencia || 'Sin observaciones requeridas.';

  try {
    const query = `
      UPDATE evaluaciones
      SET id_estudiante = $1,
          asignatura = $2,
          nota = $3,
          retroalimentacion_evidencia = $4,
          semaforo_asignado = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [id_estudiante, asignatura, nota, retroalimentacionFinal, semaforo, id];

    const resultado = await pool.query(query, values);

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la evaluación con ID ${id} para actualizar.`
      });
    }

    return res.status(200).json({
      status: 'success',
      mensaje: `Evaluación con ID ${id} actualizada exitosamente.`,
      datos_actualizados: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar la evaluación:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor al actualizar la evaluación.'
    });
  }
};

// 5. Eliminar una evaluación por ID
export const eliminarEvaluacion = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('DELETE FROM evaluaciones WHERE id = $1 RETURNING *;', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la evaluación con ID ${id} para eliminar.`
      });
    }

    return res.status(200).json({
      status: 'success',
      mensaje: `Evaluación con ID ${id} eliminada correctamente de la base de datos.`,
      registro_eliminado: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor al intentar eliminar la evaluación.'
    });
  }
};