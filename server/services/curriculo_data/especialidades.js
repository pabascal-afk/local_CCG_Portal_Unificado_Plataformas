/**
 * Catálogo Curricular MINEDUC - Filosofía, Artes Visuales, Música, Educación Física y Tecnología
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales.
 */

const ESPECIALIDADES_CURRICULO = [
  // ==========================================
  // FILOSOFÍA (III° Y IV° MEDIO)
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'FILOSOFIA', eje: 'Problematización y Ontología', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Formular preguntas filosóficas fundamentales sobre la realidad, el sentido de la existencia y la naturaleza del conocimiento a partir de la experiencia cotidiana.',
    indicadores: [
      'Diferencian preguntas filosóficas (abiertas, radicales, conceptuales) de preguntas científicas o cotidianas.',
      'Analizan el asombro y la duda metódica como puntos de partida del pensamiento reflexivo.',
      'Examinan textos clásicos de Platón, Aristóteles y Descartes identificando tesis y argumentos centrales.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'FILOSOFIA', eje: 'Ética y Filosofía Política', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Analizar teorías éticas clásicas y contemporáneas (ética de las virtudes, deontología kantiana, utilitarismo) y aplicarlas a dilemas bioéticos y de justicia.',
    indicadores: [
      'Comparan el imperativo categórico kantiano con el principio utilitarista del mayor bienestar para el mayor número.',
      'Analizan dilemas éticos actuales (eutanasia, aborto, experimentación genética) a la luz de distintas corrientes.',
      'Fundamentan una postura moral personal rigurosa evitando el relativismo simplista y el dogmatismo.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'FILOSOFIA', eje: 'Epistemología y Verdad', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Examinar diversas concepciones de la verdad y los límites del conocimiento humano (racionalismo, empirismo, escepticismo, hermenéutica) en la era digital.',
    indicadores: [
      'Contrastan el racionalismo cartesiano con el empirismo de Locke y Hume y el criticismo kantiano.',
      'Analizan la noción de paradigma científico de Thomas Kuhn y los límites del positivismo.',
      'Debaten sobre el impacto de la posverdad y los algoritmos en la comprensión de la realidad objetiva.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'FILOSOFIA', eje: 'Estética y Sentido de la Vida', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Reflexionar sobre el sentido de la existencia humana, la finitud, la libertad y la experiencia estética en el arte y la cultura contemporánea.',
    indicadores: [
      'Analizan obras del existencialismo (Sartre, Camus, Kierkegaard) respecto a la angustia y la libertad responsable.',
      'Explican el concepto de juicio estético y la función del arte como cuestionamiento de la realidad.',
      'Escriben ensayos filosóficos originales fundamentando su visión sobre el sentido existencial.'
    ]
  },

  // ==========================================
  // ARTES VISUALES
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'ARTES VISUALES', eje: 'Expresión y Creación', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Expresar y crear trabajos de arte a partir de la observación del entorno natural (paisajes, animales, plantas) utilizando diversos materiales plásticos.',
    indicadores: [
      'Experimentan con témperas, plasticinas, papeles de colores y materiales reciclados.',
      'Representan escenas de la naturaleza usando líneas, puntos, formas libres y colores puros.',
      'Demuestran disfrute y autonomía en el proceso de creación plástica individual.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'ARTES VISUALES', eje: 'Creación Artística', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Crear trabajos de arte inspirados en el patrimonio cultural chileno y latinoamericano (artesanía tradicional, arquitectura precolombina y pintura contemporánea).',
    indicadores: [
      'Reconocen patrones geométricos y simbología en la alfarería diaguita y textilería mapuche.',
      'Aplican técnicas de grabado, escultura en greda o modelado en pasta para crear réplicas interpretativas.',
      'Utilizan la teoría del color (colores complementarios y contrastes de luz y sombra) en sus obras.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'ARTES VISUALES', eje: 'Creación y Reflexión Visual', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Crear proyectos visuales individuales o colectivos basados en temas de interés social y juvenil (graffiti, muralismo, fotografía documental, videoarte).',
    indicadores: [
      'Planifican un proyecto artístico definiendo concepto, bocetos preparatorios y recursos técnicos.',
      'Utilizan técnicas mixtas y medios digitales de edición gráfica para plasmar su propuesta estética.',
      'Fundamentan el sentido crítico de su obra en una memoria conceptual escrita o presentación oral.'
    ]
  },

  // ==========================================
  // MÚSICA
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'MUSICA', eje: 'Escuchar y Apreciar', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Escuchar cualidades del sonido (altura, intensidad, timbre y duración) y elementos del lenguaje musical (pulsos, acentos, ritmos y melodías) presentes en el entorno.',
    indicadores: [
      'Diferencian sonidos graves de agudos y sonidos fuertes de suaves en juegos auditivos.',
      'Siguen el pulso musical con palmadas, pasos y percusiones corporales al compás de canciones.',
      'Identifican timbres de instrumentos de percusión elementales (triángulo, pandero, maracas).'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'MUSICA', eje: 'Interpretación Musical', unidad: 'Unidad 1', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Cantar e interpretar música tradicional chilena y latinoamericana al unísono y a más de una voz, tocando instrumentos melódicos y armónicos.',
    indicadores: [
      'Cantan canciones folclóricas con afinación, postura corporal y respiración diafragmática correcta.',
      'Ejecutan melodías en flauta dulce, metalófono, ukelele o guitarra con precisión rítmica.',
      'Acompañan piezas musicales siguiendo partituras convencionales o musicogramas no convencionales.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'MUSICA', eje: 'Apreciación e Interpretación', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Analizar repertorios de música popular y de concierto universal, reconociendo el contexto sociocultural de creación y experimentando con arreglos propios.',
    indicadores: [
      'Identifican estilos y géneros musicales (rock, jazz, música docta, trova, folclore) y sus contextos históricos.',
      'Integran ensambles instrumentales colectivos respetando dinámicas, tempi y balances sonoros.',
      'Crean arreglos musicales o composiciones breves utilizando software de edición de audio (DAW).'
    ]
  },

  // ==========================================
  // EDUCACIÓN FÍSICA Y SALUD
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'EDUCACION FISICA Y SALUD', eje: 'Habilidades Motrices Básicas', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Demostrar habilidades motrices básicas de locomoción, manipulación y equilibrio en diferentes entornos (correr, saltar, lanzar, atrapar y rodar).',
    indicadores: [
      'Corren esquivando obstáculos y cambiando de dirección con agilidad y control postural.',
      'Saltan en uno y dos pies cayendo de forma amortiguada y segura.',
      'Lanzan y atrapan balones de diferentes tamaños con una y ambas manos en juegos cooperativos.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'EDUCACION FISICA Y SALUD', eje: 'Deportes y Condición Física', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Ejecutar juegos colectivos y predeportivos (básquetbol, vóleibol, fútbol, balonmano) aplicando principios tácticos básicos de ataque y defensa.',
    indicadores: [
      'Aplican fundamentos técnicos específicos del deporte (pases, lanzamientos, recepción, desplazamientos).',
      'Desarrollan la resistencia cardiorrespiratoria, fuerza muscular y flexibilidad en circuitos funcionales.',
      'Demuestran juego limpio (fair play), respeto a las reglas arbitrales y espíritu de equipo.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'EDUCACION FISICA Y SALUD', eje: 'Vida Activa y Entrenamiento', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Diseñar y aplicar un plan de entrenamiento físico personal para mejorar o mantener la condición física orientada a la salud, según principios FITT.',
    indicadores: [
      'Calculan su frecuencia cardíaca en reposo, de reserva y zona diana de entrenamiento aeróbico.',
      'Diseñan rutinas semanales regulando Frecuencia, Intensidad, Tiempo y Tipo de ejercicio (FITT).',
      'Evalúan periódicamente su capacidad aeróbica y muscular mediante pruebas estandarizadas (test de Cooper, salto vertical).'
    ]
  },

  // ==========================================
  // TECNOLOGÍA
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'TECNOLOGIA', eje: 'Diseño y Elaboración', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Crear diseños de objetos tecnológicos simples para resolver problemas cotidianos, dibujando ideas y seleccionando materiales y herramientas seguras.',
    indicadores: [
      'Dibujan propuestas de soluciones tecnológicas señalando las partes del objeto.',
      'Manipulan tijeras de punta roma, pegamentos y reglas siguiendo normas de seguridad básicas.',
      'Construyen objetos sencillos con materiales reciclables y evalúan su funcionamiento.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'TECNOLOGIA', eje: 'Procesos Tecnológicos y Software', unidad: 'Unidad 1', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Usar procesadores de texto, hojas de cálculo y herramientas de presentación digital para organizar y comunicar información de proyectos tecnológicos.',
    indicadores: [
      'Elaboran cartas Gantt sencillas y presupuestos de materiales en hojas de cálculo.',
      'Redactan informes técnicos aplicando formato de párrafos, encabezados e imágenes insertadas.',
      'Diseñan presentaciones multimedia interactivas para exponer sus proyectos frente al curso.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'TECNOLOGIA', eje: 'Soluciones Tecnológicas e Innovación', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Identificar oportunidades o necesidades del entorno para diseñar servicios o productos tecnológicos sustentables, evaluando costos y ciclo de vida.',
    indicadores: [
      'Aplican metodologías de Design Thinking (empatizar, definir, idear, prototipar y testear).',
      'Construyen prototipos funcionales incorporando circuitos electrónicos básicos o programación en Arduino/micro:bit.',
      'Evalúan el impacto ambiental y social del producto aplicando criterios de ecodiseño y economía circular.'
    ]
  }
];

module.exports = { ESPECIALIDADES_CURRICULO };
