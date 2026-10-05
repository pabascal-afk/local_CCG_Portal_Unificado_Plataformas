const fs = require('fs');
let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// 1. Add Badge to Header
codeHtml = codeHtml.replace(
  '<div class="header-panel text-center">',
  '<div class="header-panel text-center position-relative">\n  <div id="badgeUser" class="position-absolute top-0 end-0 m-3 badge bg-light text-dark shadow-sm border text-start" style="display: none; z-index: 1000;"></div>'
);

// 2. Add IDs to new buttons so we can hide them
codeHtml = codeHtml.replace(
  'onclick="abrirWizardProfesor()"',
  'id="btnPerfiles" onclick="abrirWizardProfesor()"'
);
codeHtml = codeHtml.replace(
  'onclick="empezarDesdeCero()"',
  'id="btnDesdeCero" onclick="empezarDesdeCero()"'
);
codeHtml = codeHtml.replace(
  'onclick="autoAsignarProfesores()"',
  'id="btnAutoAsignar" onclick="autoAsignarProfesores()"'
);
codeHtml = codeHtml.replace(
  'onclick="guardarCambios()"',
  'id="btnGuardarTop" onclick="guardarCambios()"'
);
codeHtml = codeHtml.replace(
  'onclick="abrirModalReglas()"',
  'id="btnReglasTop" onclick="abrirModalReglas()"'
);

// 3. Global Variables & Init
codeHtml = codeHtml.replace(
  'let DB_HORARIOS = [];',
  `let DB_HORARIOS = [];
  let USER_ROLE = 'LECTOR';
  let USER_EMAIL = '';`
);

const oldInit = `google.script.run.withSuccessHandler(function(data) {
    DB_HORARIOS = data.horarios;
    REGLAS_GRALES = data.reglasGrales;
    REGLAS_PROFES = data.reglasProfes;
    
    poblarFiltros();
    renderizar();`;

const newInit = `google.script.run.withSuccessHandler(function(data) {
    if (data.error === 'UNAUTHORIZED') {
        document.body.innerHTML = \`
            <div class="container mt-5 text-center">
                <h1 class="text-danger"><i class="bi bi-shield-lock"></i> Acceso Denegado</h1>
                <p class="lead mt-3">Tu cuenta (<b>\${data.email}</b>) no tiene permisos para acceder a esta plataforma.</p>
                <p>Por favor ingresa con un correo institucional válido (@colegiocerrogrande.cl) o contacta al administrador.</p>
            </div>
        \`;
        return;
    }
    DB_HORARIOS = data.horarios;
    REGLAS_GRALES = data.reglasGrales;
    REGLAS_PROFES = data.reglasProfes;
    USER_ROLE = data.userRol;
    USER_EMAIL = data.userEmail;
    
    aplicarReglasRol();
    poblarFiltros();
    renderizar();`;
codeHtml = codeHtml.replace(oldInit, newInit);

// 4. Implement aplicarReglasRol
const jsAppend = `
function aplicarReglasRol() {
    const badge = document.getElementById('badgeUser');
    badge.innerHTML = \`<i class="bi bi-person-circle"></i> \${USER_EMAIL} <br><span class="badge bg-primary mt-1">\${USER_ROLE}</span>\`;
    badge.style.display = 'block';

    if (USER_ROLE === 'LECTOR') {
        if(document.getElementById('btnPerfiles')) document.getElementById('btnPerfiles').style.display = 'none';
        if(document.getElementById('btnDesdeCero')) document.getElementById('btnDesdeCero').style.display = 'none';
        if(document.getElementById('btnAutoAsignar')) document.getElementById('btnAutoAsignar').style.display = 'none';
        if(document.getElementById('btnGenerar')) document.getElementById('btnGenerar').style.display = 'none';
        if(document.getElementById('btnGenerarFlexible')) document.getElementById('btnGenerarFlexible').style.display = 'none';
        if(document.getElementById('btnAsistenteIA')) document.getElementById('btnAsistenteIA').style.display = 'none';
        if(document.getElementById('btnGenerarNoLectivas')) document.getElementById('btnGenerarNoLectivas').style.display = 'none';
        if(document.getElementById('btnGuardarTop')) document.getElementById('btnGuardarTop').style.display = 'none';
        if(document.getElementById('btnReglasTop')) document.getElementById('btnReglasTop').style.display = 'none';
        if(document.querySelector('button[onclick="guardarEdicion()"]')) document.querySelector('button[onclick="guardarEdicion()"]').style.display = 'none';
        if(document.getElementById('btnGuardarReglas')) document.getElementById('btnGuardarReglas').style.display = 'none';
    } else if (USER_ROLE === 'ADMIN') {
        if(document.getElementById('btnPerfiles')) document.getElementById('btnPerfiles').style.display = 'none';
        if(document.getElementById('btnDesdeCero')) document.getElementById('btnDesdeCero').style.display = 'none';
        if(document.getElementById('btnAutoAsignar')) document.getElementById('btnAutoAsignar').style.display = 'none';
        if(document.getElementById('btnGenerar')) document.getElementById('btnGenerar').style.display = 'none';
        if(document.getElementById('btnGenerarFlexible')) document.getElementById('btnGenerarFlexible').style.display = 'none';
        if(document.getElementById('btnAsistenteIA')) document.getElementById('btnAsistenteIA').style.display = 'none';
        if(document.getElementById('btnGenerarNoLectivas')) document.getElementById('btnGenerarNoLectivas').style.display = 'none';
        if(document.getElementById('btnReglasTop')) document.getElementById('btnReglasTop').style.display = 'none';
    }
}
`;
codeHtml = codeHtml.replace('// --- MODULO DESDE CERO Y AUTO-ASIGNACION ---', jsAppend + '\n// --- MODULO DESDE CERO Y AUTO-ASIGNACION ---');


// 5. Restrict Drag and Drop & Onclick in renderizar
const oldCardLogic = `        card.setAttribute('draggable', 'true');
        card.ondragstart = (e) => drag(e);
        card.onclick = () => abrirModalEdicion(card, cur.Asignatura, cur.Profesor, cur.Día, cur.Bloque, cId);`;

const newCardLogic = `        if (USER_ROLE !== 'LECTOR') {
            card.setAttribute('draggable', 'true');
            card.ondragstart = (e) => drag(e);
            card.onclick = () => abrirModalEdicion(card, cur.Asignatura, cur.Profesor, cur.Día, cur.Bloque, cId);
        } else {
            card.style.cursor = 'default';
        }`;
codeHtml = codeHtml.replace(oldCardLogic, newCardLogic);


fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('RBAC frontend implemented');
