const path = require('path');
const planificacion = require('../server/services/planificacion');
const curriculoSeed = require('../server/services/curriculo_seed');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

async function runTests() {
  console.log("=== INICIANDO SUITE DE PRUEBAS CURRICULARES MINEDUC ===");

  // 1. Verificar planes y objetivos
  const totalPlanes = await new Promise(r => db.get("SELECT COUNT(*) as c FROM curriculo_planes", (e, row) => r(row.c)));
  const totalOAs = await new Promise(r => db.get("SELECT COUNT(*) as c FROM curriculo_objetivos", (e, row) => r(row.c)));
  const sinUnidad = await new Promise(r => db.get("SELECT COUNT(*) as c FROM curriculo_objetivos WHERE unidad_sugerida IS NULL OR unidad_sugerida = ''", (e, row) => r(row.c)));
  const sinIndicadores = await new Promise(r => db.get("SELECT COUNT(*) as c FROM curriculo_objetivos WHERE indicadores_sugeridos IS NULL OR indicadores_sugeridos = '' OR indicadores_sugeridos = '[]'", (e, row) => r(row.c)));

  console.log(`[TEST 1] Total Planes: ${totalPlanes} (Esperado >= 70)`);
  console.log(`[TEST 1] Total OAs: ${totalOAs} (Esperado >= 200)`);
  console.log(`[TEST 1] OAs sin unidad: ${sinUnidad} (Esperado: 0)`);
  console.log(`[TEST 1] OAs sin indicadores: ${sinIndicadores} (Esperado: 0)`);

  if (sinUnidad !== 0 || sinIndicadores !== 0 || totalOAs < 200) {
    throw new Error("Fallo en verificación de catálogo curricular");
  }

  // 2. Verificar distribución de unidades
  const unidades = await new Promise(r => db.all("SELECT DISTINCT unidad_sugerida FROM curriculo_objetivos ORDER BY unidad_sugerida", (e, rows) => r(rows.map(x => x.unidad_sugerida))));
  console.log(`[TEST 2] Unidades encontradas: ${unidades.join(', ')}`);
  if (!unidades.includes('Unidad 1') || !unidades.includes('Unidad 2') || !unidades.includes('Unidad 3') || !unidades.includes('Unidad 4')) {
    throw new Error("No están todas las 4 unidades presentes en el catálogo");
  }

  // 3. Crear planificación de prueba
  console.log("\n[TEST 3] Creando planificación de prueba para '3° BASICO A' - 'MATEMATICA'...");
  const usuarioMock = {
    email: 'test.docente@colegiocerrogrande.cl',
    nombre: 'Profesor de Prueba',
    rol: 'Profesor'
  };

  const nuevaPlan = await planificacion.crearPlanificacion({
    anio: 2026,
    curso: '3° BASICO A',
    asignatura: 'MATEMATICA',
    titulo: 'Plan Anual Matemática 3° Básico A (Test)'
  }, usuarioMock);

  console.log(`[TEST 3] Planificación creada con ID: ${nuevaPlan.id}`);

  // 4. Obtener detalle de planificación y validar datos curriculares
  const detalle = await planificacion.obtenerPlanificacionDetalle(nuevaPlan.id);
  console.log(`[TEST 4] Plan vinculado: ${detalle.plan_curricular ? detalle.plan_curricular.descripcion : 'Ninguno'}`);
  console.log(`[TEST 4] Habilidades oficiales cargadas: ${detalle.plan_curricular ? detalle.plan_curricular.habilidades_sugeridas.length : 0}`);
  console.log(`[TEST 4] OAs disponibles para el curso: ${detalle.oas_disponibles.length}`);

  const oasUnidad1 = detalle.oas_disponibles.filter(o => o.unidad_sugerida === 'Unidad 1');
  console.log(`[TEST 4] OAs sugeridos específicamente para Unidad 1: ${oasUnidad1.map(o => o.codigo).join(', ')}`);
  
  const oaConIndicadores = detalle.oas_disponibles[0];
  console.log(`[TEST 4] Ejemplo OA ${oaConIndicadores.codigo} tiene ${oaConIndicadores.indicadores_sugeridos.length} indicadores.`);
  console.log(`[TEST 4] Primer indicador: "${oaConIndicadores.indicadores_sugeridos[0]}"`);

  if (!detalle.plan_curricular || detalle.plan_curricular.habilidades_sugeridas.length === 0 || detalle.oas_disponibles.length === 0) {
    throw new Error("Fallo en la vinculación curricular o carga de habilidades");
  }

  // 5. Simular precarga en Unidad 1 y guardado
  console.log("\n[TEST 5] Simulando precarga de habilidades, actitudes e indicadores en Unidad 1...");
  const unidad1 = detalle.unidades[0];
  unidad1.oas_seleccionados = oasUnidad1.map(o => ({
    codigo: o.codigo,
    categoria: o.categoria,
    descripcion: o.descripcion
  }));

  // Precargar habilidades formateadas
  unidad1.habilidades = detalle.plan_curricular.habilidades_sugeridas.map(h => `• ${h.nombre}: ${h.descripcion}`).join('\n\n');
  // Precargar actitudes
  unidad1.actitudes = detalle.actitudes_sugeridas.map(a => `• ${a}`).join('\n');
  // Precargar indicadores de los OAs asignados
  const indicadores = [];
  oasUnidad1.forEach(o => {
    o.indicadores_sugeridos.forEach(ind => {
      indicadores.push(`• [${o.codigo}] ${ind}`);
    });
  });
  unidad1.indicadores_evaluacion = indicadores.join('\n');

  await planificacion.guardarPlanificacion(nuevaPlan.id, {
    titulo: detalle.titulo,
    unidades: [unidad1]
  }, usuarioMock);

  // 6. Verificar cobertura calculada
  const cob = await planificacion.calcularCoberturaCurricular({
    planId: nuevaPlan.id,
    curso: '3° BASICO A',
    asignatura: 'MATEMATICA'
  });
  console.log(`[TEST 6] Cobertura de OAs calculada: ${cob.cobertura_oas_pct}% (${cob.oas_cubiertos} de ${cob.oas_totales_programa} OAs del programa oficial)`);
  console.log(`[TEST 6] Semáforo de cobertura: ${cob.semaforo}`);

  // 7. Limpiar planificación de prueba
  await new Promise(r => db.run("DELETE FROM planificaciones_versiones WHERE planificacion_id = ?", [nuevaPlan.id], r));
  await new Promise(r => db.run("DELETE FROM planificaciones_unidades WHERE planificacion_id = ?", [nuevaPlan.id], r));
  await new Promise(r => db.run("DELETE FROM planificaciones WHERE id = ?", [nuevaPlan.id], r));
  console.log("[TEST 7] Limpieza de planificación de prueba completada.");

  console.log("\n=== TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK) ===");
  db.close();
}

runTests().catch(err => {
  console.error("ERROR EN PRUEBAS:", err);
  db.close();
  process.exit(1);
});
