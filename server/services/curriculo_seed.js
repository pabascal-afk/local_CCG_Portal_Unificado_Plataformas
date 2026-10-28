/**
 * Servicio de Semilla y Gestión de Planes y Programas MINEDUC
 * Bases Curriculares y Programas de Estudio Oficiales MINEDUC
 * Incluye distribución por Unidades Oficiales (1 a 4 con nombre oficial),
 * todos los OAs (Basales y Complementarios), Habilidades e Indicadores de Evaluación.
 */

const path = require('path');
const xlsx = require('xlsx');

const CURRICULO_SEED_VERSION = '2026.2-MINEDUC-OFICIAL';

function extraerArregloCurriculo(mod, propName) {
  if (Array.isArray(mod)) return mod;
  if (mod && Array.isArray(mod[propName])) return mod[propName];
  return [];
}

// Importación de catálogos curriculares oficiales por área
const LENGUAJE_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/lenguaje'), 'LENGUAJE_CURRICULO');
const MATEMATICA_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/matematica'), 'MATEMATICA_CURRICULO');
const CIENCIAS_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/ciencias'), 'CIENCIAS_CURRICULO');
const HISTORIA_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/historia'), 'HISTORIA_CURRICULO');
const INGLES_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/ingles'), 'INGLES_CURRICULO');
const ESPECIALIDADES_CURRICULO = extraerArregloCurriculo(require('./curriculo_data/especialidades'), 'ESPECIALIDADES_CURRICULO');

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

function obtenerCatalogoMineducCompleto() {
  delete require.cache[require.resolve('./curriculo_data/lenguaje')];
  delete require.cache[require.resolve('./curriculo_data/matematica')];
  delete require.cache[require.resolve('./curriculo_data/ciencias')];
  delete require.cache[require.resolve('./curriculo_data/historia')];
  delete require.cache[require.resolve('./curriculo_data/ingles')];
  delete require.cache[require.resolve('./curriculo_data/especialidades')];

  const L = extraerArregloCurriculo(require('./curriculo_data/lenguaje'), 'LENGUAJE_CURRICULO');
  const M = extraerArregloCurriculo(require('./curriculo_data/matematica'), 'MATEMATICA_CURRICULO');
  const C = extraerArregloCurriculo(require('./curriculo_data/ciencias'), 'CIENCIAS_CURRICULO');
  const H = extraerArregloCurriculo(require('./curriculo_data/historia'), 'HISTORIA_CURRICULO');
  const I = extraerArregloCurriculo(require('./curriculo_data/ingles'), 'INGLES_CURRICULO');
  const E = extraerArregloCurriculo(require('./curriculo_data/especialidades'), 'ESPECIALIDADES_CURRICULO');

  return [...L, ...M, ...C, ...H, ...I, ...E];
}

// Catálogo inicial exportado
const CATALOGO_MINEDUC_COMPLETO = [
  ...LENGUAJE_CURRICULO,
  ...MATEMATICA_CURRICULO,
  ...CIENCIAS_CURRICULO,
  ...HISTORIA_CURRICULO,
  ...INGLES_CURRICULO,
  ...ESPECIALIDADES_CURRICULO
];

/**
 * Normaliza niveles educativos al formato canónico de la plataforma (ej: '6° BASICO' -> '6° Básico', 'I° MEDIO' -> 'I° Medio')
 */
function normalizarNivel(nivel) {
  if (!nivel) return '';
  const clean = String(nivel).trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ' ');
  const mBas = clean.match(/^([1-8])\s*°?\s*BASICO$/);
  if (mBas) return `${mBas[1]}° Básico`;
  const mMed = clean.match(/^(I|II|III|IV)\s*°?\s*MEDIO$/);
  if (mMed) return `${mMed[1]}° Medio`;
  return String(nivel).trim();
}

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
 * Construye el arreglo de unidades oficiales de un plan a partir de sus objetivos
 */
function construirUnidadesOficialesPlan(objetivos) {
  const mapUnidades = new Map();
  for (const obj of (objetivos || [])) {
    const rawU = obj.unidad !== undefined && obj.unidad !== null ? String(obj.unidad).trim() : 'Unidad 1';
    const matchNum = rawU.match(/(\d+)/);
    const num = matchNum ? parseInt(matchNum[1], 10) : (mapUnidades.size + 1);
    const uKey = `Unidad ${num}`;
    const nombreOficial = String(obj.nombre_unidad || obj.nombre_unidad_oficial || uKey).trim();
    const nombreFinal = (nombreOficial.startsWith('Unidad') || nombreOficial.startsWith('Unit'))
      ? nombreOficial
      : `${uKey}: ${nombreOficial}`;
    if (!mapUnidades.has(num)) {
      mapUnidades.set(num, {
        numero: num,
        unidad: uKey,
        nombre: nombreFinal,
        nombre_unidad: nombreFinal,
        semestre: num <= 2 ? 1 : 2,
        horas_sugeridas: 38
      });
    } else if (nombreOficial && nombreOficial !== uKey && mapUnidades.get(num).nombre === uKey) {
      mapUnidades.get(num).nombre = nombreFinal;
      mapUnidades.get(num).nombre_unidad = nombreFinal;
    }
  }
  return Array.from(mapUnidades.values()).sort((a, b) => a.numero - b.numero);
}

/**
 * Inicializa las tablas del currículo y siembra el catálogo oficial MINEDUC enriquecido
 * con Unidades Oficiales (nombres y OAs reales Basales y Complementarios), Habilidades e Indicadores.
 * Preserva los IDs de planes y las ediciones manuales en reinicios normales del servidor.
 */
function inicializarCurriculo(db, callback, { forzarActualizacion = false, ignorarEdicionesManuales = false } = {}) {
  const anioActual = 2026;
  const catalogoActual = obtenerCatalogoMineducCompleto();

  db.serialize(() => {
    // 1. Asegurar columnas en las tablas
    db.run("ALTER TABLE curriculo_planes ADD COLUMN habilidades_sugeridas TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE curriculo_planes ADD COLUMN unidades_oficiales TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE curriculo_objetivos ADD COLUMN unidad_sugerida TEXT DEFAULT 'Unidad 1'", () => {});
    db.run("ALTER TABLE curriculo_objetivos ADD COLUMN nombre_unidad_oficial TEXT DEFAULT ''", () => {});
    db.run("ALTER TABLE curriculo_objetivos ADD COLUMN editado_manual INTEGER DEFAULT 0", () => {});
    db.run("DELETE FROM curriculo_objetivos WHERE plan_id NOT IN (SELECT id FROM curriculo_planes)", () => {});

    // 2. Verificar versión de semilla y estado de la base de datos
    db.get("SELECT valor FROM config_global WHERE clave = 'curriculo_seed_version'", [], (errVer, verRow) => {
      const versionGuardada = verRow ? verRow.valor : '';

      db.get("SELECT COUNT(*) as total, SUM(CASE WHEN nombre_unidad_oficial IS NOT NULL AND nombre_unidad_oficial != '' THEN 1 ELSE 0 END) as con_nombre_unidad FROM curriculo_objetivos", [], (err, row) => {
        if (err) {
          console.error("[CURRICULO] Error verificando estado:", err);
          if (callback) callback(err);
          return;
        }

        const totalOAs = (row && row.total) || 0;
        const conNombreUnidad = (row && row.con_nombre_unidad) || 0;

        // Si ya está en la versión vigente con nombres de unidades oficiales y no se fuerza actualización, conservar intacto
        if (!forzarActualizacion && versionGuardada === CURRICULO_SEED_VERSION && totalOAs >= catalogoActual.length && conNombreUnidad > 0) {
          console.log(`[CURRICULO] Catálogo oficial MINEDUC v${CURRICULO_SEED_VERSION} activo (${totalOAs} OAs). Ediciones manuales preservadas.`);
          if (callback) callback(null);
          return;
        }

        console.log(`[CURRICULO] Actualizando catálogo oficial MINEDUC ${anioActual} (v${CURRICULO_SEED_VERSION}, ${catalogoActual.length} OAs)...`);

        // Agrupar catálogo por (nivel, asignatura) normalizados
        const planesAgrupados = {};
        for (const item of catalogoActual) {
          const nivNorm = normalizarNivel(item.nivel);
          const asigNorm = normalizarNombreAsignatura(item.asignatura);
          const key = `${nivNorm}___${asigNorm}`;
          if (!planesAgrupados[key]) {
            const habs = HABILIDADES_POR_ASIGNATURA[asigNorm] || HABILIDADES_POR_ASIGNATURA[item.asignatura] || [];

            planesAgrupados[key] = {
              nivel: nivNorm,
              asignatura: asigNorm,
              tipo: 'MINEDUC',
              habilidades: habs,
              objetivos: []
            };
          }
          planesAgrupados[key].objetivos.push(item);
        }

        const keys = Object.keys(planesAgrupados);
        let planesProcesados = 0;
        let oasProcesados = 0;

        function procesarSiguientePlan(idx) {
          if (idx >= keys.length) {
            db.run("INSERT OR REPLACE INTO config_global (clave, valor) VALUES ('curriculo_seed_version', ?)", [CURRICULO_SEED_VERSION], () => {
              console.log(`[CURRICULO] Sincronización completada: ${planesProcesados} planes y ${oasProcesados} OAs oficiales con nombres de Unidad, Habilidades e Indicadores.`);
              if (callback) callback(null);
            });
            return;
          }

          const planData = planesAgrupados[keys[idx]];
          const habsJson = JSON.stringify(planData.habilidades || []);
          const unidadesOficialesArr = construirUnidadesOficialesPlan(planData.objetivos);
          const unidadesJson = JSON.stringify(unidadesOficialesArr);
          const desc = `Programa de Estudio Oficial MINEDUC ${planData.asignatura} - ${planData.nivel}`;

          // Buscar si el plan ya existe (incluyendo variantes sin tilde) para preservar su ID
          const nivSinTilde = planData.nivel.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          db.all(
            `SELECT id, nivel FROM curriculo_planes WHERE anio = ? AND tipo = 'MINEDUC' AND (nivel = ? OR nivel = ?) AND asignatura = ? ORDER BY id ASC`,
            [anioActual, planData.nivel, nivSinTilde, planData.asignatura],
            (errFind, existingPlans) => {
              if (errFind) {
                console.error("[CURRICULO] Error buscando plan:", errFind);
                procesarSiguientePlan(idx + 1);
                return;
              }

              if (existingPlans && existingPlans.length > 0) {
                const planId = existingPlans[0].id;
                // Si había planes duplicados por tilde, limpiar los sobrantes no editados
                if (existingPlans.length > 1) {
                  const extraIds = existingPlans.slice(1).map(p => p.id);
                  extraIds.forEach(eid => {
                    db.run(`DELETE FROM curriculo_objetivos WHERE plan_id = ? AND (editado_manual IS NULL OR editado_manual = 0)`, [eid]);
                    db.run(`DELETE FROM curriculo_planes WHERE id = ?`, [eid]);
                  });
                }
                db.run(
                  `UPDATE curriculo_planes SET nivel = ?, asignatura = ?, descripcion = ?, habilidades_sugeridas = ?, unidades_oficiales = ?, activo = 1, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                  [planData.nivel, planData.asignatura, desc, habsJson, unidadesJson, planId],
                  () => {
                    planesProcesados++;
                    sincronizarObjetivosPlan(planId, planData.objetivos, () => procesarSiguientePlan(idx + 1));
                  }
                );
              } else {
                db.run(
                  `INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, habilidades_sugeridas, unidades_oficiales, activo) VALUES (?, 'MINEDUC', ?, ?, ?, ?, ?, 1)`,
                  [anioActual, planData.nivel, planData.asignatura, desc, habsJson, unidadesJson],
                  function (errIns) {
                    if (errIns) {
                      console.error("[CURRICULO] Error insertando plan:", errIns);
                      procesarSiguientePlan(idx + 1);
                      return;
                    }
                    planesProcesados++;
                    sincronizarObjetivosPlan(this.lastID, planData.objetivos, () => procesarSiguientePlan(idx + 1));
                  }
                );
              }
            }
          );
        }

        function sincronizarObjetivosPlan(planId, objetivos, onDone) {
          if (!objetivos || objetivos.length === 0) {
            onDone();
            return;
          }

          // Eliminar OAs no editados manualmente de este plan antes de reinsertar el catálogo oficial limpio
          const sqlDelete = ignorarEdicionesManuales
            ? `DELETE FROM curriculo_objetivos WHERE plan_id = ?`
            : `DELETE FROM curriculo_objetivos WHERE plan_id = ? AND (editado_manual IS NULL OR editado_manual = 0)`;

          db.run(sqlDelete, [planId], () => {
            db.all(`SELECT codigo, unidad_sugerida FROM curriculo_objetivos WHERE plan_id = ? AND editado_manual = 1`, [planId], (errMan, manualRows) => {
              const manualSet = new Set((manualRows || []).map(r => `${r.codigo}___${r.unidad_sugerida}`));
              let count = 0;

              objetivos.forEach((obj, orderIdx) => {
                const rawU = obj.unidad !== undefined && obj.unidad !== null ? String(obj.unidad).trim() : '1';
                const mNum = rawU.match(/(\d+)/);
                const numU = mNum ? parseInt(mNum[1], 10) : 1;
                const uSug = `Unidad ${numU}`;
                const mKey = `${obj.codigo}___${uSug}`;
                if (!ignorarEdicionesManuales && manualSet.has(mKey)) {
                  count++;
                  if (count === objetivos.length) onDone();
                  return;
                }

                const indicsJson = JSON.stringify(obj.indicadores || []);
                const nomUniOficial = String(obj.nombre_unidad || obj.nombre_unidad_oficial || uSug).trim();
                const nomFinal = (nomUniOficial.startsWith('Unidad') || nomUniOficial.startsWith('Unit'))
                  ? nomUniOficial
                  : `${uSug}: ${nomUniOficial}`;
                const catNormalizada = (obj.categoria === 'Complementario') ? 'Complementario' : 'Basal';

                db.run(
                  `INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, editado_manual, activo)
                   VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
                  [
                    planId,
                    obj.eje || 'General',
                    uSug,
                    nomFinal,
                    obj.codigo,
                    obj.descripcion,
                    catNormalizada,
                    indicsJson,
                    orderIdx + 1
                  ],
                  (errObj) => {
                    if (!errObj) oasProcesados++;
                    count++;
                    if (count === objetivos.length) onDone();
                  }
                );
              });
            });
          });
        }

        procesarSiguientePlan(0);
      });
    });
  });
}

/**
 * Procesa un archivo Excel/CSV cargado por UTP para actualizar o crear planes curriculares
 */
function importarCurriculoExcel(db, buffer, anio, tipo = 'MINEDUC', opciones = {}) {
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
        const codigo = (r['Codigo'] || r['codigo'] || r['Codigo_OA'] || r['codigo_oa'] || r['OA'] || r['oa'] || '').toString().trim();
        const descripcion = (r['Descripcion'] || r['descripcion'] || r['Descripcion_OA'] || r['descripcion_oa'] || r['Objetivo'] || '').toString().trim();
        const eje = (r['Eje'] || r['eje'] || 'General').toString().trim();
        const unidad = (r['Unidad'] || r['unidad'] || 'Unidad 1').toString().trim();
        const nombreUnidad = (r['Nombre_Unidad'] || r['nombre_unidad'] || r['Titulo_Unidad'] || unidad).toString().trim();
        const categoriaRaw = (r['Categoria'] || r['categoria'] || r['Basal_Complementario'] || r['Priorizacion'] || 'Basal').toString().trim();
        const categoria = categoriaRaw.toLowerCase().includes('comp') ? 'Complementario' : 'Basal';
        const indicadoresRaw = (r['Indicadores'] || r['indicadores'] || '').toString().trim();
        const suplantarRaw = (r['Suplantar_MINEDUC'] || r['suplantar_mineduc'] || r['Excluir_MINEDUC'] || r['excluir_mineduc'] || '').toString().trim().toUpperCase();
        const suplantarColumna = (suplantarRaw === 'SI' || suplantarRaw === 'S' || suplantarRaw === '1' || suplantarRaw === 'TRUE');

        if (!nivel || !asignatura || !codigo || !descripcion) continue;

        let indicadoresArr = [];
        if (indicadoresRaw) {
          indicadoresArr = indicadoresRaw.split(';').map(i => i.trim()).filter(Boolean);
        }

        const key = `${nivel}___${asignatura}`;
        if (!planesMap[key]) {
          const asigNorm = normalizarNombreAsignatura(asignatura);
          const habs = HABILIDADES_POR_ASIGNATURA[asigNorm] || HABILIDADES_POR_ASIGNATURA[asignatura] || [];
          const excluirMineduc = suplantarColumna || (tipo === 'PROPIO' && opciones.excluir_oas_mineduc);
          planesMap[key] = {
            nivel,
            asignatura,
            habilidades: habs,
            excluir_oas_mineduc: excluirMineduc ? 1 : 0,
            objetivos: []
          };
        } else if (suplantarColumna) {
          planesMap[key].excluir_oas_mineduc = 1;
        }
        planesMap[key].objetivos.push({
          codigo,
          descripcion,
          eje,
          unidad,
          nombre_unidad: nombreUnidad.startsWith('Unidad') ? nombreUnidad : `${unidad}: ${nombreUnidad}`,
          categoria,
          indicadores: indicadoresArr
        });
      }

      const keys = Object.keys(planesMap);
      if (keys.length === 0) {
        return reject(new Error("No se encontraron registros válidos con las columnas requeridas (Nivel, Asignatura, Codigo/Codigo_OA, Descripcion/Descripcion_OA)."));
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
          const unidadesJson = JSON.stringify(construirUnidadesOficialesPlan(item.objetivos));
          const excluyeVal = item.excluir_oas_mineduc ? 1 : 0;
          db.get(`SELECT id FROM curriculo_planes WHERE anio = ? AND nivel = ? AND asignatura = ? AND tipo = ?`,
            [anioNum, item.nivel, item.asignatura, tipo], (errFind, planRow) => {
              if (errFind) {
                db.run("ROLLBACK");
                return reject(errFind);
              }

              if (planRow) {
                const planId = planRow.id;
                db.run(`UPDATE curriculo_planes SET habilidades_sugeridas = ?, unidades_oficiales = ?, excluir_oas_mineduc = ?, activo = 1, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                  [habsJson, unidadesJson, excluyeVal, planId]);
                upsertOAs(planId, item.objetivos, () => procesarPlan(index + 1));
              } else {
                db.run(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, habilidades_sugeridas, unidades_oficiales, excluir_oas_mineduc, activo)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                  [anioNum, tipo, item.nivel, item.asignatura, `Plan ${tipo} ${item.asignatura} - ${item.nivel}`, habsJson, unidadesJson, excluyeVal],
                  function (errIns) {
                    if (errIns) {
                      db.run("ROLLBACK");
                      return reject(errIns);
                    }
                    planesCreados++;
                    const planId = this.lastID;
                    upsertOAs(planId, item.objetivos, () => procesarPlan(index + 1));
                  });
              }
            });
        }

        function upsertOAs(planId, objs, onDone) {
          let count = 0;
          objs.forEach((obj, idx) => {
            db.get(
              `SELECT id FROM curriculo_objetivos WHERE plan_id = ? AND UPPER(TRIM(codigo)) = UPPER(TRIM(?)) AND UPPER(TRIM(unidad_sugerida)) = UPPER(TRIM(?))`,
              [planId, obj.codigo, obj.unidad],
              (errExist, existingOa) => {
                if (existingOa) {
                  db.run(
                    `UPDATE curriculo_objetivos SET eje_unidad = ?, nombre_unidad_oficial = ?, descripcion = ?, categoria = ?, indicadores_sugeridos = ?, editado_manual = 1, activo = 1 WHERE id = ?`,
                    [obj.eje, obj.nombre_unidad, obj.descripcion, obj.categoria, JSON.stringify(obj.indicadores || []), existingOa.id],
                    (errUpd) => {
                      if (!errUpd) objetivosCreados++;
                      count++;
                      if (count === objs.length) onDone();
                    }
                  );
                } else {
                  db.run(
                    `INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, editado_manual, activo)
                     VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
                    [planId, obj.eje, obj.unidad, obj.nombre_unidad, obj.codigo, obj.descripcion, obj.categoria, JSON.stringify(obj.indicadores || []), idx + 1],
                    (errObj) => {
                      if (!errObj) objetivosCreados++;
                      count++;
                      if (count === objs.length) onDone();
                    }
                  );
                }
              }
            );
          });
        }

        procesarPlan(0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  CURRICULO_SEED_VERSION,
  CATALOGO_MINEDUC_COMPLETO,
  HABILIDADES_POR_ASIGNATURA,
  ACTITUDES_GENERALES_MINEDUC,
  obtenerCatalogoMineducCompleto,
  construirUnidadesOficialesPlan,
  inicializarCurriculo,
  importarCurriculoExcel,
  normalizarNivel,
  normalizarNombreAsignatura
};
