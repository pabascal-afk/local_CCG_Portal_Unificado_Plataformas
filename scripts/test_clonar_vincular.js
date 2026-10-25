const planificacion = require('../server/services/planificacion');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

function queryRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function queryGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function runTests() {
    console.log("=== INICIANDO TEST DE CLONAR, VINCULAR Y TAGS ===");
    const usuarioMock = {
        email: 'profesor.test@colegiocerrogrande.cl',
        nombre: 'Profesor Test',
        rol: 'Profesor'
    };

    const anioTest = 2029; // Usamos un año futuro aislado para testing limpio
    const cursoA = 'TEST 4° BASICO A';
    const cursoB = 'TEST 4° BASICO B';
    const cursoC = 'TEST 4° BASICO C';
    const asignatura = 'LENGUAJE Y COMUNICACION';

    try {
        // Limpieza previa
        await queryRun(`DELETE FROM planificaciones WHERE anio = ?`, [anioTest]);
        console.log("✔ Limpieza previa realizada.");

        // 1. Crear planificación para curso A
        const resCrear = await planificacion.crearPlanificacion({
            anio: anioTest,
            curso: cursoA,
            asignatura: asignatura,
            titulo: `Planificación Test ${cursoA}`,
            docente_responsable: usuarioMock.nombre
        }, usuarioMock);

        const planAId = resCrear.id;
        console.log(`✔ Planificación A creada con ID: ${planAId}`);

        // 2. Guardar unidad con tags y semanas
        const tagsUnidad = ['DUA I: Representación', 'ABP', 'Evaluación Formativa'];
        await planificacion.guardarPlanificacion(planAId, {
            titulo: `Planificación Test ${cursoA} Actualizada`,
            unidades: [
                {
                    numero_unidad: 1,
                    nombre_unidad: 'Unidad 1: Comprensión Lectora',
                    semestre: 1,
                    horas_estimadas: 30,
                    oas_seleccionados: ['OA 01', 'OA 02'],
                    tags: tagsUnidad,
                    desglose_semanal: [
                        { semana: 1, tema: 'Estrategias de lectura', tags: ['DUA I'] },
                        { semana: 2, tema: 'Textos narrativos', tags: ['ABP'] }
                    ],
                    orden: 1
                }
            ]
        }, usuarioMock);

        const detalleA = await planificacion.obtenerPlanificacionDetalle(planAId);
        if (!detalleA.unidades[0].tags.includes('ABP')) {
            throw new Error("Tags no se guardaron correctamente en la unidad.");
        }
        console.log("✔ Tags y unidades guardados y recuperados correctamente:", detalleA.unidades[0].tags);

        // 3. Test Clonar a Curso B
        const resClonar = await planificacion.clonarPlanificacion(planAId, cursoB, usuarioMock);
        const planBId = resClonar.id;
        console.log(`✔ Planificación clonada con éxito a ${cursoB} (ID: ${planBId})`);

        const detalleB = await planificacion.obtenerPlanificacionDetalle(planBId);
        if (detalleB.curso !== cursoB) throw new Error("El curso clonado no coincide.");
        if (detalleB.unidades.length !== 1 || !detalleB.unidades[0].tags.includes('ABP')) {
            throw new Error("Las unidades y tags no se clonaron correctamente.");
        }
        console.log("✔ Detalle de plan clonado B validado con éxito.");

        // 4. Test Vincular Curso C a Plan A
        const resVincular = await planificacion.vincularCurso(planAId, cursoC, usuarioMock);
        console.log(`✔ Curso ${cursoC} vinculado a Plan A:`, resVincular.cursos_vinculados);

        const detalleAVinculado = await planificacion.obtenerPlanificacionDetalle(planAId);
        if (!detalleAVinculado.cursos_vinculados.includes(cursoC)) {
            throw new Error("Curso C no figura en cursos_vinculados de Plan A.");
        }

        // 5. Test Desvincular Curso C con opción de crear copia independiente
        const resDesvincular = await planificacion.desvincularCurso(planAId, cursoC, { crearCopia: true }, usuarioMock);
        console.log(`✔ Curso ${cursoC} desvinculado con copia creada:`, resDesvincular);

        const detalleC = await planificacion.obtenerPlanificacionDetalle(resDesvincular.nuevo_plan_id);
        if (detalleC.curso !== cursoC) throw new Error("Copia independiente de Curso C falló.");
        console.log("✔ Copia independiente de Curso C creada exitosamente tras desvinculación.");

        // Limpieza final
        await queryRun(`DELETE FROM planificaciones WHERE anio = ?`, [anioTest]);
        console.log("✔ Limpieza final realizada con éxito.");
        console.log("\n==========================================");
        console.log("🎉 TODOS LOS TESTS PASARON EXITOSAMENTE (100%)");
        console.log("==========================================");
        process.exit(0);
    } catch (e) {
        console.error("❌ ERROR EN TESTS:", e);
        process.exit(1);
    }
}

runTests();
