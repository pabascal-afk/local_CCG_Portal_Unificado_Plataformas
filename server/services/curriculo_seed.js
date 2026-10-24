/**
 * Servicio de Semilla y Gestión de Planes y Programas MINEDUC
 * Bases Curriculares y Priorización Curricular
 */

const path = require('path');
const xlsx = require('xlsx');

// Catálogo base de OAs oficiales MINEDUC organizados por Asignatura y Nivel
const CATALOGO_MINEDUC_BASE = [
  // ==========================================
  // LENGUAJE Y COMUNICACIÓN (1° a 8° Básico)
  // ==========================================
  {
    nivel: '1° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Reconocer que los textos escritos transmiten mensajes y que son escritos por alguien para cumplir un propósito.'
  },
  {
    nivel: '1° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Leer palabras aisladas y en contexto, aplicando su conocimiento de la correspondencia letra-sonido en diferentes combinaciones.'
  },
  {
    nivel: '1° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 08',
    categoria: 'Basal',
    descripcion: 'Demostrar comprensión de narraciones que aborden temas que les sean familiares: extrayendo información explícita e implícita, respondiendo preguntas.'
  },
  {
    nivel: '1° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 13',
    categoria: 'Basal',
    descripcion: 'Experimentar con la escritura para comunicar hechos, ideas y sentimientos, entre otros.'
  },
  {
    nivel: '1° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Comunicación Oral',
    codigo: 'OA 18',
    categoria: 'Complementario',
    descripcion: 'Comprender textos orales (explicaciones, instrucciones, relatos, anécdotas, etc.) para obtener información y desarrollar su curiosidad por el mundo.'
  },

  // 2° Básico - Lenguaje
  {
    nivel: '2° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Comprender textos aplicando estrategias de comprensión lectora; por ejemplo: relacionar la información del texto con sus experiencias y conocimientos, visualizar lo que describe el texto.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 05',
    categoria: 'Basal',
    descripcion: 'Demostrar comprensión de las narraciones leídas: extrayendo información explícita e implícita, reconstruyendo la secuencia de las acciones en la historia.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 12',
    categoria: 'Basal',
    descripcion: 'Escribir frecuentemente, para desarrollar la creatividad y expresar sus ideas, textos como poemas, diarios de vida, anécdotas, cartas, recados, etc.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 17',
    categoria: 'Complementario',
    descripcion: 'Escribir correctamente para facilitar la comprensión por parte del lector, aplicando las reglas ortográficas aprendidas.'
  },

  // 3° Básico - Lenguaje
  {
    nivel: '3° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Comprender textos aplicando estrategias de comprensión lectora: relectura, subrayado, parafraseo y formulación de preguntas.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Profundizar su comprensión de las narraciones leídas: extrayendo información explícita e implícita, describiendo el ambiente y personajes, expresando opiniones fundamentadas.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 06',
    categoria: 'Complementario',
    descripcion: 'Leer independientemente y comprender textos no literarios (cartas, biografías, relatos históricos, instrucciones, libros y artículos informativos).'
  },
  {
    nivel: '3° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 12',
    categoria: 'Basal',
    descripcion: 'Escribir creativamente narraciones (experiencias personales, relatos de hechos, cuentos) que tengan una estructura clara con inicio, desarrollo y desenlace.'
  },

  // 4° Básico - Lenguaje
  {
    nivel: '4° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Profundizar su comprensión de las narraciones leídas: determinando las consecuencias de hechos o acciones, describiendo el orden temporal y relacionando el relato con el contexto.'
  },
  {
    nivel: '4° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 11',
    categoria: 'Basal',
    descripcion: 'Escribir cartas, instrucciones, afiches, reportes de una experiencia o resúmenes, organizando las ideas en párrafos separados con punto aparte.'
  },

  // 5° Básico - Lenguaje
  {
    nivel: '5° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Leer y familiarizarse con un amplio repertorio de literatura para aumentar su conocimiento del mundo, desarrollando su imaginación y reconociendo su valor social.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Analizar aspectos relevantes de narraciones leídas para profundizar su comprensión: interpretando el lenguaje figurado, evaluando actitudes y el dilema de los personajes.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 14',
    categoria: 'Basal',
    descripcion: 'Escribir creativamente narraciones que incluyan una secuencia lógica de eventos, inicio, desarrollo, clímax y desenlace con personajes caracterizados.'
  },

  // 6° Básico - Lenguaje
  {
    nivel: '6° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Analizar aspectos relevantes de diversas narraciones para profundizar su comprensión: identificando las acciones principales y secundarias, explicando las motivaciones de los personajes.'
  },
  {
    nivel: '6° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 13',
    categoria: 'Basal',
    descripcion: 'Escribir frecuentemente, para expresar sus ideas y reflexiones: comentarios sobre lecturas, cartas dirigidas a la comunidad, noticias o ensayos breves.'
  },

  // 7° Básico - Lengua y Literatura
  {
    nivel: '7° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Reflexionar sobre las diferentes dimensiones de la experiencia humana, propia y ajena, a partir de la lectura de obras literarias y textos argumentativos.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 07',
    categoria: 'Basal',
    descripcion: 'Formular una interpretación de los textos literarios leídos o vistos, que sea coherente con su análisis y sustentada con citas textuales.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Escritura',
    codigo: 'OA 14',
    categoria: 'Basal',
    descripcion: 'Escribir, con el propósito de explicar un tema, textos de diversos géneros (por ejemplo, artículos informativos, monografías, informes).'
  },

  // 8° Básico - Lengua y Literatura
  {
    nivel: '8° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Reflexionar sobre temas y dilemas de la vida a partir de lecturas literarias, valorando distintas visiones de mundo y contextos socioculturales.'
  },
  {
    nivel: '8° Básico',
    asignatura: 'LENGUAJE Y COMUNICACION',
    eje: 'Lectura',
    codigo: 'OA 08',
    categoria: 'Basal',
    descripcion: 'Formular una interpretación crítica de los textos leídos, considerando su postura personal frente al tema y los recursos retóricos utilizados por el autor.'
  },

  // I° Medio - Lengua y Literatura
  {
    nivel: 'I° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Lectura',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Leer habitualmente para aprender y recrearse, seleccionando textos de acuerdo con sus preferencias y propósitos formativos.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Lectura',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Reflexionar sobre el conflicto y el sentido de la obra leída, analizando personajes, símbolos, temas recurrentes y visiones de mundo.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Escritura',
    codigo: 'OA 06',
    categoria: 'Basal',
    descripcion: 'Producir textos argumentativos coherentes y cohesionados para expresar una postura informada y fundamentada sobre temas controversiales.'
  },

  // II° Medio - Lengua y Literatura
  {
    nivel: 'II° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Lectura',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Analizar críticamente textos poéticos y dramáticos, evaluando el uso del lenguaje figurado, figuras retóricas y el diálogo dramático.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Investigación',
    codigo: 'OA 08',
    categoria: 'Basal',
    descripcion: 'Planificar, escribir, revisar y editar textos en función del contexto, el destinatario y el propósito, utilizando fuentes confiables citadas formalmente.'
  },

  // III° y IV° Medio - Lengua y Literatura / Plan Común
  {
    nivel: 'III° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Comprensión Crítica',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Formular interpretaciones de obras literarias y discursos públicos que consideren el contexto de producción, la intertextualidad y el impacto en la audiencia.'
  },
  {
    nivel: 'III° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Producción',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Evaluar críticamente discursos de medios masivos de comunicación, identificando sesgos, recursos persuasivos y falacias argumentativas.'
  },
  {
    nivel: 'IV° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Comprensión Crítica',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Analizar obras literarias y ensayos contemporáneos que planteen reflexiones filosóficas sobre la identidad, la libertad y el poder.'
  },
  {
    nivel: 'IV° Medio',
    asignatura: 'LENGUA Y LITERATURA',
    eje: 'Discurso Público',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Construir textos orales, escritos y multimodales de carácter argumentativo complejo, integrando contraargumentación sólida y fuentes académicas.'
  },

  // ==========================================
  // MATEMÁTICA (1° Básico a IV° Medio)
  // ==========================================
  {
    nivel: '1° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Contar números del 0 al 100 de 1 en 1, de 2 en 2, de 5 en 5 y de 10 en 10, hacia adelante y hacia atrás, empezando por cualquier número dado.'
  },
  {
    nivel: '1° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la adición y la sustracción de números del 0 al 20 progresivamente, de 0 a 5, de 6 a 10, de 11 a 20 con material concreto y pictórico.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Contar números del 0 al 1 000 de 2 en 2, de 5 en 5, de 10 en 10 y de 100 en 100, reconociendo el valor posicional de cada dígito.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprende la adición y la sustracción en el ámbito del 0 al 100: usando un lenguaje cotidiano y matemático para describir las operaciones.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Comparar y ordenar números naturales hasta 1 000, utilizando la recta numérica y el valor posicional de las centenas, decenas y unidades.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 08',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las tablas de multiplicar hasta el 10 de manera progresiva: usando representaciones concretas y pictóricas, expresando una multiplicación como adición repetida.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Geometría',
    codigo: 'OA 15',
    categoria: 'Complementario',
    descripcion: 'Demostrar que comprenden la relación entre figuras 3D y 2D: construyendo redes, identificando caras, aristas y vértices.'
  },
  {
    nivel: '4° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 05',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la multiplicación de números de tres dígitos por números de un dígito, aplicando el algoritmo de la multiplicación.'
  },
  {
    nivel: '4° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 06',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la división con dividendos de dos dígitos y divisores de un dígito: interpretando el resto en problemas contextualizados.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números y Operaciones',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la multiplicación de números naturales de dos dígitos por números naturales de dos dígitos aplicando la propiedad distributiva.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Fracciones y Decimales',
    codigo: 'OA 07',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las fracciones propias e impropias: representándolas de manera concreta, pictórica y simbólica, calculando adiciones y sustracciones con igual denominador.'
  },
  {
    nivel: '6° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Álgebra y Ecuaciones',
    codigo: 'OA 11',
    categoria: 'Basal',
    descripcion: 'Resolver ecuaciones de primer grado con una incógnita, utilizando estrategias como la balanza, descomposición y operaciones inversas.'
  },
  {
    nivel: '6° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Porcentajes y Proporcionalidad',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Demostrar que comprenden el concepto de porcentaje de manera concreta, pictórica y simbólica, calculando porcentajes sencillos en situaciones de la vida diaria.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números Enteros',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la adición y la sustracción de números enteros: representando los números enteros en la recta numérica, resolviendo problemas en contextos cotidianos.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Geometría y Medición',
    codigo: 'OA 11',
    categoria: 'Basal',
    descripcion: 'Calcular el perímetro y el área de círculos y polígonos regulares, aplicando fórmulas en la resolución de problemas geométricos.'
  },
  {
    nivel: '8° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Números Racionales',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la multiplicación y la división de números racionales: aplicando la regla de los signos, resolviendo problemas con fracciones y decimales positivos y negativos.'
  },
  {
    nivel: '8° Básico',
    asignatura: 'MATEMATICA',
    eje: 'Álgebra y Funciones',
    codigo: 'OA 07',
    categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la noción de función por medio de un cambio lineal: relacionando tablas, gráficos y expresiones algebraicas.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Números y Potencias',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Mostrar que comprenden las potencias de base racional y exponente entero: transfiriendo propiedades de la multiplicación y división de potencias.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Álgebra y Funciones',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Desarrollar los productos notables de manera concreta, pictórica y simbólica: transformando expresiones algebraicas y factorizando.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Álgebra y Ecuación Cuadrática',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la función cuadrática f(x)= ax^2 + bx + c: reconociendo el vértice, eje de simetría y concavidad en situaciones modeladas.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Probabilidad y Estadística',
    codigo: 'OA 11',
    categoria: 'Basal',
    descripcion: 'Utilizar permutaciones y combinatoria simple para calcular probabilidades de eventos y resolver problemas contextualizados.'
  },
  {
    nivel: 'III° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Modelamiento y Funciones',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Construir modelos matemáticos de situaciones o fenómenos de la vida diaria utilizando funciones exponenciales y logarítmicas.'
  },
  {
    nivel: 'IV° Medio',
    asignatura: 'MATEMATICA',
    eje: 'Toma de Decisiones y Estadística',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Fundamentar decisiones a partir del análisis crítico de datos cuantitativos, medidas de dispersión y distribuciones normales en problemas reales.'
  },

  // ==========================================
  // CIENCIAS NATURALES (1° a 8° Básico)
  // ==========================================
  {
    nivel: '1° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Ciencias de la Vida',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Reconocer y observar, por medio de la exploración, que los seres vivos crecen, responden a estímulos del medio, se reproducen y necesitan agua, alimento y aire.'
  },
  {
    nivel: '2° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Cuerpo Humano',
    codigo: 'OA 07',
    categoria: 'Basal',
    descripcion: 'Identificar la ubicación y explicar la función de algunas partes del cuerpo que son fundamentales para vivir: corazón, pulmones, estómago, esqueleto y músculos.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Plantas y Ecosistemas',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Observar y describir, por medio de la investigación experimental, las necesidades de las plantas y su relación con la raíz, el tallo, las hojas, flores y frutos.'
  },
  {
    nivel: '4° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Materia y Fuerza',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Demostrar, por medio de la investigación experimental, que la materia tiene masa y ocupa espacio, reconociendo sus tres estados: sólido, líquido y gaseoso.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Sistemas del Cuerpo Humano',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Reconocer y explicar que los seres vivos están formados por una o más células y que estas se organizan en tejidos, órganos y sistemas.'
  },
  {
    nivel: '6° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Fotosíntesis y Energía',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Explicar, a partir de una investigación experimental, los requerimientos de agua, dióxido de carbono y energía lumínica para la producción de azúcar y liberación de oxígeno en la fotosíntesis.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Microorganismos y Barreras Biológicas',
    codigo: 'OA 04',
    categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen las barreras defensivas del cuerpo humano frente a agentes patógenos e infecciones.'
  },
  {
    nivel: '8° Básico',
    asignatura: 'CIENCIAS NATURALES',
    eje: 'Célula y Genética',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen la estructura de la célula eucarionte, la función del núcleo y el papel de los cromosomas y el ADN.'
  },

  // ==========================================
  // CIENCIAS MEDIA: BIOLOGÍA, FÍSICA, QUÍMICA
  // ==========================================
  {
    nivel: 'I° Medio',
    asignatura: 'BIOLOGIA',
    eje: 'Evolución y Biodiversidad',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Analizar e interpretar datos sobre el origen de la biodiversidad, la selección natural y las evidencias fósiles, anatómicas y moleculares.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'QUIMICA',
    eje: 'Reacciones Químicas',
    codigo: 'OA 14',
    categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen la ley de conservación de la materia en las reacciones químicas cotidianas y procesos industriales.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'FISICA',
    eje: 'Ondas y Sonido',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Explicar los fenómenos ondulatorios del sonido y la luz a partir de sus propiedades: reflexión, refracción, difracción e interferencia.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'BIOLOGIA',
    eje: 'Homeostasis y Regulación',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Explicar el papel del sistema nervioso y endocrino en la mantención del medio interno del organismo frente a cambios ambientales.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'QUIMICA',
    eje: 'Soluciones y Concentración',
    codigo: 'OA 17',
    categoria: 'Basal',
    descripcion: 'Describir cuantitativamente las propiedades de las disoluciones químicas: molaridad, molalidad y porcentaje masa/volumen.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'FISICA',
    eje: 'Fuerza y Movimiento',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Analizar cuantitativamente el movimiento rectilíneo uniforme y acelerado aplicando las leyes de Newton en problemas físicos reales.'
  },

  // ==========================================
  // HISTORIA, GEOGRAFÍA Y CIENCIAS SOCIALES
  // ==========================================
  {
    nivel: '1° Básico',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Historia',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Nombrar y secuenciar días de la semana y meses del año, utilizando calendarios e identificando fechas significativas familiares y escolares.'
  },
  {
    nivel: '3° Básico',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Civilizaciones Clásicas',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Reconocer aspectos de la vida cotidiana de la civilización griega y romana de la Antigüedad y su legado en las sociedades democráticas contemporáneas.'
  },
  {
    nivel: '5° Básico',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Historia de Chile',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Explicar los viajes de descubrimiento de Cristóbal Colón, Hernando de Magallanes y otros exploradores, considerando sus rutas e impacto geográfico.'
  },
  {
    nivel: '7° Básico',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Historia Universal',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Explicar el surgimiento de las primeras civilizaciones fluviales (Mesopotamia, Egipto, India y China) y sus aportes a la organización política y urbana.'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Siglo XIX y República',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Explicar las ideas republicanas y liberales del siglo XIX y su impacto en la conformación del Estado nacional en Chile e Iberoamérica.'
  },
  {
    nivel: 'II° Medio',
    asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
    eje: 'Siglo XX y Crisis',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Analizar la crisis de 1929, las causas de la Segunda Guerra Mundial y el surgimiento de regímenes totalitarios en el periodo de entreguerras.'
  },
  {
    nivel: 'III° Medio',
    asignatura: 'EDUCACION CIUDADANA',
    eje: 'Democracia y Participación',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Evaluar las características de la democracia en Chile, el Estado de derecho y la importancia de los derechos humanos como fundamento de la convivencia social.'
  },
  {
    nivel: 'IV° Medio',
    asignatura: 'EDUCACION CIUDADANA',
    eje: 'Institucionalidad y Sociedad',
    codigo: 'OA 02',
    categoria: 'Basal',
    descripcion: 'Analizar las políticas públicas, el rol del Estado en el bienestar social y los mecanismos de participación ciudadana en el Chile contemporáneo.'
  },

  // ==========================================
  // IDIOMA EXTRANJERO: INGLÉS (1° Básico a IV° Medio)
  // ==========================================
  {
    nivel: '3° Básico',
    asignatura: 'INGLES',
    eje: 'Comprensión Auditiva y Lectora',
    codigo: 'OA 01',
    categoria: 'Basal',
    descripcion: 'Comprender textos orales y escritos muy breves y simples sobre temas conocidos (familia, animales, escuela y alimentos).'
  },
  {
    nivel: '6° Básico',
    asignatura: 'INGLES',
    eje: 'Expresión Escrita',
    codigo: 'OA 13',
    categoria: 'Basal',
    descripcion: 'Escribir oraciones breves y párrafos simples utilizando vocabulario de uso frecuente y conectores básicos (and, but, because).'
  },
  {
    nivel: 'I° Medio',
    asignatura: 'INGLES',
    eje: 'Comprensión de Lectura',
    codigo: 'OA 09',
    categoria: 'Basal',
    descripcion: 'Demostrar comprensión de textos auténticos simples y semi-auténticos identificando ideas principales, detalles relevantes y propósito comunicativo.'
  },
  {
    nivel: 'III° Medio',
    asignatura: 'INGLES',
    eje: 'Comunicación Oral y Escrita',
    codigo: 'OA 03',
    categoria: 'Basal',
    descripcion: 'Producir textos orales y escritos fluidos para expresar opiniones fundamentadas sobre temas de interés global y juvenil.'
  }
];

/**
 * Normaliza nombres de asignaturas para asegurar consistencia en búsquedas
 */
function normalizarNombreAsignatura(asig) {
  if (!asig) return '';
  return asig.trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // sin tildes
    .replace(/\s+/g, ' ');
}

/**
 * Inicializa las tablas del currículo y siembra los OAs oficiales si está vacío
 */
function inicializarCurriculo(db, callback) {
  const anioActual = 2026;

  db.serialize(() => {
    // 1. Verificar si existen planes para el año actual
    db.get("SELECT COUNT(*) as total FROM curriculo_planes WHERE anio = ?", [anioActual], (err, row) => {
      if (err) {
        console.error("[CURRICULO] Error verificando planes:", err);
        if (callback) callback(err);
        return;
      }

      if (row && row.total > 0) {
        console.log(`[CURRICULO] Catálogo ya inicializado con ${row.total} planes para el año ${anioActual}.`);
        if (callback) callback(null);
        return;
      }

      console.log(`[CURRICULO] Sembrando catálogo oficial MINEDUC para el año escolar ${anioActual}...`);

      // Agrupar OAs por (nivel, asignatura)
      const planesAgrupados = {};
      for (const item of CATALOGO_MINEDUC_BASE) {
        const key = `${item.nivel}___${item.asignatura}`;
        if (!planesAgrupados[key]) {
          planesAgrupados[key] = {
            nivel: item.nivel,
            asignatura: item.asignatura,
            tipo: 'MINEDUC',
            objetivos: []
          };
        }
        planesAgrupados[key].objetivos.push(item);
      }

      const stmtPlan = db.prepare(`INSERT OR IGNORE INTO curriculo_planes 
        (anio, tipo, nivel, asignatura, descripcion, activo) VALUES (?, ?, ?, ?, ?, 1)`);

      const stmtObj = db.prepare(`INSERT OR IGNORE INTO curriculo_objetivos 
        (plan_id, tipo_objetivo, eje_unidad, codigo, descripcion, categoria, orden, activo) 
        VALUES (?, 'OA', ?, ?, ?, ?, ?, 1)`);

      db.serialize(() => {
        let insertados = 0;
        const keys = Object.keys(planesAgrupados);

        function insertarSiguiente(idx) {
          if (idx >= keys.length) {
            stmtPlan.finalize();
            stmtObj.finalize();
            console.log(`[CURRICULO] Precarga oficial MINEDUC completada con éxito (${insertados} planes sembrados).`);
            if (callback) callback(null);
            return;
          }

          const planData = planesAgrupados[keys[idx]];
          stmtPlan.run([
            anioActual,
            planData.tipo,
            planData.nivel,
            planData.asignatura,
            `Programa Oficial MINEDUC ${planData.asignatura} - ${planData.nivel}`
          ], function (errInsert) {
            if (errInsert) {
              console.error("[CURRICULO] Error insertando plan:", errInsert);
              insertarSiguiente(idx + 1);
              return;
            }

            const planId = this.lastID;
            if (planId) {
              insertados++;
              planData.objetivos.forEach((obj, orderIdx) => {
                stmtObj.run([
                  planId,
                  obj.eje || 'General',
                  obj.codigo,
                  obj.descripcion,
                  obj.categoria || 'Basal',
                  orderIdx + 1
                ]);
              });
            }
            insertarSiguiente(idx + 1);
          });
        }

        insertarSiguiente(0);
      });
    });
  });
}

/**
 * Procesa un archivo Excel/CSV cargado por UTP para actualizar o crear planes curriculares
 */
function importarCurriculoExcel(db, buffer, anio, tipo = 'MINEDUC') {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        return reject(new Error("La planilla no contiene filas de datos."));
      }

      const anioNum = parseInt(anio) || 2026;
      let totalProcesados = 0;
      let planesCreados = 0;
      let objetivosCreados = 0;

      // Agrupar filas del Excel por Nivel y Asignatura
      const planesMap = {};
      for (const r of rows) {
        const nivel = (r['Nivel'] || r['nivel'] || r['Curso'] || r['curso'] || '').toString().trim();
        const asignatura = (r['Asignatura'] || r['asignatura'] || r['Materia'] || '').toString().trim().toUpperCase();
        const codigo = (r['Codigo'] || r['codigo'] || r['OA'] || r['oa'] || '').toString().trim();
        const descripcion = (r['Descripcion'] || r['descripcion'] || r['Objetivo'] || '').toString().trim();
        const eje = (r['Eje'] || r['eje'] || r['Unidad'] || 'General').toString().trim();
        const categoria = (r['Categoria'] || r['categoria'] || r['Priorizacion'] || 'Basal').toString().trim();

        if (!nivel || !asignatura || !codigo || !descripcion) continue;

        const key = `${nivel}___${asignatura}`;
        if (!planesMap[key]) {
          planesMap[key] = {
            nivel,
            asignatura,
            objetivos: []
          };
        }
        planesMap[key].objetivos.push({ codigo, descripcion, eje, categoria });
      }

      const keys = Object.keys(planesMap);
      if (keys.length === 0) {
        return reject(new Error("No se encontraron registros válidos con las columnas requeridas (Nivel, Asignatura, Codigo, Descripcion)."));
      }

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        function procesarPlan(index) {
          if (index >= keys.length) {
            db.run("COMMIT", (errCommit) => {
              if (errCommit) return reject(errCommit);
              resolve({
                mensaje: `Importación curricular completada: ${planesCreados} planes y ${objetivosCreados} OAs procesados para el año ${anioNum}.`,
                planesCreados,
                objetivosCreados
              });
            });
            return;
          }

          const item = planesMap[keys[index]];
          // Buscar si existe el plan
          db.get(`SELECT id FROM curriculo_planes WHERE anio = ? AND nivel = ? AND asignatura = ? AND tipo = ?`,
            [anioNum, item.nivel, item.asignatura, tipo], (errFind, planRow) => {
              if (errFind) {
                db.run("ROLLBACK");
                return reject(errFind);
              }

              if (planRow) {
                // Plan existente: insertar OAs nuevos o reemplazar
                const planId = planRow.id;
                insertarOAs(planId, item.objetivos, () => procesarPlan(index + 1));
              } else {
                // Crear plan nuevo
                db.run(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, activo)
                        VALUES (?, ?, ?, ?, ?, 1)`,
                  [anioNum, tipo, item.nivel, item.asignatura, `Plan ${tipo} ${item.asignatura} - ${item.nivel}`],
                  function (errIns) {
                    if (errIns) {
                      db.run("ROLLBACK");
                      return reject(errIns);
                    }
                    planesCreados++;
                    const planId = this.lastID;
                    insertarOAs(planId, item.objetivos, () => procesarPlan(index + 1));
                  });
              }
            });
        }

        function insertarOAs(planId, objs, onDone) {
          let count = 0;
          for (const obj of objs) {
            db.run(`INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, codigo, descripcion, categoria, activo)
                    VALUES (?, 'OA', ?, ?, ?, ?, 1)`,
              [planId, obj.eje, obj.codigo, obj.descripcion, obj.categoria],
              (errObj) => {
                if (!errObj) objetivosCreados++;
                count++;
                if (count === objs.length) onDone();
              });
          }
        }

        procesarPlan(0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  CATALOGO_MINEDUC_BASE,
  inicializarCurriculo,
  importarCurriculoExcel,
  normalizarNombreAsignatura
};
