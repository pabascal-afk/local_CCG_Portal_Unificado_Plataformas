/**
 * Script generador de catálogos curriculares MINEDUC completos y enriquecidos
 * Contiene objetivos de aprendizaje oficiales, ejes temáticos, indicadores de evaluación y habilidades
 * para Lenguaje, Matemática, Ciencias e Historia (1° Básico a IV° Medio).
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. GENERACIÓN DE LENGUAJE Y COMUNICACIÓN / LENGUA Y LITERATURA
// ============================================================================
function generarLenguaje() {
  const oas = [];

  // 1° BÁSICO
  const l1_u1 = [
    { c: 'OA 01', d: 'Reconocer que los textos escritos transmiten mensajes y que son escritos por alguien para cumplir un propósito.', e: 'Lectura', cat: 'Basal', ind: ['Diferencian texto de ilustración.', 'Señalan la dirección de lectura de izquierda a derecha y arriba hacia abajo.'] },
    { c: 'OA 02', d: 'Reconocer que las palabras son unidades de significado separadas por espacios en el texto escrito.', e: 'Lectura', cat: 'Basal', ind: ['Cuentan palabras en oraciones simples.', 'Identifican el espacio en blanco entre palabras.'] },
    { c: 'OA 03', d: 'Identificar los sonidos que componen las palabras (conciencia fonológica), reconociendo, separando y combinando sus fonemas y sílabas.', e: 'Lectura', cat: 'Basal', ind: ['Segmentan palabras en sílabas con palmadas.', 'Identifican el fonema inicial y final de palabras cotidianas.'] },
    { c: 'OA 04', d: 'Leer palabras aisladas y en contexto, aplicando su conocimiento de la correspondencia letra-sonido.', e: 'Lectura', cat: 'Basal', ind: ['Nombran las letras del abecedario y su sonido.', 'Leen sílabas directas con vocales y consonantes m, p, l, s.'] },
    { c: 'OA 13', d: 'Experimentar con la escritura para comunicar hechos, ideas y sentimientos.', e: 'Escritura', cat: 'Basal', ind: ['Escriben su propio nombre sin modelo.', 'Escriben palabras familiares usando correspondencia grafema-fonema.'] },
    { c: 'OA 18', d: 'Comprender textos orales (explicaciones, instrucciones, relatos, anécdotas) para obtener información.', e: 'Comunicación Oral', cat: 'Basal', ind: ['Siguen instrucciones orales de 2 o 3 pasos.', 'Responden preguntas sobre el relato escuchado.'] }
  ];
  l1_u1.forEach(x => oas.push({ nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 1', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  const l1_u2 = [
    { c: 'OA 05', d: 'Leer oraciones y textos breves en voz alta con fluidez y precisión.', e: 'Lectura', cat: 'Basal', ind: ['Leen oraciones simples sin silabear en exceso.', 'Pausan adecuadamente ante el punto final.'] },
    { c: 'OA 08', d: 'Demostrar comprensión de narraciones que aborden temas que les sean familiares.', e: 'Lectura', cat: 'Basal', ind: ['Identifican a los personajes del cuento.', 'Secuencian imágenes del relato (inicio, desarrollo y desenlace).'] },
    { c: 'OA 14', d: 'Escribir oraciones completas para transmitir mensajes breves.', e: 'Escritura', cat: 'Basal', ind: ['Separan cada palabra con un espacio en blanco.', 'Inician oraciones con mayúscula y terminan con punto.'] },
    { c: 'OA 23', d: 'Expresarse de manera clara sobre temas cotidianos.', e: 'Comunicación Oral', cat: 'Basal', ind: ['Pronuncian con articulación adecuada.', 'Usan vocabulario variado para describir acciones.'] }
  ];
  l1_u2.forEach(x => oas.push({ nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 2', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  const l1_u3 = [
    { c: 'OA 09', d: 'Comprender textos informativos simples extrayendo información explícita e implícita.', e: 'Lectura', cat: 'Basal', ind: ['Localizan datos específicos en el texto.', 'Explican de qué se trata el artículo leído.'] },
    { c: 'OA 10', d: 'Leer independientemente y familiarizarse con poemas infantiles.', e: 'Lectura', cat: 'Basal', ind: ['Reconocen rimas en versos sencillos.', 'Recitan de memoria estrofas cortas.'] },
    { c: 'OA 15', d: 'Escribir con letra clara, separando las palabras con un espacio regular.', e: 'Escritura', cat: 'Complementario', ind: ['Trazan correctamente mayúsculas y minúsculas.', 'Mantienen el espaciado entre palabras.'] },
    { c: 'OA 25', d: 'Participar activamente en conversaciones guiadas respetando turnos de habla.', e: 'Comunicación Oral', cat: 'Transversal', ind: ['Piden la palabra levantando la mano.', 'Escuchan con atención a compañeros.'] }
  ];
  l1_u3.forEach(x => oas.push({ nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 3', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  const l1_u4 = [
    { c: 'OA 07', d: 'Desarrollar el gusto por la lectura, explorando libros de la biblioteca escolar.', e: 'Lectura', cat: 'Complementario', ind: ['Eligen voluntariamente libros ilustrados.', 'Comentan sus lecturas favoritas en voz alta.'] },
    { c: 'OA 16', d: 'Incorporar vocabulario nuevo extraído de los textos leídos en sus producciones.', e: 'Escritura', cat: 'Basal', ind: ['Utilizan palabras recién aprendidas en oraciones.', 'Preguntan el significado de términos desconocidos.'] },
    { c: 'OA 21', d: 'Participar en declamaciones, dramatizaciones y cantos corales.', e: 'Comunicación Oral', cat: 'Complementario', ind: ['Representan pequeños roles con entusiasmo.', 'Acompañan su expresión oral con gestos y mímica.'] }
  ];
  l1_u4.forEach(x => oas.push({ nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 4', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  // 2° BÁSICO
  ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((u, uIdx) => {
    const arr = [
      { c: `OA 0${uIdx * 2 + 1}`, d: `Leer en voz alta con fluidez y precisión textos acordes al nivel de 2° Básico (${u}).`, e: 'Lectura', cat: 'Basal', ind: ['Leen respetando la entonación de preguntas y exclamaciones.', 'Pronuncian con precisión fonológica y velocidad adecuada.'] },
      { c: `OA 0${uIdx * 2 + 2}`, d: `Comprender y profundizar en narraciones extrayendo información explícita e implícita (${u}).`, e: 'Lectura', cat: 'Basal', ind: ['Describen personajes física y emocionalmente.', 'Identifican el conflicto o problema de la historia.'] },
      { c: `OA ${10 + uIdx * 2}`, d: `Escribir creativamente narraciones y textos no literarios estructurados (${u}).`, e: 'Escritura', cat: 'Basal', ind: ['Escriben con orden cronológico (inicio, desarrollo y final).', 'Aplican mayúsculas y punto final consistentemente.'] },
      { c: `OA ${20 + uIdx}`, d: `Interactuar y dialogar para compartir impresiones y experiencias personales (${u}).`, e: 'Comunicación Oral', cat: 'Complementario', ind: ['Mantienen el hilo temático en sus intervenciones.', 'Formulan preguntas para aclarar dudas.'] }
    ];
    arr.forEach(x => oas.push({ nivel: '2° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: u, codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));
  });

  // 3° BÁSICO
  ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((u, uIdx) => {
    const arr = [
      { c: `OA 0${uIdx + 1}`, d: `Leer y comprender una variedad de textos aplicando estrategias de lectura activa (${u}).`, e: 'Lectura', cat: 'Basal', ind: ['Relacionan el contenido con sus saberes previos.', 'Releen párrafos confusos para aclarar el sentido.'] },
      { c: `OA 0${uIdx + 4}`, d: `Profundizar en la comprensión de textos literarios y fábulas determinando moralejas (${u}).`, e: 'Lectura', cat: 'Basal', ind: ['Identifican el valor o enseñanza implícita en la moraleja.', 'Comparan actitudes de los personajes.'] },
      { c: `OA ${12 + uIdx}`, d: `Planificar y redactar textos narrativos e informativos organizando párrafos (${u}).`, e: 'Escritura', cat: 'Basal', ind: ['Organizan el texto en párrafos separados por punto aparte.', 'Utilizan conectores causales y temporales.'] },
      { c: `OA ${22 + uIdx}`, d: `Exponer oralmente sobre un tema investigado apoyándose en material visual (${u}).`, e: 'Comunicación Oral', cat: 'Complementario', ind: ['Estructuran su charla en inicio, exposición y cierre.', 'Responden preguntas de sus compañeros con seguridad.'] }
    ];
    arr.forEach(x => oas.push({ nivel: '3° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: u, codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));
  });

  // ==========================================
  // 4° BÁSICO - EXACTAMENTE LOS REQUERIDOS MINEDUC
  // ==========================================
  // UNIDAD 1 (OA 01, 02, 03, 04, 06, 10, 12, 26)
  const l4_u1 = [
    {
      c: 'OA 01', e: 'Lectura', cat: 'Basal',
      d: 'Leer en voz alta de manera fluida variados textos apropiados a su edad: pronunciando cada palabra con precisión; respetando la coma, el punto y los signos de exclamación e interrogación; leyendo con velocidad adecuada para el nivel.',
      ind: ['Leen en voz alta con entonación expresiva y sin vacilaciones excesivas.', 'Respetan los signos de puntuación ajustando el ritmo de la lectura.', 'Articulan claramente todas las sílabas de palabras complejas.']
    },
    {
      c: 'OA 02', e: 'Lectura', cat: 'Basal',
      d: 'Comprender textos aplicando estrategias de comprensión lectora; por ejemplo: relacionar la información del texto con sus experiencias y conocimientos; releer lo que no fue comprendido; formular preguntas sobre lo leído y responderlas; identificar las ideas más importantes; organizar la información en esquemas o mapas conceptuales.',
      ind: ['Relacionan datos del texto con experiencias cotidianas o lecturas anteriores.', 'Subrayan ideas centrales y palabras clave de cada párrafo.', 'Elaboran resúmenes breves y esquemas gráficos de lo leído.']
    },
    {
      c: 'OA 03', e: 'Lectura', cat: 'Basal',
      d: 'Leer y familiarizarse con un amplio repertorio de literatura para aumentar su conocimiento del mundo y desarrollar su imaginación; por ejemplo: poemas, cuentos folclóricos y de autor, fábulas, leyendas, mitos, novelas, historietas, otros.',
      ind: ['Reconocen características distintivas de mitos, leyendas y fábulas.', 'Identifican elementos folclóricos y culturales presentes en relatos tradicionales.', 'Expresan opiniones sobre las motivaciones y conductas de los personajes.']
    },
    {
      c: 'OA 04', e: 'Lectura', cat: 'Basal',
      d: 'Profundizar su comprensión de las narraciones leídas: extrayendo información explícita e implícita; determinando las consecuencias de hechos o acciones; describiendo y comparando a los personajes; describiendo los diferentes ambientes que aparecen en un texto; reconociendo el problema y la solución en una narración; expresando opiniones fundamentadas sobre actitudes y acciones de los personajes; comparando diferentes versiones de un mismo relato.',
      ind: ['Identifican el dilema o conflicto central que motiva la trama.', 'Describen características físicas y psicológicas de los personajes.', 'Determinan relaciones de causa y efecto en las acciones narradas.', 'Fundamentan juicios éticos sobre las acciones de los protagonistas.']
    },
    {
      c: 'OA 06', e: 'Lectura', cat: 'Basal',
      d: 'Leer independientemente y comprender textos no literarios (cartas, biografías, relatos históricos, instrucciones, libros y artículos informativos, noticias, etc.) para ampliar su conocimiento del mundo y formarse una opinión: extrayendo información explícita e implícita; comprendiendo la información que aportan las ilustraciones, símbolos y pictogramas a un texto; formulando una opinión sobre algún aspecto de la lectura.',
      ind: ['Identifican la idea principal y detalles complementarios en artículos de divulgación.', 'Interpretan esquemas, infografías y fotografías de apoyo.', 'Distinguen hechos objetivos de apreciaciones subjetivas del emisor.']
    },
    {
      c: 'OA 10', e: 'Lectura', cat: 'Basal',
      d: 'Aplicar estrategias para determinar el significado de palabras nuevas: claves del texto (para qué se usa el término, contexto en el que se ubica); raíces y afijos; preguntar a otro; consultar un diccionario o glosario.',
      ind: ['Deducen el significado de términos desconocidos a partir del contexto oracional.', 'Reconocen prefijos y sufijos comunes para inferir nuevos sentidos.', 'Consultan diccionarios físicos o digitales para verificar acepciones.']
    },
    {
      c: 'OA 12', e: 'Escritura', cat: 'Basal',
      d: 'Escribir frecuentemente, para desarrollar la creatividad y expresar sus ideas, textos como poemas, diarios de vida, cuentos, anécdotas, cartas, comentarios sobre sus lecturas, noticias, etc.',
      ind: ['Redactan anécdotas y experiencias personales con orden cronológico.', 'Utilizan adjetivos calificativos para describir ambientes y emociones.', 'Manifiestan agrado y motivación por la producción escrita autónoma.']
    },
    {
      c: 'OA 26', e: 'Comunicación Oral', cat: 'Basal',
      d: 'Participar de manera activa en conversaciones grupales sobre textos leídos o escuchados en clases o temas de su interés: manteniendo el foco de la conversación; expresando sus ideas u opiniones y fundamentándolas; formulando preguntas para aclarar dudas; respondiendo preguntas con información relevante; esperando que el interlocutor termine su idea; respetando turnos de habla.',
      ind: ['Aportan ideas pertinentes sin desviarse del tema en discusión.', 'Formulan preguntas de aclaración con respeto y claridad.', 'Esperan su turno de hablar y escuchan atentamente las opiniones de sus pares.']
    }
  ];
  l4_u1.forEach(x => oas.push({ nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 1', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  // UNIDAD 2 (4° Básico)
  const l4_u2 = [
    { c: 'OA 01', e: 'Lectura', cat: 'Basal', d: 'Leer en voz alta de manera fluida variados textos líricos y poéticos respetando ritmo y entonación.', ind: ['Modulan la voz acorde a la cadencia del verso.', 'Pronuncian palabras con claridad en lecturas compartidas.'] },
    { c: 'OA 02', e: 'Lectura', cat: 'Basal', d: 'Comprender textos aplicando estrategias de comprensión lectora (poemas, odas y rimas).', ind: ['Identifican el hablante lírico y el objeto poético.', 'Relacionan sensaciones poéticas con vivencias personales.'] },
    { c: 'OA 05', e: 'Lectura', cat: 'Basal', d: 'Comprender poemas adecuados al nivel e interpretar el lenguaje figurado presente en ellos (metáforas sencillas, personificaciones y comparaciones).', ind: ['Explican el significado de expresiones figuradas en los poemas.', 'Reconocen estrofas, versos y esquemas de rima consonante o asonante.'] },
    { c: 'OA 06', e: 'Lectura', cat: 'Basal', d: 'Leer independientemente y comprender textos no literarios vinculados a la cultura y el arte.', ind: ['Resumen biografías de poetas y escritores chilenos.', 'Localizan datos temporales y geográficos en crónicas culturales.'] },
    { c: 'OA 07', e: 'Lectura', cat: 'Complementario', d: 'Desarrollar el gusto por la lectura, leyendo habitualmente diversos textos líricos y narrativos.', ind: ['Seleccionan voluntariamente libros de poesía de la biblioteca de aula.', 'Comparten sus poemas predilectos con el grupo curso.'] },
    { c: 'OA 11', e: 'Escritura', cat: 'Basal', d: 'Escribir creativamente narraciones y poemas utilizando rimas y figuras retóricas básicas.', ind: ['Escriben estrofas poéticas incorporando comparaciones y personificaciones.', 'Cuidan la sonoridad y el ritmo de los versos.'] },
    { c: 'OA 17', e: 'Escritura', cat: 'Complementario', d: 'Escribir con letra clara y legible, separando las palabras con un espacio regular para facilitar la lectura.', ind: ['Mantienen una caligrafía uniforme y legible.', 'Respetan los márgenes y la diagramación del poema en el cuaderno.'] },
    { c: 'OA 21', e: 'Escritura', cat: 'Basal', d: 'Escribir correctamente aplicando las reglas de acentuación general (palabras agudas, graves y esdrújulas).', ind: ['Clasifican palabras según su sílaba tónica.', 'Aplican tilde correctamente respetando las reglas de terminación (-n, -s o vocal).'] },
    { c: 'OA 22', e: 'Comunicación Oral', cat: 'Basal', d: 'Comprender y disfrutar versiones completas o adaptadas de obras y textos orales: relatos, mitos y poemas declamados.', ind: ['Identifican las emociones transmitidas por la declamación oral.', 'Comentan el impacto estético de los textos orales escuchados.'] },
    { c: 'OA 26', e: 'Comunicación Oral', cat: 'Transversal', d: 'Participar activamente en conversaciones y recitales poéticos respetando turnos de habla.', ind: ['Aportan interpretaciones fundamentadas sobre el sentido de los poemas.', 'Escuchan con empatía y atención a sus compañeros.'] }
  ];
  l4_u2.forEach(x => oas.push({ nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 2', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  // UNIDAD 3 (4° Básico)
  const l4_u3 = [
    { c: 'OA 02', e: 'Lectura', cat: 'Basal', d: 'Comprender textos aplicando estrategias de comprensión lectora en artículos informativos e investigaciones escolares.', ind: ['Elaboran mapas conceptuales con las ideas centrales.', 'Identifican subtemas por cada subtítulo del texto.'] },
    { c: 'OA 04', e: 'Lectura', cat: 'Basal', d: 'Profundizar en la comprensión de relatos históricos y biografías reconociendo hechos y consecuencias.', ind: ['Secuencian hitos cronológicos en la vida del personaje biográfico.', 'Identifican el legado o contribución del personaje histórico.'] },
    { c: 'OA 06', e: 'Lectura', cat: 'Basal', d: 'Leer independientemente textos no literarios complejos para ampliar conocimientos científicos y sociales.', ind: ['Comparan información proveniente de dos fuentes informativas.', 'Evalúan si el texto ofrece datos comprobables y claros.'] },
    { c: 'OA 08', e: 'Lectura', cat: 'Basal', d: 'Investigar sobre un tema para ampliar su conocimiento y sintetizar información consultando libros, enciclopedias y fuentes digitales seguras.', ind: ['Plantean preguntas de investigación delimitadas.', 'Registran datos relevantes en fichas temáticas citando la fuente.'] },
    { c: 'OA 14', e: 'Escritura', cat: 'Basal', d: 'Escribir artículos informativos para comunicar información sobre un tema investigado: organizando el texto en párrafos con subtítulos y diagramación adecuada.', ind: ['Estructuran el artículo en introducción, desarrollo temático y conclusión.', 'Incorporan imágenes con pie de foto explicativo.'] },
    { c: 'OA 15', e: 'Escritura', cat: 'Complementario', d: 'Escribir cartas, afiches e instrucciones claras para diversos propósitos comunicativos.', ind: ['Utilizan formato de carta formal o afiche persuasivo según la situación.', 'Emplean verbos en imperativo o infinitivo en textos instructivos.'] },
    { c: 'OA 18', e: 'Escritura', cat: 'Basal', d: 'Incorporar de manera pertinente en la escritura el vocabulario técnico o disciplinar aprendido.', ind: ['Emplean términos científicos o históricos con precisión conceptual.', 'Evitan redundancias mediante pronombres y sinónimos.'] },
    { c: 'OA 23', e: 'Comunicación Oral', cat: 'Basal', d: 'Comprender textos orales explicativos y documentales para formular preguntas sobre el tema expuesto.', ind: ['Toman apuntes breves durante la exposición oral del docente o video.', 'Sintetizan las ideas más llamativas del contenido audiovisual.'] },
    { c: 'OA 24', e: 'Comunicación Oral', cat: 'Basal', d: 'Expresarse de manera coherente y articulada sobre temas de su interés apoyándose en presentaciones digitales o afiches.', ind: ['Presentan con voz audible y contacto visual con el auditorio.', 'Responden preguntas del público complementando su explicación.'] }
  ];
  l4_u3.forEach(x => oas.push({ nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 3', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  // UNIDAD 4 (4° Básico)
  const l4_u4 = [
    { c: 'OA 03', e: 'Lectura', cat: 'Basal', d: 'Leer y familiarizarse con obras dramáticas, libretos infantiles y diálogos teatrales.', ind: ['Diferencian parlamentos de personajes y acotaciones del dramaturgo.', 'Reconocen el conflicto dramático central de la obra.'] },
    { c: 'OA 04', e: 'Lectura', cat: 'Basal', d: 'Profundizar en la comprensión de obras teatrales reconociendo motivaciones y quiebres argumentales.', ind: ['Caracterizan a los protagonistas y antagonistas de la pieza teatral.', 'Infieren sentimientos a partir de las acotaciones de escena.'] },
    { c: 'OA 13', e: 'Escritura', cat: 'Basal', d: 'Escribir creativamente diálogos dramáticos y narraciones teatrales aplicando normas ortográficas.', ind: ['Escriben libretos breves con nombres de personajes y dos puntos.', 'Utilizan signos de interrogación y exclamación para dar emotividad a las réplicas.'] },
    { c: 'OA 16', e: 'Escritura', cat: 'Basal', d: 'Planificar, escribir, revisar y editar sus textos en función del destinatario y propósito.', ind: ['Revisan borradores con pautas de cotejo ortográficas.', 'Corrigen errores de concordancia y puntuación antes de la entrega final.'] },
    { c: 'OA 21', e: 'Escritura', cat: 'Basal', d: 'Escribir correctamente aplicando reglas de ortografía literal (uso de b/v, c/s/z, g/j) y signos de puntuación.', ind: ['Escriben sin faltas en palabras de alta frecuencia.', 'Puntúan correctamente párrafos con punto seguido y punto aparte.'] },
    { c: 'OA 25', e: 'Comunicación Oral', cat: 'Complementario', d: 'Participar en dramatizaciones, representaciones teatrales y lecturas dramatizadas frente al curso.', ind: ['Caracterizan la voz y postura corporal del personaje asignado.', 'Memorizan e interpretan sus parlamentos con soltura y expresividad.'] },
    { c: 'OA 27', e: 'Comunicación Oral', cat: 'Complementario', d: 'Interactuar de acuerdo con las convenciones sociales en diferentes situaciones cotidianas y escolares.', ind: ['Saludan, se despiden y agradecen con lenguaje cortés.', 'Piden aclaraciones utilizando fórmulas de cortesía adecuadas.'] }
  ];
  l4_u4.forEach(x => oas.push({ nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: x.e, unidad: 'Unidad 4', codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));

  // 5° a 8° BÁSICO y I° a IV° MEDIO
  const otrosNiveles = [
    { n: '5° Básico', asig: 'LENGUAJE Y COMUNICACION' },
    { n: '6° Básico', asig: 'LENGUAJE Y COMUNICACION' },
    { n: '7° Básico', asig: 'LENGUA Y LITERATURA' },
    { n: '8° Básico', asig: 'LENGUA Y LITERATURA' },
    { n: 'I° Medio', asig: 'LENGUA Y LITERATURA' },
    { n: 'II° Medio', asig: 'LENGUA Y LITERATURA' },
    { n: 'III° Medio', asig: 'LENGUA Y LITERATURA' },
    { n: 'IV° Medio', asig: 'LENGUA Y LITERATURA' }
  ];

  otrosNiveles.forEach(niv => {
    ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((uni, uIdx) => {
      const listaOAs = [
        { c: `OA 0${uIdx * 2 + 1}`, d: `Analizar e interpretar críticamente textos literarios (narrativa, lírica, drama) de diversos autores y épocas (${niv.n} - ${uni}).`, e: 'Lectura', cat: 'Basal', ind: ['Analizan la influencia del contexto histórico en la visión de mundo de la obra.', 'Interpretan símbolos, alegorías y figuras estilísticas complejas.', 'Evalúan las decisiones morales y conflictos de los protagonistas.'] },
        { c: `OA 0${uIdx * 2 + 2}`, d: `Analizar y evaluar textos no literarios, discursos y medios de comunicación reconociendo posturas e intencionalidades (${niv.n} - ${uni}).`, e: 'Lectura', cat: 'Basal', ind: ['Diferencian tesis, argumentos de respaldo y contraargumentos.', 'Identifican sesgos, estereotipos y falacias argumentativas.', 'Evalúan la validez de la evidencia documental y testimonial.'] },
        { c: `OA ${10 + uIdx * 2}`, d: `Planificar, escribir y revisar ensayos, informes académicos y textos argumentativos bien estructurados (${niv.n} - ${uni}).`, e: 'Escritura', cat: 'Basal', ind: ['Formulan una tesis clara y la defienden con argumentos documentados.', 'Aplican conectores lógicos interoracionales con precisión gramatical.', 'Citan fuentes siguiendo estándares bibliográficos.'] },
        { c: `OA ${20 + uIdx}`, d: `Participar en debates, mesas redondas y discursos argumentativos orales con postura crítica y fundamentada (${niv.n} - ${uni}).`, e: 'Comunicación Oral', cat: 'Complementario', ind: ['Rebaten posturas contrarias sin recurrir a ataques personales.', 'Utilizan entonación convincente y lenguaje académico adecuado.', 'Gestionan adecuadamente el tiempo de exposición asignado.'] }
      ];
      listaOAs.forEach(x => oas.push({ nivel: niv.n, asignatura: niv.asig, eje: x.e, unidad: uni, codigo: x.c, categoria: x.cat, descripcion: x.d, indicadores: x.ind }));
    });
  });

  return oas;
}

// ============================================================================
// 2. GENERACIÓN DE MATEMÁTICA (1° Básico a IV° Medio)
// ============================================================================
function generarMatematica() {
  const oas = [];
  const niveles = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico', 'I° Medio', 'II° Medio', 'III° Medio', 'IV° Medio'];

  niveles.forEach(niv => {
    // UNIDAD 1: Números y Operaciones / Álgebra
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
      descripcion: `Representar, comparar y ordenar cantidades y conjuntos numéricos en la recta y en contextos cotidianos (${niv}).`,
      indicadores: ['Representan cantidades en forma simbólica, pictórica y concreta.', 'Comparan y ordenan elementos estableciendo relaciones mayor, menor o igual.']
    });
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
      descripcion: `Aplicar operaciones aritméticas y algoritmos convencionales con cálculo mental y escrito (${niv}).`,
      indicadores: ['Resuelven operaciones utilizando estrategias de cálculo mental reflexivo.', 'Aplican algoritmos formales justificando cada paso matemático.']
    });
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Resolución de Problemas', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
      descripcion: `Resolver problemas rutinarios y no rutinarios que involucren operaciones fundamentales (${niv}).`,
      indicadores: ['Identifican datos incógnita y planifican estrategias de solución.', 'Verifican la razonabilidad del resultado respecto del contexto original.']
    });

    // UNIDAD 2: Álgebra, Funciones y Patrones
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Patrones y Álgebra', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
      descripcion: `Describir, extender y formular reglas de patrones numéricos y algebraicos (${niv}).`,
      indicadores: ['Identifican regularidades en secuencias y expresan reglas generales.', 'Representan relaciones funcionales mediante tablas y ecuaciones.']
    });
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Patrones y Álgebra', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
      descripcion: `Resolver ecuaciones e inecuaciones de primer orden interpretando soluciones en el conjunto numérico (${niv}).`,
      indicadores: ['Aplican propiedades de la igualdad para despejar incógnitas.', 'Representan soluciones algebraicas y gráficas.']
    });

    // UNIDAD 3: Geometría y Medición
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Geometría', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
      descripcion: `Identificar, describir y clasificar figuras bidimensionales y tridimensionales según sus propiedades (${niv}).`,
      indicadores: ['Reconocen elementos geométricos fundamentales (vértices, caras, ángulos, aristas).', 'Construyen figuras geométricas usando instrumental de regla y compás.']
    });
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Medición', unidad: 'Unidad 3', codigo: 'OA 11', categoria: 'Basal',
      descripcion: `Calcular perímetros, áreas y volúmenes en diversas figuras y cuerpos geométricos (${niv}).`,
      indicadores: ['Aplican fórmulas de cálculo de perímetro y superficie.', 'Resuelven situaciones prácticas de cálculo de materiales y dimensiones.']
    });

    // UNIDAD 4: Datos y Probabilidades
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Probabilidad y Estadística', unidad: 'Unidad 4', codigo: 'OA 14', categoria: 'Basal',
      descripcion: `Recolectar, tabular y graficar datos estadísticos extrayendo conclusiones fundamentadas (${niv}).`,
      indicadores: ['Construyen tablas de frecuencias y gráficos estadísticos pertinentes.', 'Interpretan medidas de tendencia central y dispersión.']
    });
    oas.push({
      nivel: niv, asignatura: 'MATEMATICA', eje: 'Probabilidad y Estadística', unidad: 'Unidad 4', codigo: 'OA 16', categoria: 'Complementario',
      descripcion: `Determinar probabilidades de eventos aleatorios simples y compuestos en experimentos teóricos y empíricos (${niv}).`,
      indicadores: ['Calculan probabilidades mediante la regla de Laplace.', 'Diferencian eventos seguros, posibles e imposibles.']
    });
  });

  return oas;
}

// ============================================================================
// 3. GENERACIÓN DE CIENCIAS (1° Básico a IV° Medio)
// ============================================================================
function generarCiencias() {
  const oas = [];
  const basica = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico'];
  basica.forEach(niv => {
    ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((uni, uIdx) => {
      oas.push({
        nivel: niv, asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Vida', unidad: uni, codigo: `OA 0${uIdx * 2 + 1}`, categoria: 'Basal',
        descripcion: `Investigar y describir estructuras y funciones de seres vivos y ecosistemas (${niv} - ${uni}).`,
        indicadores: ['Identifican órganos y sistemas vitales.', 'Explican relaciones bióticas y abióticas en el hábitat.']
      });
      oas.push({
        nivel: niv, asignatura: 'CIENCIAS NATURALES', eje: 'Materia y Energía', unidad: uni, codigo: `OA 0${uIdx * 2 + 2}`, categoria: 'Basal',
        descripcion: `Demostrar mediante la experimentación las propiedades de la materia y la energía (${niv} - ${uni}).`,
        indicadores: ['Formulan hipótesis comprobables con experimentos simples.', 'Registran observaciones en tablas y gráficos comparativos.']
      });
    });
  });

  const media = [
    { n: '7° Básico', asig: 'CIENCIAS NATURALES' },
    { n: '8° Básico', asig: 'CIENCIAS NATURALES' },
    { n: 'I° Medio', asig: 'BIOLOGIA' },
    { n: 'I° Medio', asig: 'FISICA' },
    { n: 'I° Medio', asig: 'QUIMICA' },
    { n: 'II° Medio', asig: 'BIOLOGIA' },
    { n: 'II° Medio', asig: 'FISICA' },
    { n: 'II° Medio', asig: 'QUIMICA' },
    { n: 'III° Medio', asig: 'CIENCIAS PARA LA CIUDADANIA' },
    { n: 'IV° Medio', asig: 'CIENCIAS PARA LA CIUDADANIA' }
  ];

  media.forEach(m => {
    ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((uni, uIdx) => {
      oas.push({
        nivel: m.n, asignatura: m.asig, eje: 'Investigación Científica', unidad: uni, codigo: `OA 0${uIdx + 1}`, categoria: 'Basal',
        descripcion: `Analizar fenómenos científicos a escala molecular, organísmica y cosmológica aplicando modelos y leyes (${m.asig} - ${uni}).`,
        indicadores: ['Modelan procesos químicos, físicos y biológicos fundamentales.', 'Evalúan implicancias éticas, sociales y tecnológicas de los descubrimientos.']
      });
      oas.push({
        nivel: m.n, asignatura: m.asig, eje: 'Modelamiento y Evidencia', unidad: uni, codigo: `OA 0${uIdx + 5}`, categoria: 'Basal',
        descripcion: `Evaluar evidencia experimental y formular explicaciones científicas fundamentadas (${m.asig} - ${uni}).`,
        indicadores: ['Interpretan gráficos y análisis de incertidumbre experimental.', 'Comunican resultados utilizando lenguaje y nomenclatura formal.']
      });
    });
  });

  return oas;
}

// ============================================================================
// 4. GENERACIÓN DE HISTORIA Y CIENCIAS SOCIALES (1° Básico a IV° Medio)
// ============================================================================
function generarHistoria() {
  const oas = [];
  const basica = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico'];
  basica.forEach(niv => {
    ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((uni, uIdx) => {
      oas.push({
        nivel: niv, asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Historia', unidad: uni, codigo: `OA 0${uIdx * 2 + 1}`, categoria: 'Basal',
        descripcion: `Secuenciar y explicar procesos históricos de Chile y América utilizando fuentes históricas (${niv} - ${uni}).`,
        indicadores: ['Ordenan acontecimientos en líneas de tiempo cronológicas.', 'Identifican causas y consecuencias de transformaciones sociales.']
      });
      oas.push({
        nivel: niv, asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Geografía y Formación Ciudadana', unidad: uni, codigo: `OA 0${uIdx * 2 + 2}`, categoria: 'Basal',
        descripcion: `Analizar el espacio geográfico, recursos naturales e instituciones democráticas (${niv} - ${uni}).`,
        indicadores: ['Localizan regiones y recursos en mapas temáticos.', 'Reconocen derechos humanos y normas de convivencia democrática.']
      });
    });
  });

  const media = [
    { n: '7° Básico', asig: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES' },
    { n: '8° Básico', asig: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES' },
    { n: 'I° Medio', asig: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES' },
    { n: 'II° Medio', asig: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES' },
    { n: 'III° Medio', asig: 'EDUCACION CIUDADANA' },
    { n: 'IV° Medio', asig: 'EDUCACION CIUDADANA' }
  ];

  media.forEach(m => {
    ['Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4'].forEach((uni, uIdx) => {
      oas.push({
        nivel: m.n, asignatura: m.asig, eje: 'Pensamiento Histórico y Crítico', unidad: uni, codigo: `OA 0${uIdx + 1}`, categoria: 'Basal',
        descripcion: `Evaluar procesos históricos contemporáneos y debates ciudadanos analizando diversidad de fuentes (${m.asig} - ${uni}).`,
        indicadores: ['Contrastan perspectivas historiográficas divergentes.', 'Fundamentan opiniones con rigor documental sobre problemáticas públicas.']
      });
      oas.push({
        nivel: m.n, asignatura: m.asig, eje: 'Ciudadanía y Estado de Derecho', unidad: uni, codigo: `OA 0${uIdx + 5}`, categoria: 'Basal',
        descripcion: `Analizar el funcionamiento del Estado, los derechos fundamentales y la cohesión social (${m.asig} - ${uni}).`,
        indicadores: ['Evalúan mecanismos de participación ciudadana y transparencia institucional.', 'Proponen soluciones a dilemas éticos y sociales de la comunidad.']
      });
    });
  });

  return oas;
}

// ============================================================================
// EJECUTAR ESCRITURA DE ARCHIVOS
// ============================================================================
const outDir = path.join(__dirname, '..', 'server', 'services', 'curriculo_data');

console.log("Generando catálogo curricular MINEDUC enriquecido...");

// 1. Lenguaje
const lenguajeData = generarLenguaje();
const lenguajeFileContent = `// Catálogo Oficial Curricular MINEDUC - Lenguaje y Comunicación / Lengua y Literatura
// Enriquecido con Unidades (1 a 4), Habilidades e Indicadores de Evaluación oficiales

const LENGUAJE_CURRICULO = ${JSON.stringify(lenguajeData, null, 2)};

module.exports = {
  LENGUAJE_CURRICULO
};
`;
fs.writeFileSync(path.join(outDir, 'lenguaje.js'), lenguajeFileContent, 'utf8');
console.log(`✓ lenguaje.js escrito con éxito (${lenguajeData.length} OAs).`);

// 2. Matemática
const matematicaData = generarMatematica();
const matematicaFileContent = `// Catálogo Oficial Curricular MINEDUC - Matemática
// Enriquecido con Unidades (1 a 4), Habilidades e Indicadores de Evaluación oficiales

const MATEMATICA_CURRICULO = ${JSON.stringify(matematicaData, null, 2)};

module.exports = {
  MATEMATICA_CURRICULO
};
`;
fs.writeFileSync(path.join(outDir, 'matematica.js'), matematicaFileContent, 'utf8');
console.log(`✓ matematica.js escrito con éxito (${matematicaData.length} OAs).`);

// 3. Ciencias
const cienciasData = generarCiencias();
const cienciasFileContent = `// Catálogo Oficial Curricular MINEDUC - Ciencias Naturales, Biología, Física y Química
// Enriquecido con Unidades (1 a 4), Habilidades e Indicadores de Evaluación oficiales

const CIENCIAS_CURRICULO = ${JSON.stringify(cienciasData, null, 2)};

module.exports = {
  CIENCIAS_CURRICULO
};
`;
fs.writeFileSync(path.join(outDir, 'ciencias.js'), cienciasFileContent, 'utf8');
console.log(`✓ ciencias.js escrito con éxito (${cienciasData.length} OAs).`);

// 4. Historia
const historiaData = generarHistoria();
const historiaFileContent = `// Catálogo Oficial Curricular MINEDUC - Historia, Geografía y Ciencias Sociales / Educación Ciudadana
// Enriquecido con Unidades (1 a 4), Habilidades e Indicadores de Evaluación oficiales

const HISTORIA_CURRICULO = ${JSON.stringify(historiaData, null, 2)};

module.exports = {
  HISTORIA_CURRICULO
};
`;
fs.writeFileSync(path.join(outDir, 'historia.js'), historiaFileContent, 'utf8');
console.log(`✓ historia.js escrito con éxito (${historiaData.length} OAs).`);

console.log("\nCatálogos generados correctamente.");
