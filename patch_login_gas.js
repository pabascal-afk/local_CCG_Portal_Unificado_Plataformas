const fs = require('fs');
let html = fs.readFileSync('public/login.html', 'utf8');

// Replace the Google button anchor
const oldBtn = `<a href="/auth/google" class="btn btn-outline-dark w-100 mb-4 py-2 d-flex align-items-center justify-content-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20" alt="Google">
                Ingresar con cuenta Google
            </a>`;
const newBtn = `<button onclick="loginGoogle()" class="btn btn-outline-dark w-100 mb-4 py-2 d-flex align-items-center justify-content-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="20" alt="Google">
                Ingresar con cuenta Google
            </button>`;
html = html.replace(oldBtn, newBtn);

// Add the JS function
const jsScript = `
        async function loginGoogle() {
            try {
                const res = await fetch('/api/auth/gas-url');
                const data = await res.json();
                if (!data.url) {
                    Swal.fire('Configuración pendiente', 'El administrador debe configurar la URL de Apps Script en el archivo .env', 'info');
                    return;
                }
                const currentUrl = window.location.origin;
                window.location.href = data.url + "?returnUrl=" + encodeURIComponent(currentUrl);
            } catch(e) {
                Swal.fire('Error', 'No se pudo conectar al servidor local', 'error');
            }
        }`;
html = html.replace("<script>", "<script>\n" + jsScript);
fs.writeFileSync('public/login.html', html, 'utf8');
