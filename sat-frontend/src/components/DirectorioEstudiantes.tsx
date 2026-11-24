import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, AlertCircle, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

interface Estudiante {
  id: string | number;
  nombre: string;
  documento: string;
  grado: string;
  acudiente: string;
  telefono: string;
  promedio: number | string;
  estadoSemaforo: string;
}

// Datos por defecto de la institución
const ESTUDIANTES_BASE: Estudiante[] = [
  { id: 'ALU-1001', nombre: 'Álvaro Cuervo', documento: '1012345678', grado: '11-A', acudiente: 'María Sanabria', telefono: '3001234567', promedio: 4.2, estadoSemaforo: '🟡 Amarillo' },
  { id: 'ALU-1002', nombre: 'Camila Rodríguez', documento: '1098765432', grado: '11-A', acudiente: 'Roberto Rodríguez', telefono: '3119876543', promedio: 2.5, estadoSemaforo: '🔴 Rojo' },
  { id: 'ALU-1003', nombre: 'Mateo Gómez', documento: '1055443322', grado: '11-B', acudiente: 'Laura Gómez', telefono: '3205554433', promedio: 4.8, estadoSemaforo: '🟢 Verde' },
  { id: 'ALU-1004', nombre: 'Sofia Martínez', documento: '1077889900', grado: '10-A', acudiente: 'Carlos Martínez', telefono: '3157778899', promedio: 3.8, estadoSemaforo: '🟡 Amarillo' },
];

interface DirectorioProps {
  onSeleccionarEstudiante: (idEstudiante: string | number) => void;
}

export default function DirectorioEstudiantes({ onSeleccionarEstudiante }: DirectorioProps) {
  const [busqueda, setBusqueda] = useState('');
  const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>(ESTUDIANTES_BASE);

  useEffect(() => {
    // Leer usuarios registrados dinámicamente desde el LocalStorage
    const usuariosBD = localStorage.getItem('sat_usuarios_bd');
    if (usuariosBD) {
      try {
        const usuarios = JSON.parse(usuariosBD);
        // Filtrar solo los usuarios con rol "alumno"
        const alumnosRegistrados = usuarios
          .filter((u: any) => u.rol === 'alumno')
          .map((u: any, idx: number) => ({
            id: u.idAlumno || `ALU-${2000 + idx}`,
            nombre: u.nombresApellidos || 'Alumno Registrado',
            documento: u.numeroIdentificacion || u.documento || 'Sin doc.',
            grado: u.curso || '11-A',
            acudiente: u.nombreAcudientes || 'No asignado',
            telefono: u.contactoFamiliar || u.numeroContacto || 'Sin tel.',
            promedio: '4.0',
            estadoSemaforo: '🟢 Verde'
          }));

        // Combinar datos base con los registrados recientemente (evitando duplicados)
        const combinados = [...alumnosRegistrados, ...ESTUDIANTES_BASE];
        const unicos = combinados.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setListaEstudiantes(unicos);
      } catch (e) {
        console.error('Error al cargar lista de estudiantes:', e);
      }
    }
  }, []);

  const estudiantesFiltrados = listaEstudiantes.filter(e => 
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.documento.includes(busqueda) ||
    e.grado.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(e.id).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Directorio Institucional de Estudiantes</h2>
            <p className="text-xs text-slate-500">Consulta el estado académico de todos los alumnos registrados</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ID, documento o grado..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-3 px-2">ID Único</th>
              <th className="py-3 px-2">Estudiante</th>
              <th className="py-3 px-2">Documento</th>
              <th className="py-3 px-2">Grado</th>
              <th className="py-3 px-2">Acudiente</th>
              <th className="py-3 px-2">Promedio</th>
              <th className="py-3 px-2">Estado Riesgo</th>
              <th className="py-3 px-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {estudiantesFiltrados.map((est) => {
              const esRojo = String(est.estadoSemaforo).includes('Rojo');
              const esAmarillo = String(est.estadoSemaforo).includes('Amarillo');

              return (
                <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-bold text-blue-700">{est.id}</td>
                  <td className="py-3 px-2 font-medium text-slate-900">{est.nombre}</td>
                  <td className="py-3 px-2 text-xs text-slate-500">{est.documento}</td>
                  <td className="py-3 px-2 text-xs font-semibold text-slate-600">{est.grado}</td>
                  <td className="py-3 px-2 text-xs text-slate-600">
                    {est.acudiente} <br />
                    <span className="text-[10px] text-slate-400">{est.telefono}</span>
                  </td>
                  <td className="py-3 px-2 font-bold">{est.promedio}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      esRojo ? 'bg-red-100 text-red-700' :
                      esAmarillo ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {esRojo && <AlertCircle size={12} />}
                      {esAmarillo && <AlertTriangle size={12} />}
                      {!esRojo && !esAmarillo && <CheckCircle2 size={12} />}
                      {est.estadoSemaforo}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => onSeleccionarEstudiante(est.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Ver Ficha Completa"
                    >
                      <Eye size={14} />
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}