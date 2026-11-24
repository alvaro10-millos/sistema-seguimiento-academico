import { Request, Response, NextFunction } from 'express';

export const validarEvaluacion = (req: Request, res: Response, next: NextFunction) => {
  const { nota, retroalimentacion_evidencia } = req.body;

  // 1. Validar que la nota sea un número y esté en el rango de 1.0 a 5.0
  if (typeof nota !== 'number' || nota < 1.0 || nota > 5.0) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'La calificación debe ser un valor numérico entre 1.0 y 5.0.'
    });
  }

  // 2. REGLA DE NEGOCIO SAT: Si la nota es menor a 3.0, la retroalimentación es OBLIGATORIA
  if (nota < 3.0 && (!retroalimentacion_evidencia || retroalimentacion_evidencia.trim() === '')) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'ACCION BLOQUEADA: Para calificaciones inferiores a 3.0 es OBLIGATORIO ingresar la retroalimentación y evidencia pedagógica.'
    });
  }

  // Si pasa las validaciones, continúa con el proceso
  next();
};