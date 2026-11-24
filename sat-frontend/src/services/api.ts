export interface Evaluacion {
  id?: number;
  id_estudiante: number | string;
  asignatura: string;
  nota: number | string;
  retroalimentacion_evidencia?: string;
  semaforo_asignado?: string;
  // Nuevos campos para fechas de entrega y alertas preventivas
  fecha_entrega?: string;
  tipo_actividad?: 'Tarea' | 'Quiz' | 'Evaluación' | 'Taller';
  estado_entrega?: 'Pendiente' | 'Entregado' | 'Vencido';
}

const API_BASE_URL = 'http://localhost:3000/api';

// Obtener todas las evaluaciones
export const obtenerEvaluaciones = async (): Promise<Evaluacion[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones`);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend no disponible. Utilizando servidor de respaldos local.');
    const loc = localStorage.getItem('sat_evaluaciones_bd');
    if (loc) return JSON.parse(loc);
    
    // Datos iniciales de prueba con fechas de entrega
    const iniciales: Evaluacion[] = [
      { id: 1, id_estudiante: '11001', asignatura: 'Matemáticas', nota: 4.2, semaforo_asignado: '🟡 AMARILLO', retroalimentacion_evidencia: 'Buen desempeño en álgebra.', fecha_entrega: '2026-10-15', tipo_actividad: 'Evaluación', estado_entrega: 'Entregado' },
      { id: 2, id_estudiante: '11001', asignatura: 'Español', nota: 2.5, semaforo_asignado: '🔴 ROJO', retroalimentacion_evidencia: 'No presentó la comprensión de lectura.', fecha_entrega: '2026-10-05', tipo_actividad: 'Tarea', estado_entrega: 'Vencido' },
      { id: 3, id_estudiante: '11002', asignatura: 'Ciencias', nota: 4.8, semaforo_asignado: '🟢 VERDE', retroalimentacion_evidencia: 'Excelente proyecto de laboratorio.', fecha_entrega: '2026-10-20', tipo_actividad: 'Taller', estado_entrega: 'Pendiente' },
    ];
    localStorage.setItem('sat_evaluaciones_bd', JSON.stringify(iniciales));
    return iniciales;
  }
};

// Crear nueva evaluación con fecha
export const crearEvaluacion = async (evaluacion: Evaluacion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluacion)
    });
    return await response.json();
  } catch (error) {
    const loc = localStorage.getItem('sat_evaluaciones_bd');
    const lista: Evaluacion[] = loc ? JSON.parse(loc) : [];
    
    // Lógica del semáforo en frontend si no hay backend
    const numNota = Number(evaluacion.nota);
    let semaforo = '🟢 VERDE';
    if (numNota < 3.0) semaforo = '🔴 ROJO';
    else if (numNota < 4.5) semaforo = '🟡 AMARILLO';

    const nueva = { 
      ...evaluacion, 
      id: Date.now(), 
      semaforo_asignado: semaforo,
      estado_entrega: evaluacion.estado_entrega || 'Pendiente'
    };
    lista.push(nueva);
    localStorage.setItem('sat_evaluaciones_bd', JSON.stringify(lista));
    return { status: 'success', mensaje: 'Evaluación registrada en modo local.', data: nueva };
  }
};

// Actualizar evaluación
export const actualizarEvaluacion = async (id: number, evaluacion: Evaluacion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluacion)
    });
    return await response.json();
  } catch (error) {
    const loc = localStorage.getItem('sat_evaluaciones_bd');
    let lista: Evaluacion[] = loc ? JSON.parse(loc) : [];
    
    const numNota = Number(evaluacion.nota);
    let semaforo = '🟢 VERDE';
    if (numNota < 3.0) semaforo = '🔴 ROJO';
    else if (numNota < 4.5) semaforo = '🟡 AMARILLO';

    lista = lista.map(item => item.id === id ? { ...evaluacion, id, semaforo_asignado: semaforo } : item);
    localStorage.setItem('sat_evaluaciones_bd', JSON.stringify(lista));
    return { status: 'success', mensaje: 'Evaluación actualizada localmente.' };
  }
};

// Eliminar evaluación
export const eliminarEvaluacion = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones/${id}`, { method: 'DELETE' });
    return await response.json();
  } catch (error) {
    const loc = localStorage.getItem('sat_evaluaciones_bd');
    let lista: Evaluacion[] = loc ? JSON.parse(loc) : [];
    lista = lista.filter(item => item.id !== id);
    localStorage.setItem('sat_evaluaciones_bd', JSON.stringify(lista));
    return { status: 'success', mensaje: 'Evaluación eliminada localmente.' };
  }
};
