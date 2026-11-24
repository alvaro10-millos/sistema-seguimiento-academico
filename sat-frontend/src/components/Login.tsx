import React, { useState } from 'react';
import { BookOpen, Key, Users, GraduationCap, Award, ShieldAlert, Lock, Mail, Image } from 'lucide-react';

interface LoginProps {
  onLoginExitoso: (usuario: any) => void;
}

export default function Login({ onLoginExitoso }: LoginProps) {
  const [isRegistro, setIsRegistro] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Selección de Rol: 'coordinador', 'docente', 'alumno', 'acudiente'
  const [rol, setRol] = useState('acudiente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombresApellidos, setNombresApellidos] = useState('');
  const [numeroContacto, setNumeroContacto] = useState('');

  // CAMPOS ESPECÍFICOS PARA ACUDIENTE
  const [codigoAlumnoAcudiente, setCodigoAlumnoAcudiente] = useState('');
  const [direccionCasaAcudiente, setDireccionCasaAcudiente] = useState('');
  const [parentesco, setParentesco] = useState('Padre/Madre');
  const [gradoAlumnoAcudiente, setGradoAlumnoAcudiente] = useState('11-A');

  // CAMPOS ESPECÍFICOS PARA ALUMNO
  const [gradoMatricula, setGradoMatricula] = useState('11'); // 1 a 11
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [rh, setRh] = useState('O+');
  const [nombreAcudientesAlumno, setNombreAcudientesAlumno] = useState('');
  const [contactoFamiliar, setContactoFamiliar] = useState('');
  const [direccionCasaAlumno, setDireccionCasaAlumno] = useState('');
  const [docenteGrupo, setDocenteGrupo] = useState('');
  const [fotoUrl, setFotoUrl] = useState(''); // Foto Carnet

  // CAMPOS ESPECÍFICOS PARA DOCENTE
  const [cursoGradoAsignado, setCursoGradoAsignado] = useState('');
  const [materiaProfesional, setMateriaProfesional] = useState('');

  // Obtener usuarios registrados de LocalStorage
  const obtenerUsuariosRegistrados = () => {
    const usuariosGuardados = localStorage.getItem('sat_usuarios_bd');
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
  };

  // Generador de Consecutivo Automático según Grado (Mínimo 4 dígitos)
  const generarCodigoConsecutivo = (gradoNum: string) => {
    const lista = obtenerUsuariosRegistrados();
    const alumnosEnGrado = lista.filter((u: any) => u.rol === 'alumno' && u.gradoMatricula === gradoNum);
    const consecutivo = alumnosEnGrado.length + 1;
    const numeroFormateado = String(consecutivo).padStart(3, '0');
    return `${gradoNum}${numeroFormateado}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);

    const correoLimpio = email.trim().toLowerCase();
    const claveLimpia = password.trim();

    if (!correoLimpio || !claveLimpia) {
      setErrorLogin('El correo electrónico y la contraseña son obligatorios.');
      return;
    }

    const listaUsuarios = obtenerUsuariosRegistrados();

    if (isRegistro) {
      // ---------------- REGISTRO DE USUARIOS ----------------
      if (!nombresApellidos.trim() || !numeroContacto.trim()) {
        setErrorLogin('Nombres, Apellidos y Número de Contacto son obligatorios.');
        return;
      }

      const existeUsuario = listaUsuarios.some((u: any) => u.email.toLowerCase() === correoLimpio);
      if (existeUsuario) {
        setErrorLogin('⚠️ El correo ingresado ya se encuentra registrado. Intente iniciar sesión.');
        return;
      }

      let codigoUnicoAsignado = '';

      if (rol === 'alumno') {
        if (!fechaNacimiento || !numeroIdentificacion.trim() || !docenteGrupo.trim() || !direccionCasaAlumno.trim()) {
          setErrorLogin('Debe completar todos los datos de matrícula del Alumno.');
          return;
        }
        codigoUnicoAsignado = generarCodigoConsecutivo(gradoMatricula);
      }

      if (rol === 'acudiente') {
        const codIngresado = codigoAlumnoAcudiente.trim();
        if (!codIngresado) {
          setErrorLogin('Debe ingresar el Código Único del Alumno para vincular la cuenta.');
          return;
        }

        const alumnoExiste = listaUsuarios.some(
          (u: any) => u.rol === 'alumno' && String(u.idAlumno) === String(codIngresado)
        );

        if (!alumnoExiste) {
          setErrorLogin(`⚠️ El Código Único de Alumno "${codIngresado}" no se encuentra registrado en el sistema.`);
          return;
        }

        if (!direccionCasaAcudiente.trim()) {
          setErrorLogin('Ingrese su dirección de residencia.');
          return;
        }
      }

      if (rol === 'docente') {
        if (!cursoGradoAsignado.trim() || !materiaProfesional.trim()) {
          setErrorLogin('Ingrese el curso/grado asignado y la materia profesional.');
          return;
        }
      }

      const nuevoUsuario = {
        nombresApellidos: nombresApellidos.trim(),
        email: correoLimpio,
        password: claveLimpia,
        rol,
        numeroContacto: numeroContacto.trim(),
        ...(rol === 'acudiente' && {
          direccionCasa: direccionCasaAcudiente.trim(),
          idAlumnoSolicitado: codigoAlumnoAcudiente.trim(),
          parentesco,
          gradoAlumno: gradoAlumnoAcudiente
        }),
        ...(rol === 'alumno' && {
          idAlumno: codigoUnicoAsignado,
          gradoMatricula,
          curso: `${gradoMatricula}-A`,
          fechaNacimiento,
          numeroIdentificacion: numeroIdentificacion.trim(),
          rh,
          nombreAcudientes: nombreAcudientesAlumno.trim(),
          contactoFamiliar: contactoFamiliar.trim(),
          direccionCasa: direccionCasaAlumno.trim(),
          docenteGrupo: docenteGrupo.trim(),
          fotoUrl: fotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }),
        ...(rol === 'docente' && {
          cursoGradoAsignado: cursoGradoAsignado.trim(),
          materiaProfesional: materiaProfesional.trim()
        }),
        ...(rol === 'coordinador' && {
          cargo: 'Coordinador Académico'
        })
      };

      listaUsuarios.push(nuevoUsuario);
      localStorage.setItem('sat_usuarios_bd', JSON.stringify(listaUsuarios));
      localStorage.setItem('sat_usuario', JSON.stringify(nuevoUsuario));

      if (rol === 'alumno') {
        alert(`🎉 ¡Matrícula Exitosa! Se ha asignado el Código Único de Alumno: ${codigoUnicoAsignado}. Compártelo con el acudiente para su autenticación.`);
      } else {
        alert(`🎉 ¡Registro Exitoso como ${rol.toUpperCase()}!`);
      }

      onLoginExitoso(nuevoUsuario);
    } else {
      // ---------------- LOGIN CON VALIDACIÓN ESTRICTA Y 3 FACTORES ----------------
      const usuarioEncontrado = listaUsuarios.find(
        (u: any) => u.email.toLowerCase() === correoLimpio && u.password === claveLimpia
      );

      if (!usuarioEncontrado) {
        setErrorLogin('⚠️ Credenciales incorrectas. Verifique el correo y la contraseña.');
        return;
      }

      if (usuarioEncontrado.rol !== rol) {
        setErrorLogin(`⚠️ El usuario ingresado pertenece al rol de ${usuarioEncontrado.rol.toUpperCase()}. Seleccione el perfil correcto.`);
        return;
      }

      if (rol === 'acudiente') {
        const codigoIngresado = codigoAlumnoAcudiente.trim();

        if (!codigoIngresado) {
          setErrorLogin('⚠️ Acceso Acudiente: Es obligatorio ingresar el Código Único del Alumno.');
          return;
        }

        const alumnoExiste = listaUsuarios.find(
          (u: any) => u.rol === 'alumno' && String(u.idAlumno) === String(codigoIngresado)
        );

        if (!alumnoExiste) {
          setErrorLogin(`⚠️ El Código Único "${codigoIngresado}" no corresponde a ningún alumno registrado en el sistema.`);
          return;
        }

        if (usuarioEncontrado.idAlumnoSolicitado && String(usuarioEncontrado.idAlumnoSolicitado) !== String(codigoIngresado)) {
          setErrorLogin(`⚠️ El Código Único "${codigoIngresado}" no corresponde al alumno vinculado a su cuenta (Código autorizado: ${usuarioEncontrado.idAlumnoSolicitado}).`);
          return;
        }

        usuarioEncontrado.idAlumnoSolicitado = codigoIngresado;
      }

      localStorage.setItem('sat_usuario', JSON.stringify(usuarioEncontrado));
      onLoginExitoso(usuarioEncontrado);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 max-w-xl w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SAT Educational</h1>
          <p className="text-xs text-slate-500">
            {isRegistro ? 'Sistema Institucional de Matrícula y Gestión de Perfiles' : 'Ingreso Seguro a la Plataforma Educativa'}
          </p>
        </div>

        {/* Mensajes de Alerta y Errores */}
        {errorLogin && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{errorLogin}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Selección de Rol */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Seleccione su Rol / Perfil <span className="text-red-500">*</span>
            </label>
            <select
              value={rol}
              onChange={(e) => {
                setRol(e.target.value);
                setErrorLogin(null);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
            >
              <option value="acudiente">Acudiente / Padre de Familia</option>
              <option value="alumno">Alumno / Estudiante</option>
              <option value="docente">Docente / Profesor</option>
              <option value="coordinador">Coordinador (Administrador)</option>
            </select>
          </div>

          {/* FACTOR EXTRA FIJO PARA ACUDIENTE EN LOGIN */}
          {!isRegistro && rol === 'acudiente' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold uppercase text-amber-900 flex items-center gap-1">
                <Key size={14} /> Código Único del Alumno (Tercer Factor Obligatorio) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={codigoAlumnoAcudiente}
                onChange={(e) => setCodigoAlumnoAcudiente(e.target.value)}
                placeholder="Ej. 1001"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-blue-800"
              />
              <p className="text-[10px] text-amber-700">Ingrese el código institucional exacto asignado a su estudiante.</p>
            </div>
          )}

          {/* CAMPOS ADICIONALES PARA REGISTRO */}
          {isRegistro && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Nombres y Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombresApellidos}
                    onChange={(e) => setNombresApellidos(e.target.value)}
                    placeholder="Ej. Pedro Pérez"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Número de Contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={numeroContacto}
                    onChange={(e) => setNumeroContacto(e.target.value)}
                    placeholder="3001234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* ROL: ACUDIENTE */}
              {rol === 'acudiente' && (
                <div className="p-4 bg-amber-50/60 rounded-xl space-y-3 border border-amber-200">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Users size={16} /> Vinculación de Acudiente
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Código Único del Alumno <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={codigoAlumnoAcudiente}
                      onChange={(e) => setCodigoAlumnoAcudiente(e.target.value)}
                      placeholder="Ej. 1001"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dirección Residencia <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={direccionCasaAcudiente}
                        onChange={(e) => setDireccionCasaAcudiente(e.target.value)}
                        placeholder="Calle 12 #34-56"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Parentesco</label>
                      <select
                        value={parentesco}
                        onChange={(e) => setParentesco(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Padre/Madre">Padre/Madre</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Familiar">Familiar</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ROL: ALUMNO */}
              {rol === 'alumno' && (
                <div className="p-4 bg-blue-50/60 rounded-xl space-y-3 border border-blue-200">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <GraduationCap size={16} /> Datos de Matrícula del Alumno
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Grado Matrícula <span className="text-red-500">*</span></label>
                      <select
                        value={gradoMatricula}
                        onChange={(e) => setGradoMatricula(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                          <option key={g} value={String(g)}>Grado {g}°</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">No. Identificación <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={numeroIdentificacion}
                        onChange={(e) => setNumeroIdentificacion(e.target.value)}
                        placeholder="1012345678"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">RH</label>
                      <select
                        value={rh}
                        onChange={(e) => setRh(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Fecha Nacimiento <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Docente Titular Grupo <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={docenteGrupo}
                        onChange={(e) => setDocenteGrupo(e.target.value)}
                        placeholder="Prof. Carlos Mendoza"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* CAMPO DE FOTO TIPO CARNET */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <Image size={12} /> URL Foto Tipo Carnet (Opcional)
                    </label>
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/foto-estudiante.jpg"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Si se deja vacío, se asignará un avatar institucional de carnet.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombre Acudientes</label>
                      <input
                        type="text"
                        value={nombreAcudientesAlumno}
                        onChange={(e) => setNombreAcudientesAlumno(e.target.value)}
                        placeholder="María Sanabria"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contacto Familiar</label>
                      <input
                        type="tel"
                        value={contactoFamiliar}
                        onChange={(e) => setContactoFamiliar(e.target.value)}
                        placeholder="3119876543"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dirección Residencia <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={direccionCasaAlumno}
                      onChange={(e) => setDireccionCasaAlumno(e.target.value)}
                      placeholder="Calle 12 #34-56"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* ROL: DOCENTE */}
              {rol === 'docente' && (
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Award size={16} /> Asignación Académica Docente
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Materia Profesional Asignada <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={materiaProfesional}
                        onChange={(e) => setMateriaProfesional(e.target.value)}
                        placeholder="Ej. Matemáticas"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Curso o Grado Asignado <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={cursoGradoAsignado}
                        onChange={(e) => setCursoGradoAsignado(e.target.value)}
                        placeholder="Ej. 11-A"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credenciales Básicas */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@colegio.edu.co"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm cursor-pointer shadow-sm mt-2"
          >
            {isRegistro ? 'Validar y Completar Registro' : 'Ingresar a la Plataforma'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegistro(!isRegistro);
              setErrorLogin(null);
            }}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            {isRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Registra tu perfil aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}