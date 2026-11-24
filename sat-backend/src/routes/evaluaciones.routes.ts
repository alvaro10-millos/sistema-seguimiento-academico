import { Router } from 'express';
import { 
  obtenerEvaluaciones, 
  obtenerEvaluacionPorId, 
  crearEvaluacion, 
  actualizarEvaluacion,
  eliminarEvaluacion 
} from '../controllers/evaluaciones.controller';
import { validarEvaluacion } from '../middlewares/evalValidation';

const router = Router();

/**
 * @openapi
 * /evaluaciones:
 *   get:
 *     summary: Obtener todas las evaluaciones
 *     responses:
 *       200:
 *         description: Lista de evaluaciones obtenida exitosamente.
 *   post:
 *     summary: Registrar una nueva evaluación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *               asignatura:
 *                 type: string
 *               nota:
 *                 type: number
 *               retroalimentacion_evidencia:
 *                 type: string
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente.
 */
router.get('/evaluaciones', obtenerEvaluaciones);
router.post('/evaluaciones', validarEvaluacion, crearEvaluacion);

/**
 * @openapi
 * /evaluaciones/{id}:
 *   get:
 *     summary: Obtener una evaluación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la evaluación.
 *   put:
 *     summary: Actualizar una evaluación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *               asignatura:
 *                 type: string
 *               nota:
 *                 type: number
 *               retroalimentacion_evidencia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evaluación actualizada exitosamente.
 *   delete:
 *     summary: Eliminar una evaluación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evaluación eliminada exitosamente.
 */
router.get('/evaluaciones/:id', obtenerEvaluacionPorId);
router.put('/evaluaciones/:id', validarEvaluacion, actualizarEvaluacion);
router.delete('/evaluaciones/:id', eliminarEvaluacion);

export default router;