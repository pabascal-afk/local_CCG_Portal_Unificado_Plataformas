const xlsx = require('xlsx');

function getHeaders(file, sheetName) {
    const wb = xlsx.readFile(file);
    const ws = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(ws, {header: 1});
    return data[0];
}

console.log('Evaluaciones:', getHeaders('RESPALDOS XLSX/CCG_Calendario 2.0.xlsx', 'Evaluaciones'));
console.log('Usuarios_Autorizados:', getHeaders('RESPALDOS XLSX/CCG_Calendario 2.0.xlsx', 'Usuarios_Autorizados'));
console.log('Config_Topes:', getHeaders('RESPALDOS XLSX/CCG_Calendario 2.0.xlsx', 'Config_Topes'));
console.log('Horarios:', getHeaders('RESPALDOS XLSX/CCG_Horarios.xlsx', 'Base de Datos Final Horarios 20'));
console.log('Eventos (DatosWeb):', getHeaders('RESPALDOS XLSX/CALENDARIO ANUAL 2026 UTP .xlsx', 'DatosWeb'));
