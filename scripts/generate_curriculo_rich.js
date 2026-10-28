/**
 * Script de verificación y sincronización del catálogo curricular oficial MINEDUC
 * Los catálogos modulares oficiales están mantenidos directamente en:
 * - server/services/curriculo_data/lenguaje.js
 * - server/services/curriculo_data/matematica.js
 * - server/services/curriculo_data/ciencias.js
 * - server/services/curriculo_data/historia.js
 * - server/services/curriculo_data/ingles.js
 * - server/services/curriculo_data/especialidades.js
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { inicializarCurriculo, CURRICULO_SEED_VERSION } = require('../server/services/curriculo_seed');

async function main() {
    const dbPath = path.join(__dirname, '../server/db/colegio.db');
    const db = new sqlite3.Database(dbPath);
    console.log(`[Curriculo] Sincronizando catálogo curricular oficial (${CURRICULO_SEED_VERSION}) en ${dbPath}...`);
    await new Promise((resolve, reject) => {
        inicializarCurriculo(db, (err) => {
            if (err) reject(err);
            else resolve();
        }, { forzarActualizacion: true });
    });
    console.log('[Curriculo] Catálogo sincronizado exitosamente.');
    db.close();
}

if (require.main === module) {
    main().catch(err => {
        console.error('Error sincronizando currículo:', err);
        process.exit(1);
    });
}
