import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import DirectorioEstudiantes from './components/DirectorioEstudiantes';
import { 
  obtenerEvaluaciones, 
  crearEvaluacion, 
  actualizarEvaluacion, 
  eliminarEvaluacion, 
  type Evaluacion 
} from './services/api';
import { 
  BookOpen, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  RefreshCw,
  LogOut,
  User,
  Users,
  IdCard,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Bell,
  Eye,
  X,
  Award
} from 'lucide-react';

interface RegistroAsistencia {
  id: number;
  idEstudiante: string;
  fecha: string;
  asignatura: string;
  estado: 'Presente' | 'Excusal' | 'Inasistencia';
  observacion?: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<any>(null);

  // Navegación de vistas
  const [vistaActual, setVistaActual] = useState<'evaluaciones' | 'directorio' | 'asistencia'>('evaluaciones');
  const [estudianteSeleccionadoId, setEstudianteSeleccionadoId] = useState<string | number>('8001');

  // Control de Periodos y Trimestres (Acudiente / Alumno)
  const [trimestreActivo, setTrimestreActivo] = useState<1 | 2 | 3>(1);
  const [materiaDetalleModal, setMateriaDetalleModal] = useState<string | null>(null);

  // Objeto con la información real del estudiante consultado
  const [datosEstudianteConsultado, setDatosEstudianteConsultado] = useState<any>(null);

  // Estados de datos del SAT
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // ESTADO DE ASISTENCIAS
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(() => {
    const guardadas = localStorage.getItem('sat_asistencias_bd');
    return guardadas ? JSON.parse(guardadas) : [
      { id: 1, idEstudiante: '8001', fecha: '2026-10-10', asignatura: 'Matemáticas', estado: 'Inasistencia', observacion: 'Sin excusa presentada' },
      { id: 2, idEstudiante: '8001', fecha: '2026-10-12', asignatura: 'Español', estado: 'Inasistencia', observacion: 'Cita médica pendiente por justificar' },
      { id: 3, idEstudiante: '8001', fecha: '2026-10-14', asignatura: 'Ciencias', estado: 'Inasistencia', observacion: 'Llegada tarde sin ingreso al aula' },
      { id: 4, idEstudiante: '8001', fecha: '2026-10-15', asignatura: 'Matemáticas', estado: 'Presente', observacion: 'Asistencia puntual' }
    ];
  });

  // Formulario Asistencia (Docente)
  const [asistenciaIdEstudiante, setAsistenciaIdEstudiante] = useState<string>('8001');
  const [asistenciaFecha, setAsistenciaFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [asistenciaMateria, setAsistenciaMateria] = useState<string>('Matemáticas');
  const [asistenciaEstado, setAsistenciaEstado] = useState<'Presente' | 'Excusal' | 'Inasistencia'>('Inasistencia');
  const [asistenciaObservacion, setAsistenciaObservacion] = useState<string>('');

  // Estado del formulario Evaluaciones (Docente)
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [idEstudiante, setIdEstudiante] = useState<string>('8001');
  const [asignatura, setAsignatura] = useState<string>('Matemáticas');
  const [tipoActividad, setTipoActividad] = useState<'Tarea' | 'Quiz' | 'Evaluación' | 'Taller'>('Tarea');
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [nota, setNota] = useState<number | ''>('');
  const [retroalimentacion, setRetroalimentacion] = useState<string>('');

  // Búsqueda
  const [busqueda] = useState<string>('');

  // Guardar asistencias en LocalStorage
  useEffect(() => {
    localStorage.setItem('sat_asistencias_bd', JSON.stringify(asistencias));
  }, [asistencias]);

  // Verificar sesión
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sat_usuario');
    if (sesionGuardada) {
      try {
        const usr = JSON.parse(sesionGuardada);
        setUsuario(usr);

        const codBuscado = usr.idAlumno || usr.idAlumnoSolicitado || '8001';
        setEstudianteSeleccionadoId(codBuscado);
        buscarDatosEstudiante(codBuscado, usr);
      } catch (e) {
        localStorage.removeItem('sat_usuario');
      }
    }
  }, []);

  const buscarDatosEstudiante = (codigo: string, usuarioSesion: any) => {
    const usuariosBD = localStorage.getItem('sat_usuarios_bd');
    if (usuariosBD) {
      try {
        const listaUsuarios = JSON.parse(usuariosBD);
        const alumnoEncontrado = listaUsuarios.find(
          (u: any) => u.rol === 'alumno' && (String(u.idAlumno) === String(codigo) || String(u.numeroIdentificacion) === String(codigo))
        );

        if (alumnoEncontrado) {
          setDatosEstudianteConsultado(alumnoEncontrado);
          return;
        }
      } catch (e) {
        console.error('Error al leer la base de usuarios:', e);
      }
    }

    setDatosEstudianteConsultado({
      nombresApellidos: usuarioSesion.rol === 'alumno' ? usuarioSesion.nombresApellidos : 'Miguel Cuervo',
      idAlumno: codigo,
      numeroIdentificacion: '10011111111',
      curso: '8-A',
      rh: 'O+',
      numeroContacto: usuarioSesion.numeroContacto || '3002222222',
      docenteGrupo: 'Fernando Cepeda',
      direccionCasa: usuarioSesion.direccionCasa || 'Calle 123 #45-67',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const datos = await obtenerEvaluaciones();
      setEvaluaciones(datos);
    } catch (err: any) {
      console.error(err.message || 'Error al cargar evaluaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('sat_usuario');
    setUsuario(null);
  };

  const handleRegistrarAsistencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asistenciaIdEstudiante.trim()) {
      alert('Ingrese el código del estudiante.');
      return;
    }

    const nuevoRegistro: RegistroAsistencia = {
      id: Date.now(),
      idEstudiante: asistenciaIdEstudiante.trim(),
      fecha: asistenciaFecha,
      asignatura: asistenciaMateria.trim(),
      estado: asistenciaEstado,
      observacion: asistenciaObservacion.trim()
    };

    setAsistencias([nuevoRegistro, ...asistencias]);
    setAsistenciaObservacion('');
    alert(`✅ Registro de asistencia guardado para el código ${asistenciaIdEstudiante}.`);
  };

  if (!usuario) {
    return <Login onLoginExitoso={(usr) => {
      setUsuario(usr);
      const cod = usr.idAlumno || usr.idAlumnoSolicitado || '8001';
      setEstudianteSeleccionadoId(cod);
      buscarDatosEstudiante(cod, usr);
    }} />;
  }

  const evaluacionesFiltradas = evaluaciones.filter(e => 
    e.asignatura.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(e.id_estudiante).includes(busqueda)
  );

  const limpiarFormulario = () => {
    setIdEditando(null);
    setIdEstudiante('8001');
    setAsignatura('Matemáticas');
    setTipoActividad('Tarea');
    setFechaEntrega('');
    setNota('');
    setRetroalimentacion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numNota = Number(nota);

    if (nota === '' || isNaN(numNota) || numNota < 0 || numNota > 5) {
      alert('Por favor ingrese una nota válida entre 0.0 y 5.0.');
      return;
    }

    if (numNota < 3.0 && !retroalimentacion.trim()) {
      alert('⚠️ Para notas inferiores a 3.0 (Alerta Roja) es obligatorio detallar las observaciones pedagógicas/evidencias.');
      return;
    }

    const payload: Evaluacion = {
      id_estudiante: idEstudiante,
      asignatura,
      tipo_actividad: tipoActividad,
      fecha_entrega: fechaEntrega || new Date().toISOString().split('T')[0],
      nota: numNota,
      retroalimentacion_evidencia: retroalimentacion,
      estado_entrega: numNota >= 3.0 ? 'Entregado' : 'Vencido'
    };

    try {
      let resp;
      if (idEditando !== null) {
        resp = await actualizarEvaluacion(idEditando, payload);
      } else {
        resp = await crearEvaluacion(payload);
      }

      if (resp.status === 'success') {
        limpiarFormulario();
        cargarDatos();
      } else {
        alert(resp.mensaje || 'Error al guardar.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditar = (e: Evaluacion) => {
    if (e.id) {
      setIdEditando(e.id);
      setIdEstudiante(String(e.id_estudiante));
      setAsignatura(e.asignatura);
      setTipoActividad(e.tipo_actividad || 'Tarea');
      setFechaEntrega(e.fecha_entrega || '');
      setNota(Number(e.nota));
      setRetroalimentacion(e.retroalimentacion_evidencia || '');
    }
  };

  const handleEliminar = async (id?: number) => {
    if (!id) return;
    if (confirm(`¿Está seguro de eliminar esta evaluación?`)) {
      try {
        const resp = await eliminarEvaluacion(id);
        if (resp.status === 'success') cargarDatos();
      } catch (err: any) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const codigoEstudianteActivo = usuario.idAlumno || usuario.idAlumnoSolicitado || estudianteSeleccionadoId;
  const asistenciasEstudiante = asistencias.filter(a => String(a.idEstudiante) === String(codigoEstudianteActivo));
  const totalInasistencias = asistenciasEstudiante.filter(a => a.estado === 'Inasistencia').length;

  // MATERIAS DEL PLAN DE ESTUDIOS POR GRADO (Ej: 8-A)
  const asignaturasGrado = ['Matemáticas', 'Español', 'Ciencias', 'Sociales', 'Inglés', 'Tecnología'];

  // ESTRUCTURA DE CALIFICACIONES TRIMESTRALES PONDERADAS
  const datosTrimestralesPorMateria: Record<string, { t1: number; t2: number; t3: number; entregas: any[] }> = {
    'Matemáticas': {
      t1: 4.2, t2: 3.8, t3: 4.0,
      entregas: [
        { id: 1, actividad: 'Taller 1: Álgebra', tipo: 'Taller', fecha: '2026-02-15', nota: 4.5, retro: 'Excelente procedimiento' },
        { id: 2, actividad: 'Quiz 1: Ecuaciones', tipo: 'Quiz', fecha: '2026-03-01', nota: 4.0, retro: 'Buen manejo de signos' },
        { id: 3, actividad: 'Evaluación Parcial', tipo: 'Evaluación', fecha: '2026-03-20', nota: 3.8, retro: 'Repasar simplificación de fracciones' },
        { id: 4, actividad: 'Tarea 2: Polinomios', tipo: 'Tarea', fecha: '2026-04-05', nota: 4.5, retro: 'Entregado a tiempo' },
        { id: 5, actividad: 'Taller 2: Factorización', tipo: 'Taller', fecha: '2026-04-18', nota: 4.2, retro: 'Buen trabajo colaborativo' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-30', nota: 4.2, retro: 'Sobresaliente' }
      ]
    },
    'Español': {
      t1: 2.5, t2: 3.5, t3: 3.8,
      entregas: [
        { id: 1, actividad: 'Control de Lectura 1', tipo: 'Quiz', fecha: '2026-02-10', nota: 2.0, retro: 'No presentó la lectura asignada' },
        { id: 2, actividad: 'Taller de Ortografía', tipo: 'Taller', fecha: '2026-02-25', nota: 3.0, retro: 'Revisar tildes diacríticas' },
        { id: 3, actividad: 'Ensayo Literario', tipo: 'Tarea', fecha: '2026-03-15', nota: 2.5, retro: 'Falta coherencia argumentativa' },
        { id: 4, actividad: 'Exposición Oral', tipo: 'Evaluación', fecha: '2026-04-02', nota: 3.0, retro: 'Buen tono de voz' },
        { id: 5, actividad: 'Taller de Gramática', tipo: 'Taller', fecha: '2026-04-15', nota: 2.2, retro: 'Incompleto' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-28', nota: 2.3, retro: 'Bajo rendimiento' }
      ]
    },
    'Ciencias': {
      t1: 4.8, t2: 4.5, t3: 4.6,
      entregas: [
        { id: 1, actividad: 'Informe de Laboratorio Química', tipo: 'Taller', fecha: '2026-02-18', nota: 5.0, retro: 'Excelente informe' },
        { id: 2, actividad: 'Quiz de Células', tipo: 'Quiz', fecha: '2026-03-05', nota: 4.8, retro: 'Muy bien preparado' },
        { id: 3, actividad: 'Maqueta de Sistema Solar', tipo: 'Tarea', fecha: '2026-03-25', nota: 4.7, retro: 'Gran creatividad' },
        { id: 4, actividad: 'Evaluación de Biología', tipo: 'Evaluación', fecha: '2026-04-10', nota: 4.6, retro: 'Dominio del tema' },
        { id: 5, actividad: 'Taller Ecosistemas', tipo: 'Taller', fecha: '2026-04-22', nota: 5.0, retro: 'Felicitaciones' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-29', nota: 4.7, retro: 'Sobresaliente' }
      ]
    },
    'Sociales': {
      t1: 3.5, t2: 4.0, t3: 3.9,
      entregas: [
        { id: 1, actividad: 'Mapa Histórico', tipo: 'Tarea', fecha: '2026-02-12', nota: 3.5, retro: 'Faltaron convenciones' },
        { id: 2, actividad: 'Quiz de Geografía', tipo: 'Quiz', fecha: '2026-03-02', nota: 3.8, retro: 'Aceptable' },
        { id: 3, actividad: 'Debate de Historia', tipo: 'Evaluación', fecha: '2026-03-22', nota: 3.2, retro: 'Participación moderada' },
        { id: 4, actividad: 'Línea de Tiempo', tipo: 'Taller', fecha: '2026-04-08', nota: 3.5, retro: 'Bien estructurado' },
        { id: 5, actividad: 'Taller de Democracia', tipo: 'Taller', fecha: '2026-04-20', nota: 3.6, retro: 'Buen análisis' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-30', nota: 3.4, retro: 'Aprobado' }
      ]
    },
    'Inglés': {
      t1: 4.0, t2: 4.2, t3: 4.1,
      entregas: [
        { id: 1, actividad: 'Reading Comprehension', tipo: 'Quiz', fecha: '2026-02-14', nota: 4.2, retro: 'Good understanding' },
        { id: 2, actividad: 'Writing Essay', tipo: 'Tarea', fecha: '2026-03-04', nota: 3.8, retro: 'Check grammar' },
        { id: 3, actividad: 'Speaking Presentation', tipo: 'Evaluación', fecha: '2026-03-24', nota: 4.0, retro: 'Fluency is improving' },
        { id: 4, actividad: 'Listening Test', tipo: 'Quiz', fecha: '2026-04-06', nota: 4.0, retro: 'Good score' },
        { id: 5, actividad: 'Vocabulary Workshop', tipo: 'Taller', fecha: '2026-04-19', nota: 4.1, retro: 'Complete' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-29', nota: 3.9, retro: 'Approved' }
      ]
    },
    'Tecnología': {
      t1: 4.5, t2: 4.6, t3: 4.7,
      entregas: [
        { id: 1, actividad: 'Proyecto Scratch', tipo: 'Taller', fecha: '2026-02-20', nota: 4.5, retro: 'Gran lógica de programación' },
        { id: 2, actividad: 'Quiz Algoritmos', tipo: 'Quiz', fecha: '2026-03-08', nota: 4.6, retro: 'Muy buen nivel' },
        { id: 3, actividad: 'Diseño 3D Modelado', tipo: 'Tarea', fecha: '2026-03-28', nota: 4.4, retro: 'Creativo' },
        { id: 4, actividad: 'Circuito Electrónico', tipo: 'Evaluación', fecha: '2026-04-12', nota: 4.5, retro: 'Excelente ensamble' },
        { id: 5, actividad: 'Presentación Robótica', tipo: 'Taller', fecha: '2026-04-21', nota: 4.6, retro: 'Felicitaciones' },
        { id: 6, actividad: 'Examen Trimestral I', tipo: 'Evaluación', fecha: '2026-04-30', nota: 4.5, retro: 'Sobresaliente' }
      ]
    }
  };

  // Cálculo de Definitiva Anual Ponderada (T1 30% + T2 30% + T3 40%)
  const calcularDefinitivaAnual = (t1: number, t2: number, t3: number) => {
    return ((t1 * 0.30) + (t2 * 0.30) + (t3 * 0.40)).toFixed(2);
  };

  const promedioGeneralAnual = (
    asignaturasGrado.reduce((acc, materia) => {
      const datos = datosTrimestralesPorMateria[materia];
      const def = Number(calcularDefinitivaAnual(datos.t1, datos.t2, datos.t3));
      return acc + def;
    }, 0) / asignaturasGrado.length
  ).toFixed(2);

  const actividadesProgramadas = [
    { id: 101, asignatura: 'Matemáticas', actividad: 'Taller de Ecuaciones Lineales', fechaProgramada: '2026-10-18', tipo: 'Taller', estadoAlerta: '🟡 Próxima en 3 días' },
    { id: 102, asignatura: 'Inglés', actividad: 'Examen de Verbos Irregulares', fechaProgramada: '2026-10-20', tipo: 'Evaluación', estadoAlerta: '🔵 Programada' },
    { id: 103, asignatura: 'Ciencias', actividad: 'Informe de Laboratorio Química', fechaProgramada: '2026-10-22', tipo: 'Tarea', estadoAlerta: '🔵 Programada' }
  ];

  const esNotaReprobatoria = nota !== '' && Number(nota) < 3.0;

  const alumnoVisual = datosEstudianteConsultado || {
    nombresApellidos: 'Miguel Cuervo',
    numeroIdentificacion: '10011111111',
    curso: '8-A',
    rh: 'O+',
    numeroContacto: '3002222222',
    docenteGrupo: 'Fernando Cepeda',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Encabezado */}
      <header className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SAT Educational</h1>
            <p className="text-xs text-slate-500">Sistema de Alertas Tempranas - Control Preventivo y Asistencia</p>
          </div>
        </div>

        {/* Menú para Docentes y Coordinadores */}
        {usuario.rol !== 'alumno' && usuario.rol !== 'acudiente' && (
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setVistaActual('evaluaciones')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                vistaActual === 'evaluaciones' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              Evaluaciones
            </button>
            <button
              onClick={() => setVistaActual('asistencia')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                vistaActual === 'asistencia' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={14} />
              Asistencia
            </button>
            <button
              onClick={() => setVistaActual('directorio')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                vistaActual === 'directorio' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              Directorio Estudiantes
            </button>
          </div>
        )}

        {/* Perfil Sesión */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{usuario.nombresApellidos || usuario.email.split('@')[0]}</p>
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase">
                {usuario.rol}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={cargarDatos} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer" title="Actualizar">
              <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleCerrarSesion} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-xs cursor-pointer">
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* VISTA DIRECTA PARA EL ACUDIENTE Y EL ALUMNO */}
        {(usuario.rol === 'alumno' || usuario.rol === 'acudiente') ? (
          <div className="space-y-6">
            {/* Banner Informativo para el Acudiente */}
            {usuario.rol === 'acudiente' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Panel de Control Preventivo - Acudiente</h3>
                    <p className="text-xs text-amber-700">
                      Acudiente: <span className="font-bold">{usuario.nombresApellidos}</span> | Alumno Matriculado Código: <span className="font-bold">{codigoEstudianteActivo}</span> (Grado {alumnoVisual.curso})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ficha Principal del Alumno con Carnet Fotográfico */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  {/* Foto tipo Carnet */}
                  <div className="relative shrink-0">
                    <img
                      src={alumnoVisual.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={`Foto Carnet - ${alumnoVisual.nombresApellidos}`}
                      className="w-20 h-24 object-cover rounded-xl border-2 border-blue-600 shadow-sm bg-slate-100"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-md text-[9px] font-bold uppercase shadow-xs">
                      Carnet
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{alumnoVisual.nombresApellidos}</h2>
                    <p className="text-xs text-slate-500">
                      Ficha Institucional | Código Único: <span className="font-bold text-blue-600">{codigoEstudianteActivo}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Curso Asignado: <span className="text-blue-700 font-bold">{alumnoVisual.curso || '8-A'}</span> | RH: <span className="font-bold">{alumnoVisual.rh || 'O+'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                    Matrícula Activa
                  </span>
                </div>
              </div>

              {/* Grid de Datos Técnicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <IdCard size={12} /> Identificación
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{alumnoVisual.numeroIdentificacion || '10011111111'}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <BookOpen size={12} /> Grado / Curso
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{alumnoVisual.curso || '8-A'}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <User size={12} /> RH / Sangre
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{alumnoVisual.rh || 'O+'}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Phone size={12} /> Contacto
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{alumnoVisual.numeroContacto || '3002222222'}</p>
                </div>
              </div>

              {/* Métricas e Indicadores de Rendimiento Ponderado Anual */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-semibold uppercase">ID del Alumno</p>
                  <p className="text-2xl font-bold text-blue-800 mt-1">{codigoEstudianteActivo}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Promedio Anual (30%-30%-40%)</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{promedioGeneralAnual}</p>
                </div>
                <div className={`p-4 rounded-xl border ${totalInasistencias >= 3 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-xs uppercase font-semibold ${totalInasistencias >= 3 ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
                    Fallas Injustificadas
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-2xl font-bold ${totalInasistencias >= 3 ? 'text-red-700' : 'text-slate-800'}`}>
                      {totalInasistencias}
                    </p>
                    {totalInasistencias >= 3 && <AlertTriangle className="text-red-600 animate-pulse" size={20} />}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Docente Titular</p>
                  <p className="text-sm font-bold text-slate-800 mt-2">{alumnoVisual.docenteGrupo || 'Fernando Cepeda'}</p>
                </div>
              </div>

              {/* Alerta Temprana por Asistencia */}
              {totalInasistencias >= 3 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 space-y-0.5">
                    <p className="font-bold text-sm">⚠️ ALERTA TEMPRANA: Riesgo de Pérdida por Inasistencia</p>
                    <p>
                      El estudiante registra <span className="font-bold underline">{totalInasistencias} inasistencias injustificadas</span>. Se requiere justificación médica o académica ante coordinación.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CONSOLA EVALUATIVA POR TRIMESTRES Y PONDERACIÓN ANUAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="text-blue-600" size={20} />
                    Consola de Calificaciones por Trimestre (Grado {alumnoVisual.curso})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ponderación Anual: Trimestre 1 (30%) + Trimestre 2 (30%) + Trimestre 3 (40%) = Nota Definitiva.
                  </p>
                </div>

                {/* Pestañas de Trimestres */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTrimestreActivo(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      trimestreActivo === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1° Trim (30%)
                  </button>
                  <button
                    onClick={() => setTrimestreActivo(2)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      trimestreActivo === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2° Trim (30%)
                  </button>
                  <button
                    onClick={() => setTrimestreActivo(3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      trimestreActivo === 3 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3° Trim (40%)
                  </button>
                </div>
              </div>

              {/* TABLA RESUMEN DE ASIGNATURAS Y DEFINITIVAS PONDERADAS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3 px-2">Asignatura</th>
                      <th className="py-3 px-2 text-center">Trimestre 1 (30%)</th>
                      <th className="py-3 px-2 text-center">Trimestre 2 (30%)</th>
                      <th className="py-3 px-2 text-center">Trimestre 3 (40%)</th>
                      <th className="py-3 px-2 text-center">Definitiva Anual</th>
                      <th className="py-3 px-2 text-center">Semáforo Anual</th>
                      <th className="py-3 px-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {asignaturasGrado.map((materia) => {
                      const datos = datosTrimestralesPorMateria[materia];
                      const definitivaAnual = Number(calcularDefinitivaAnual(datos.t1, datos.t2, datos.t3));

                      const esRojoAnual = definitivaAnual < 3.0;
                      const esAmarilloAnual = definitivaAnual >= 3.0 && definitivaAnual < 4.0;

                      return (
                        <tr key={materia} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2 font-bold text-slate-900">{materia}</td>
                          <td className={`py-3 px-2 text-center font-bold ${datos.t1 < 3.0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {datos.t1.toFixed(1)}
                          </td>
                          <td className={`py-3 px-2 text-center font-bold ${datos.t2 < 3.0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {datos.t2.toFixed(1)}
                          </td>
                          <td className={`py-3 px-2 text-center font-bold ${datos.t3 < 3.0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {datos.t3.toFixed(1)}
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-blue-700 text-base">
                            {definitivaAnual.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              esRojoAnual ? 'bg-red-100 text-red-700' :
                              esAmarilloAnual ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {esRojoAnual ? '🔴 ALERTA ROJA' : esAmarilloAnual ? '🟡 REGULAR' : '🟢 APROBADO'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => setMateriaDetalleModal(materia)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              <Eye size={14} />
                              Ver 6 Entregas
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DASHBOARD PREVENTIVO: PRÓXIMAS ENTREGAS Y AGENDA ACADÉMICA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Agenda Preventiva y Próximas Entregas (Grado {alumnoVisual.curso})
              </h3>
              <p className="text-xs text-slate-500">
                Supervise las actividades programadas por los docentes para prevenir entregas fuera de tiempo y reducir alertas de bajo rendimiento.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actividadesProgramadas.map((act) => (
                  <div key={act.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        {act.asignatura}
                      </span>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        {act.estadoAlerta}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{act.actividad}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> Fecha Límite: <span className="font-bold text-slate-700">{act.fechaProgramada}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VENTANA FLOTANTE / MODAL DETALLE DE LAS 6 ENTREGAS Y RETROALIMENTACIÓN */}
            {materiaDetalleModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="text-blue-600" size={22} />
                        Desglose Evaluativo: {materiaDetalleModal}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Detalle individual de actividades, notas registradas y retroalimentación pedagógica del docente.
                      </p>
                    </div>
                    <button
                      onClick={() => setMateriaDetalleModal(null)}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* TABLA DE LAS 6 ENTREGAS DEL TRIMESTRE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="py-2.5 px-2">Actividad / Título</th>
                          <th className="py-2.5 px-2">Tipo</th>
                          <th className="py-2.5 px-2">Fecha Entrega</th>
                          <th className="py-2.5 px-2 text-center">Nota</th>
                          <th className="py-2.5 px-2">Retroalimentación / Evidencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {datosTrimestralesPorMateria[materiaDetalleModal]?.entregas.map((ent) => {
                          const esRojo = ent.nota < 3.0;
                          return (
                            <tr key={ent.id} className="hover:bg-slate-50">
                              <td className="py-3 px-2 font-bold text-slate-900">{ent.actividad}</td>
                              <td className="py-3 px-2 text-xs text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold">
                                  {ent.tipo}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-xs text-slate-500">{ent.fecha}</td>
                              <td className={`py-3 px-2 text-center font-bold text-base ${esRojo ? 'text-red-600' : 'text-slate-800'}`}>
                                {ent.nota.toFixed(1)}
                              </td>
                              <td className="py-3 px-2 text-xs text-slate-600">
                                {ent.retro || 'Sin observaciones del docente.'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setMateriaDetalleModal(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cerrar Detalle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MÓDULO VISUAL DE REGISTRO DE ASISTENCIAS PARA ALUMNO/ACUDIENTE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Historial y Registro de Asistencia
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3 px-2">Fecha</th>
                      <th className="py-3 px-2">Asignatura</th>
                      <th className="py-3 px-2">Estado</th>
                      <th className="py-3 px-2">Observación / Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {asistenciasEstudiante.length > 0 ? (
                      asistenciasEstudiante.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 px-2 text-xs font-semibold text-slate-700">{a.fecha}</td>
                          <td className="py-3 px-2 font-bold text-slate-900">{a.asignatura}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              a.estado === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                              a.estado === 'Excusal' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {a.estado === 'Presente' && <CheckCircle2 size={12} />}
                              {a.estado === 'Excusal' && <Calendar size={12} />}
                              {a.estado === 'Inasistencia' && <XCircle size={12} />}
                              {a.estado}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-slate-600">
                            {a.observacion || 'Sin observaciones.'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-xs text-slate-400">
                          No hay registros de asistencia para este estudiante.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          vistaActual === 'directorio' ? (
            <DirectorioEstudiantes onSeleccionarEstudiante={(id) => {
              setEstudianteSeleccionadoId(id);
              setVistaActual('evaluaciones');
            }} />
          ) : vistaActual === 'asistencia' ? (
            /* CONTROL DE ASISTENCIA PARA DOCENTES */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 h-fit space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} />
                  Registrar Asistencia / Falla
                </h2>

                <form onSubmit={handleRegistrarAsistencia} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Código Único Estudiante <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={asistenciaIdEstudiante} 
                      onChange={(e) => setAsistenciaIdEstudiante(e.target.value)}
                      placeholder="Ej. 8001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-blue-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Fecha <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={asistenciaFecha} 
                        onChange={(e) => setAsistenciaFecha(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Asignatura
                      </label>
                      <input 
                        type="text" 
                        required
                        value={asistenciaMateria} 
                        onChange={(e) => setAsistenciaMateria(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Estado de Asistencia <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={asistenciaEstado}
                      onChange={(e: any) => setAsistenciaEstado(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-bold"
                    >
                      <option value="Inasistencia">❌ Inasistencia (Falla Injustificada)</option>
                      <option value="Excusal">📝 Excusa Presentada</option>
                      <option value="Presente">✅ Presente en Aula</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Observación / Novedad
                    </label>
                    <textarea 
                      rows={3}
                      value={asistenciaObservacion} 
                      onChange={(e) => setAsistenciaObservacion(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Ej: Cita médica, llegada tarde..."
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm cursor-pointer transition-colors shadow-sm">
                    Guardar Registro de Asistencia
                  </button>
                </form>
              </div>

              {/* Historial Global de Asistencias para Docentes */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Historial de Control de Asistencias Registradas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-2">Código Est.</th>
                        <th className="py-3 px-2">Fecha</th>
                        <th className="py-3 px-2">Asignatura</th>
                        <th className="py-3 px-2">Estado</th>
                        <th className="py-3 px-2">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {asistencias.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 px-2 font-bold text-blue-700">{a.idEstudiante}</td>
                          <td className="py-3 px-2 text-xs text-slate-600">{a.fecha}</td>
                          <td className="py-3 px-2 font-medium">{a.asignatura}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              a.estado === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                              a.estado === 'Excusal' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {a.estado}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-slate-500">{a.observacion || 'Sin novedad'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario de Evaluación */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 h-fit">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PlusCircle className="text-blue-600" size={20} />
                  {idEditando ? 'Editar Actividad/Nota' : 'Registrar Actividad Académica'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Código Único Estudiante <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={idEstudiante} 
                      onChange={(e) => setIdEstudiante(e.target.value)}
                      placeholder="Ej. 8001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-blue-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Asignatura
                      </label>
                      <input 
                        type="text" 
                        required
                        value={asignatura} 
                        onChange={(e) => setAsignatura(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Tipo Actividad
                      </label>
                      <select
                        value={tipoActividad}
                        onChange={(e: any) => setTipoActividad(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="Tarea">Tarea</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Evaluación">Evaluación</option>
                        <option value="Taller">Taller</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Fecha Límite Entrega <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={fechaEntrega} 
                        onChange={(e) => setFechaEntrega(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                        Nota (0.0 - 5.0)
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5"
                        required
                        value={nota} 
                        onChange={(e) => setNota(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                        placeholder="Ej: 2.8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Observaciones / Retroalimentación {esNotaReprobatoria && <span className="text-red-500 font-bold">*Obligatorio</span>}
                    </label>
                    <textarea 
                      rows={3}
                      value={retroalimentacion} 
                      onChange={(e) => setRetroalimentacion(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        esNotaReprobatoria ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                      }`}
                      placeholder={esNotaReprobatoria ? "Motivo obligatorio de reprobación..." : "Observaciones..."}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm cursor-pointer">
                      {idEditando ? 'Guardar Cambios' : 'Registrar Nota'}
                    </button>
                    {idEditando && (
                      <button type="button" onClick={limpiarFormulario} className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm cursor-pointer">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Tabla General para Docentes */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Historial General de Evaluaciones Registradas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-2">Código Est.</th>
                        <th className="py-3 px-2">Asignatura</th>
                        <th className="py-3 px-2">Tipo</th>
                        <th className="py-3 px-2">Fecha Entrega</th>
                        <th className="py-3 px-2">Nota</th>
                        <th className="py-3 px-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {evaluacionesFiltradas.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="py-3 px-2 font-bold text-blue-700">{e.id_estudiante}</td>
                          <td className="py-3 px-2">{e.asignatura}</td>
                          <td className="py-3 px-2 text-xs text-slate-600">{e.tipo_actividad || 'Tarea'}</td>
                          <td className="py-3 px-2 text-xs text-slate-500">{e.fecha_entrega || '2026-10-15'}</td>
                          <td className="py-3 px-2 font-bold">{e.nota}</td>
                          <td className="py-3 px-2 text-center space-x-1">
                            <button onClick={() => handleEditar(e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer" title="Editar">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleEliminar(e.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}