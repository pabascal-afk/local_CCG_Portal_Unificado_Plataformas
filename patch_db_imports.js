const fs = require('fs');

function fixFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    const importDb = "const { queryAll, run } = require('../db/db');";
    
    if (code.includes(importDb)) {
        const replacement = `const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/colegio.db');

const queryAll = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(query, params, (err, rows) => {
        db.close();
        if(err) reject(err); else resolve(rows);
    });
});
const run = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(query, params, function(err) {
        db.close();
        if(err) reject(err); else resolve(this.lastID);
    });
});`;
        code = code.replace(importDb, replacement);
        fs.writeFileSync(file, code, 'utf8');
        console.log("Fixed " + file);
    }
}

fixFile('server/api/config.js');
fixFile('server/api/envios.js');
