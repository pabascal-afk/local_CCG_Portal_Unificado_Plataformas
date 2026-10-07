const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const targetNav = `<li class="nav-item d-none" id="nav-usuarios-container">
        <a href="#" class="nav-link" onclick="loadApp('usuarios', this)" id="nav-usuarios">
          <i class="bi bi-people"></i> Gestión de Usuarios
        </a>
      </li>`;
const replacementNav = `<li class="nav-item d-none" id="nav-usuarios-container">
        <a href="#" class="nav-link" onclick="loadApp('usuarios', this)" id="nav-usuarios">
          <i class="bi bi-people"></i> Gestión de Usuarios
        </a>
      </li>
      <li class="nav-item d-none" id="nav-coordinadores-container">
        <a href="#" class="nav-link" onclick="loadApp('coordinadores', this)" id="nav-coordinadores">
          <i class="bi bi-envelope-paper"></i> Reglas de Envíos
        </a>
      </li>`;

if (code.includes('nav-usuarios-container')) {
    code = code.replace(targetNav, replacementNav);
} else {
    code = code.replace(/Gestión de Usuarios[\s\S]*?<\/li>/, "Gestión de Usuarios\n        </a>\n      </li>\n      <li class=\"nav-item d-none\" id=\"nav-coordinadores-container\">\n        <a href=\"#\" class=\"nav-link\" onclick=\"loadApp('coordinadores', this)\" id=\"nav-coordinadores\">\n          <i class=\"bi bi-envelope-paper\"></i> Reglas de Envíos\n        </a>\n      </li>");
}

const targetJs = "document.getElementById('nav-usuarios-container').classList.remove('d-none');";
const replacementJs = "document.getElementById('nav-usuarios-container').classList.remove('d-none');\n              document.getElementById('nav-coordinadores-container').classList.remove('d-none');";
code = code.replace(targetJs, replacementJs);

const targetUrls = 'usuarios: "/usuarios.html"';
const replacementUrls = 'usuarios: "/usuarios.html",\n            coordinadores: "/coordinadores.html"';
code = code.replace(targetUrls, replacementUrls);

fs.writeFileSync('public/index.html', code, 'utf8');
console.log("index.html actualizado con la pestaña");
