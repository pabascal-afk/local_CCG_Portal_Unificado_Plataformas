const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regex = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/xlsx-js-style@1\.2\.0\/dist\/xlsx\.bundle\.js"><\/script>/;
const replacement = `<script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">`;

html = html.replace(regex, replacement);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('SweetAlert2 y Bootstrap Icons inyectados en calendario.html');
