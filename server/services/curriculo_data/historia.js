/**
 * Catálogo Curricular MINEDUC - Historia, Geografía y Ciencias Sociales (1° Básico a II° Medio)
 * y Educación Ciudadana (III° y IV° Medio)
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales.
 */

const HISTORIA_CURRICULO = [
  // ==========================================
  // 1° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Historia y Tiempo', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Nombrar y secuenciar días de la semana y meses del año, utilizando un calendario, y conceptos de tiempo (antes, ahora, después, ayer, hoy, mañana, día, noche).',
    indicadores: [
      'Ordenan secuencias temporales de eventos de su vida diaria usando antes, ahora y después.',
      'Identifican los días de la semana y los meses del año en calendarios de pared y digitales.',
      'Reconocen fechas significativas para la familia y la comunidad escolar.',
      'Diferencian el pasado personal (cuando eran bebés) del presente y el futuro próximo.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Geografía y Comunidad', unidad: 'Unidad 2', codigo: 'OA 07', categoria: 'Basal',
    descripcion: 'Conocer sobre la vida de personas de otros lugares y los diferentes tipos de viviendas, vestimentas y medios de transporte en diversos paisajes del país.',
    indicadores: [
      'Describen características de paisajes naturales y urbanos de Chile.',
      'Relacionan el tipo de vivienda y vestimenta con el clima de la zona geográfica.',
      'Identifican diferentes medios de transporte que conectan a las personas.',
      'Valoran las tradiciones y modos de vida de familias en diferentes regiones.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Formación Ciudadana', unidad: 'Unidad 3', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Mostrar actitudes y conductas de respeto en el aula y el colegio: escuchar respetuosamente, esperar turno para hablar, cuidar los materiales y espacios comunes.',
    indicadores: [
      'Siguen normas de convivencia pactadas colectivamente en la sala de clases.',
      'Tratan con amabilidad a sus compañeros, profesores y asistentes de la educación.',
      'Colaboran en el orden y limpieza de su espacio de trabajo y del aula.',
      'Resuelven desacuerdos pacíficamente mediante el diálogo guiado por el profesor.'
    ]
  },

  // ==========================================
  // 2° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '2° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Pueblos Originarios', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Describir los modos de vida de algunos pueblos originarios de Chile en el período precolombino (mapuche, aymara, chango, rapanui, yagán), diferenciando nómades y sedentarios.',
    indicadores: [
      'Clasifican pueblos originarios en nómades y sedentarios según su forma de subsistencia y vivienda.',
      'Describen actividades cotidianas, alimentación, vestimenta y artesanías de pueblos ancestrales.',
      'Ubican en el mapa de Chile las zonas habitadas tradicionalmente por cada pueblo.',
      'Reconocen palabras y costumbres heredadas de pueblos indígenas en el Chile actual.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Geografía y Cartografía', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Leer y dibujar planos simples de su entorno (sala de clases, habitación, colegio) utilizando puntos de referencia, categorías de posición relativa y simbología básica.',
    indicadores: [
      'Identifican elementos en maquetas y planos sencillos vistos desde arriba.',
      'Utilizan puntos cardinales básicos (norte, sur, este, oeste) para orientarse.',
      'Crean leyendas o simbologías pictóricas para representar objetos en un plano.',
      'Siguen trayectorias en mapas y cuadrículas sencillas.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Diversidad y Migración', unidad: 'Unidad 3', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Distinguir los diversos aportes a la sociedad chilena provenientes de los pueblos originarios y de los inmigrantes de distintas épocas históricas.',
    indicadores: [
      'Identifican platos típicos, juegos tradicionales y fiestas de origen indígena y español.',
      'Reconocen aportes culturales, gastronómicos y artísticos de comunidades inmigrantes recientes.',
      'Promueven la no discriminación y el respeto hacia personas de diversas nacionalidades y etnias.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Instituciones y Servicios', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Complementario',
    descripcion: 'Identificar la labor que cumplen en beneficio de la comunidad diversas instituciones (hospitales, escuelas, bomberos, municipalidades, carabineros).',
    indicadores: [
      'Explican el rol de servicios públicos como salud, educación y seguridad ciudadana.',
      'Reconocen números telefónicos de emergencia (131, 132, 133) y cómo usarlos responsablemente.',
      'Valoran el trabajo de los voluntarios (bomberos, cruz roja) en beneficio colectivo.'
    ]
  },

  // ==========================================
  // 3° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '3° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Civilizaciones Clásicas (Grecia)', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Reconocer aspectos de la vida cotidiana de la civilización griega de la Antigüedad (organización en polis, mitología, teatro, Juegos Olímpicos y democracia ateniense).',
    indicadores: [
      'Ubican la cuenca del mar Mediterráneo y la península balcánica en mapas históricos.',
      'Describen la vida cotidiana en Atenas y Esparta, contrastando roles de hombres, mujeres y esclavos.',
      'Explican el origen de los Juegos Olímpicos y los dioses del panteón olímpico.',
      'Reconocen a la democracia ateniense como origen de la participación ciudadana contemporánea.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Civilizaciones Clásicas (Roma)', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Reconocer aspectos de la vida cotidiana de la civilización romana de la Antigüedad e identificar su legado en la actualidad: república, derecho romano, latín, arquitectura y obras viales.',
    indicadores: [
      'Ubican la península itálica y la expansión del Imperio Romano en torno al mar Mediterráneo.',
      'Describen obras arquitectónicas romanas: acueductos, coliseos, calzadas y termas.',
      'Explican la importancia del latín como lengua madre del español y de las leyes escritas (Derecho).',
      'Comparan derechos de ciudadanos libres y libertos con la situación de los esclavos.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Geografía del Planeta', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Identificar y ubicar en mapas y globos terráqueos las principales líneas imaginarias de la Tierra (línea del Ecuador, trópicos, círculos polares, meridiano de Greenwich) y zonas climáticas.',
    indicadores: [
      'Localizan en planisferios los continentes, océanos, líneas de referencia y hemisferios.',
      'Diferencian las zonas cálidas, templadas y frías según la inclinación de los rayos solares.',
      'Relacionan los biomas y paisajes de cada zona climática con la adaptación humana.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Derechos del Niño y Participación', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Complementario',
    descripcion: 'Asumir sus deberes y responsabilidades como estudiante y en situaciones de la vida cotidiana, y conocer los Derechos Fundamentales del Niño protegidos por la UNICEF.',
    indicadores: [
      'Identifican los derechos a la educación, salud, recreación y no discriminación de la niñez.',
      'Relacionan cada derecho con los deberes correspondientes en el hogar y en la escuela.',
      'Participan en directivas de curso y debates escolares proponiendo mejoras para su curso.'
    ]
  },

  // ==========================================
  // 4° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '4° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Civilizaciones Americanas (Mayas y Aztecas)', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Describir la civilización maya y azteca, considerando ubicación geográfica, organización política en ciudades-estado e imperios, chinampas y milpas, pirámides y avances astronómicos.',
    indicadores: [
      'Ubican en mapas de Mesoamérica las áreas de desarrollo de las culturas maya y azteca.',
      'Explican las técnicas agrícolas de terrazas, roza y quema (milpa) y chinampas lacustres.',
      'Describen la estructura social piramidal encabezada por el Halach Uinic y el Tlatoani.',
      'Reconocen los sistemas de escritura jeroglífica, el concepto del cero y calendarios solares.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Civilizaciones Americanas (Incas)', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Describir la civilización inca, considerando su ubicación en los Andes, la administración del Tahuantinsuyo desde el Cusco, el Camino del Inca (Qhapaq Ñan), terrazas de cultivo y los quipus.',
    indicadores: [
      'Ubican en el mapa de Sudamérica la extensión del Imperio Incaico abarcando el norte y centro de Chile.',
      'Explican el sistema de correos de chasquis y la red vial del Camino del Inca.',
      'Describen el sistema de reciprocidad y redistribución, el tributo en mita y el uso de quipus.',
      'Valoran las construcciones de piedra monumentales de Machu Picchu y Sacsayhuamán.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Geografía de América', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Describir los distintos paisajes del continente americano (selvas, desiertos, cordilleras, estepas y tundras), considerando climas, recursos naturales y población.',
    indicadores: [
      'Identifican en mapas físicos la Cordillera de los Andes, el Amazonas y el Desierto de Atacama.',
      'Clasifican los principales recursos renovables y no renovables de América Latina (cobre, petróleo, pesca, madera).',
      'Analizan problemas ambientales derivados de la deforestación y la minería no sustentable.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Democracia y Participación', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Complementario',
    descripcion: 'Reconocer que la Constitución Política de Chile establece la división de los poderes del Estado (Ejecutivo, Legislativo y Judicial) y garantiza los derechos fundamentales.',
    indicadores: [
      'Explican las funciones del Presidente de la República, Ministros, Diputados, Senadores y Jueces.',
      'Reconocen la importancia de la alternancia en el poder y el voto secreto en las elecciones periódicas.',
      'Identifican los mecanismos de participación ciudadana y juntas de vecinos en su comuna.'
    ]
  },

  // ==========================================
  // 5° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '5° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Viajes de Exploración y Conquista', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar los viajes de descubrimiento de Cristóbal Colón, Hernando de Magallanes y otros navegantes europeos, considerando adelantos técnicos (astrolabio, carabela) y motivaciones económicas.',
    indicadores: [
      'Explican la caída de Constantinopla y la necesidad de buscar nuevas rutas hacia las Indias y especias.',
      'Trazan en mapas los viajes de Colón, Vasco da Gama, Magallanes y Elcano.',
      'Analizan las visiones encontradas y el impacto demográfico del choque entre europeos y americanos.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Conquista de Chile y Colonia', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Describir el proceso de conquista de Chile liderado por Diego de Almagro y Pedro de Valdivia, la resistencia mapuche en la Guerra de Arauco y el proceso de mestizaje biológico y cultural.',
    indicadores: [
      'Comparan las expediciones de Almagro y Valdivia analizando las dificultades del territorio y del desierto.',
      'Explican la resistencia mapuche liderada por Michimalonco, Lautaro y Caupolicán.',
      'Describen la frontera del Biobío y el tránsito hacia los parlamentos de paz durante el siglo XVII y XVIII.',
      'Analizan el surgimiento del pueblo mestizo y el sincretismo religioso (fiesta de La Tirana).'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Sociedad Colonial e Institucionalidad', unidad: 'Unidad 3', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Explicar los rasgos fundamentales de la sociedad colonial americana: aristocracia criolla, mestizos, indígenas y esclavos africanos; la hacienda; el monopolio comercial y los cabildos.',
    indicadores: [
      'Caracterizan la estructura estamental jerárquica de la Colonia basada en el origen étnico.',
      'Describen el funcionamiento de la hacienda como unidad económica, productiva y social rural.',
      'Explican las restricciones del monopolio comercial español administrado por la Casa de Contratación.',
      'Destacan el rol de los cabildos abiertos como espacios de expresión y deliberación local.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Zonas Naturales de Chile', unidad: 'Unidad 4', codigo: 'OA 09', categoria: 'Complementario',
    descripcion: 'Caracterizar las grandes zonas naturales de Chile (Norte Grande, Norte Chico, Zona Central, Zona Sur y Zona Austral) considerando relieve, clima, vegetación y riesgos.',
    indicadores: [
      'Identifican las 4 macroformas del relieve chileno: Planicies Litorales, Cordillera de la Costa, Depresión Intermedia y Cordillera de los Andes.',
      'Relacionan la disponibilidad de agua con el asentamiento humano y las actividades económicas de cada zona.',
      'Evalúan riesgos naturales asociados a vulcanismo, aluviones y sequías prolongadas en el país.'
    ]
  },

  // ==========================================
  // 6° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '6° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Independencia de Chile', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar los múltiples factores que precipitaron el proceso de independencia de Chile y América (Ilustración, Revolución Francesa, invasión napoleónica y rivalidad criollo-peninsular).',
    indicadores: [
      'Diferencian causas externas (independencia de EE.UU., difusión de ideas ilustradas) de causas internas (descontento criollo).',
      'Secuencian las etapas de la Independencia de Chile: Patria Vieja, Reconquista española y Patria Nueva.',
      'Analizan el rol de figuras históricas como O\'Higgins, Carrera, Rodríguez, San Martín y Javiera Carrera.',
      'Explican la Proclamación de la Independencia de 1818 y la consolidación de la República.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Organización Republicana y Siglo XIX', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Describir los desafíos de organizar la República tras la Independencia: ensayos constitucionales, la Constitución de 1833 de Portales, la expansión territorial y la Guerra del Pacífico.',
    indicadores: [
      'Comparan los proyectos políticos liberales y conservadores en la primera mitad del siglo XIX.',
      'Analizan el impacto de la incorporación de Tarapacá y Antofagasta tras la Guerra del Pacífico.',
      'Explican el proceso de colonización alemana en el sur y la ocupación militar de la Araucanía.',
      'Evalúan la incorporación de Rapa Nui a la soberanía nacional en 1888.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Chile en el Siglo XX', unidad: 'Unidad 3', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Caracterizar las transformaciones de la sociedad chilena en el siglo XX: auge del salitre y cuestión social; migración campo-ciudad; democratización y voto femenino; reformas estructurales.',
    indicadores: [
      'Describen las precarias condiciones de vida de los obreros del salitre (conventillos, fichas, matanza de Santa María).',
      'Explican la conquista de derechos civiles y políticos: voto femenino en 1949 y expansión escolar.',
      'Analizan el auge del cobre y la nacionalización de la gran minería en 1971.',
      'Secuencian los gobiernos de Jorge Alessandri, Eduardo Frei Montalva y Salvador Allende.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Dictadura, Transición y Democracia', unidad: 'Unidad 4', codigo: 'OA 08', categoria: 'Complementario',
    descripcion: 'Analizar el quiebre de la democracia en 1973, la dictadura militar (violaciones sistemáticas a los DDHH y transformaciones neoliberales) y la recuperación pacífica de la democracia en 1990.',
    indicadores: [
      'Explican el Golpe de Estado del 11 de septiembre de 1973 y la clausura de las instituciones republicanas.',
      'Reconocen los informes oficiales (Rettig y Valech) sobre violaciones a los Derechos Humanos.',
      'Explican el plebiscito de 1988 y la transición democrática liderada por los presidentes electos.',
      'Valoran el consenso nacional sobre la defensa irrestricta de los Derechos Humanos y la democracia.'
    ]
  },

  // ==========================================
  // 7° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '7° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Hominización y Primeras Civilizaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar el proceso de hominización, reconociendo las principales etapas de la evolución biológica y cultural de los seres humanos (Paleolítico y Revolución Neolítica).',
    indicadores: [
      'Secuencian especies del género Homo (habilis, erectus, neanderthalensis, sapiens) y sus adaptaciones.',
      'Explican que el descubrimiento de la agricultura y la domesticación animal generaron el sedentarismo y excedentes.',
      'Analizan características de las primeras civilizaciones fluviales (Mesopotamia, Egipto, India, China): escritura, leyes y estratificación.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Mundo Clásico Greco-Romano', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Caracterizar el canon cultural del mundo clásico greco-romano: filosofía, racionalismo, república romana, ciudadanía, ciudadanía censitaria y derecho.',
    indicadores: [
      'Comparan los sistemas de gobierno de la democracia ateniense y la república patricia romana.',
      'Explican la crisis de la república romana y el ascenso del principado imperial con Augusto.',
      'Analizan el surgimiento y expansión del cristianismo en el Imperio Romano hasta su oficialización.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Edad Media y Confluencia Cultural', unidad: 'Unidad 3', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Explicar que en la Edad Media confluyeron las tradiciones grecorromana, judeocristiana y germana, configurando la civilización europea occidental, junto al Imperio Bizantino e Islam.',
    indicadores: [
      'Describen la fragmentación del Imperio Romano de Occidente y la formación de reinos germánicos.',
      'Explican el régimen feudal: señorío, servidumbre, vasallaje y economía agraria autárquica.',
      'Analizan la expansión de la civilización islámica y sus aportes científicos, matemáticos y filosóficos.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Espacio Geográfico y Dinámica Poblacional', unidad: 'Unidad 4', codigo: 'OA 14', categoria: 'Complementario',
    descripcion: 'Interpretar pirámides poblacionales e indicadores demográficos (tasas de natalidad, mortalidad, fecundidad) y analizar el fenómeno de las migraciones contemporáneas.',
    indicadores: [
      'Calculan e interpretan pirámides de población expansivas, estacionarias y regresivas.',
      'Relacionan el envejecimiento demográfico con los desafíos de los sistemas de pensiones y salud.',
      'Analizan causas geopolíticas, climáticas y económicas de las corrientes migratorias globales.'
    ]
  },

  // ==========================================
  // 8° BÁSICO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: '8° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Humanismo, Renacimiento y Ciencia Moderna', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Analizar los rasgos del Humanismo y del Renacimiento: la centralidad del ser humano (antropocentrismo), la recuperación de los clásicos, el método científico y la imprenta de tipos móviles.',
    indicadores: [
      'Contrastan la visión teocéntrica medieval con la perspectiva antropocéntrica renacentista.',
      'Analizan obras artísticas renacentistas (Da Vinci, Miguel Ángel, Rafael) reconociendo la perspectiva y anatomía.',
      'Explican la revolución científica iniciada por Copérnico, Galileo, Kepler y Newton fundamentada en la evidencia empírica.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Ruptura Religiosa y Absolutismo', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Caracterizar la Reforma Protestante iniciada por Martín Lutero, la Contrarreforma Católica y la consolidación del Estado moderno bajo monarquías absolutas en Europa.',
    indicadores: [
      'Explican las 95 tesis de Lutero contra las indulgencias y los principios teológicos luteranos y calvinistas.',
      'Describen los acuerdos del Concilio de Trento y la fundación de la Compañía de Jesús en la Contrarreforma.',
      'Analizan los fundamentos doctrinales del absolutismo monárquico (derecho divino de los reyes).'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Ilustración y Revoluciones Liberales', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Analizar las ideas de la Ilustración (soberanía popular, separación de poderes, derechos naturales, tolerancia) y su impacto en la Revolución Francesa y la Independencia de EE.UU.',
    indicadores: [
      'Explican el pensamiento de filósofos ilustrados como Montesquieu, Rousseau, Voltaire y Locke.',
      'Analizan la Declaración de los Derechos del Hombre y del Ciudadano de 1789 como hito universal.',
      'Evalúan la abolición del Antiguo Régimen y la difusión de los ideales republicanos en Occidente.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Revolución Industrial y Cuestión Social', unidad: 'Unidad 4', codigo: 'OA 12', categoria: 'Complementario',
    descripcion: 'Explicar las causas y consecuencias de la Revolución Industrial: la máquina de vapor, el capitalismo fabril, la urbanización acelerada y el surgimiento del movimiento obrero.',
    indicadores: [
      'Explican por qué Inglaterra fue pionera en la industrialización (carbón, hierro, marina mercante y capitales).',
      'Describen las condiciones del proletariado industrial y el trabajo infantil y femenino en minas y fábricas.',
      'Comparan las doctrinas políticas surgidas frente a la cuestión social: socialismo utópico, marxismo y Doctrina Social de la Iglesia.'
    ]
  },

  // ==========================================
  // I° MEDIO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Imperialismo y Primera Guerra Mundial', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar las causas del imperialismo europeo en África y Asia, la paz armada, las alianzas y el desencadenamiento de la Primera Guerra Mundial (1914-1918) y sus consecuencias.',
    indicadores: [
      'Analizan el reparto colonial de África en la Conferencia de Berlín de 1885 y los discursos eurocéntricos.',
      'Explican el sistema de trincheras, la tecnología bélica moderna y el concepto de "guerra total".',
      'Evalúan el Tratado de Versalles y el colapso de los imperios austrohúngaro, otomano, ruso y alemán.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Entreguerras y Totalitarismos', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Analizar la crisis del orden liberal democrático en el período de entreguerras: la Gran Depresión de 1929, el ascenso del fascismo, nazismo y estalinismo, y el Holocausto.',
    indicadores: [
      'Explican las causas y consecuencias globales del crack de Wall Street de 1929 y el modelo keynesiano del New Deal.',
      'Comparan los regímenes totalitarios: culto al líder, partido único, propaganda masiva y terror policial.',
      'Analizan la ideología racista y antisemita nazi que condujo al genocidio del pueblo judío (Shoá).'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Segunda Guerra Mundial y Nuevo Orden', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Explicar la Segunda Guerra Mundial (1939-1945), el uso de la bomba atómica, la creación de la ONU y la Declaración Universal de los Derechos Humanos de 1948.',
    indicadores: [
      'Secuencian los principales teatros de operaciones de la guerra: Europa, África y el Pacífico.',
      'Debaten el impacto ético del lanzamiento de las bombas atómicas en Hiroshima y Nagasaki.',
      'Analizan la conformación de la Organización de las Naciones Unidas (ONU) para garantizar la paz duradera.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Guerra Fría y Bipolaridad', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Complementario',
    descripcion: 'Caracterizar el mundo bipolar de la Guerra Fría: la rivalidad geopolítica e ideológica entre EE.UU. y la URSS, la carrera armamentista, la crisis de los misiles y la descolonización.',
    indicadores: [
      'Explican la división de Europa por la "Cortina de Hierro", el Plan Marshall y el Pacto de Varsovia.',
      'Analizan conflictos periféricos como la Guerra de Corea, la Revolución Cubana y la Guerra de Vietnam.',
      'Describen el proceso de descolonización de Asia y África y el movimiento de países no alineados.'
    ]
  },

  // ==========================================
  // II° MEDIO - HISTORIA, GEOGRAFÍA Y CS. SOCIALES
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Chile Republicano en el Siglo XX', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Analizar el proceso de democratización de la sociedad chilena durante el siglo XX: la ampliación del sufragio, las reformas agrarias y educacionales y la polarización política.',
    indicadores: [
      'Explican las reformas constitucionales y electorales que garantizaron el voto universal, secreto e informado.',
      'Analizan la Reforma Agraria como transformación estructural de la tenencia de la tierra en Chile.',
      'Evalúan la creciente polarización ideológica en el marco de la Doctrina de Seguridad Nacional estadounidense.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Quiebre Democrático y Dictadura Militar', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Analizar el golpe militar de 1973, el régimen autoritario (1973-1990), la represión y violaciones a los DDHH, la refundación económica neoliberal y la Constitución de 1980.',
    indicadores: [
      'Investigan la acción de la DINA y CNI en la detención, tortura, ejecución y desaparición forzada de opositores.',
      'Explican las reformas económicas promovidas por los "Chicago Boys" (privatizaciones, desregulación de mercados).',
      'Analizan la creación de las AFP, ISAPRES y el rol subsidiario del Estado en la Constitución de 1980.',
      'Describen la resistencia ciudadana, las jornadas de protesta nacional y el plebiscito de 1988.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Transición a la Democracia y Chile Actual', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Evaluar la transición a la democracia y los gobiernos democráticos (1990 al presente): la reducción de la pobreza, reformas constitucionales, comisiones de verdad y demandas ciudadanas.',
    indicadores: [
      'Explican los acuerdos y tensiones civiles-militares durante los primeros gobiernos de la Concertación.',
      'Evalúan la labor de las comisiones de Verdad y Reconciliación (Rettig) y sobre Prisión Política y Tortura (Valech).',
      'Analizan el crecimiento macroeconómico junto a la persistencia de brechas de desigualdad y segregación social.',
      'Examinan las movilizaciones estudiantiles (2006 y 2011) y el estallido social de 2019 como hitos ciudadanos.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', eje: 'Globalización y Desafíos Regionales', unidad: 'Unidad 4', codigo: 'OA 14', categoria: 'Complementario',
    descripcion: 'Caracterizar el proceso de globalización económica, cultural y tecnológica y los tratados de libre comercio suscritos por Chile, evaluando ventajas y vulnerabilidades.',
    indicadores: [
      'Explican la inserción de la economía chilena como exportadora de materias primas (cobre, celulosa, frutas, salmón).',
      'Analizan los impactos de la revolución digital, la hiperconectividad y el auge del comercio electrónico transnacional.',
      'Debaten sobre la soberanía alimentaria, la dependencia de precios internacionales y los desafíos del desarrollo sustentable.'
    ]
  },

  // ==========================================
  // III° MEDIO - EDUCACIÓN CIUDADANA
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Democracia y Estado de Derecho', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender los fundamentos de la democracia y el Estado de Derecho en Chile, analizando la división de poderes, el principio de legalidad y la probidad pública.',
    indicadores: [
      'Analizan la supremacía constitucional y el control de constitucionalidad ejercido por los tribunales.',
      'Evalúan mecanismos de transparencia activa, acceso a la información pública y prevención de la corrupción.',
      'Debaten sobre proyectos de reformas institucionales para profundizar la descentralización regional.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Participación Ciudadana y Cohesión', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Evaluar diversas formas de participación ciudadana y su impacto en el fortalecimiento de la sociedad civil: movimientos sociales, sufragio, voluntariado y consultas comunales.',
    indicadores: [
      'Analizan la evolución de la participación electoral en Chile tras la implementación del voto voluntario y obligatorio.',
      'Investigan iniciativas ciudadanas de base (ollas comunes, juntas de vecinos, brigadas de rescate).',
      'Diseñan proyectos de acción comunitaria para abordar una problemática específica de su barrio o comuna.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Derechos Humanos y Diversidad', unidad: 'Unidad 3', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Analizar dilemas éticos y jurídicos vinculados a los Derechos Humanos: no discriminación, derechos de pueblos originarios, equidad de género y minorías.',
    indicadores: [
      'Aplican tratados internacionales ratificados por Chile (Pacto de San José, Convención de los Derechos del Niño).',
      'Evalúan la eficacia de leyes antidiscriminación (Ley Zamudio) y de inclusión escolar y laboral.',
      'Proponen protocolos escolares para erradicar el acoso cibernético y la discriminación por identidad de género.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Justicia Social y Modelos de Desarrollo', unidad: 'Unidad 4', codigo: 'OA 04', categoria: 'Complementario',
    descripcion: 'Examinar las relaciones entre el modelo económico, la justicia distributiva y la garantía de derechos sociales (salud, educación, vivienda y previsión) en Chile.',
    indicadores: [
      'Comparan modelos de Estado de bienestar socialdemócrata con modelos de Estado subsidiario neoliberal.',
      'Analizan indicadores de desigualdad económica (coeficiente de Gini) y pobreza multidimensional.',
      'Debaten sobre reformas tributarias y gasto social orientados a la equidad y movilidad intergeneracional.'
    ]
  },

  // ==========================================
  // IV° MEDIO - EDUCACIÓN CIUDADANA
  // ==========================================
  {
    nivel: 'IV° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Institucionalidad Democrática y Poder', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Evaluar críticamente el funcionamiento de las instituciones públicas chilenas y los desafíos de legitimidad, representación política y gobernabilidad democrática.',
    indicadores: [
      'Analizan el rol de los partidos políticos, gremios empresariales y sindicatos en la formulación de leyes.',
      'Evalúan la autonomía constitucional de órganos como el Banco Central y la Contraloría General de la República.',
      'Proponen mecanismos de democracia directa y semidirecta (iniciativa popular de ley, plebiscitos revocatorios).'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Medios de Comunicación y Opinión Pública', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Analizar el papel de los medios de comunicación y redes sociales en la formación de la opinión pública, la deliberación ciudadana y la prevención de la desinformación.',
    indicadores: [
      'Identifican la concentración de la propiedad de medios de prensa y televisión abierta en Chile.',
      'Evalúan el peligro de las "fake news", la polarización afectiva y la manipulación electoral digital.',
      'Promueven estándares éticos de consumo y producción de información en redes sociales escolares.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Justicia Ambiental y Crisis Climática', unidad: 'Unidad 3', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Evaluar los conflictos socioambientales en Chile desde la perspectiva de la justicia ambiental, el ordenamiento territorial y el Acuerdo de Escazú.',
    indicadores: [
      'Investigan zonas de sacrificio ambiental en Chile (Quintero-Puchuncaví, Huasco, Coronel) y sus costos en salud.',
      'Analizan el marco legal del Sistema de Evaluación de Impacto Ambiental (SEIA) y consultas indígenas (Convenio 169 OIT).',
      'Proponen medidas de remediación y transición justa hacia energías limpias y cuidado de glaciares.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'EDUCACION CIUDADANA', eje: 'Proyectos de Incidencia Ciudadana', unidad: 'Unidad 4', codigo: 'OA 04', categoria: 'Complementario',
    descripcion: 'Diseñar y ejecutar un proyecto colectivo de incidencia ciudadana que responda a una necesidad real del entorno local o escolar, aplicando metodologías participativas.',
    indicadores: [
      'Realizan diagnósticos participativos levantando evidencias cualitativas y cuantitativas con la comunidad.',
      'Gestionan redes de apoyo con autoridades locales, juntas de vecinos y organizaciones no gubernamentales.',
      'Evalúan los resultados del proyecto mediante indicadores de impacto y presentan una memoria pública de cierre.'
    ]
  }
];

module.exports = { HISTORIA_CURRICULO };
