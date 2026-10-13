# Módulo de Seguimiento de Libro Digital (Dashboard Pedagógico)

Este módulo procesa los reportes semanales de cumplimiento pedagógico en el Libro Digital (clases creadas, firmas, leccionarios y asistencia) y está completamente integrado en la **Plataforma Unificada**.

---

## 🚀 Uso en la Plataforma Web
1. Inicia sesión en la plataforma con una cuenta con rol administrativo (`Administrador`, `Directivo` o `Coordinación`).
2. En la barra lateral izquierda, ingresa a **Llenado de Libros**.
3. En la pestaña **Importar Reportes en Lote**:
   - Arrastra o selecciona múltiples archivos `.xlsx` o `.xls`.
   - Organiza la secuencia de procesamiento usando los botones de subir/bajar (`⬆` / `⬇`).
   - Presiona **"Procesar Todos en Orden"**.
4. En la pestaña **Dashboard Pedagógico**:
   - Visualiza los indicadores en tiempo real (críticos, pendientes, al día).
   - Filtra por mes, profesor o activa la casilla "Ver solo problemas".
5. En la pestaña **Configuración y Alertas**:
   - Administra profesores exentos (blacklist) y días feriados.
   - Envía el resumen consolidado a coordinación o notificaciones individuales a docentes vía correo institucional (SMTP).

---

## 🛠️ Procesamiento Local por Consola (CLI)
Para procesar archivos manualmente desde la terminal del servidor:
```bash
node "reporte llenado libro/procesador_libro.js" "ruta/al/reporte_semana1.xlsx" "ruta/al/reporte_semana2.xlsx"
```

---

## 📊 Formato Esperado del Reporte Excel
- **Fila 0 (Cabecera):** Fechas de la semana cada 5 columnas iniciando en la columna 1 (`col 1`, `col 6`, `col 11`, `col 16`, `col 21`).
- **Fila 1:** Sub-cabeceras de indicadores.
- **Fila 2 en adelante:** 
  - Columna 0: Nombre del profesor.
  - Cada bloque de 5 columnas representa un día:
    1. Clases Creadas
    2. Clases Requeridas
    3. Contenido / Leccionario
    4. Asistencia
    5. Firmas Realizadas

---

## 📁 Archivos en esta Carpeta
- `procesador_libro.js`: Script ejecutable en Node.js para procesamiento de archivos Excel con SheetJS y SQLite.
- `Código.gs.txt`: Código legado original de Google Apps Script (mantenido como respaldo).
- `Index.html.txt`: Plantilla HTML legada de Google Sheets (mantenida como respaldo).
- `SelectorArchivo.html.txt`: Selector legado de archivo único (mantenido como respaldo).
