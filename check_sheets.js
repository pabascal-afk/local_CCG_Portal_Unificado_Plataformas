const xlsx = require('xlsx');
const wb = xlsx.readFile('RESPALDOS XLSX/CCG_Calendario 2.0.xlsx');
console.log('CCG_Calendario 2.0:', wb.SheetNames);

const wb2 = xlsx.readFile('RESPALDOS XLSX/CCG_Horarios.xlsx');
console.log('CCG_Horarios:', wb2.SheetNames);

const wb3 = xlsx.readFile('RESPALDOS XLSX/CALENDARIO ANUAL 2026 UTP .xlsx');
console.log('CALENDARIO ANUAL:', wb3.SheetNames);
