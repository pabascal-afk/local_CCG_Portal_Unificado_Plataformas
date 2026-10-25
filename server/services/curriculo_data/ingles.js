/**
 * Catálogo Curricular MINEDUC - Idioma Extranjero Inglés (1° Básico a IV° Medio)
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales (Listening, Reading, Writing, Speaking).
 */

const INGLES_CURRICULO = [
  // ==========================================
  // 1° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'INGLES', eje: 'Listening', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender textos orales muy breves y simples con apoyo visual (saludos, números del 1 al 10, colores y objetos escolares).',
    indicadores: [
      'Responden con gestos y palabras a saludos básicos ("Hello", "Good morning", "Goodbye").',
      'Identifican colores primarios y secundarios señalando objetos al escuchar su nombre.',
      'Cuentan elementos del 1 al 10 en inglés al escuchar canciones y rimas infantiles.',
      'Siguen instrucciones breves de clase ("Stand up", "Sit down", "Open your book").'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'INGLES', eje: 'Speaking & Reading', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Reaccionar a textos leídos o escuchados nombrando partes del cuerpo, miembros de la familia y animales favoritos.',
    indicadores: [
      'Señalan y nombran partes del cuerpo ("head", "hands", "eyes", "mouth") al escuchar comandos.',
      'Identifican vocabulario de la familia ("mother", "father", "sister", "brother") en ilustraciones.',
      'Nombran animales domésticos y de la granja ("dog", "cat", "cow", "horse") con pronunciación comprensible.'
    ]
  },

  // ==========================================
  // 2° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '2° Básico', asignatura: 'INGLES', eje: 'Listening & Reading', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender textos orales y escritos sencillos sobre la rutina diaria, prendas de vestir y comida favorita.',
    indicadores: [
      'Reconocen vocabulario de alimentos ("apple", "milk", "bread", "water") en diálogos breves.',
      'Asocian prendas de vestir ("shoes", "t-shirt", "jacket", "pants") con imágenes correspondientes.',
      'Expresan gustos y preferencias básicas usando la estructura "I like..." y "I don\'t like...".'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'INGLES', eje: 'Writing', unidad: 'Unidad 2', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Copiar y escribir palabras de uso frecuente y oraciones modelo asociándolas con dibujos descriptivos.',
    indicadores: [
      'Escriben palabras en inglés de forma legible respetando ortografía básica.',
      'Completan oraciones breves con palabras clave de vocabulario aprendido.',
      'Ilustran oraciones sencillas demostrando comprensión del significado.'
    ]
  },

  // ==========================================
  // 3° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '3° Básico', asignatura: 'INGLES', eje: 'Reading Comprehension', unidad: 'Unidad 1', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Leer y demostrar comprensión de textos instructivos y descriptivos breves identificando personajes, lugares y acciones.',
    indicadores: [
      'Identifican información explícita sobre personas y profesiones ("doctor", "teacher", "firefighter").',
      'Leen oraciones con el verbo "to be" en presente simple identificando pronombres personales (I, you, he, she, we, they).',
      'Reconocen adjetivos descriptivos de tamaño, forma y personalidad en textos breves.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'INGLES', eje: 'Writing & Speaking', unidad: 'Unidad 2', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Escribir oraciones breves y participar en intercambios orales guiados sobre lugares de la ciudad y cómo llegar.',
    indicadores: [
      'Utilizan preposiciones de lugar básicas ("in", "on", "under", "next to") en oraciones escritas.',
      'Preguntan y responden por ubicaciones usando "Where is the...?" y "It is...".',
      'Pronuncian con claridad vocabulario de la ciudad ("school", "park", "hospital", "supermarket").'
    ]
  },

  // ==========================================
  // 4° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '4° Básico', asignatura: 'INGLES', eje: 'Listening & Speaking', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender conversaciones breves sobre la hora, hábitos y pasatiempos, y formular preguntas sencillas con "What time is it?".',
    indicadores: [
      'Identifican horas en punto y medias horas ("It\'s 3 o\'clock", "It\'s half past four") en audios breves.',
      'Describen pasatiempos usando adverbios de frecuencia básicos ("always", "sometimes", "never").',
      'Mantienen diálogos guiados con un compañero sobre actividades de tiempo libre.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'INGLES', eje: 'Reading & Writing', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Leer textos informativos breves sobre animales y sus hábitats, y escribir párrafos simples de 3 a 4 oraciones.',
    indicadores: [
      'Identifican ideas principales en textos descriptivos de la fauna salvaje (leones, ballenas, cóndores).',
      'Escriben párrafos describiendo un animal utilizando conectores "and" y "but".',
      'Aplican correctamente la concordancia del presente simple con tercera persona singular (-s / -es).'
    ]
  },

  // ==========================================
  // 5° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '5° Básico', asignatura: 'INGLES', eje: 'Listening Comprehension', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender información explícita y detalles específicos en textos orales breves adaptados sobre celebraciones y festividades culturales.',
    indicadores: [
      'Identifican fechas, lugares y comidas tradicionales en audios sobre festividades mundiales.',
      'Diferencian el sonido de terminaciones verbales regulares en pasado simple (-ed).',
      'Siguen narraciones orales breves apoyadas en imágenes secuenciales sin subtítulos.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'INGLES', eje: 'Reading Comprehension', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Demostrar comprensión de textos no literarios (recetas, guías turísticas breves, correos electrónicos) identificando el propósito del emisor.',
    indicadores: [
      'Extraen pasos secuenciales en recetas e instructivos sencillos identificando ingredientes.',
      'Responden correos electrónicos breves simulados aplicando fórmulas de saludo y despedida estándar.',
      'Diferencian hechos de opiniones personales en comentarios de viajes.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'INGLES', eje: 'Written Production', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Escribir mensajes y descripciones breves de experiencias pasadas utilizando el tiempo pasado simple y conectores cronológicos.',
    indicadores: [
      'Conjugan verbos regulares e irregulares comunes en pasado simple ("went", "saw", "played", "ate").',
      'Redactan una tarjeta postal o entrada de diario describiendo unas vacaciones pasadas.',
      'Aplican conectores temporales ("first", "then", "after that", "finally") con propiedad.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'INGLES', eje: 'Oral Expression', unidad: 'Unidad 4', codigo: 'OA 16', categoria: 'Complementario',
    descripcion: 'Participar en conversaciones y dramatizaciones breves pidiendo y dando información sobre planes futuros con "going to".',
    indicadores: [
      'Estructuran oraciones afirmativas e interrogativas con "be + going to + verbo".',
      'Representan situaciones comunicativas reales (hacer planes de fin de semana, comprar boletos).',
      'Mantienen fluidez y pronunciación clara evitando pausas excesivas en su intervención.'
    ]
  },

  // ==========================================
  // 6° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '6° Básico', asignatura: 'INGLES', eje: 'Listening & Reading', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Demostrar comprensión de textos auténticos y adaptados sobre el medio ambiente, reciclaje y tecnologías sostenibles.',
    indicadores: [
      'Identifican vocabulario ambiental especializado ("pollution", "recycle", "global warming", "solar energy").',
      'Reconocen oraciones con verbos modales de obligación y consejo ("should", "must", "can").',
      'Resumen las recomendaciones ecológicas de un artículo científico breve adaptado.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'INGLES', eje: 'Writing & Speaking', unidad: 'Unidad 2', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Elaborar afiches informativos y presentaciones orales cortas proponiendo soluciones a problemas ecológicos de la comunidad escolar.',
    indicadores: [
      'Redactan lemas y párrafos breves llamando a la acción ecológica con imperativos y modales.',
      'Exponen frente a la clase durante 2 minutos utilizando diapositivas con apoyo visual.',
      'Responden preguntas simples formuladas por sus compañeros en idioma inglés.'
    ]
  },

  // ==========================================
  // 7° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '7° Básico', asignatura: 'INGLES', eje: 'Reading Comprehension', unidad: 'Unidad 1', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Demostrar comprensión de textos narrativos e informativos sobre biografías de personajes históricos destacados y avances científicos.',
    indicadores: [
      'Identifican la secuencia cronológica de eventos en biografías de inventores y artistas mundiales.',
      'Deduzcan el significado de vocabulario desconocido a partir del contexto y prefijos/sufijos comunes.',
      'Diferencian oraciones en pasado simple de oraciones en pasado continuo ("was/were + -ing").'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'INGLES', eje: 'Written Communication', unidad: 'Unidad 2', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Escribir párrafos argumentativos breves expresando acuerdos y desacuerdos sobre el uso responsable de la tecnología y redes sociales.',
    indicadores: [
      'Utilizan frases idiomáticas de opinión ("In my opinion", "I believe that", "From my perspective").',
      'Desarrollan argumentos a favor y en contra de los teléfonos móviles en el colegio.',
      'Aplican conectores de contraste y causa ("however", "because", "therefore") con precisión gramatical.'
    ]
  },

  // ==========================================
  // 8° BÁSICO - INGLÉS
  // ==========================================
  {
    nivel: '8° Básico', asignatura: 'INGLES', eje: 'Listening & Speaking', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender conversaciones orales sobre dilemas de la adolescencia y participar en debates simulados sobre convivencia escolar.',
    indicadores: [
      'Identifican el tono emocional (enojo, sorpresa, empatía) en hablantes nativos grabados.',
      'Utilizan modales de probabilidad y posibilidad ("might", "may", "could") en discusiones grupales.',
      'Formulan réplicas respetuosas reaccionando a las ideas planteadas por otros interlocutores.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'INGLES', eje: 'Reading & Writing', unidad: 'Unidad 2', codigo: 'OA 10', categoria: 'Basal',
    descripcion: 'Leer relatos de misterio y ciencia ficción y redactar una reseña crítica breve recomendando o desaconsejando la obra.',
    indicadores: [
      'Identifican el clímax y los giros argumentales en cuentos breves en inglés.',
      'Escriben una reseña de 150 palabras sintetizando la trama y evaluando personajes y ritmo narrativo.',
      'Aplican correctamente la voz pasiva simple en tiempo presente y pasado ("was written", "is discovered").'
    ]
  },

  // ==========================================
  // I° MEDIO - INGLÉS
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'INGLES', eje: 'Integrated Skills (Reading & Listening)', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender textos orales y escritos auténticos (entrevistas, artículos de prensa internacional, charlas TED cortas) sobre globalización y juventud.',
    indicadores: [
      'Identifican tesis centrales, posturas valóricas y líneas argumentativas en discursos en inglés.',
      'Reconocen estructuras del presente perfecto ("have/has + participio") para experiencias de vida.',
      'Sintetizan las ideas principales de una conferencia en notas esquemáticas tipo Cornell.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'INGLES', eje: 'Integrated Skills (Writing & Speaking)', unidad: 'Unidad 2', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Producir ensayos breves y realizar presentaciones formales sobre problemáticas globales (cambio climático, migración) aplicando vocabulario académico.',
    indicadores: [
      'Escriben ensayos de cinco párrafos con tesis clara, desarrollo con evidencias y conclusión.',
      'Exponen oralmente durante 3 minutos frente a la clase con apoyo de diapositivas en inglés.',
      'Responden con soltura preguntas de la audiencia empleando conectores lógicos y léxico formal.'
    ]
  },

  // ==========================================
  // II° MEDIO - INGLÉS
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'INGLES', eje: 'Reading Comprehension', unidad: 'Unidad 1', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Analizar críticamente textos argumentativos y científicos en inglés identificando evidencias estadísticas, sesgos y conclusiones de autores.',
    indicadores: [
      'Evalúan la credibilidad de fuentes de noticias internacionales (BBC, CNN, Reuters, The Guardian).',
      'Interpretan oraciones con oraciones condicionales mixtas (First, Second and Third Conditionals).',
      'Elaboran resúmenes ejecutivos (abstracts) de textos científicos divulgativos.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'INGLES', eje: 'Oral & Written Production', unidad: 'Unidad 2', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Diseñar y conducir debates formales en inglés sobre dilemas éticos y tecnológicos (inteligencia artificial, automatización laboral).',
    indicadores: [
      'Estructuran discursos de apertura y refutación utilizando técnicas retóricas persuasivas en inglés.',
      'Manejan tiempos de réplica y respetan los turnos de intervención sin cambiar al español.',
      'Redactan documentos de posición (position papers) fundamentados en citas textuales en inglés.'
    ]
  },

  // ==========================================
  // III° MEDIO - INGLÉS
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'INGLES', eje: 'Advanced Reading & Writing', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender textos académicos avanzados en inglés y redactar cartas formales de postulación a universidades extranjeras y becas internacionales.',
    indicadores: [
      'Dominan el registro formal epistolar en inglés ("Dear Admissions Committee", "Yours sincerely").',
      'Redactan declaraciones personales (Personal Statements) destacando logros académicos y metas vocacionales.',
      'Aplican estructuras gramaticales avanzadas: inversión enfática, cláusulas relativas restrictivas y no restrictivas.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'INGLES', eje: 'Oral Communication & Debate', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Participar activamente en modelos simulados de Naciones Unidas (MUN) representando la delegación de un país anglófono.',
    indicadores: [
      'Exponen discursos de delegación en lenguaje diplomático formal en inglés.',
      'Negocian resoluciones y tratados internacionales redactando enmiendas colaborativas.',
      'Defienden las posturas de política exterior asignadas con rigor documental y oratoria fluida.'
    ]
  },

  // ==========================================
  // IV° MEDIO - INGLÉS
  // ==========================================
  {
    nivel: 'IV° Medio', asignatura: 'INGLES', eje: 'Professional English & Careers', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Elaborar un Currículum Vitae (CV) en formato internacional y simular una entrevista laboral o académica en inglés con preguntas situacionales.',
    indicadores: [
      'Diseñan un currículum vitae en inglés destacando habilidades blandas, técnicas e historial formativo.',
      'Responden preguntas de entrevistas por competencias utilizando la metodología STAR (Situation, Task, Action, Result).',
      'Demuestran seguridad corporal, modulación y pronunciación fluida acorde a estándares B1/B2 del Marco Común Europeo.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'INGLES', eje: 'Research & Global Perspectives', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Presentar una ponencia de graduación escolar en inglés sobre una investigación interdisciplinaria, respondiendo a objeciones académicas.',
    indicadores: [
      'Exponen resultados de investigación con lenguaje técnico preciso y modismos académicos.',
      'Sustentan conclusiones respondiendo con agilidad mental y propiedad a preguntas del jurado.',
      'Sintetizan literatura especializada en inglés citando autores y fuentes arbitradas bajo normas APA.'
    ]
  }
];

module.exports = { INGLES_CURRICULO };
