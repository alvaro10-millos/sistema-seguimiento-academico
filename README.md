# Sistema Predictivo de Seguimiento Académico para Padres, con Alertas Tempranas ante Riesgo Escolar

**Institución:** Corporación Universitaria Iberoamericana  
**Programa:** Ingeniería de Software  
**Autor:** Alvaro Cuervo Sanabria  
**Asesor:** Joaquin Fernando Sánchez  
**Periodo:** 202631  

## 1. Intención, Alcance y Fin de la Plataforma

La intención de esta plataforma es construir un **canal de comunicación directo, constante y transparente entre la institución educativa 
y los padres o acudientes**, evitando que el seguimiento académico dependa únicamente de reportes tardíos o reuniones esporádicas.

En esencia, el sistema trata de un entorno de **monitoreo continuo (diario, semanal y mensual)** sobre el desempeño escolar del estudiante. 
Cada vez que se presenta una calificación baja, la no entrega de una actividad o una falla en el proceso, el sistema integra la
**retroalimentación del docente explicando el porqué** junto con un seguimiento de fechas (pasadas, presentes y próximas), para que el 
acudiente entienda qué ocurre y por qué se activa una señal de alerta.

El **fin** de la plataforma es **prevenir a tiempo la pérdida de materias o del año escolar**, convirtiendo la información académica en 
acciones oportunas mediante un **sistema de alertas tipo semáforo**:

* 🔴 **Alerta Roja (Calificación menor a 3.0):** Indica un riesgo alto por calificación baja o incumplimiento; requiere atención inmediata para evitar comprometer la asignatura.
* 🟡 **Alerta Amarilla (Calificación entre 3.0 y 4.5):** Señala un riesgo preventivo o rendimiento intermedio; invita a reforzar el acompañamiento antes de que el desempeño caiga.
* 🟢 **Estado Verde (Calificación superior a 4.5 hasta 5.0):** Refleja un desempeño sobresaliente y una evolución académica favorable.

## 2. Control de Usuarios, ID Único del Estudiante y Roles

Para garantizar un manejo ordenado, seguro y trazable de la información, la plataforma centraliza los datos de **cada alumno, curso 
y área**, junto con su información personal y la de sus **padres o acudientes**.

Al momento de matricular a un estudiante y asignarlo a un aula con su **profesor coordinador de curso**, el sistema le asigna 
un **número de ID único**. Este identificador cumple un papel clave en el control de acceso y seguimiento:

* **Vinculación segura del acudiente:** Para acceder al perfil académico del estudiante, el padre o acudiente debe registrarse como usuario
e ingresar el **número de ID único** asignado al alumno, completando así su vinculación y permitiendo un control claro de usuarios y
estudiantes.

La plataforma organiza sus funciones según el rol dentro de la institución:

* **Administrador:** Registra y gestiona a los profesores, alumnos y coordinadores dentro del sistema.
* **Profesor:** Registra las materias, evaluaciones y próximas entregas, además de ingresar las calificaciones y la retroalimentación
  correspondiente.
* **Padre o acudiente:** Consulta el perfil del alumno vinculado a su cuenta para revisar calificaciones, retroalimentación, entregas y
  alertas tempranas.

## 3. Estructura del Repositorio y Guía para Revisión

El código del prototipo se encuentra organizado en dos carpetas principales en la raíz del repositorio:

* **`sat-backend/`**: Contiene la lógica del servidor, rutas, controladores, validaciones, configuración de base de datos (`src/config/db.ts`), documentación Swagger (`src/config/swagger.ts`) y archivo de pruebas de peticiones (`peticiones.http`).
* **`sat-frontend/`**: Contiene la interfaz web del sistema, incluyendo componentes como el inicio de sesión (`Login.tsx`) y el directorio de estudiantes (`DirectorioEstudiantes.tsx`), junto con la comunicación hacia los servicios en `src/services/api.ts`.

### Cómo ejecutar el prototipo localmente

1. **Descargar o clonar el repositorio:**
   ```bash
   git clone [https://github.com/alvaro10-millos/sistema-seguimiento-academico.git](https://github.com/alvaro10-millos/sistema-seguimiento-academico.git)


   ### Cómo probar y navegar el prototipo

* **Para ejecutarlo en local:** El evaluador puede descargar el proyecto desde GitHub, instalar dependencias (`npm install`) e iniciar tanto
*  el servidor (`sat-backend`) como la aplicación web (`sat-frontend`) siguiendo los scripts de cada carpeta.
* **Recorrido en la plataforma:** Al abrir la aplicación, se inicia en la vista de **Login** para acceder al entorno y luego se navega
*  hacia el **Directorio de Estudiantes** y las secciones de seguimiento para revisar los registros, calificaciones, retroalimentación y alertas.
* **Revisión del código y API:** Las rutas, validaciones y pruebas de endpoints se encuentran en `sat-backend` (incluyendo `peticiones.http` y Swagger), y las vistas principales en `sat-frontend/src`.
