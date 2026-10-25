/**
 * Servicio de Semilla y Gestión de Planes y Programas MINEDUC
 * Bases Curriculares y Priorización Curricular Oficial
 * Incluye distribución por Unidades (1 a 4), Habilidades e Indicadores de Evaluación precargados.
 */

const path = require('path');
const xlsx = require('xlsx');

// Importación de catálogos curriculares oficiales por área
const { LENGUAJE_CURRICULO } = require('./curriculo_data/lenguaje');
const { MATEMATICA_CURRICULO } = require('./curriculo_data/matematica');
const { CIENCIAS_CURRICULO } = require('./curriculo_data/ciencias');
const { HISTORIA_CURRICULO } = require('./curriculo_data/historia');
const { INGLES_CURRICULO } = require('./curriculo_data/ingles');
const { ESPECIALIDADES_CURRICULO } = require('./curriculo_data/especialidades');

// -------------------------------------------------------------
// HABILIDADES OFICIALES MINEDUC POR ASIGNATURA
// -------------------------------------------------------------
const HABILIDADES_POR_ASIGNATURA = {
  'LENGUAJE Y COMUNICACION': [
    { nombre: 'Comprensión lectora', descripcion: 'Localizar información explícita e implícita, interpretar sentido global, inferir significados y reflexionar críticamente sobre textos literarios y no literarios.' },
    { nombre: 'Producción escrita', descripcion: 'Planificar, redactar, revisar y editar textos narrativos, informativos y argumentativos cohesionados y coherentes.' },
    { nombre: 'Comunicación oral', descripcion: 'Expresar ideas con claridad, fluidez y adecuación pragmática en diversas situaciones comunicativas, y escuchar comprensiva y empáticamente.' },
    { nombre: 'Investigación y uso de fuentes', descripcion: 'Buscar, seleccionar, evaluar y registrar información de diversas fuentes impresas y digitales citando adecuadamente.' }
  ],
  'LENGUA Y LITERATURA': [
    { nombre: 'Comprensión e interpretación crítica', descripcion: 'Interpretar textos literarios y discursos públicos evaluando recursos estéticos, posturas ideológicas y visiones de mundo.' },
    { nombre: 'Escritura argumentativa e investigativa', descripcion: 'Elaborar textos académicos y ensayos bien estructurados, fundamentando tesis con evidencia rigurosa.' },
    { nombre: 'Diálogo y debate argumentativo', descripcion: 'Participar constructivamente en debates y exposiciones orales, rebatiendo argumentos con respeto y rigor.' }
  ],
  'MATEMATICA': [
    { nombre: 'Resolver problemas', descripcion: 'Comprender situaciones problemáticas, seleccionar y adaptar estrategias heurísticas, verificar resultados y comunicar soluciones.' },
    { nombre: 'Modelar', descripcion: 'Traducir situaciones del entorno cotidiano y científico a expresiones y modelos matemáticos, evaluando su validez y límites.' },
    { nombre: 'Representar', descripcion: 'Utilizar y transitar entre representaciones concretas, pictóricas, gráficas y simbólicas para visualizar relaciones y conceptos matemáticos.' },
    { nombre: 'Argumentar y comunicar', descripcion: 'Explicar razonamientos de manera clara, justificar afirmaciones matemáticas mediante propiedades y evaluar la validez de razonamientos ajenos.' }
  ],
  'CIENCIAS NATURALES': [
    { nombre: 'Observar y plantear preguntas', descripcion: 'Formular preguntas e hipótesis comprobables sobre fenómenos naturales del entorno a partir de observaciones sistemáticas.' },
    { nombre: 'Planificar y conducir investigaciones', descripcion: 'Diseñar y ejecutar procedimientos experimentales y no experimentales de forma rigurosa, ordenada y segura.' },
    { nombre: 'Procesar y analizar evidencia', descripcion: 'Organizar datos cualitativos y cuantitativos en tablas y gráficos, identificar tendencias o relaciones causa-efecto y extraer conclusiones fundamentadas.' },
    { nombre: 'Evaluar y comunicar', descripcion: 'Discutir la validez de los resultados experimentales y comunicar hallazgos usando vocabulario, modelos y formatos científicos adecuados.' }
  ],
  'BIOLOGIA': [
    { nombre: 'Pensamiento científico y bioético', descripcion: 'Analizar problemáticas biológicas contemporáneas evaluando implicancias éticas, sociales y ambientales.' },
    { nombre: 'Investigación experimental y modelamiento biológico', descripcion: 'Diseñar experimentos biológicos y construir modelos explicativos de procesos celulares, genéticos y ecológicos.' }
  ],
  'FISICA': [
    { nombre: 'Modelamiento físico y cuantitativo', descripcion: 'Aplicar leyes de la física clásica y moderna para resolver problemas cuantitativos del movimiento, energía y materia.' },
    { nombre: 'Experimentación y análisis de sistemas físicos', descripcion: 'Manipular instrumentos de medición física, evaluar fuentes de incertidumbre y relacionar variables teóricas y empíricas.' }
  ],
  'QUIMICA': [
    { nombre: 'Interpretación a nivel molecular y macroscópico', descripcion: 'Relacionar fenómenos químicos macroscópicos con interacciones a escala atómica y molecular.' },
    { nombre: 'Cálculo estequiométrico y trabajo experimental de laboratorio', descripcion: 'Realizar cálculos de reactivos y productos, manipulando sustancias químicas con rigurosidad y medidas de seguridad.' }
  ],
  'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES': [
    { nombre: 'Pensamiento temporal y espacial', descripcion: 'Secuenciar procesos históricos, utilizar coordenadas y mapas temáticos, y comprender la simultaneidad y multicausalidad de los fenómenos.' },
    { nombre: 'Análisis y trabajo con fuentes', descripcion: 'Analizar y contrastar fuentes primarias y secundarias evaluando su confiabilidad, origen, intencionalidad y perspectiva histórica.' },
    { nombre: 'Pensamiento crítico y deliberación', descripcion: 'Fundamentar opiniones sobre problemáticas históricas, geográficas y ciudadanas con argumentos sólidos basados en derechos humanos.' },
    { nombre: 'Comunicación', descripcion: 'Elaborar explicaciones históricas y geográficas organizadas, escritas y orales, integrando vocabulario disciplinar.' }
  ],
  'HISTORIA Y GEOGRAFIA': [
    { nombre: 'Pensamiento temporal y espacial', descripcion: 'Secuenciar procesos históricos, utilizar coordenadas y mapas temáticos, y comprender la simultaneidad y multicausalidad de los fenómenos.' },
    { nombre: 'Análisis y trabajo con fuentes', descripcion: 'Analizar y contrastar fuentes primarias y secundarias evaluando su confiabilidad, origen, intencionalidad y perspectiva histórica.' },
    { nombre: 'Pensamiento crítico y deliberación', descripcion: 'Fundamentar opiniones sobre problemáticas históricas, geográficas y ciudadanas con argumentos sólidos basados en derechos humanos.' },
    { nombre: 'Comunicación', descripcion: 'Elaborar explicaciones históricas y geográficas organizadas, escritas y orales, integrando vocabulario disciplinar.' }
  ],
  'EDUCACION CIUDADANA': [
    { nombre: 'Deliberación y participación democrática', descripcion: 'Analizar dilemas éticos y políticos de la sociedad democrática, proponiendo iniciativas de bien común.' },
    { nombre: 'Juicio crítico sobre la institucionalidad y los medios', descripcion: 'Evaluar el funcionamiento del Estado de derecho, la justicia social y el impacto de los discursos mediáticos.' }
  ],
  'INGLES': [
    { nombre: 'Listening (Comprensión auditiva)', descripcion: 'Identificar ideas clave y detalles específicos en textos orales auténticos y adaptados en diversas situaciones comunicativas.' },
    { nombre: 'Reading (Comprensión lectora)', descripcion: 'Comprender propósitos comunicativos, vocabulario temático y estructuras gramaticales en textos escritos simples y complejos.' },
    { nombre: 'Speaking (Expresión oral)', descripcion: 'Participar en diálogos, responder preguntas y realizar presentaciones orales fluidas y comprensibles sobre temas de interés.' },
    { nombre: 'Writing (Expresión escrita)', descripcion: 'Redactar oraciones, mensajes breves, correos y párrafos aplicando conectores, ortografía y vocabulario meta.' }
  ],
  'CIENCIAS PARA LA CIUDADANIA': [
    { nombre: 'Pensamiento científico reflexivo', descripcion: 'Evaluar críticamente controversias sociocientíficas e impactos de la ciencia y la tecnología en la sociedad.' },
    { nombre: 'Diseño de proyectos colaborativos', descripcion: 'Planificar e implementar soluciones sustentables a problemáticas ambientales y de salud comunitaria.' }
  ],
  'ARTES VISUALES': [
    { nombre: 'Expresar y crear visualmente', descripcion: 'Experimentar con diversas técnicas, materiales, soportes y medios digitales de expresión artística bidimensional y tridimensional.' },
    { nombre: 'Apreciar y responder frente al arte', descripcion: 'Analizar e interpretar obras de arte visual de distintas culturas y épocas, fundamentando juicios estéticos y personales.' }
  ],
  'MUSICA': [
    { nombre: 'Escuchar y apreciar', descripcion: 'Reconocer auditivamente elementos del lenguaje musical, timbres, formas y contextos socioculturales de diversas tradiciones sonoras.' },
    { nombre: 'Interpretar y crear', descripcion: 'Cantar, tocar instrumentos musicales y experimentar con sonoridades individuales y grupales con precisión rítmica y expresividad.' }
  ],
  'EDUCACION FISICA Y SALUD': [
    { nombre: 'Habilidades motrices específicas', descripcion: 'Ejecutar habilidades motrices básicas y específicas en diversos juegos predeportivos, deportes colectivos e individuales.' },
    { nombre: 'Vida activa y hábitos saludables', descripcion: 'Practicar actividad física de intensidad moderada a vigorosa reconociendo sus beneficios para el bienestar integral.' }
  ],
  'EDUCACION FISICA': [
    { nombre: 'Habilidades motrices específicas', descripcion: 'Ejecutar habilidades motrices básicas y específicas en diversos juegos predeportivos, deportes colectivos e individuales.' },
    { nombre: 'Vida activa y hábitos saludables', descripcion: 'Practicar actividad física de intensidad moderada a vigorosa reconociendo sus beneficios para el bienestar integral.' }
  ],
  'TECNOLOGIA': [
    { nombre: 'Diseñar y planificar soluciones', descripcion: 'Idear soluciones tecnológicas a necesidades del entorno seleccionando materiales, herramientas y procesos pertinentes.' },
    { nombre: 'Elaborar, probar y evaluar', descripcion: 'Construir objetos o sistemas tecnológicos siguiendo normas de seguridad y evaluando su impacto social y ambiental.' }
  ],
  'ORIENTACION': [
    { nombre: 'Crecimiento personal y autoconocimiento', descripcion: 'Reconocer fortalezas, intereses y metas personales, gestionando emociones y conductas con autonomía.' },
    { nombre: 'Relaciones interpersonales y convivencia', descripcion: 'Fomentar la resolución pacífica de conflictos, la empatía y la participación en la comunidad escolar.' }
  ],
  'FILOSOFIA': [
    { nombre: 'Problematización filosófica', descripcion: 'Formular preguntas fundamentales sobre la realidad, el conocimiento, la ética y el sentido de la existencia.' },
    { nombre: 'Análisis y argumentación conceptual', descripcion: 'Examinar rigurosamente conceptos, supuestos y argumentos en textos filosóficos clásicos y contemporáneos.' }
  ]
};

// -------------------------------------------------------------
// ACTITUDES TRANSVERSALES MINEDUC (OATs)
// -------------------------------------------------------------
const ACTITUDES_GENERALES_MINEDUC = [
  "Demostrar curiosidad, interés y rigor intelectual en el trabajo escolar.",
  "Manifestar disposición al trabajo colaborativo, respetando las opiniones y aportes ajenos.",
  "Valorar la perseverancia y el esfuerzo personal en la superación de desafíos pedagógicos.",
  "Demostrar empatía, solidaridad y compromiso con el bienestar de la comunidad escolar y el cuidado del entorno.",
  "Actuar con honestidad y rigurosidad en el uso de la información y en la presentación de resultados.",
  "Reconocer y valorar la diversidad humana, cultural y social como fuente de enriquecimiento personal y colectivo."
];

// -------------------------------------------------------------
// CATÁLOGO OFICIAL COMPLETO MINEDUC
// -------------------------------------------------------------
const CATALOGO_MINEDUC_COMPLETO = [
  ...LENGUAJE_CURRICULO,
  ...MATEMATICA_CURRICULO,
  ...CIENCIAS_CURRICULO,
  ...HISTORIA_CURRICULO,
  ...INGLES_CURRICULO,
  ...ESPECIALIDADES_CURRICULO
];

/**
 * Normaliza nombres de asignaturas
 */
function normalizarNombreAsignatura(asig) {
  if (!asig) return '';
  const clean = asig.trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ' ');
  if (clean === 'LENGUAJE' || clean === 'LENGUAJE Y COMUNICACION') return 'LENGUAJE Y COMUNICACION';
  if (clean === 'HISTORIA Y GEOGRAFIA' || clean === 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES') return 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES';
  if (clean === 'MATEMATICAS') return 'MATEMATICA';
  if (clean === 'EDUCACION FISICA') return 'EDUCACION FISICA Y SALUD';
  return clean;
}

/**
 * Inicializa las tablas del currículo y siembra el catálogo oficial MINEDUC enriquecido
 * con OAs por Unidad (1 a 4), Habilidades e Indicadores de Evaluación precargados.
 */
function inicializarCurriculo(db, callback, { forzarActualizacion = true } = {}) {
  const anioActual = 2026;

  db.serialize(() => {
    // 1. Asegurar columnas en las tablas
    db.run("ALTER TABLE curriculo_planes ADD COLUMN habilidades_sugeridas TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE curriculo_objetivos ADD COLUMN unidad_sugerida TEXT DEFAULT 'Unidad 1'", () => {});

    // 2. Verificar estado de la base de datos
    db.get("SELECT COUNT(*) as total, SUM(CASE WHEN indicadores_sugeridos IS NOT NULL AND indicadores_sugeridos != '[]' THEN 1 ELSE 0 END) as con_indicadores FROM curriculo_objetivos", [], (err, row) => {
      if (err) {
        console.error("[CURRICULO] Error verificando estado:", err);
        if (callback) callback(err);
        return;
      }

      const totalOAs = (row && row.total) || 0;
      const conIndicadores = (row && row.con_indicadores) || 0;

      // Si ya está completamente poblado con todo el catálogo oficial y no se fuerza recarga, salir
      if (!forzarActualizacion && totalOAs >= CATALOGO_MINEDUC_COMPLETO.length && conIndicadores >= CATALOGO_MINEDUC_COMPLETO.length) {
        console.log(`[CURRICULO] Catálogo ya actualizado con ${totalOAs} OAs e indicadores para el año ${anioActual}.`);
        if (callback) callback(null);
        return;
      }

      console.log(`[CURRICULO] Sembrando catálogo enriquecido MINEDUC 2026 (${CATALOGO_MINEDUC_COMPLETO.length} OAs)...`);

      // Limpiar registros antiguos de tipo MINEDUC para garantizar coherencia íntegra
      db.run("DELETE FROM curriculo_objetivos WHERE plan_id IN (SELECT id FROM curriculo_planes WHERE tipo = 'MINEDUC')");
      db.run("DELETE FROM curriculo_planes WHERE tipo = 'MINEDUC'");

      // Agrupar catálogo por (nivel, asignatura)
      const planesAgrupados = {};
      for (const item of CATALOGO_MINEDUC_COMPLETO) {
        const key = `${item.nivel}___${item.asignatura}`;
        if (!planesAgrupados[key]) {
          const asigNorm = normalizarNombreAsignatura(item.asignatura);
          const habs = HABILIDADES_POR_ASIGNATURA[asigNorm] || HABILIDADES_POR_ASIGNATURA[item.asignatura] || [];

          planesAgrupados[key] = {
            nivel: item.nivel,
            asignatura: item.asignatura,
            tipo: 'MINEDUC',
            habilidades: habs,
            objetivos: []
          };
        }
        planesAgrupados[key].objetivos.push(item);
      }

      const keys = Object.keys(planesAgrupados);

      // Sentencias preparadas
      const stmtInsertPlan = db.prepare(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, habilidades_sugeridas, activo) VALUES (?, 'MINEDUC', ?, ?, ?, ?, 1)`);
      const stmtInsertObj = db.prepare(`INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, categoria, indicadores_sugeridos, orden, activo) VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, ?, 1)`);

      let planesProcesados = 0;
      let oasProcesados = 0;

      function procesarSiguientePlan(idx) {
        if (idx >= keys.length) {
          stmtInsertPlan.finalize();
          stmtInsertObj.finalize();

          console.log(`[CURRICULO] Precarga completada exitosamente: ${planesProcesados} planes y ${oasProcesados} OAs enriquecidos con Unidades, Habilidades e Indicadores.`);
          if (callback) callback(null);
          return;
        }

        const planData = planesAgrupados[keys[idx]];
        const habsJson = JSON.stringify(planData.habilidades || []);
        const desc = `Programa Oficial MINEDUC ${planData.asignatura} - ${planData.nivel}`;

        stmtInsertPlan.run([anioActual, planData.nivel, planData.asignatura, desc, habsJson], function (errIns) {
          if (errIns) {
            console.error("[CURRICULO] Error insertando plan:", errIns);
            procesarSiguientePlan(idx + 1);
            return;
          }
          const planId = this.lastID;
          planesProcesados++;
          insertarObjetivosPlan(planId, planData.objetivos, () => procesarSiguientePlan(idx + 1));
        });
      }

      function insertarObjetivosPlan(planId, objetivos, onDone) {
        let count = 0;
        if (!objetivos || objetivos.length === 0) {
          onDone();
          return;
        }

        objetivos.forEach((obj, orderIdx) => {
          const indicsJson = JSON.stringify(obj.indicadores || []);
          stmtInsertObj.run([
            planId,
            obj.eje || 'General',
            obj.unidad || 'Unidad 1',
            obj.codigo,
            obj.descripcion,
            obj.categoria || 'Basal',
            indicsJson,
            orderIdx + 1
          ], (errObj) => {
            if (!errObj) oasProcesados++;
            count++;
            if (count === objetivos.length) onDone();
          });
        });
      }

      procesarSiguientePlan(0);
    });
  });
}

/**
 * Procesa un archivo Excel/CSV cargado por UTP para actualizar o crear planes curriculares
 */
function importarCurriculoExcel(db, buffer, anio, tipo = 'MINEDUC') {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        return reject(new Error("La planilla no contiene filas de datos."));
      }

      const anioNum = parseInt(anio) || 2026;
      let planesCreados = 0;
      let objetivosCreados = 0;

      const planesMap = {};
      for (const r of rows) {
        const nivel = (r['Nivel'] || r['nivel'] || r['Curso'] || r['curso'] || '').toString().trim();
        const asignatura = (r['Asignatura'] || r['asignatura'] || r['Materia'] || '').toString().trim().toUpperCase();
        const codigo = (r['Codigo'] || r['codigo'] || r['OA'] || r['oa'] || '').toString().trim();
        const descripcion = (r['Descripcion'] || r['descripcion'] || r['Objetivo'] || '').toString().trim();
        const eje = (r['Eje'] || r['eje'] || 'General').toString().trim();
        const unidad = (r['Unidad'] || r['unidad'] || 'Unidad 1').toString().trim();
        const categoria = (r['Categoria'] || r['categoria'] || r['Priorizacion'] || 'Basal').toString().trim();
        const indicadoresRaw = (r['Indicadores'] || r['indicadores'] || '').toString().trim();

        if (!nivel || !asignatura || !codigo || !descripcion) continue;

        let indicadoresArr = [];
        if (indicadoresRaw) {
          indicadoresArr = indicadoresRaw.split(';').map(i => i.trim()).filter(Boolean);
        }

        const key = `${nivel}___${asignatura}`;
        if (!planesMap[key]) {
          const asigNorm = normalizarNombreAsignatura(asignatura);
          const habs = HABILIDADES_POR_ASIGNATURA[asigNorm] || HABILIDADES_POR_ASIGNATURA[asignatura] || [];
          planesMap[key] = {
            nivel,
            asignatura,
            habilidades: habs,
            objetivos: []
          };
        }
        planesMap[key].objetivos.push({ codigo, descripcion, eje, unidad, categoria, indicadores: indicadoresArr });
      }

      const keys = Object.keys(planesMap);
      if (keys.length === 0) {
        return reject(new Error("No se encontraron registros válidos con las columnas requeridas (Nivel, Asignatura, Codigo, Descripcion)."));
      }

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        function procesarPlan(index) {
          if (index >= keys.length) {
            db.run("COMMIT", (errCommit) => {
              if (errCommit) return reject(errCommit);
              resolve({
                mensaje: `Importación curricular completada: ${planesCreados} planes y ${objetivosCreados} OAs procesados para el año ${anioNum}.`,
                planesCreados,
                objetivosCreados
              });
            });
            return;
          }

          const item = planesMap[keys[index]];
          const habsJson = JSON.stringify(item.habilidades || []);
          db.get(`SELECT id FROM curriculo_planes WHERE anio = ? AND nivel = ? AND asignatura = ? AND tipo = ?`,
            [anioNum, item.nivel, item.asignatura, tipo], (errFind, planRow) => {
              if (errFind) {
                db.run("ROLLBACK");
                return reject(errFind);
              }

              if (planRow) {
                const planId = planRow.id;
                db.run(`UPDATE curriculo_planes SET habilidades_sugeridas = ? WHERE id = ?`, [habsJson, planId]);
                insertarOAs(planId, item.objetivos, () => procesarPlan(index + 1));
              } else {
                db.run(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, habilidades_sugeridas, activo)
                        VALUES (?, ?, ?, ?, ?, ?, 1)`,
                  [anioNum, tipo, item.nivel, item.asignatura, `Plan ${tipo} ${item.asignatura} - ${item.nivel}`, habsJson],
                  function (errIns) {
                    if (errIns) {
                      db.run("ROLLBACK");
                      return reject(errIns);
                    }
                    planesCreados++;
                    const planId = this.lastID;
                    insertarOAs(planId, item.objetivos, () => procesarPlan(index + 1));
                  });
              }
            });
        }

        function insertarOAs(planId, objs, onDone) {
          let count = 0;
          for (const obj of objs) {
            db.run(`INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, categoria, indicadores_sugeridos, activo)
                    VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, 1)`,
              [planId, obj.eje, obj.unidad, obj.codigo, obj.descripcion, obj.categoria, JSON.stringify(obj.indicadores || [])],
              (errObj) => {
                if (!errObj) objetivosCreados++;
                count++;
                if (count === objs.length) onDone();
              });
          }
        }

        procesarPlan(0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  CATALOGO_MINEDUC_COMPLETO,
  HABILIDADES_POR_ASIGNATURA,
  ACTITUDES_GENERALES_MINEDUC,
  inicializarCurriculo,
  importarCurriculoExcel,
  normalizarNombreAsignatura
};
