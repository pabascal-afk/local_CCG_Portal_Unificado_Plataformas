/**
 * Catálogo Curricular MINEDUC - Lenguaje y Comunicación (1° a 8° Básico)
 * y Lengua y Literatura (7°/8° Básico a IV° Medio)
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales.
 */

const LENGUAJE_CURRICULO = [
  // ==========================================
  // 1° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Reconocer que los textos escritos transmiten mensajes y que son escritos por alguien para cumplir un propósito.',
    indicadores: [
      'Identifican que las palabras escritas representan ideas y mensajes del entorno.',
      'Señalan textos en el entorno (etiquetas, letreros, libros) reconociendo su función comunicativa.',
      'Diferencian letras de dibujos y números en diversos soportes visuales.',
      'Siguen la direccionalidad de la lectura de izquierda a derecha y de arriba hacia abajo.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Identificar los sonidos que componen las palabras (conciencia fonológica), reconociendo, separando y combinando sus fonemas y sílabas.',
    indicadores: [
      'Identifican el sonido inicial y final de palabras cotidianas.',
      'Separan palabras familiares en sus sílabas correspondientes con palmadas o aplausos.',
      'Identifican palabras que riman a partir de poesías y canciones infantiles.',
      'Unen sonidos vocálicos y consonánticos para formar sílabas directas.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Leer palabras aisladas y en contexto, aplicando su conocimiento de la correspondencia letra-sonido en diferentes combinaciones.',
    indicadores: [
      'Nombran las letras del abecedario trabajadas y reproducen su sonido asociado.',
      'Leen palabras formadas por sílabas directas simples de forma fluida.',
      'Leen oraciones breves compuestas por palabras de uso frecuente.',
      'Reconocen palabras a primera vista a partir de un vocabulario visual básico.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Demostrar comprensión de narraciones que aborden temas que les sean familiares: extrayendo información explícita e implícita, respondiendo preguntas.',
    indicadores: [
      'Mencionan a los personajes principales y secundarios del relato.',
      'Describen el lugar físico donde se desarrollan las acciones narradas.',
      'Reconstruyen la secuencia cronológica de la historia (inicio, desarrollo, desenlace).',
      'Responden preguntas literales e inferenciales simples formuladas por el docente.',
      'Expresan una opinión personal fundamentada sobre las acciones de los personajes.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Experimentar con la escritura para comunicar hechos, ideas y sentimientos, entre otros.',
    indicadores: [
      'Escriben mensajes breves usando palabras conocidas y combinaciones silábicas aprendidas.',
      'Escriben tarjetas de saludo, notas familiares o listas de palabras con propósitos reales.',
      'Separan las palabras con un espacio visible en oraciones sencillas.',
      'Muestran satisfacción y entusiasmo por comunicar ideas a través de la escritura.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 18', categoria: 'Complementario',
    descripcion: 'Comprender textos orales (explicaciones, instrucciones, relatos, anécdotas, etc.) para obtener información y desarrollar su curiosidad por el mundo.',
    indicadores: [
      'Siguen instrucciones orales compuestas de dos o tres pasos secuenciales.',
      'Relatan con sus propias palabras anécdotas o sucesos escuchados en clases.',
      'Formulan preguntas pertinentes sobre temas de interés abordados en los textos orales.',
      'Demuestran respeto escuchando atentamente a sus compañeros sin interrumpir.'
    ]
  },

  // ==========================================
  // 2° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '2° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Leer en voz alta para adquirir fluidez: pronunciando cada palabra con precisión, respetando el punto seguido y punto aparte, y con entonación adecuada.',
    indicadores: [
      'Leen en voz alta textos adecuados a su edad con precisión y ritmo continuo.',
      'Respetan los signos de puntuación (punto seguido, aparte y coma) al leer oralmente.',
      'Modulan adecuadamente el volumen y la entonación según el sentido del texto.',
      'Autocorrigen errores de lectura espontáneamente al perder el sentido del texto.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Demostrar comprensión de las narraciones leídas: extrayendo información explícita e implícita, reconstruyendo la secuencia de acciones y describiendo personajes.',
    indicadores: [
      'Contestan preguntas sobre información explícita e implícita de cuentos y fábulas.',
      'Describen características físicas y psicológicas evidentes de los personajes.',
      'Determinan causas y consecuencias directas de acontecimientos del relato.',
      'Comparan personajes de distintas historias leídas estableciendo semejanzas y diferencias.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Escribir frecuentemente, para desarrollar la creatividad y expresar sus ideas, textos como poemas, diarios de vida, anécdotas, cartas, recados, etc.',
    indicadores: [
      'Escriben narraciones breves estructuradas en inicio, conflicto y desenlace.',
      'Utilizan conectores temporales básicos (primero, luego, después, finalmente).',
      'Emplean mayúscula al inicio de oraciones y nombres propios, y punto al terminar.',
      'Revisan sus escritos guiados por una pauta sencilla para mejorar la ortografía.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 18', categoria: 'Complementario',
    descripcion: 'Participar activamente en conversaciones grupales sobre textos leídos o temas de interés, expresando ideas con claridad y fundamentando sus preferencias.',
    indicadores: [
      'Aportan opiniones pertinentes al tema discutido en la clase.',
      'Esperan su turno para hablar y respetan las opiniones divergentes de sus pares.',
      'Fundamentan sus comentarios aludiendo a hechos ocurridos en los textos leídos.'
    ]
  },

  // ==========================================
  // 3° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '3° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Comprender textos aplicando estrategias de comprensión lectora; por ejemplo: relacionar la información del texto con sus experiencias y conocimientos; releer lo que no fue comprendido.',
    indicadores: [
      'Relacionan el contenido del texto con situaciones vividas o lecturas previas.',
      'Formulan preguntas sobre dudas de significado y releen párrafos confusos.',
      'Subrayan palabras clave o ideas principales para resumir párrafos.',
      'Predicen acontecimientos a partir del título, imágenes y pistas textuales.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Profundizar su comprensión de las narraciones leídas: extrayendo información explícita e implícita; determinando las consecuencias de hechos o acciones; describiendo y comparando personajes.',
    indicadores: [
      'Explican el conflicto central que motiva las acciones de los personajes.',
      'Identifican pistas textuales para inferir emociones, intenciones y valores de personajes.',
      'Establecen relaciones de causa y efecto en la trama argumental.',
      'Emiten juicios valorativos fundamentados sobre conductas éticas observadas en el relato.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Escribir creativamente narraciones (experiencias personales, relatos de hechos, cuentos) que incluyan una secuencia lógica de eventos con conectores variados.',
    indicadores: [
      'Redactan cuentos que presentan un inicio cautivador, un clímax y un desenlace coherente.',
      'Utilizan una variedad de conectores cronológicos y causales (porque, por eso, sin embargo).',
      'Describen escenarios y atmósferas usando adjetivos calificativos pertinentes.',
      'Aplican signos de puntuación (puntos, comas en enumeraciones y signos de exclamación).'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 24', categoria: 'Complementario',
    descripcion: 'Exponer de manera clara y organizada sobre un tema de su interés o investigado, utilizando vocabulario variado y material gráfico de apoyo.',
    indicadores: [
      'Estructuran su presentación oral en introducción, exposición central y conclusión.',
      'Utilizan cartulinas, diapositivas o maquetas para respaldar las ideas expuestas.',
      'Mantienen contacto visual y una postura corporal erguida y segura frente al curso.'
    ]
  },

  // ==========================================
  // 4° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Profundizar su comprensión de las narraciones leídas: identificando problema y solución; describiendo personajes física y psicológicamente; comparando relatos de distintos orígenes.',
    indicadores: [
      'Reconocen el dilema central o conflicto que enfrentan los protagonistas en mitos y leyendas.',
      'Describen la evolución del personaje principal a lo largo de la narración.',
      'Comparan mitos y relatos folclóricos identificando elementos culturales comunes.',
      'Fundamentan interpretaciones citando párrafos textuales pertinentes.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Leer independientemente y comprender textos no literarios (cartas, biografías, artículos informativos) para ampliar su conocimiento del mundo y formar opinión.',
    indicadores: [
      'Identifican la idea principal y las secundarias en cada párrafo de artículos divulgativos.',
      'Interpretan recursos gráficos de apoyo (fotografías, infografías, esquemas y tablas).',
      'Diferencian hechos comprobables de opiniones del autor en textos informativos.',
      'Resumen las ideas centrales usando sus propias palabras sin alterar el significado.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Escribir creativamente narraciones (experiencias personales, cuentos, anécdotas) organizando las ideas en párrafos separados por punto y aparte.',
    indicadores: [
      'Estructuran el texto narrativo en al menos 3 párrafos claramente diferenciados.',
      'Enriquecen el vocabulario evitando la repetición de palabras mediante el uso de sinónimos.',
      'Aplican reglas de acentuación general (palabras agudas, graves y esdrújulas).',
      'Revisan y corrigen la concordancia gramatical de género y número en oraciones compuestas.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 22', categoria: 'Complementario',
    descripcion: 'Dialogar para compartir y desarrollar ideas y buscar acuerdos: manteniendo el foco de la conversación; formulando preguntas para aclarar dudas.',
    indicadores: [
      'Participan activamente en paneles de discusión respetando los turnos de habla asignados.',
      'Formulan preguntas de profundización que enriquecen los puntos planteados por sus pares.',
      'Expresan discrepancias de manera respetuosa ofreciendo argumentos alternativos.'
    ]
  },

  // ==========================================
  // 5° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '5° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Leer y familiarizarse con un amplio repertorio de literatura para aumentar su conocimiento del mundo y desarrollar su imaginación: cuentos folclóricos, de autor y novelas.',
    indicadores: [
      'Analizan el impacto del contexto histórico o social en la motivación de los personajes.',
      'Identifican la voz del narrador (primera o tercera persona) y su influencia en el relato.',
      'Reconocen temas universales (la amistad, la justicia, la superación) en textos narrativos.',
      'Comparan versiones literarias y cinematográficas de una misma obra.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Leer independientemente y comprender textos no literarios (artículos, reportajes, entrevistas) para informarse sobre temas de interés y evaluar la veracidad de la información.',
    indicadores: [
      'Evalúan la pertinencia y confiabilidad de las fuentes citadas en reportajes escolares.',
      'Diferencian el propósito comunicativo central (informar, convencer, instruir) de cada texto.',
      'Identifican relaciones de causa-efecto y problema-solución en textos explicativos.',
      'Elaboran mapas conceptuales o cuadros sinópticos a partir de la información leída.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Escribir artículos informativos para comunicar información sobre un tema: organizando el texto en introducción, desarrollo y conclusión; incorporando datos e infografías.',
    indicadores: [
      'Planifican la estructura del artículo seleccionando subtítulos temáticos coherentes.',
      'Integran datos, ejemplos y citas para fundamentar las afirmaciones explicativas.',
      'Utilizan conectores de adición, causa, consecuencia y contraste con precisión sintáctica.',
      'Revisan y corrigen ortografía literal (b/v, c/s/z) y puntual en borradores sucesivos.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 26', categoria: 'Complementario',
    descripcion: 'Participar activamente en conversaciones colectivas y debates sobre textos escuchados o leídos, fundamentando opiniones con ejemplos del texto.',
    indicadores: [
      'Defienden una postura sobre un dilema ético presente en una lectura con al menos dos argumentos sólidos.',
      'Escuchan críticamente los argumentos contrarios e identifican posibles contradicciones.',
      'Utilizan un registro de habla formal adecuado a la situación comunicativa académica.'
    ]
  },

  // ==========================================
  // 6° BÁSICO - LENGUAJE Y COMUNICACIÓN
  // ==========================================
  {
    nivel: '6° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Analizar las narraciones leídas para enriquecer su comprensión: identificando al narrador y su punto de vista; interpretando el lenguaje figurado y los símbolos presentes.',
    indicadores: [
      'Diferencian narrador omnisciente, protagonista y testigo en relatos complejos.',
      'Interpretan metáforas, comparaciones y personificaciones en prosa y poesía.',
      'Analizan la atmósfera psicológica y el ambiente físico de la historia.',
      'Explican el simbolismo de objetos o acciones clave en la resolución del conflicto.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Leer críticamente textos de los medios de comunicación (noticias, columnas de opinión, crónicas) identificando la línea editorial y posturas valóricas.',
    indicadores: [
      'Reconocen la tesis o postura central del autor en una columna de opinión.',
      'Diferencian hechos objetivos de juicios de valor en crónicas periodísticas.',
      'Contrastan la cobertura de una misma noticia en dos medios de comunicación distintos.',
      'Detectan estereotipos o sesgos en titulares y contenidos periodísticos.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 15', categoria: 'Basal',
    descripcion: 'Escribir textos con la intención de persuadir (cartas al director, manifiestos, afiches argumentativos) fundamentando su tesis con argumentos y evidencias.',
    indicadores: [
      'Formulan una tesis clara y explícita sobre un tema controversial de interés escolar.',
      'Desarrollan argumentos causales, de autoridad y de ejemplo bien documentados.',
      'Estructuran el texto con conectores argumentativos (por lo tanto, dado que, a pesar de).',
      'Redactan una conclusión contundente que refuerza la tesis inicial y apela al receptor.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 24', categoria: 'Complementario',
    descripcion: 'Realizar presentaciones orales estructuradas para difundir investigaciones escolares, utilizando lenguaje formal y apoyo audiovisual interactivo.',
    indicadores: [
      'Presentan resultados de investigación siguiendo la estructura formal: introducción, marco, resultados y conclusiones.',
      'Emplean diapositivas o recursos digitales equilibrados, sin exceso de texto y con gráficos pertinentes.',
      'Responden preguntas de la audiencia y del docente con solvencia y dominio conceptual.'
    ]
  },

  // ==========================================
  // 7° BÁSICO - LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: '7° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura Literaria', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Reflexionar sobre las diferentes dimensiones de la experiencia humana, propia y ajena, a partir de la lectura de obras literarias y otros textos que forman parte de nuestras herencias culturales.',
    indicadores: [
      'Identifican cómo se expresa el arquetipo del héroe y su viaje en mitos y novelas juveniles.',
      'Analizan la superación de adversidades y el crecimiento moral de los personajes.',
      'Relacionan los conflictos de la obra con dilemas personales de la adolescencia.',
      'Comparan visiones de mundo presentes en textos de épocas y culturas diversas.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura Crítica', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Analizar y evaluar textos con finalidad argumentativa como cartas de lectores, columnas de opinión y ensayos breves, considerando postura y argumentos.',
    indicadores: [
      'Identifican la tesis central defendida por el autor en columnas de opinión pública.',
      'Evalúan la solidez y pertinencia de los argumentos y contraargumentos presentados.',
      'Reconocen falacias argumentativas comunes (ataque personal, generalización apresurada).',
      'Formulan una opinión crítica fundada respecto a la propuesta del texto leído.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Escribir, con el propósito de explicar o argumentar, textos de diversos géneros (ensayos breves, cartas de lectores) con rigurosidad y coherencia.',
    indicadores: [
      'Estructuran el texto distinguiendo introducción, cuerpo argumentativo y conclusión.',
      'Utilizan citas textuales y referencias a fuentes confiables para apoyar su postura.',
      'Emplean léxico preciso y variado acorde al registro académico formal.',
      'Corrigen problemas de cohesión, conectores y puntuación en etapas sucesivas de edición.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 20', categoria: 'Complementario',
    descripcion: 'Evaluar puntos de vista y posturas en debates, paneles o foros, distinguiendo argumentos válidos de opiniones sin respaldo.',
    indicadores: [
      'Registran en pautas estructuradas los argumentos y evidencias de cada exponente.',
      'Identifican debilidades lógicas o vacíos de evidencia en las exposiciones orales.',
      'Participan en mesas de diálogo refutando objeciones con serenidad y rigor intelectual.'
    ]
  },

  // ==========================================
  // 8° BÁSICO - LENGUAJE Y COMUNICACIÓN / LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: '8° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura Literaria', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Reflexionar sobre las diferentes dimensiones de la experiencia humana a partir de obras literarias: el tema de la epopeya, el honor, el amor y la tragedia.',
    indicadores: [
      'Analizan el conflicto trágico y el peso del destino en epopeyas clásicas y contemporáneas.',
      'Explican la evolución ética y psicológica del protagonista frente a situaciones límite.',
      'Relacionan el concepto de honor y deber en obras literarias con valores ciudadanos actuales.',
      'Escriben ensayos breves fundamentando su postura frente a las decisiones de los protagonistas.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Lectura Crítica', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Analizar críticamente textos de medios de comunicación (reportajes investigativos, editoriales, documentales), considerando propósitos implícitos y sesgos.',
    indicadores: [
      'Identifican la perspectiva ideológica o editorial implícita en documentales y reportajes.',
      'Evalúan si la evidencia aportada por el medio es equilibrada o unilateral.',
      'Analizan el impacto social que generan los discursos emitidos en redes y medios masivos.',
      'Distinguen recursos persuasivos retóricos de argumentos lógicos demostrables.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Escritura', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Planificar, escribir, revisar y editar textos argumentativos académicos bien cohesionados, defendiendo una tesis mediante razonamientos lógicos.',
    indicadores: [
      'Plantean una tesis original sobre dilemas éticos o científicos contemporáneos.',
      'Elaboran cadenas de razonamiento deductivo e inductivo fundamentadas en datos comprobables.',
      'Contraargumentan posturas opuestas demostrando solvencia teórica y respeto.',
      'Citan fuentes impresas y digitales bajo convenciones bibliográficas estándar.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'LENGUAJE Y COMUNICACION', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 20', categoria: 'Complementario',
    descripcion: 'Participar activamente en debates formales y foros escolares: formulando argumentos de refutación sólidos y manteniendo compostura pragmática.',
    indicadores: [
      'Aplican técnicas de oratoria, modulación de voz, silencios y pausas intencionadas.',
      'Refutan argumentos del equipo oponente empleando evidencias factuales verificadas.',
      'Respaldan sus afirmaciones orales con datos estadísticos y citas de expertos.'
    ]
  },

  // ==========================================
  // I° MEDIO - LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Literaria', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Formular interpretaciones de obras leídas que aborden el tema de la identidad, el amor y el conflicto humano, considerando relaciones intertextuales y contexto.',
    indicadores: [
      'Analizan cómo los personajes construyen o cuestionan su propia identidad a lo largo del relato.',
      'Identifican intertextualidad y alusiones a mitos clásicos en obras literarias modernas.',
      'Explican el impacto del contexto histórico del autor en los temas y problemáticas de la obra.',
      'Elaboran ensayos interpretativos fundamentando hipótesis de lectura con citas textuales.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Crítica', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Analizar y evaluar críticamente textos con finalidad argumentativa como columnas de opinión, editoriales y ensayos, identificando sesgos y validez de premisas.',
    indicadores: [
      'Reconocen la estructura silogística de la argumentación en editoriales de prensa.',
      'Evalúan la aceptabilidad, relevancia y suficiencia de las premisas presentadas.',
      'Detectan falacias formales e informales en discursos políticos y publicitarios.',
      'Redactan contraensayos rebatiendo rigurosamente la postura del autor analizado.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Escritura Especializada', unidad: 'Unidad 3', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Escribir textos de intención literaria y ensayos de investigación aplicando recursos retóricos, estilísticos y citas bibliográficas normalizadas.',
    indicadores: [
      'Redactan ensayos académicos de 3 a 5 páginas con introducción, estado del arte, discusión y conclusiones.',
      'Aplican normas de citación bibliográfica (APA) en citas directas y paráfrasis.',
      'Emplean un registro formal especializado y variedad de figuras retóricas en textos literarios.',
      'Participan en talleres de coevaluación y edición entre pares mejorando la coherencia global.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Comunicación Dialógica', unidad: 'Unidad 4', codigo: 'OA 22', categoria: 'Complementario',
    descripcion: 'Diseñar y conducir debates formales y mesas de discusión académica sobre problemáticas socioculturales, formulando réplicas fundamentadas.',
    indicadores: [
      'Lideran equipos de debate preparando argumentos de apertura, réplica y cierre.',
      'Responden a objeciones imprevistas con serenidad, lógica y evidencia verificable.',
      'Sintetizan los consensos y disensos alcanzados al término de la discusión plenaria.'
    ]
  },

  // ==========================================
  // II° MEDIO - LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Literaria', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Formular interpretaciones de obras literarias que aborden problemáticas de marginalidad, poder y justicia social en la narrativa chilena y latinoamericana.',
    indicadores: [
      'Analizan la representación de las desigualdades sociales y de género en la literatura contemporánea.',
      'Explican el uso de recursos vanguardistas (monólogo interior, alteración cronológica, perspectivismo).',
      'Vinculan las obras leídas con procesos históricos de transformación social en América Latina.',
      'Sustentan lecturas críticas dialogando con ensayos de teoría literaria.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Crítica', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Analizar críticamente discursos argumentativos públicos (discursos de estadistas, alegatos jurídicos, proclamas), evaluando su eficacia retórica y ética.',
    indicadores: [
      'Identifican los recursos de persuasión retórica: ethos, pathos y logos en discursos memorables.',
      'Evalúan la consistencia moral de las propuestas formuladas a la luz de los Derechos Humanos.',
      'Contrastan el discurso emitido con las acciones reales y el impacto social generado.',
      'Elaboran ensayos críticos desglosando los dispositivos retóricos y lingüísticos del discurso.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Escritura Académica', unidad: 'Unidad 3', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Escribir monografías o artículos de opinión académica fundamentados en una investigación bibliográfica sistemática en bases de datos.',
    indicadores: [
      'Plantean un problema de investigación delimitado y una hipótesis de trabajo coherente.',
      'Seleccionan fuentes académicas arbitradas (artículos científicos, libros especializados).',
      'Sintetizan posturas de diversos autores articulándolas en un marco teórico sólido.',
      'Escriben bajo estándares académicos rigurosos con citas y lista de referencias APA.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Comunicación Oral', unidad: 'Unidad 4', codigo: 'OA 20', categoria: 'Complementario',
    descripcion: 'Exponer oralmente los hallazgos de investigaciones interdisciplinarias utilizando recursos digitales interactivos y respondiendo a preguntas de pares y docentes.',
    indicadores: [
      'Estructuran su conferencia oral adaptando el lenguaje técnico a la audiencia escolar.',
      'Utilizan infografías interactivas o plataformas de datos para ilustrar hallazgos.',
      'Defienden las conclusiones alcanzadas fundamentando las limitaciones metodológicas del estudio.'
    ]
  },

  // ==========================================
  // III° MEDIO - LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Crítica e Interpretativa', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Formular interpretaciones de obras literarias complejas analizando la construcción de mundos posibles, intertextualidad y el cuestionamiento del sentido existencial.',
    indicadores: [
      'Analizan visiones filosóficas y existenciales expresadas en novelas, dramas y poesía del siglo XX y XXI.',
      'Identifican el diálogo intertextual entre clásicos universales y reescrituras contemporáneas.',
      'Explican cómo la técnica narrativa (polifonía, distanciamiento) condiciona la postura del lector.',
      'Redactan ensayos monográficos profundizando en dilemas estéticos y morales.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Crítica de Medios', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Evaluar críticamente discursos de los medios masivos y plataformas digitales, analizando los mecanismos de construcción de la realidad y posverdad.',
    indicadores: [
      'Identifican cómo los algoritmos de recomendación y las cámaras de eco configuran burbujas informativas.',
      'Analizan estrategias de encuadre mediático (framing) en noticias de alta controversia social.',
      'Detectan sesgos cognitivos e ideológicos implícitos en notas informativas y redes sociales.',
      'Proponen criterios de alfabetización mediática para verificar autenticidad en noticias digitales.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Escritura Académica', unidad: 'Unidad 3', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Producir textos argumentativos académicos y ensayos de divulgación con rigor epistemológico, fundamentación documental y estilo fluido.',
    indicadores: [
      'Construyen marcos teóricos articulando conceptos de distintas corrientes de pensamiento.',
      'Desarrollan razonamientos analíticos profundos evitando lugares comunes y generalizaciones.',
      'Dominan el registro culto formal, la precisión léxica y la riqueza morfosintáctica.',
      'Incorporan aparato crítico con referencias bibliográficas rigurosas y pertinentes.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Comunicación Oral y Ciudadana', unidad: 'Unidad 4', codigo: 'OA 07', categoria: 'Complementario',
    descripcion: 'Participar activamente en foros ciudadanos y coloquios académicos, deliberando con fundamento sobre problemáticas éticas, culturales y ambientales.',
    indicadores: [
      'Exponen argumentos ponderados en mesas redondas reconociendo la complejidad de los dilemas éticos.',
      'Demuestran escucha activa y disposición a matizar posturas frente a evidencias contundentes.',
      'Sintetizan puntos de acuerdo y desacuerdo promoviendo el diálogo democrático constructivo.'
    ]
  },

  // ==========================================
  // IV° MEDIO - LENGUA Y LITERATURA
  // ==========================================
  {
    nivel: 'IV° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Lectura Literaria y Memoria', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Construir interpretaciones literarias vinculando las obras con el contexto sociocultural de producción y reflexionando sobre la memoria, la justicia y la dignidad humana.',
    indicadores: [
      'Analizan la representación de la memoria colectiva y los Derechos Humanos en la literatura chilena y mundial.',
      'Examinan el testimonio testimonial y la crónica como herramientas de resistencia y denuncia.',
      'Evalúan la función social de la literatura en la transformación de paradigmas éticos y políticos.',
      'Fundamentan lecturas críticas en coloquios y ponencias orales de graduación escolar.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Análisis Crítico del Discurso', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Evaluar discursos en torno a dilemas contemporáneos (bioética, inteligencia artificial, crisis climática), examinando supuestos ideológicos y argumentos.',
    indicadores: [
      'Desglosan la arquitectura argumentativa de manifiestos científicos, filosóficos y políticos.',
      'Identifican presunciones no declaradas y sesgos antropocéntricos o tecnocráticos en los discursos.',
      'Elaboran ensayos críticos proponiendo marcos éticos integradores para enfrentar desafíos globales.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Escritura de Investigación', unidad: 'Unidad 3', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Elaborar un proyecto monográfico de graduación o ensayo investigativo extenso, aplicando metodología científica y estándares de publicación académica.',
    indicadores: [
      'Plantean preguntas de investigación originales y objetivos claros y viables.',
      'Revisan literatura especializada nacional e internacional en fuentes académicas indexadas.',
      'Analizan datos cualitativos y textuales con métodos rigurosos de análisis de contenido.',
      'Redactan conclusiones prospectivas que abren nuevas líneas de indagación pedagógica.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'LENGUA Y LITERATURA', eje: 'Defensa Oral de Proyectos', unidad: 'Unidad 4', codigo: 'OA 08', categoria: 'Complementario',
    descripcion: 'Sustentar conferencias y defensas orales de proyectos de investigación ante comisiones evaluadoras, utilizando recursos retóricos de oratoria académica.',
    indicadores: [
      'Exponen con elocuencia, síntesis y precisión conceptual los aportes de su investigación.',
      'Responden con solvencia y madurez intelectual a las objeciones y preguntas de la comisión.',
      'Demuestran dominio de herramientas tecnológicas para la divulgación del conocimiento.'
    ]
  }
];

module.exports = { LENGUAJE_CURRICULO };
