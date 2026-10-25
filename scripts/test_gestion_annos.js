const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const annosService = require('../server/services/annos');
const planificacionService = require('../server/services/planificacion');

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

function queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err); else resolve(rows || []);
        });
    });
}

function queryGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err); else resolve(row);
        });
    });
}

function queryRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err); else resolve(this);
        });
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('🧪 VERIFICACIÓN INTEGRAL DE GESTIÓN DE AÑOS ESCOLARES');
    console.log('====================================================\n');

    const adminUser = {
        email: 'pabascal@colegiocerrogrande.cl',
        nombre: 'PEDRO ABASCAL',
        rol: 'Administrador'
    };

    let testPlanId2026 = null;
    let promotedPlanId2027 = null;

    try {
        // -------------------------------------------------------------
        // TEST 1: Listar Años Iniciales
        // -------------------------------------------------------------
        console.log('1️⃣ Verificando listarAnnos() y Año 2026 por defecto...');
        const annos = await annosService.listarAnnos();
        console.log(`   - Años encontrados: ${annos.map(a => `${a.anno} (${a.estado})`).join(', ')}`);
        
        const anno2026 = annos.find(a => a.anno === 2026);
        if (!anno2026) throw new Error('Año 2026 no encontrado en annos_escolares');
        if (anno2026.estado !== 'Activo') throw new Error(`Estado de 2026 debe ser Activo, obtenido: ${anno2026.estado}`);
        console.log(`   ✅ Año 2026 verificado. Métricas: ${JSON.stringify(anno2026.metricas)}`);

        // -------------------------------------------------------------
        // TEST 2: Obtener Año Activo
        // -------------------------------------------------------------
        console.log('\n2️⃣ Verificando obtenerAnnoActivo()...');
        const activo = await annosService.obtenerAnnoActivo();
        if (activo.anno !== 2026) throw new Error(`Año activo esperado 2026, obtenido: ${activo.anno}`);
        console.log(`   ✅ Año Activo obtenido: ${activo.nombre} (${activo.anno})`);

        // -------------------------------------------------------------
        // TEST 3: Crear Nuevo Año Escolar 2027
        // -------------------------------------------------------------
        console.log('\n3️⃣ Creando Año Escolar 2027 (En preparación)...');
        // Limpiar previo 2027 si quedó de alguna corrida
        await queryRun(`DELETE FROM annos_escolares WHERE anno = 2027`);
        await queryRun(`DELETE FROM curriculo_objetivos WHERE plan_id IN (SELECT id FROM curriculo_planes WHERE anio = 2027)`);
        await queryRun(`DELETE FROM curriculo_planes WHERE anio = 2027`);
        await queryRun(`DELETE FROM horarios WHERE anno = 2027`);

        const resCrear = await annosService.crearAnno({
            anno: 2027,
            nombre: 'Año Escolar 2027',
            estado: 'En preparacion',
            fecha_inicio: '2027-03-01',
            fecha_fin: '2027-12-17',
            descripcion: 'Ciclo lectivo de pruebas automatizadas'
        }, adminUser);
        console.log(`   - Resultado: ${resCrear.mensaje}`);

        const curr2027Count = await queryGet(`
            SELECT COUNT(*) as total 
            FROM curriculo_objetivos o
            JOIN curriculo_planes p ON o.plan_id = p.id
            WHERE p.anio = 2027
        `);
        console.log(`   - Objetivos curriculares MINEDUC auto-copiados para 2027: ${curr2027Count.total}`);
        if (curr2027Count.total === 0) throw new Error('No se copiaron objetivos curriculares para 2027');
        console.log('   ✅ Creación de Año 2027 y auto-copia curricular exitosa.');

        // -------------------------------------------------------------
        // TEST 4: Clonación Interanual de Horarios (2026 -> 2027)
        // -------------------------------------------------------------
        console.log('\n4️⃣ Clonando Horarios de 2026 a 2027...');
        const resClonHorarios = await annosService.clonarHorariosInteranual(2026, 2027, adminUser);
        console.log(`   - ${resClonHorarios.mensaje}`);

        const count2026 = await queryGet(`SELECT COUNT(*) as c FROM horarios WHERE anno = 2026`);
        const count2027 = await queryGet(`SELECT COUNT(*) as c FROM horarios WHERE anno = 2027`);
        console.log(`   - Bloques 2026: ${count2026.c} | Bloques 2027 clonados: ${count2027.c}`);
        if (count2027.c !== count2026.c || count2027.c === 0) {
            throw new Error(`Discrepancia en conteo de horarios clonados: 2026=${count2026.c}, 2027=${count2027.c}`);
        }
        console.log('   ✅ Horarios 2026 clonados íntegramente a 2027.');

        // -------------------------------------------------------------
        // TEST 5: Detección de Plan del Año Anterior en Cursos Docente
        // -------------------------------------------------------------
        console.log('\n5️⃣ Verificando detección inteligente de plan anterior para el docente...');
        // Buscar un curso y docente real de la malla horaria
        const hEjemplo = await queryGet(`
            SELECT curso, asignatura, profesor 
            FROM horarios 
            WHERE anno = 2026 AND curso IS NOT NULL AND profesor IS NOT NULL AND TRIM(profesor) != '' 
            LIMIT 1
        `);
        const cursoTest = hEjemplo.curso;
        const asigTest = hEjemplo.asignatura;
        const profeTest = hEjemplo.profesor;
        console.log(`   - Probando con curso "${cursoTest}", asignatura "${asigTest}", docente "${profeTest}"...`);

        // Limpiar posible plan residual
        await queryRun(`DELETE FROM planificaciones WHERE anio IN (2026, 2027) AND curso = ? AND asignatura = ?`, [cursoTest, asigTest]);

        // Crear un plan 2026 para testing
        const resPlan = await planificacionService.crearPlanificacion({
            anio: 2026,
            curso: cursoTest,
            asignatura: asigTest,
            titulo: `Planificación Anual ${asigTest} ${cursoTest} 2026`
        }, { ...adminUser, nombre: profeTest });
        testPlanId2026 = resPlan.id;

        // Agregar una unidad con OAs y tags
        await planificacionService.guardarPlanificacion(testPlanId2026, {
            titulo: `Planificación Anual ${asigTest} ${cursoTest} 2026`,
            docente_responsable: profeTest,
            unidades: [{
                numero_unidad: 1,
                nombre_unidad: 'Unidad 1: Introducción y Fundamentos',
                semestre: 1,
                horas_estimadas: 30,
                fecha_inicio: '2026-03-05',
                fecha_fin: '2026-04-05',
                oas_seleccionados: ['OA 01', 'OA 02'],
                indicadores_evaluacion: 'Lee comprensivamente; Escribe oraciones completas',
                habilidades: 'Analizar, Crear',
                tags: ['DUA I: Representación', 'ABP (Proyectos)']
            }]
        }, { ...adminUser, nombre: profeTest });

        // Marcar como Visada para simular plan aprobado
        await planificacionService.cambiarEstadoVisado(testPlanId2026, 'Visada', 'Aprobado oficialmente', adminUser);

        // Consultar asignaciones para 2027 del docente
        const datosDocente2027 = await planificacionService.obtenerCursosDocente(profeTest, profeTest, 2027);
        const asignacionTest = (datosDocente2027.misAsignaciones || []).find(a => a.curso === cursoTest && a.asignatura === asigTest);
        
        console.log(`   - Asignación ${cursoTest} (${asigTest}) en 2027:`);
        console.log(`     * Estado 2027: ${asignacionTest ? asignacionTest.estado : 'No encontrada'}`);
        console.log(`     * Tiene plan anterior: ${asignacionTest ? asignacionTest.tiene_plan_anterior : false}`);
        console.log(`     * ID Plan anterior: ${asignacionTest ? asignacionTest.plan_anterior_id : null} (Año ${asignacionTest ? asignacionTest.plan_anterior_anno : null})`);

        if (!asignacionTest || !asignacionTest.tiene_plan_anterior) {
            throw new Error('No se detectó el plan del año anterior para la asignación en 2027');
        }
        console.log('   ✅ Detección de plan del año anterior verificada con éxito.');

        // -------------------------------------------------------------
        // TEST 6: Promoción Individual de Plan a 2027
        // -------------------------------------------------------------
        console.log('\n6️⃣ Promoviendo plan individual de 2026 hacia 2027...');
        const resPromocion = await planificacionService.promoverPlanificacionIndividual(testPlanId2026, 2027, adminUser);
        promotedPlanId2027 = resPromocion.nuevoPlanId;
        console.log(`   - ${resPromocion.mensaje} (Nuevo ID: ${promotedPlanId2027})`);

        const nuevoPlan = await planificacionService.obtenerPlanificacionDetalle(promotedPlanId2027);
        console.log(`   - Plan 2027 creado: "${nuevoPlan.titulo}" (Año: ${nuevoPlan.anio}, Estado: ${nuevoPlan.estado})`);
        console.log(`   - Unidades copiadas: ${nuevoPlan.unidades.length}`);
        
        if (nuevoPlan.anio !== 2027) throw new Error(`Año de plan debe ser 2027, es ${nuevoPlan.anio}`);
        if (nuevoPlan.estado !== 'En edición' && nuevoPlan.estado !== 'En edicion') throw new Error(`Estado debe ser 'En edición', es ${nuevoPlan.estado}`);
        if (nuevoPlan.unidades.length !== 1) throw new Error(`Debe tener 1 unidad copiada, tiene ${nuevoPlan.unidades.length}`);
        
        const u = nuevoPlan.unidades[0];
        console.log(`     * Unidad 1: "${u.nombre_unidad}"`);
        console.log(`     * OAs: ${JSON.stringify(u.oas_seleccionados)}`);
        console.log(`     * Tags DUA/Metodologías: ${JSON.stringify(u.tags)}`);
        console.log(`     * Fechas de semana limpiadas para nuevo año: inicio="${u.fecha_inicio}", fin="${u.fecha_fin}"`);

        if (u.fecha_inicio || u.fecha_fin) {
            throw new Error('Las fechas de semanas de la unidad debieron limpiarse para el nuevo año.');
        }
        if (!u.tags || u.tags.length === 0) {
            throw new Error('Las etiquetas pedagógicas DUA debieron conservarse.');
        }
        console.log('   ✅ Promoción individual verificada: unidades, OAs y DUA tags preservados, fechas de calendario escolar limpiadas.');

        // -------------------------------------------------------------
        // TEST 7: Establecer y Cerrar Año Escolar
        // -------------------------------------------------------------
        console.log('\n7️⃣ Probando transición de ciclo: Activar y Cerrar Año 2027...');
        await annosService.establecerAnnoActivo(2027, adminUser);
        const activo2027 = await annosService.obtenerAnnoActivo();
        if (activo2027.anno !== 2027) throw new Error('Fallo al establecer 2027 como activo');
        console.log('   - 2027 establecido como Año Activo.');

        await annosService.cerrarAnno(2027, adminUser);
        const annosPostCierre = await annosService.listarAnnos();
        const a2027Cerrado = annosPostCierre.find(a => a.anno === 2027);
        if (a2027Cerrado.estado !== 'Cerrado') throw new Error(`Estado debe ser Cerrado, es ${a2027Cerrado.estado}`);
        console.log('   - 2027 cerrado exitosamente (Modo Histórico Solo Lectura).');

        // Restaurar 2026 como activo
        await annosService.establecerAnnoActivo(2026, adminUser);
        console.log('   - 2026 restaurado como Año Activo predeterminado.');

        console.log('\n====================================================');
        console.log('🎉 TODAS LAS PRUEBAS DE AÑOS ESCOLARES PASARON (100%)');
        console.log('====================================================');

    } catch (err) {
        console.error('\n❌ ERROR EN TEST DE AÑOS ESCOLARES:', err);
        process.exitCode = 1;
    } finally {
        // Limpieza de datos de prueba
        console.log('\n🧹 Limpiando registros temporales de prueba...');
        if (promotedPlanId2027) {
            await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [promotedPlanId2027]);
            await queryRun(`DELETE FROM planificaciones WHERE id = ?`, [promotedPlanId2027]);
        }
        if (testPlanId2026) {
            await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [testPlanId2026]);
            await queryRun(`DELETE FROM planificaciones WHERE id = ?`, [testPlanId2026]);
        }
        await queryRun(`DELETE FROM horarios WHERE anno = 2027`);
        await queryRun(`DELETE FROM curriculo_objetivos WHERE plan_id IN (SELECT id FROM curriculo_planes WHERE anio = 2027)`);
        await queryRun(`DELETE FROM curriculo_planes WHERE anio = 2027`);
        await queryRun(`DELETE FROM annos_escolares WHERE anno = 2027`);
        await queryRun(`UPDATE config_global SET valor = '2026' WHERE clave = 'anno_activo_predeterminado'`);
        db.close();
        console.log('✅ Base de datos restaurada al estado limpio 2026.');
    }
}

runTests();
