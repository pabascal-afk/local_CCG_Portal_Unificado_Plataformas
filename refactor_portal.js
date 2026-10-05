const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /google\.script\.run\.withSuccessHandler\(function\(ctx\) \{[\s\S]*?\}\)\.getContextoUsuario\(\);/;

const replacement = `
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(ctx => {
          contexto = ctx;
          document.getElementById('info-usuario').innerText = ctx.email + '\\n' + ctx.rol;
          
          const rolNormalizado = ctx.rol.toLowerCase();
          if (rolNormalizado === 'administrador' || rolNormalizado === 'admin' || rolNormalizado === 'directivo general') {
            document.getElementById('nav-usuarios-container').classList.remove('d-none');
          }
          
          // URLs estáticas en Node.js
          urls = {
            evaluaciones: "/evaluaciones.html",
            calendario: "/calendario.html",
            horarios: "/horarios.html",
            recursos: "/recursos.html",
            usuarios: "/usuarios.html"
          };
          document.getElementById('nav-evaluaciones').click();
        }).catch(err => {
          // Si no está autenticado, redirigir al login (o Auth de Google)
          window.location.href = '/auth/google';
        });
`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Portal index.html migrado a fetch');
