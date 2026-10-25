/**
 * Catálogo Curricular MINEDUC - Matemática (1° Básico a IV° Medio)
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales.
 */

const MATEMATICA_CURRICULO = [
  // ==========================================
  // 1° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Contar números del 0 al 100 de 1 en 1, de 2 en 2, de 5 en 5 y de 10 en 10, hacia adelante y hacia atrás, empezando por cualquier número dado.',
    indicadores: [
      'Cuentan de 1 en 1 hacia adelante en el tramo del 0 al 20, y progresivamente hasta 100.',
      'Cuentan hacia atrás de 1 en 1 partiendo desde números dados en la recta numérica.',
      'Cuentan de 2 en 2 y de 5 en 5 identificando regularidades numéricas.',
      'Cuentan de 10 en 10 identificando decenas exactas hasta 100.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Leer números del 0 al 20 y representarlos en forma concreta, pictórica y simbólica.',
    indicadores: [
      'Leen números escritos en cifras del 0 al 20.',
      'Representan cantidades del 0 al 20 con fichas, bloques encajables y dibujos.',
      'Asocian el numeral escrito con la cantidad correspondiente de elementos.',
      'Escriben números al dictado o al contar colecciones de objetos.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la adición y la sustracción de números del 0 al 20 progresivamente: usando material concreto, representaciones pictóricas y simbólicas.',
    indicadores: [
      'Representan adiciones y sustracciones concretamente con material manipulativo.',
      'Resuelven problemas contextualizados que involucran acciones de juntar, agregar, quitar o separar.',
      'Utilizan la frase numérica simbólica con signos +, - e = para expresar operaciones.',
      'Crean cuentos matemáticos orales a partir de imágenes que representan sumas y restas.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Medición', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Complementario',
    descripcion: 'Identificar en el entorno figuras 2D (círculos, triángulos, cuadrados y rectángulos) y figuras 3D.',
    indicadores: [
      'Nombran figuras 2D en objetos del entorno escolar y familiar.',
      'Diferencian figuras planas (2D) de cuerpos geométricos con volumen (3D).',
      'Clasifican figuras según la cantidad de lados rectos y curvos.',
      'Dibujan círculos, cuadrados, rectángulos y triángulos con regla y a mano alzada.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'MATEMATICA', eje: 'Patrones y Álgebra', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Reconocer, describir, crear y continuar patrones repetitivos (sonidos, figuras, ritmos) y patrones numéricos hasta el 20.',
    indicadores: [
      'Identifican el patrón de repetición en secuencias visuales y sonoras.',
      'Continúan secuencias lógicas siguiendo una regla dada (ej: AB, AAB, ABC).',
      'Crean patrones propios utilizando figuras geométricas o colores.',
      'Identifican errores o elementos faltantes en secuencias numéricas dadas.'
    ]
  },

  // ==========================================
  // 2° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '2° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Contar números del 0 al 1.000 de 2 en 2, de 5 en 5, de 10 en 10 y de 100 en 100, hacia adelante y hacia atrás, empezando por cualquier número menor que 1.000.',
    indicadores: [
      'Cuentan de 2 en 2, de 5 en 5 y de 10 en 10 hacia adelante y hacia atrás hasta 500 y 1.000.',
      'Identifican patrones en la tabla del 100 al contar por tramos numéricos.',
      'Completan secuencias numéricas ascendentes y descendentes con números de hasta 3 dígitos.',
      'Reconocen el número anterior y posterior de cualquier cifra menor a 1.000.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la adición y la sustracción en el ámbito del 0 al 100 usando el algoritmo estándar con y sin reserva/canje.',
    indicadores: [
      'Aplican estrategias de cálculo mental: dobles, completar a la decena y descomposición.',
      'Resuelven adiciones y sustracciones utilizando el algoritmo convencional alineando unidades y decenas.',
      'Explican el procedimiento de canje o reagrupación en sustracciones de dos dígitos.',
      'Resuelven problemas rutinarios contextualizados de suma y resta verificando la respuesta.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'MATEMATICA', eje: 'Geometría', unidad: 'Unidad 3', codigo: 'OA 15', categoria: 'Complementario',
    descripcion: 'Describir, comparar y construir figuras 2D (triángulos, cuadrados, rectángulos y círculos) con material concreto.',
    indicadores: [
      'Identifican la cantidad de lados y vértices en cuadrados, triángulos y rectángulos.',
      'Construyen figuras geométricas en geoplanos y con varillas o bombillas.',
      'Comparan figuras geométricas planas señalando similitudes y diferencias formales.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'MATEMATICA', eje: 'Datos y Probabilidades', unidad: 'Unidad 4', codigo: 'OA 20', categoria: 'Basal',
    descripcion: 'Recolectar y registrar datos para responder preguntas estadísticas sobre juegos con monedas o dados, usando tablas de conteo y pictogramas.',
    indicadores: [
      'Registran datos cuantitativos simples mediante marcas de conteo en tablas de frecuencia.',
      'Construyen pictogramas donde cada símbolo representa 1 o 2 unidades.',
      'Leen e interpretan información contenida en gráficos de barras simples y pictogramas.'
    ]
  },

  // ==========================================
  // 3° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '3° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Comparar y ordenar números naturales hasta 1.000, utilizando la recta numérica y la tabla posicional, expresando el valor posicional de cada dígito.',
    indicadores: [
      'Descomponen números aditivamente según el valor posicional de sus dígitos (C, D, U).',
      'Comparan números utilizando los signos >, < e =.',
      'Ubican números en la recta numérica graduada respetando las escalas correspondientes.',
      'Ordenan conjuntos de números de menor a mayor y viceversa.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las tablas de multiplicar hasta el 10 de manera progresiva: usando representaciones concretas, pictóricas y expresando multiplicaciones como adiciones de sumandos iguales.',
    indicadores: [
      'Representan una multiplicación como una suma reiterada y como una matriz de puntos.',
      'Aplican la propiedad conmutativa y distributiva para resolver multiplicaciones.',
      'Calculan mentalmente multiplicaciones por 2, 3, 4, 5 y 10.',
      'Resuelven problemas de la vida cotidiana que involucran situaciones de proporcionalidad directa simple.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Medición', unidad: 'Unidad 3', codigo: 'OA 16', categoria: 'Complementario',
    descripcion: 'Demostrar que comprenden el perímetro de una figura regular e irregular: midiendo y calculando el perímetro de figuras 2D en centímetros y metros.',
    indicadores: [
      'Definen el perímetro como la longitud del contorno de una figura plana.',
      'Miden los lados de polígonos utilizando reglas graduadas en centímetros.',
      'Calculan el perímetro de cuadrados, rectángulos y triángulos sumando las medidas de sus lados.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'MATEMATICA', eje: 'Datos y Probabilidades', unidad: 'Unidad 4', codigo: 'OA 23', categoria: 'Basal',
    descripcion: 'Realizar encuestas, clasificar y organizar los datos obtenidos en tablas y visualizarlos en gráficos de barra con escala.',
    indicadores: [
      'Diseñan preguntas sencillas para recolectar información de interés escolar.',
      'Construyen gráficos de barras verticales y horizontales con escalas de 2, 5 o 10.',
      'Interpretan la moda y extraen conclusiones fundamentadas a partir del gráfico.'
    ]
  },

  // ==========================================
  // 4° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '4° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Representar y describir números del 0 al 10.000: contándolos de 10 en 10, de 100 en 100, de 1.000 en 1.000; identificando el valor posicional de los dígitos.',
    indicadores: [
      'Componen y descomponen números de hasta 5 cifras en forma estándar y expandida.',
      'Identifican el valor posicional de dígitos destacados en números hasta 10.000.',
      'Aproximan números a la decena, centena o unidad de mil más cercana.',
      'Resuelven adiciones y sustracciones hasta 10.000 con algoritmos tradicionales.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la multiplicación de números de tres dígitos por números de un dígito: usando estrategias con o sin material concreto; aplicando la propiedad distributiva; usando el algoritmo.',
    indicadores: [
      'Aplican la propiedad distributiva de la multiplicación respecto de la suma.',
      'Resuelven multiplicaciones de 3 dígitos por 1 dígito utilizando el algoritmo convencional.',
      'Estiman productos redondeando factores para evaluar la razonabilidad de resultados.',
      'Resuelven problemas contextualizados de compra y venta calculando costos totales.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'MATEMATICA', eje: 'Números y Fracciones', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las fracciones con denominadores 2, 3, 4, 5, 6, 8, 10 y 12: explicando que una fracción representa la parte de un todo de manera concreta y pictórica.',
    indicadores: [
      'Representan fracciones unitarias y no unitarias en regiones sombreadas y en la recta numérica.',
      'Identifican y generan fracciones equivalentes mediante amplificación y simplificación pictórica.',
      'Comparan y ordenan fracciones de igual denominador y de igual numerador.',
      'Resuelven adiciones y sustracciones de fracciones con igual denominador en situaciones reales.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Medición', unidad: 'Unidad 4', codigo: 'OA 23', categoria: 'Complementario',
    descripcion: 'Demostrar que comprenden el concepto de área de un rectángulo y de un cuadrado: reconociendo que el área es la medida de la superficie y calculándola mediante cuadrículas y fórmulas ($l \\times a$).',
    indicadores: [
      'Calculan el área de figuras planas contando unidades cuadradas en cuadrículas.',
      'Aplican la fórmula $largo \\times ancho$ para determinar el área de cuadrados y rectángulos.',
      'Diferencian claramente el cálculo del perímetro (contorno) del cálculo del área (superficie).',
      'Resuelven problemas que involucran áreas de pisos, paredes o terrenos cuadrangulares.'
    ]
  },

  // ==========================================
  // 5° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '5° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Representar y describir números naturales de hasta más de 6 dígitos y menores que 1.000 millones: identificando el valor posicional; componiendo y descomponiendo en forma estándar y expandida.',
    indicadores: [
      'Leen y escriben números naturales en cifras y palabras en el ámbito de los millones.',
      'Identifican el valor posicional de dígitos hasta la centena de millón.',
      'Componen y descomponen números en potencias de 10 de forma multiplicativa.',
      'Comparan y ordenan grandes números naturales utilizando la recta numérica.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'MATEMATICA', eje: 'Operaciones y Álgebra', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden la división con dividendos de tres dígitos y divisores de un dígito: interpretando el resto; resolviendo problemas rutinarios y no rutinarios que involucren las 4 operaciones.',
    indicadores: [
      'Aplican el algoritmo de la división estimando cocientes y analizando el significado del resto.',
      'Resuelven operaciones combinadas respetando la jerarquía de las operaciones (paréntesis, multiplicación/división, suma/resta).',
      'Plantean y resuelven problemas de múltiples pasos formulando una expresión matemática única.',
      'Verifican los resultados obtenidos aplicando la relación $dividendo = divisor \\times cociente + resto$.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'MATEMATICA', eje: 'Fracciones y Decimales', unidad: 'Unidad 3', codigo: 'OA 07', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las fracciones impropias y números mixtos: usando representaciones pictóricas; convirtiendo entre fracciones impropias y números mixtos; sumando y restando fracciones.',
    indicadores: [
      'Representan fracciones impropias y números mixtos en rectas numéricas graduadas.',
      'Transforman fracciones impropias a números mixtos y viceversa mediante procedimientos algebraicos.',
      'Calculan sumas y restas de fracciones y números mixtos con denominadores múltiplos.',
      'Resuelven problemas que involucran repartos fraccionarios de alimentos y mediciones.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Datos', unidad: 'Unidad 4', codigo: 'OA 17', categoria: 'Complementario',
    descripcion: 'Describir y dar la posición de objetos en el primer cuadrante del plano cartesiano, usando pares ordenados, y calcular áreas de paralelogramos y triángulos.',
    indicadores: [
      'Ubican puntos en el primer cuadrante del plano cartesiano a partir de sus coordenadas $(x, y)$.',
      'Trazan figuras geométricas en el plano cartesiano uniendo coordenadas dadas.',
      'Calculan el área de paralelogramos y triángulos utilizando la fórmula $(base \\times altura)/2$.',
      'Leen e interpretan gráficos de líneas dobles para analizar tendencias temporales.'
    ]
  },

  // ==========================================
  // 6° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '6° Básico', asignatura: 'MATEMATICA', eje: 'Números y Operaciones', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden los factores y múltiplos: determinando los múltiplos y factores de números menores de 100; identificando números primos y compuestos; resolviendo problemas con MCM y MCD.',
    indicadores: [
      'Encuentran todos los factores de un número natural mediante divisiones exactas.',
      'Diferencian números primos de números compuestos utilizando la criba de Eratóstenes.',
      'Calculan el Mínimo Común Múltiplo (MCM) y el Máximo Común Divisor (MCD) por descomposición factorial.',
      'Resuelven situaciones problemáticas que involucran coincidencia periódica mediante el MCM.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'MATEMATICA', eje: 'Números y Proporcionalidad', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden las razones de manera concreta, pictórica y simbólica, y relacionarlas con el concepto de porcentaje.',
    indicadores: [
      'Expresan razones de la forma $a:b$ y las interpretan en contextos de mezcla, escala y velocidad.',
      'Representan el porcentaje como una razón de consecuente 100 y como una fracción o decimal.',
      'Calculan porcentajes mentalmente (10%, 25%, 50%) y de manera algorítmica para cualquier cantidad.',
      'Resuelven problemas que implican descuentos, aumentos e interés en compras cotidianas.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'MATEMATICA', eje: 'Patrones y Álgebra', unidad: 'Unidad 3', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Resolver ecuaciones de primer grado con una incógnita, utilizando balanzas, representaciones pictóricas y aplicando el procedimiento formal de despeje algebraico.',
    indicadores: [
      'Modelan situaciones cotidianas mediante ecuaciones de la forma $ax + b = c$.',
      'Resuelven ecuaciones lineales aplicando propiedades de la igualdad (ley de cancelación).',
      'Comprueban la solución encontrada reemplazando el valor de la incógnita en la ecuación original.',
      'Formulan problemas contextualizados a partir de una ecuación dada.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Medición', unidad: 'Unidad 4', codigo: 'OA 18', categoria: 'Complementario',
    descripcion: 'Calcular la superficie y el volumen de cubos y paralelepípedos expresando el resultado en $cm^2$, $m^2$, $cm^3$ y $m^3$.',
    indicadores: [
      'Construyen redes de paralelepípedos y calculan el área total sumando las caras.',
      'Aplican la fórmula $largo \\times ancho \\times alto$ para calcular volúmenes de prismas rectangulares.',
      'Resuelven problemas de capacidad convirtiendo entre centímetros cúbicos y litros.',
      'Interpretan gráficos circulares relacionando los sectores con porcentajes y fracciones del total.'
    ]
  },

  // ==========================================
  // 7° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '7° Básico', asignatura: 'MATEMATICA', eje: 'Números Enteros', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la adición y la sustracción de números enteros: representando los números enteros en la recta numérica; resolviendo problemas en contextos reales (temperaturas, deudas).',
    indicadores: [
      'Representan situaciones cotidianas mediante números enteros positivos y negativos ($+15^{\\circ}C$, $-5$ metros).',
      'Determinan el valor absoluto y el inverso aditivo de cualquier número entero.',
      'Suman y restan enteros aplicando reglas de signos y desplazamientos en la recta numérica.',
      'Resuelven problemas contextualizados que involucran ganancias, pérdidas y variación térmica.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'MATEMATICA', eje: 'Proporcionalidad', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden el concepto de porcentaje y las relaciones de proporcionalidad directa e inversa de manera cuantitativa y gráfica.',
    indicadores: [
      'Identifican variables directa e inversamente proporcionales en tablas de valores y gráficos.',
      'Calculan la constante de proporcionalidad directa ($k = y/x$) e inversa ($k = x \\cdot y$).',
      'Grafican relaciones de proporcionalidad directa como rectas que pasan por el origen.',
      'Aplican la proporcionalidad en problemas de escalas topográficas, velocidad y rendimiento.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'MATEMATICA', eje: 'Álgebra y Funciones', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden las proporciones directas y el modelamiento algebraico resolviendo ecuaciones e inecuaciones lineales de la forma $ax + b = c$ con coeficientes racionales.',
    indicadores: [
      'Traducen enunciados verbales a expresiones algebraicas y ecuaciones de primer grado.',
      'Despejan incógnitas aplicando inversos aditivos y multiplicativos en números racionales.',
      'Representan el conjunto solución de inecuaciones en la recta numérica con intervalos.',
      'Verifican algebraicamente la validez de las soluciones obtenidas en el contexto del problema.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Estadística', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden el círculo: describiendo sus elementos; deduciendo el número $\\pi$; calculando perímetro y área del círculo en problemas geométricos.',
    indicadores: [
      'Identifican radio, diámetro, cuerda, arco y recta tangente en una circunferencia.',
      'Deducen experimentalmente la constante $\\pi$ como la razón entre el perímetro y el diámetro.',
      'Calculan el perímetro ($P = 2\\pi r$) y el área ($A = \\pi r^2$) de círculos y sectores circulares.',
      'Calculan medidas de tendencia central (media, mediana y moda) en conjuntos de datos agrupados.'
    ]
  },

  // ==========================================
  // 8° BÁSICO - MATEMÁTICA
  // ==========================================
  {
    nivel: '8° Básico', asignatura: 'MATEMATICA', eje: 'Números y Potencias', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la multiplicación y la división de números enteros y potencias de base entera y exponente natural aplicando propiedades operacionales.',
    indicadores: [
      'Aplican la regla de signos en multiplicaciones y divisiones de números enteros.',
      'Multiplican y dividen potencias de igual base sumando o restando exponentes.',
      'Calculan potencias de potencias y potencias de base 10 con notación científica inicial.',
      'Resuelven operaciones combinadas con enteros y potencias respetando la prioridad matemática.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'MATEMATICA', eje: 'Raíces y Álgebra', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden las raíces cuadradas exactas e inexactas de números naturales y el desarrollo de productos notables y factorización básica.',
    indicadores: [
      'Estiman raíces cuadradas inexactas entre qué enteros consecutivos se encuentran.',
      'Calculan raíces cuadradas exactas asociándolas con el área de cuadrados geométricos.',
      'Desarrollan productos notables: cuadrado de binomio y suma por su diferencia.',
      'Factorizan expresiones algebraicas extrayendo factor común monomio y binomio.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'MATEMATICA', eje: 'Sistemas de Ecuaciones', unidad: 'Unidad 3', codigo: 'OA 10', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden los sistemas de ecuaciones lineales 2x2: modelando situaciones cotidianas; resolviéndolos por métodos algebraicos (reducción, sustitución, igualación) y gráfico.',
    indicadores: [
      'Plantean sistemas de dos ecuaciones con dos incógnitas a partir de problemas contextualizados.',
      'Resuelven sistemas 2x2 utilizando el método de reducción y sustitución con precisión.',
      'Grafican las rectas asociadas en el plano cartesiano e identifican el punto de intersección.',
      'Determinan si un sistema tiene solución única, infinitas soluciones o es incompatible.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'MATEMATICA', eje: 'Geometría y Teorema de Pitágoras', unidad: 'Unidad 4', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Explicar de manera concreta, pictórica y simbólica la validez del Teorema de Pitágoras y aplicarlo en la resolución de problemas geométricos de la vida cotidiana.',
    indicadores: [
      'Verifican el Teorema de Pitágoras ($a^2 + b^2 = c^2$) mediante composiciones de áreas geométricas.',
      'Calculan la longitud de la hipotenusa o de los catetos en triángulos rectángulos.',
      'Aplican ternas pitagóricas para determinar si un triángulo es rectángulo, acutángulo u obtusángulo.',
      'Calculan distancias entre puntos y alturas de objetos inaccesibles en situaciones reales.'
    ]
  },

  // ==========================================
  // I° MEDIO - MATEMÁTICA
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'MATEMATICA', eje: 'Números Racionales e Irracionales', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Calcular operaciones con números racionales e irracionales en forma simbólica y en la recta numérica, y operar con potencias de base racional y exponente entero.',
    indicadores: [
      'Reconocen números irracionales representativos ($\\sqrt{2}, \\pi, e$) diferenciándolos de los racionales.',
      'Ubican números irracionales en la recta numérica mediante construcciones con regla y compás.',
      'Aplican propiedades de potencias con exponente negativo y fraccionario con base racional.',
      'Resuelven problemas que involucran el cálculo de cantidades microscópicas y astronómicas con notación científica.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'MATEMATICA', eje: 'Álgebra y Factorización', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Desarrollar productos notables de manera concreta, pictórica y simbólica y factorizar expresiones algebraicas para simplificar fracciones algebraicas complejas.',
    indicadores: [
      'Multiplican expresiones algebraicas binomias y trinomias aplicando identidades notables.',
      'Factorizan trinomios de la forma $x^2 + px + q$ y $ax^2 + bx + c$.',
      'Simplifican fracciones algebraicas factorizando numerador y denominador con rigurosidad.',
      'Resuelven operaciones combinadas con fracciones algebraicas determinando restricciones del dominio.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'MATEMATICA', eje: 'Funciones y Sistemas Lineales', unidad: 'Unidad 3', codigo: 'OA 07', categoria: 'Basal',
    descripcion: 'Comprender el concepto de función lineal y afín: determinando pendiente, coeficiente de posición, tabla de valores, gráfica y modelando situaciones de cambio constante.',
    indicadores: [
      'Determinan la pendiente $m$ y el coeficiente de posición $n$ en la ecuación $y = mx + n$.',
      'Relacionan el signo y magnitud de la pendiente con la inclinación y crecimiento de la recta.',
      'Modelan situaciones cotidianas con costos fijos y variables mediante funciones afines.',
      'Interpretan la intersección de dos funciones lineales como solución de un sistema de ecuaciones.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'MATEMATICA', eje: 'Geometría y Probabilidades', unidad: 'Unidad 4', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Demostrar que comprenden el Teorema de Tales sobre trazos proporcionales y las reglas de probabilidad aditiva y multiplicativa para eventos dependientes e independientes.',
    indicadores: [
      'Aplican el Teorema de Tales para calcular medidas desconocidas en segmentos paralelos cortados por secantes.',
      'Construyen figuras a escala aplicando criterios de semejanza de triángulos (AA, LLL, LAL).',
      'Calculan probabilidades de eventos compuestos utilizando diagramas de árbol.',
      'Aplican la regla de la suma $P(A \\cup B)$ y del producto $P(A \\cap B)$ evaluando independencia.'
    ]
  },

  // ==========================================
  // II° MEDIO - MATEMÁTICA
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'MATEMATICA', eje: 'Números Reales y Logaritmos', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Comprender los números reales y el concepto de logaritmo: deduciendo sus propiedades; relacionándolos con potencias y raíces; resolviendo ecuaciones exponenciales y logarítmicas.',
    indicadores: [
      'Convierten entre la forma exponencial $b^y = x$ y la forma logarítmica $\\log_b(x) = y$.',
      'Aplican propiedades del logaritmo del producto, cociente, potencia y cambio de base.',
      'Resuelven ecuaciones logarítmicas verificando la validez del argumento ($x > 0$).',
      'Modelan fenómenos científicos que usan escalas logarítmicas (escala Richter, pH químico, decibeles acústicos).'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'MATEMATICA', eje: 'Función Cuadrática', unidad: 'Unidad 2', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Mostrar que comprenden la función cuadrática $f(x) = ax^2 + bx + c$: reconociendo su concavidad, vértice, eje de simetría e intersecciones con los ejes coordenados.',
    indicadores: [
      'Calculan las coordenadas del vértice $V(-b/2a, f(-b/2a))$ y la ecuación del eje de simetría.',
      'Determinan la concavidad de la parábola a partir del signo del coeficiente cuadrático $a$.',
      'Analizan el discriminante $\\Delta = b^2 - 4ac$ para predecir la cantidad de cortes con el eje X.',
      'Resuelven problemas de optimización calculando el punto máximo o mínimo en parábolas reales (tiro parabólico).'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'MATEMATICA', eje: 'Trigonometría Básica', unidad: 'Unidad 3', codigo: 'OA 07', categoria: 'Basal',
    descripcion: 'Comprender las razones trigonométricas (seno, coseno y tangente) en triángulos rectángulos y aplicarlas para resolver problemas de ángulos de elevación y depresión.',
    indicadores: [
      'Definen seno, coseno y tangente a partir de las razones entre cateto opuesto, adyacente e hipotenusa.',
      'Calculan razones trigonométricas para ángulos notables ($30^{\\circ}, 45^{\\circ}, 60^{\\circ}$) sin calculadora.',
      'Aplican identidades trigonométricas fundamentales como $\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1$.',
      'Resuelven problemas topográficos midiendo distancias inaccesibles con ángulos de elevación y depresión.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'MATEMATICA', eje: 'Estadística y Probabilidad Condicional', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Comprender las medidas de dispersión (rango, desviación estándar, varianza) y la probabilidad condicional para la toma informada de decisiones.',
    indicadores: [
      'Calculan e interpretan el rango, la varianza ($\\sigma^2$) y la desviación estándar ($\\sigma$) en muestras de datos.',
      'Comparan dos poblaciones con igual promedio determinando cuál de ellas es más homogénea.',
      'Calculan la probabilidad condicional $P(A|B) = P(A \\cap B)/P(B)$ utilizando tablas de contingencia.',
      'Evalúan la independencia estadística entre dos sucesos aleatorios.'
    ]
  },

  // ==========================================
  // III° MEDIO - MATEMÁTICA
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'MATEMATICA', eje: 'Toma de Decisiones y Modelamiento', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Tomar decisiones fundadas en situaciones de incerteza utilizando distribuciones de probabilidad normales y análisis de dispersión poblacional.',
    indicadores: [
      'Estandarizan variables continuas calculando puntajes $Z = (X - \\mu)/\\sigma$.',
      'Calculan probabilidades bajo la curva de la distribución normal estándar usando tablas y software.',
      'Interpretan intervalos de confianza del 95% y 99% en estudios científicos y encuestas de opinión.',
      'Evalúan riesgos estadísticos en la toma de decisiones financieras y de salud pública.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'MATEMATICA', eje: 'Modelos Matemáticos Financieros', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Modelar situaciones financieras de la vida real mediante el cálculo de interés simple y compuesto, valor actual neto, amortización de créditos y tasa de interés anual.',
    indicadores: [
      'Calculan el capital final con interés compuesto usando la fórmula $C_f = C_i(1 + r)^t$.',
      'Comparan tablas de amortización de créditos de consumo e hipotecarios (sistema francés y alemán).',
      'Analizan el Costo Total del Crédito (CTC) y la Carga Anual Equivalente (CAE) en ofertas bancarias.',
      'Proyectan planes de ahorro e inversión considerando el efecto de la inflación y tasas reales.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'MATEMATICA', eje: 'Geometría Vectorial y Analítica', unidad: 'Unidad 3', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Representar y operar con vectores en 2D y 3D: calculando módulo, producto escalar, ángulo entre vectores y modelando fuerzas en física.',
    indicadores: [
      'Determinan las componentes y magnitud (norma) de vectores en el plano y en el espacio tridimensional.',
      'Calculan el producto escalar entre dos vectores e identifican condiciones de ortogonalidad (perpendicularidad).',
      'Determinan la ecuación vectorial, paramétrica y continua de la recta en el plano y espacio.',
      'Modelan la suma de fuerzas en sistemas en equilibrio estático.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'MATEMATICA', eje: 'Programación Lineal y Optimización', unidad: 'Unidad 4', codigo: 'OA 04', categoria: 'Complementario',
    descripcion: 'Resolver problemas de optimización lineal mediante la formulación de funciones objetivo y sistemas de inecuaciones con regiones de factibilidad acotadas.',
    indicadores: [
      'Traducen restricciones técnicas y económicas a un sistema de inecuaciones lineales.',
      'Grafican la región factible polimodal identificando todos sus vértices.',
      'Evalúan la función objetivo en los vértices para determinar el valor máximo o mínimo.',
      'Interpretan la solución óptima en el contexto de la gestión de recursos de una empresa.'
    ]
  },

  // ==========================================
  // IV° MEDIO - MATEMÁTICA
  // ==========================================
  {
    nivel: 'IV° Medio', asignatura: 'MATEMATICA', eje: 'Funciones Periódicas y Modelamiento', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Modelar fenómenos periódicos de la naturaleza y la tecnología (ondas, mareas, ciclos circadianos) mediante funciones trigonométricas $f(x) = A\\sin(Bx + C) + D$.',
    indicadores: [
      'Determinan la amplitud $A$, el período $T = 2\\pi/B$, el desfase $C$ y el desplazamiento vertical $D$.',
      'Grafican funciones sinusoidales y cosenoidales identificando crestas, valles y nodos.',
      'Ajustan modelos trigonométricos a series de datos empíricos de oscilaciones físicas.',
      'Resuelven ecuaciones trigonométricas en intervalos angulares específicos ($[0, 2\\pi]$).'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'MATEMATICA', eje: 'Inferencia Estadística y Muestreo', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Evaluar la validez de inferencias estadísticas a partir de muestras aleatorias, comprendiendo el Teorema del Límite Central y el margen de error.',
    indicadores: [
      'Diferencian muestreos probabilísticos (aleatorio simple, estratificado) de muestreos no probabilísticos.',
      'Aplican el Teorema del Límite Central para modelar la distribución de las medias muestrales.',
      'Calculan el tamaño muestral necesario para lograr un margen de error predeterminado.',
      'Identifican sesgos de selección y errores metodológicos en encuestas políticas y sondeos de opinión.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'MATEMATICA', eje: 'Decisiones Bajo Incertidumbre', unidad: 'Unidad 3', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Diseñar árboles de decisión y calcular la esperanza matemática para evaluar alternativas en situaciones complejas de incerteza económica, médica o ambiental.',
    indicadores: [
      'Construyen diagramas de árbol asignando probabilidades objetivas y subjetivas a cada rama.',
      'Calculan la esperanza matemática $E(X) = \\sum x_i p_i$ para juegos de azar y proyectos de inversión.',
      'Analizan el criterio de máxima verosimilitud y el criterio de utilidad esperada en dilemas de riesgo.',
      'Formulan recomendaciones fundadas ante decisiones de políticas públicas basadas en evidencia probabilística.'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'MATEMATICA', eje: 'Algoritmos y Pensamiento Computacional', unidad: 'Unidad 4', codigo: 'OA 04', categoria: 'Complementario',
    descripcion: 'Diseñar e interpretar algoritmos y modelos matemáticos iterativos (métodos de aproximación numérica, recurrencias) evaluando su convergencia y complejidad computacional.',
    indicadores: [
      'Escriben algoritmos en pseudocódigo para resolver ecuaciones por el método de bisección o Newton-Raphson.',
      'Analizan la convergencia de sucesiones recurrentes en modelos de crecimiento poblacional de Verhulst.',
      'Evalúan el costo computacional de algoritmos comparando complejidades lineales, cuadráticas y exponenciales.',
      'Utilizan planillas de cálculo y herramientas de programación para simular sistemas dinámicos discretos.'
    ]
  }
];

module.exports = { MATEMATICA_CURRICULO };
