const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// 1. Change user mock
code = code.replace(/const user = req\.user \|\| \{ email: 'admin@colegio\.edu', nombre: 'Admin Dev', rol: 'Administrador' \};/, 
"const user = req.user || { email: 'pabascal@colegiocerrogrande.cl', nombre: 'PEDRO ABASCAL', rol: 'Administrador' };");

// 2. Rewrite getConfigFrontend
const getConfRegex = /if \(functionName === 'getConfigFrontend'\) \{[\s\S]*?return res\.json\(\{ result \}\);\s*\}/;

const getConfReplacement = `if (functionName === 'getConfigFrontend') {
            const isAdmin = user.rol.toLowerCase().includes('admin') || user.rol.toLowerCase().includes('directivo') || user.rol.toLowerCase().includes('convivencia');
            
            // Extract from DB
            const allHorarios = await queryAll("SELECT * FROM horarios");
            const cursosSet = new Set();
            const asigSet = new Set();
            const profSet = new Set();
            
            const asigDict = {};
            
            allHorarios.forEach(h => {
                if(h.curso) cursosSet.add(h.curso.trim());
                if(h.asignatura) asigSet.add(h.asignatura.trim());
                if(h.profesor) profSet.add(h.profesor.trim());
                
                const c = h.curso ? h.curso.trim() : '';
                const a = h.asignatura ? h.asignatura.trim() : '';
                const d = h.dia ? h.dia.trim().toLowerCase() : '';
                
                if(!asigDict[c]) asigDict[c] = {};
                
                // Si es admin, puede elegir cualquier asignatura cualquier da, as que guardamos todas en "TODAS"
                if(isAdmin) {
                   if(!asigDict[c]['TODAS']) asigDict[c]['TODAS'] = new Set();
                   if(a) asigDict[c]['TODAS'].add(a);
                } else {
                   // Solo los del profe actual
                   if(h.profesor && h.profesor.trim().toLowerCase() === user.nombre.toLowerCase()) {
                       if(!asigDict[c][d]) asigDict[c][d] = new Set();
                       if(a) asigDict[c][d].add(a);
                   }
                }
            });

            // Convert Sets to Arrays
            const finalDict = {};
            for(let cur in asigDict) {
                finalDict[cur] = {};
                for(let dia in asigDict[cur]) {
                    finalDict[cur][dia] = Array.from(asigDict[cur][dia]);
                }
            }

            const result = {
                usuario: { 
                    nombre: user.nombre, 
                    rol: user.rol, 
                    email: user.email 
                },
                sistemaAbierto: true,
                profesoresBloqueados: [],
                cursos: Array.from(cursosSet).sort(),
                asignaturasDict: finalDict,
                filtrosGlobales: {
                    cursos: Array.from(cursosSet).sort(),
                    asignaturas: Array.from(asigSet).sort(),
                    profesores: Array.from(profSet).sort()
                }
            };
            return res.json({ result });
        }`;

code = code.replace(getConfRegex, getConfReplacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('getConfigFrontend modificado');
