const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regex = /<style>/;
const replacement = `<style>
    .swal2-container {
      z-index: 9999 !important;
    }`;

html = html.replace(regex, replacement);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Fixed swal2-container z-index');
