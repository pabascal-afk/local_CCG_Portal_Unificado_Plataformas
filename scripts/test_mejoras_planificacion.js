/**
 * Script de prueba automatizada para las 7 mejoras del módulo de planificación
 */

const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const planificacion = require('../server/services/planificacion');

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function runTests() {
  console.log("=== INICIANDO SUITE DE PRUEBAS: MEJORAS PLANIFICACIÓN CURRICULAR ===\n");

  // TEST 1: Pool de Docentes
  console.log("TEST 1: Verificando obtenerPoolDocentes()...");
  const pool = await planificacion.obtenerPoolDocentes();
  assert(Array.isArray(pool) && pool.length > 0, "El pool de docentes debe devolver un arreglo no vacío");
  console.log(`✓ Pool obtenido: ${pool.length} docentes listados.`);
  assert(pool[0].nombre, "Cada docente debe tener nombre");

  // TEST 2: Horas Pedagógicas Anuales Sugeridas y Detección de Sesiones Semanales
  console.log("\nTEST 2: Verificando sesiones y horas sugeridas para 4° Básico A - LENGUAJE Y COMUNICACION...");
  const sesionesLenguaje = await planificacion.obtenerSesionesClasesSemana('4° BASICO A', 'LENGUAJE Y COMUNICACION', 2026);
  console.log(`  Bloques semanales detectados: ${sesionesLenguaje.bloques_semanales}`);
  console.log(`  Horas anuales sugeridas: ${sesionesLenguaje.horas_anuales_sugeridas} hrs`);
  console.log(`  Sesiones detectadas: ${sesionesLenguaje.sesiones.length}`);
  sesionesLenguaje.sesiones.forEach(s => console.log(`    - ${s.label}`));
  assert(sesionesLenguaje.bloques_semanales === 8, "Debe tener 8 bloques semanales según la malla");
  assert(sesionesLenguaje.horas_anuales_sugeridas === 8 * 38, "Horas anuales deben ser 8 * 38 = 304");
  assert(sesionesLenguaje.sesiones.length >= 3, "Debe tener al menos 3 o 4 sesiones de clase");
  console.log("✓ Detección de sesiones y horas anuales correcta.");

  // TEST 3: Co-docencia y visibilidad en Dashboard del Docente
  console.log("\nTEST 3: Verificando visibilidad de planes para co-docentes y creadores...");
  const cursoTest = 'TEST_CURSO_COD';
  const asigTest = 'TEST_ASIG_COD';
  const profeTitular = 'PROFESOR TITULAR TEST';
  const coDocenteNombre = 'CAMILA ARAYA';
  const coDocenteEmail = 'camilaaraya@colegiocerrogrande.cl';

  // Limpiar test previo si existiera
  await new Promise((res) => {
    db.run("DELETE FROM planificaciones WHERE curso = ? AND asignatura = ?", [cursoTest, asigTest], res);
  });

  // Crear plan con co-docente
  const planCreado = await planificacion.crearPlanificacion({
    anio: 2026,
    curso: cursoTest,
    asignatura: asigTest,
    titulo: 'Plan Piloto Co-docencia',
    docente_responsable: profeTitular,
    docentes_colaboradores: [coDocenteNombre],
    horas_anuales: 152
  }, { email: 'admin@colegio.cl', nombre: 'Admin', rol: 'ADMIN' });

  // Consultar mis cursos para la profesora Camila Araya (que NO tiene este curso en su horario)
  const misCursosCoDocente = await planificacion.obtenerCursosDocente(coDocenteEmail, coDocenteNombre, 2026);
  const planEncontrado = misCursosCoDocente.misAsignaciones.find(a => a.curso === cursoTest && a.asignatura === asigTest);

  assert(planEncontrado, "El co-docente DEBE ver la planificación en su dashboard aunque no tenga el curso en su horario");
  assert(planEncontrado.es_codocente === true, "Debe estar marcado con es_codocente: true");
  console.log(`✓ Co-docente '${coDocenteNombre}' ve el plan '${planEncontrado.titulo}' con es_codocente: ${planEncontrado.es_codocente}`);

  // TEST 4: Verificación de OAs de 4° Básico Unidad 1 MINEDUC
  console.log("\nTEST 4: Verificando OAs cargados para 4° Básico Lenguaje Unidad 1...");
  const oas4toU1 = await query(`
    SELECT o.codigo, o.descripcion, o.unidad_sugerida, o.indicadores_sugeridos
    FROM curriculo_objetivos o
    JOIN curriculo_planes p ON o.plan_id = p.id
    WHERE p.nivel = '4° Básico' AND p.asignatura = 'LENGUAJE Y COMUNICACION' AND o.unidad_sugerida = 'Unidad 1'
    ORDER BY o.codigo ASC
  `);
  const codigos = oas4toU1.map(o => o.codigo);
  console.log("  Códigos encontrados:", codigos);
  const requeridos = ['OA 01', 'OA 02', 'OA 03', 'OA 04', 'OA 06', 'OA 10', 'OA 12', 'OA 26'];
  requeridos.forEach(r => {
    assert(codigos.includes(r), `El catálogo debe contener ${r} en Unidad 1 de 4° Básico`);
  });
  console.log("✓ Todos los 8 OAs oficiales MINEDUC requeridos (OA 01, 02, 03, 04, 06, 10, 12, 26) están presentes y cargados.");

  // TEST 5: Verificación de texto "(Inicio-Desarrollo-Cierre)" eliminado en public/planificacion.html
  console.log("\nTEST 5: Verificando eliminación de '(Inicio-Desarrollo-Cierre)' en public/planificacion.html...");
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'planificacion.html'), 'utf8');
  assert(!htmlContent.includes('(Inicio-Desarrollo-Cierre)'), "No debe existir '(Inicio-Desarrollo-Cierre)' en el archivo HTML");
  console.log("✓ No se encontró ningún texto '(Inicio-Desarrollo-Cierre)' en public/planificacion.html.");

  // Limpieza de datos de prueba
  await new Promise((res) => {
    db.run("DELETE FROM planificaciones_unidades WHERE planificacion_id = ?", [planCreado.id], () => {
      db.run("DELETE FROM planificaciones WHERE id = ?", [planCreado.id], res);
    });
  });

  db.close();
  console.log("\n=== TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE (100% OK) ===");
}

runTests().catch(err => {
  console.error("Error en pruebas:", err);
  db.close();
  process.exit(1);
});
