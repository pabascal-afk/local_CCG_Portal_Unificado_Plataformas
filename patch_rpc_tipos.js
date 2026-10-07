const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// The sumarParaTope function needs to be replaced.
// Since it's synchronous right now inside the loops, I will replace it with a Set that checks a fetched list.
// I will fetch `config_tipos_evaluacion` before the validation loops.

const target = `const sumarParaTope = (t) => {
                  const txt = (t || '').toUpperCase();
                  return txt.includes('PRUEBA') || txt.includes('EXPOSICI') || txt === 'ESCRITA';
              };`;
              
const replacement = `const tiposDbList = await queryAll("SELECT * FROM config_tipos_evaluacion");
              const sumarParaTope = (t) => {
                  const txt = (t || '').trim();
                  const found = tiposDbList.find(dbT => dbT.nombre.trim() === txt);
                  if (found) return found.es_prueba === 1;
                  // Fallback to legacy string matching if type not in DB
                  const tUpper = txt.toUpperCase();
                  return tUpper.includes('PRUEBA') || tUpper.includes('EXPOSICI') || tUpper === 'ESCRITA';
              };`;

code = code.split(target).join(replacement);

// Same replacement for the edit/delete patch
// I already replaced it with split/join which does global replacement

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log("rpc.js actualizado para usar config_tipos_evaluacion");
