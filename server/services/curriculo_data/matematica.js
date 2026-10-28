const oas = [];

function addUnidad(nivel, asignatura, unidad, nombreUnidad, lista) {
    for (const [codigo, eje, categoria, descripcion, indicadores] of lista) {
        oas.push({
            nivel,
            asignatura,
            unidad,
            nombre_unidad: nombreUnidad,
            eje,
            codigo,
            categoria,
            descripcion,
            indicadores
        });
    }
}

// ==========================================
// 1° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('1° BASICO', 'MATEMATICA', 1, 'Unidad 1: Conocer los números hasta el 50, ordenar, comparar, estimar y resolver adiciones y sustracciones', [
    ['OA 01', 'Números y Operaciones', 'Basal', 'Contar números del 0 al 100 de 1 en 1, de 2 en 2, de 5 en 5 y de 10 en 10, hacia adelante y hacia atrás, empezando por cualquier número menor que 100.', ['Cuentan de 1 en 1 números dados en una secuencia.', 'Cuentan números de 2 en 2 y de 5 en 5.']],
    ['OA 02', 'Números y Operaciones', 'Complementario', 'Identificar el orden de los elementos de una serie, utilizando números ordinales del primero (1º) al décimo (10º).', ['Indican la posición de números ordinales hasta el décimo.', 'Resuelven problemas de ordenamiento con ordinales.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Leer números del 0 al 20 y representarlos en forma concreta, pictórica y simbólica.', ['Representan cantidades de manera concreta y escriben el número.', 'Leen representaciones pictóricas de números del 0 al 20.']],
    ['OA 04', 'Números y Operaciones', 'Basal', 'Comparar y ordenar números del 0 al 20 de menor a mayor y/o viceversa, utilizando material concreto y/o usando software educativo.', ['Ordenan cantidades en el ámbito del 0 al 20 de mayor a menor.', 'Comparan cantidades usando material concreto.']],
    ['OA 06', 'Números y Operaciones', 'Basal', 'Componer y descomponer números del 0 a 20 de manera aditiva, en forma concreta, pictórica y simbólica.', ['Determinan más de una descomposición en dos grupos de elementos.', 'Representan composiciones y descomposiciones de manera pictórica.']],
    ['OA 11', 'Patrones y Álgebra', 'Basal', 'Reconocer, describir, crear y continuar patrones repetitivos (sonidos, figuras, ritmos...) y patrones numéricos hasta el 20, crecientes y decrecientes.', ['Identifican y describen unidades de patrones repetitivos.', 'Extienden patrones de figuras y numéricos.']],
    ['OA 16', 'Medición', 'Complementario', 'Usar unidades no estandarizadas de tiempo para comparar la duración de eventos cotidianos.', ['Miden el tiempo con unidades no estandarizadas (aplausos, pasos).', 'Comparan eventos según su duración.']],
    ['OA 17', 'Medición', 'Complementario', 'Usar un lenguaje cotidiano para secuenciar eventos en el tiempo: días de la semana, meses del año y algunas fechas significativas.', ['Secuencian fechas significativas usando el calendario.', 'Ordenan eventos cotidianos temporalmente.']]
]);

addUnidad('1° BASICO', 'MATEMATICA', 2, 'Unidad 2: Contar hasta el 100, cálculo mental, estimación de cantidades y figuras 2D y 3D', [
    ['OA 01', 'Números y Operaciones', 'Basal', 'Contar números del 0 al 100 de 1 en 1, de 2 en 2, de 5 en 5 y de 10 en 10, hacia adelante y hacia atrás.', ['Cuentan de 5 en 5 y de 10 en 10 números hasta 100.', 'Cuentan hacia atrás por tramos.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Leer números del 0 al 20 y representarlos en forma concreta, pictórica y simbólica.', ['Representan números hasta 20 con bloques multibase y marcos de 10.']],
    ['OA 05', 'Números y Operaciones', 'Complementario', 'Estimar cantidades hasta 20 en situaciones concretas, usando un referente.', ['Estiman cantidades de objetos con el uso del 10 como referente.', 'Verifican estimaciones contando concretamente.']],
    ['OA 07', 'Números y Operaciones', 'Complementario', 'Aplicar estrategias de cálculo mental para adiciones y sustracciones hasta 20: completar 10; usar dobles y mitades; uno más uno menos.', ['Completan 10 para sumar dos números.', 'Utilizan dobles y mitades para calcular mentalmente.']],
    ['OA 08', 'Números y Operaciones', 'Basal', 'Determinar las unidades y decenas en números del 0 al 20, agrupando de a 10, de manera concreta, pictórica y simbólica.', ['Agrupan una cantidad de objetos en decenas y unidades.', 'Registran con números la cantidad de decenas y unidades.']],
    ['OA 14', 'Geometría', 'Basal', 'Identificar en el entorno figuras 3D y figuras 2D y relacionarlas, usando material concreto.', ['Muestran diferencias entre figuras 2D y 3D.', 'Asocian caras de figuras 3D con figuras 2D.']]
]);

addUnidad('1° BASICO', 'MATEMATICA', 3, 'Unidad 3: Algoritmo de la adición y la sustracción, igualdades, desigualdades y medición de longitudes', [
    ['OA 09', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la adición y la sustracción de números del 0 al 20 progresivamente, de 0 a 5, de 6 a 10, de 11 a 20 con dos sumandos.', ['Representan adiciones y sustracciones con material concreto y pictórico.', 'Resuelven problemas de adición y sustracción en contextos familiares.']],
    ['OA 10', 'Números y Operaciones', 'Complementario', 'Demostrar que la adición y la sustracción son operaciones inversas, de manera concreta, pictórica y simbólica.', ['Muestran con material concreto que agregar y quitar son operaciones inversas.', 'Formulan familias de operaciones.']],
    ['OA 12', 'Patrones y Álgebra', 'Basal', 'Describir y registrar la igualdad y la desigualdad como equilibrio y desequilibrio, usando una balanza en forma concreta, pictórica y simbólica del 0 al 20.', ['Determinan igualdades o desigualdades usando una balanza.', 'Resuelven igualdades simples de adición y sustracción.']],
    ['OA 18', 'Medición', 'Basal', 'Identificar y comparar la longitud de objetos, usando palabras como largo y corto.', ['Miden la longitud de objetos usando unidades no estandarizadas.', 'Comparan longitudes ordenando de más corto a más largo.']]
]);

addUnidad('1° BASICO', 'MATEMATICA', 4, 'Unidad 4: Líneas rectas y curvas, tablas de conteo, pictogramas y gráficos de bloques', [
    ['OA 07', 'Números y Operaciones', 'Complementario', 'Aplicar estrategias de cálculo mental para adiciones y sustracciones hasta 20.', ['Calculan mentalmente sumas y restas por conteo hacia adelante y atrás.']],
    ['OA 09', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la adición y la sustracción de números del 0 al 20 consolidando estrategias de resolución.', ['Crean problemas matemáticos para una adición o sustracción dada.']],
    ['OA 13', 'Geometría', 'Basal', 'Describir la posición de objetos y personas en relación a sí mismos y a otros objetos y personas, usando un lenguaje común (como derecha e izquierda; arriba, abajo).', ['Describen la ubicación de objetos usando izquierda y derecha.', 'Siguen instrucciones de posición y desplazamiento.']],
    ['OA 15', 'Geometría', 'Complementario', 'Identificar y dibujar líneas rectas y curvas.', ['Reconocen líneas rectas y curvas en figuras 2D y contextos cotidianos.', 'Trazan dibujos combinando líneas rectas y curvas.']],
    ['OA 19', 'Datos y Probabilidades', 'Basal', 'Recolectar y registrar datos para responder preguntas estadísticas sobre sí mismo y el entorno, usando bloques, tablas de conteo y pictogramas.', ['Recolectan datos y los registran en tablas de conteo.', 'Responden preguntas interpretando tablas de conteo.']],
    ['OA 20', 'Datos y Probabilidades', 'Basal', 'Construir, leer e interpretar pictogramas.', ['Leen e interpretan pictogramas simples.', 'Construyen pictogramas a partir de datos recolectados.']]
]);

// ==========================================
// 2° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('2° BASICO', 'MATEMATICA', 1, 'Unidad 1: Conocer los números hasta el 500, valor posicional, adición, sustracción y ubicación espacial', [
    ['OA 01', 'Números y Operaciones', 'Basal', 'Contar números del 0 al 1 000 de 2 en 2, de 5 en 5, de 10 en 10 y de 100 en 100, hacia adelante y hacia atrás, empezando por cualquier número menor que 1 000.', ['Cuentan de 2 en 2, de 5 en 5 y de 10 en 10 hacia adelante y hacia atrás.', 'Cuentan monedas hasta $500.']],
    ['OA 02', 'Números y Operaciones', 'Basal', 'Leer números del 0 al 100 y representarlos en forma concreta, pictórica y simbólica.', ['Leen un número dado del 0 al 100 en cifras y en palabras.', 'Representan números con material multibase y pictóricamente.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Comparar y ordenar números del 0 al 100 de menor a mayor y viceversa, usando material concreto y monedas nacionales.', ['Ordenan un conjunto de números dados en forma ascendente y descendente.', 'Nombran números que rodean a otro en la tabla de 100.']],
    ['OA 05', 'Números y Operaciones', 'Basal', 'Componer y descomponer números del 0 a 100 de manera aditiva, en forma concreta, pictórica y simbólica.', ['Componen y descomponen números por medio de sumandos en forma pictórica y simbólica.']],
    ['OA 06', 'Números y Operaciones', 'Complementario', 'Describir y aplicar estrategias de cálculo mental para adiciones y sustracciones hasta 20: completar 10; usar dobles y mitades; uno más uno menos; dos más dos menos; usar la reversibilidad de las operaciones.', ['Aplican estrategias de cálculo mental como completar 10 y dobles.']],
    ['OA 07', 'Números y Operaciones', 'Basal', 'Identificar las unidades y decenas en números del 0 al 100, representando las cantidades de acuerdo a su valor posicional, con material concreto, pictórico y simbólico.', ['Usan material concreto para identificar unidades y decenas.', 'Indican el valor de un dígito según su posición.']],
    ['OA 09', 'Números y Operaciones', 'Basal', 'Demostrar que comprende la adición y la sustracción en el ámbito del 0 al 100: usando un lenguaje cotidiano y matemático para describir acciones.', ['Resuelven problemas de adición y sustracción en el ámbito del 0 al 100.', 'Explican procedimientos usados con material concreto.']]
]);

addUnidad('2° BASICO', 'MATEMATICA', 2, 'Unidad 2: Descomposición de números, igualdad y desigualdad, figuras 2D y medición de longitudes', [
    ['OA 04', 'Números y Operaciones', 'Complementario', 'Estimar cantidades hasta 100 en situaciones concretas, usando un referente.', ['Estiman cantidades de objetos hasta 100 aplicando referentes conocidos.']],
    ['OA 08', 'Números y Operaciones', 'Complementario', 'Demostrar y explicar de manera concreta, pictórica y simbólica el efecto de sumar y restar 0 a un número.', ['Explican mediante ejemplos el resultado de sumar o restar 0 a una cantidad.']],
    ['OA 10', 'Números y Operaciones', 'Complementario', 'Demostrar que comprende la relación entre la adición y la sustracción al usar la "familia de operaciones" en cálculos aritméticos y en la resolución de problemas.', ['Usan la relación inversa entre adición y sustracción para comprobar cálculos.']],
    ['OA 13', 'Patrones y Álgebra', 'Basal', 'Demostrar, explicar y registrar la igualdad y la desigualdad en forma concreta y pictórica del 0 al 20, usando el símbolo igual (=) y los símbolos no igual (>, <).', ['Comparan expresiones numéricas usando los signos =, > y <.', 'Determinan valores desconocidos en igualdades simples.']],
    ['OA 14', 'Geometría', 'Complementario', 'Representar y describir la posición de objetos y personas con relación a sí mismos y a otros objetos y personas, incluyendo derecha e izquierda y usando modelos y dibujos.', ['Describen recorridos y posiciones en cuadrículas y planos simples.']],
    ['OA 19', 'Medición', 'Basal', 'Determinar la longitud de objetos, usando unidades de medidas no estandarizadas y unidades estandarizadas (cm y m), en el contexto de la resolución de problemas.', ['Miden objetos de su entorno usando regla en centímetros y metros.', 'Comparan mediciones y resuelven problemas de longitud.']]
]);

addUnidad('2° BASICO', 'MATEMATICA', 3, 'Unidad 3: Figuras 2D y 3D, introducción a la multiplicación y recolección y registro de datos', [
    ['OA 11', 'Números y Operaciones', 'Basal', 'Demostrar que comprende la multiplicación: usando representaciones concretas y pictóricas; expresando una multiplicación como una adición de sumandos iguales; usando la distributividad como estrategia para construir las tablas del 2, del 5 y del 10.', ['Expresan una multiplicación como la adición de sumandos iguales.', 'Construyen y aplican las tablas del 2, 5 y 10 en problemas.']],
    ['OA 15', 'Geometría', 'Basal', 'Describir, comparar y construir figuras 2D (triángulos, cuadrados, rectángulos y círculos) con material concreto.', ['Describen triángulos, cuadrados y rectángulos por número de lados y vértices.', 'Construyen figuras 2D con geoplano o papel punteado.']],
    ['OA 16', 'Geometría', 'Complementario', 'Describir, comparar y construir figuras 3D (cubos, paralelepípedos, esferas y conos) con diversos materiales.', ['Identifican vértices, aristas y caras en cubos y paralelepípedos.', 'Construyen modelos de figuras 3D.']],
    ['OA 20', 'Datos y Probabilidades', 'Complementario', 'Recolectar y registrar datos para responder preguntas estadísticas sobre juegos con monedas y dados, usando bloques y tablas de conteo y pictogramas.', ['Registran resultados de juegos aleatorios con monedas y dados en tablas de conteo.']],
    ['OA 22', 'Datos y Probabilidades', 'Basal', 'Construir, leer e interpretar pictogramas con escala y gráficos de barra simple.', ['Leen e interpretan gráficos de barra simple y pictogramas con escala.', 'Construyen gráficos de barra simple a partir de tablas.']]
]);

addUnidad('2° BASICO', 'MATEMATICA', 4, 'Unidad 4: Patrones numéricos, lectura de la hora, pictogramas con escala y gráficos de barra simple', [
    ['OA 12', 'Patrones y Álgebra', 'Basal', 'Crear, representar y continuar una variedad de patrones numéricos y completar los elementos faltantes, de manera manual y/o usando software educativo.', ['Identifican la regla de un patrón numérico creciente o decreciente.', 'Completan secuencias numéricas encontrando términos faltantes.']],
    ['OA 17', 'Medición', 'Complementario', 'Identificar días, semanas, meses y fechas en el calendario.', ['Resuelven problemas que involucran fechas e intervalos en el calendario.']],
    ['OA 18', 'Medición', 'Basal', 'Leer horas y medias horas en relojes digitales, en el contexto de la resolución de problemas.', ['Leen horas y medias horas en relojes digitales y análogos.', 'Asocian actividades cotidianas con horarios determinados.']],
    ['OA 21', 'Datos y Probabilidades', 'Complementario', 'Registrar en tablas y gráficos de barra simple, resultados de juegos aleatorios con dados y monedas.', ['Representan resultados de lanzamientos de dados o monedas en gráficos de barras.']],
    ['OA 22', 'Datos y Probabilidades', 'Basal', 'Construir, leer e interpretar pictogramas con escala y gráficos de barra simple.', ['Resuelven problemas comparando frecuencias en gráficos de barra simple.']]
]);

// ==========================================
// 3° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('3° BASICO', 'MATEMATICA', 1, 'Unidad 1: Sumar y restar hasta 1.000, valor posicional y ecuaciones simples', [
    ['OA 01', 'Números y Operaciones', 'Complementario', 'Contar números del 0 al 1 000 de 5 en 5, de 10 en 10, de 100 en 100: empezando por cualquier número natural menor que 1 000; de 3 en 3, de 4 en 4, empezando por cualquier múltiplo del número correspondiente.', ['Cuentan una secuencia de números a partir de un número dado de 5 en 5, 10 en 10 y 100 en 100.', 'Cuentan de 3 en 3 y de 4 en 4 comenzando desde múltiplos.']],
    ['OA 02', 'Números y Operaciones', 'Basal', 'Leer números hasta 1 000 y representarlos en forma concreta, pictórica y simbólica.', ['Leen y escriben números de tres dígitos en cifras y palabras.', 'Representan números hasta 1 000 con bloques multibase.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Comparar y ordenar números hasta 1 000, utilizando la recta numérica o la tabla posicional de manera manual y/o por medio de software educativo.', ['Ordenan números de tres cifras en la recta numérica.', 'Comparan números usando la tabla de valor posicional.']],
    ['OA 04', 'Números y Operaciones', 'Complementario', 'Describir y aplicar estrategias de cálculo mental para las adiciones y las sustracciones hasta 100: por descomposición; completar hasta la decena más cercana; usar dobles; sumar en vez de restar.', ['Aplican descomposición y compensación en el cálculo mental hasta 100.']],
    ['OA 05', 'Números y Operaciones', 'Basal', 'Identificar y describir las unidades, decenas y centenas en números del 0 al 1 000, representando las cantidades de acuerdo a su valor posicional.', ['Representan un número dado de diferentes maneras según valor posicional.', 'Descomponen aditivamente números de tres cifras.']],
    ['OA 06', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la adición y la sustracción de números del 0 al 1 000: usando estrategias personales con y sin material concreto; creando y resolviendo problemas de adición y sustracción; aplicando los algoritmos con y sin reserva.', ['Suman y restan números de hasta tres dígitos con y sin reagrupación.', 'Resuelven problemas rutinarios y no rutinarios de adición y sustracción.']]
]);

addUnidad('3° BASICO', 'MATEMATICA', 2, 'Unidad 2: Ecuaciones, figuras 2D y 3D, perímetro, patrones numéricos y tablas de multiplicar', [
    ['OA 07', 'Números y Operaciones', 'Complementario', 'Demostrar que comprenden la relación entre la adición y la sustracción, usando la "familia de operaciones" en cálculos aritméticos y en la resolución de problemas.', ['Usan familias de operaciones para comprobar adiciones y sustracciones.']],
    ['OA 08', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden las tablas de multiplicar hasta 10 de manera progresiva: usando representaciones concretas y pictóricas; expresando una multiplicación como una adición de sumandos iguales; usando la distributividad.', ['Construyen las tablas de multiplicar aplicando la propiedad distributiva.', 'Resuelven problemas de multiplicación usando matrices de puntos.']],
    ['OA 09', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la división en el contexto de las tablas de hasta 10x10: representando y explicando la división como repartición y agrupación en partes iguales.', ['Identifican situaciones de reparto equitativo y agrupación.', 'Relacionan la multiplicación y la división como operaciones inversas.']],
    ['OA 12', 'Patrones y Álgebra', 'Basal', 'Generar, describir y registrar patrones numéricos, usando una variedad de estrategias en tablas del 100, de manera manual y/o con software educativo.', ['Describen la regla de un patrón repetitivo o numérico en tablas de 100.']],
    ['OA 13', 'Patrones y Álgebra', 'Basal', 'Resolver ecuaciones de un paso que involucren adiciones y sustracciones y un símbolo geométrico que represente un número desconocido, en forma pictórica y simbólica del 0 al 100.', ['Resuelven ecuaciones de un paso usando la relación inversa entre suma y resta.']],
    ['OA 15', 'Geometría', 'Basal', 'Demostrar que comprenden la relación que existe entre figuras 3D y figuras 2D: construyendo una figura 3D a partir de una red (plantilla); desplegando la figura 3D.', ['Arman figuras 3D a partir de sus redes geométricas.', 'Identifican qué red corresponde a un cuerpo geométrico dado.']],
    ['OA 16', 'Geometría', 'Complementario', 'Describir cubos, paralelepípedos, esferas, conos, cilindros y pirámides de acuerdo a la forma de sus caras y el número de aristas y vértices.', ['Comparan cuerpos geométricos según número de caras, aristas y vértices.']],
    ['OA 21', 'Medición', 'Basal', 'Demostrar que comprenden el perímetro de una figura regular e irregular: midiendo y registrando el perímetro de figuras del entorno en el contexto de la resolución de problemas; determinando el perímetro de un cuadrado y de un rectángulo.', ['Calculan el perímetro de cuadrados, rectángulos y polígonos irregulares.', 'Resuelven problemas prácticos que involucran el cálculo de perímetros.']]
]);

addUnidad('3° BASICO', 'MATEMATICA', 3, 'Unidad 3: Multiplicación y división, ángulos, encuestas, tablas y gráficos', [
    ['OA 08', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden las tablas de multiplicar hasta 10 aplicando estrategias y resolviendo problemas.', ['Aplican las tablas de multiplicar del 2 al 10 en problemas cotidianos.']],
    ['OA 09', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la división en el contexto de las tablas de hasta 10x10 resolviendo problemas rutinarios.', ['Resuelven problemas de división exacta en el ámbito de las tablas hasta 10x10.']],
    ['OA 18', 'Geometría', 'Basal', 'Demostrar que comprenden el concepto de ángulo: identificando ejemplos de ángulos en el entorno; estimando la medida de ángulos, usando como referente ángulos de 45º y de 90º.', ['Identifican ángulos rectos y de 45° en figuras y objetos del entorno.', 'Confeccionan plantillas para estimar medidas angulares.']],
    ['OA 19', 'Medición', 'Complementario', 'Leer e interpretar líneas de tiempo y calendarios.', ['Ubican y ordenan eventos en líneas de tiempo y calendarios.']],
    ['OA 20', 'Medición', 'Basal', 'Leer y registrar el tiempo en horas, medias horas, cuartos de hora y minutos en relojes análogos y digitales.', ['Leen el tiempo en relojes análogos y digitales en intervalos de 5 minutos.', 'Calculan la duración de eventos cotidianos.']],
    ['OA 23', 'Datos y Probabilidades', 'Complementario', 'Realizar encuestas, clasificar y organizar los datos obtenidos en tablas y visualizarlos en gráficos de barra.', ['Realizan encuestas, tabulan datos y construyen gráficos de barras.']],
    ['OA 25', 'Datos y Probabilidades', 'Basal', 'Construir, leer e interpretar pictogramas y gráficos de barra simple con escala, en base a información recolectada o dada.', ['Leen e interpretan gráficos de barra simple con escala.', 'Responden preguntas comparando categorías en pictogramas con escala.']],
    ['OA 26', 'Datos y Probabilidades', 'Complementario', 'Representar datos usando diagramas de puntos.', ['Construyen e interpretan diagramas de puntos simples.']]
]);

addUnidad('3° BASICO', 'MATEMATICA', 4, 'Unidad 4: Fracciones, movimientos en el plano, medición del peso y juegos aleatorios', [
    ['OA 10', 'Números y Operaciones', 'Complementario', 'Resolver problemas rutinarios en contextos cotidianos, que incluyan dinero e involucren las cuatro operaciones (no combinadas).', ['Resuelven problemas de compra, venta y vuelto usando las cuatro operaciones.']],
    ['OA 11', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden las fracciones de uso común: 1/4, 1/3, 1/2, 2/3, 3/4: explicando que una fracción representa la parte de un todo, de manera concreta, pictórica, simbólica.', ['Representan fracciones unitarias y propias como partes de un entero.', 'Comparan fracciones con igual denominador usando material concreto.']],
    ['OA 14', 'Geometría', 'Basal', 'Describir la localización de un objeto en un mapa simple o cuadrícula.', ['Describen la ubicación de objetos usando coordenadas de filas y columnas en una cuadrícula.']],
    ['OA 17', 'Geometría', 'Basal', 'Reconocer en el entorno figuras 2D que están trasladadas, reflejadas y rotadas.', ['Identifican figuras trasladadas, reflejadas y rotadas en diseños y cuadrículas.']],
    ['OA 22', 'Medición', 'Basal', 'Demostrar que comprende la medición del peso (g y kg): comparando y ordenando dos o más objetos a partir de su peso de manera informal; usando modelos para explicar la relación que existe entre gramos y kilogramos.', ['Estiman y miden el peso de objetos en gramos y kilogramos.', 'Convierten medidas sencillas entre kilogramos y gramos (1 kg = 1000 g).']],
    ['OA 24', 'Datos y Probabilidades', 'Complementario', 'Registrar y ordenar datos obtenidos de juegos aleatorios con dados y monedas, encontrando el menor, el mayor y estimando el punto medio entre ambos.', ['Registran resultados de experimentos aleatorios y determinan valores extremos.']]
]);

// ==========================================
// 4° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('4° BASICO', 'MATEMATICA', 1, 'Unidad 1: Conocer hasta el número 10.000, algoritmos de la multiplicación y la división y medición del tiempo', [
    ['OA 01', 'Números y Operaciones', 'Basal', 'Representar y describir números del 0 al 10 000: contándolos de 10 en 10, de 100 en 100, de 1 000 en 1 000; leyéndolos y escribiéndolos; representándolos en forma concreta, pictórica y simbólica; comparándolos y ordenándolos en la recta numérica o la tabla posicional.', ['Leen, escriben y representan números hasta 10 000.', 'Identifican el valor posicional de los dígitos y ordenan números en la recta numérica.']],
    ['OA 02', 'Números y Operaciones', 'Complementario', 'Describir y aplicar estrategias de cálculo mental para determinar las multiplicaciones hasta 10x10 y sus divisiones correspondientes: conteo hacia adelante y atrás; doblar y dividir por 2; por descomposición.', ['Aplican estrategias de doblar y dividir por 2 y propiedad distributiva en cálculo mental.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la adición y la sustracción de números hasta 1 000: usando estrategias personales para realizar estas operaciones; descomponiendo los números involucrados; estimando sumas y diferencias; resolviendo problemas rutinarios y no rutinarios.', ['Suman y restan números de hasta tres dígitos aplicando el algoritmo estándar y descomposición.', 'Estiman sumas y diferencias redondeando los términos.']],
    ['OA 04', 'Números y Operaciones', 'Complementario', 'Fundamentar y aplicar las propiedades del 0 y del 1 para la multiplicación y la propiedad del 1 para la división.', ['Explican y aplican el efecto de multiplicar por 0 y 1 y dividir por 1.']],
    ['OA 05', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la multiplicación de números de tres dígitos por números de un dígito: usando estrategias con o sin material concreto; utilizando las tablas de multiplicación; estimando productos; usando la propiedad distributiva.', ['Multiplican números de hasta tres dígitos por un dígito aplicando descomposición y algoritmo.', 'Estiman productos y resuelven problemas rutinarios de multiplicación.']],
    ['OA 06', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la división con dividendos de dos dígitos y divisores de un dígito: usando estrategias para dividir con o sin material concreto; utilizando la relación que existe entre la división y la multiplicación; estimando el cociente.', ['Dividen números de dos dígitos por un dígito descomponiendo el dividendo.', 'Resuelven problemas de división interpretando el resto.']],
    ['OA 07', 'Números y Operaciones', 'Basal', 'Resolver problemas rutinarios y no rutinarios en contextos cotidianos, que incluyan dinero, seleccionando y utilizando la operación apropiada.', ['Seleccionan la operación adecuada para resolver problemas de múltiples pasos con dinero.']]
]);

addUnidad('4° BASICO', 'MATEMATICA', 2, 'Unidad 2: Localización en mapas, vistas de figuras 3D, patrones, ecuaciones, inecuaciones y medición', [
    ['OA 13', 'Patrones y Álgebra', 'Basal', 'Identificar y describir patrones numéricos en tablas que involucren una operación, de manera manual y/o usando software educativo.', ['Identifican la regla de formación de secuencias numéricas en tablas de entrada y salida.']],
    ['OA 14', 'Patrones y Álgebra', 'Basal', 'Resolver ecuaciones e inecuaciones de un paso que involucren adiciones y sustracciones, comprobando los resultados en forma pictórica y simbólica del 0 al 100 y aplicando las relaciones inversas entre la adición y la sustracción.', ['Resuelven ecuaciones e inecuaciones de un paso con adición y sustracción.', 'Comprueban las soluciones mediante sustitución.']],
    ['OA 15', 'Geometría', 'Basal', 'Describir la localización absoluta de un objeto en un mapa simple con coordenadas informales (por ejemplo: con letras y números) y la localización relativa con relación a otros objetos.', ['Ubican objetos en mapas usando coordenadas alfanuméricas y puntos cardinales.']],
    ['OA 16', 'Geometría', 'Basal', 'Determinar las vistas de figuras 3D, desde el frente, desde el lado y desde arriba.', ['Dibujan e identifican las vistas frontal, lateral y superior de cuerpos geométricos.']],
    ['OA 20', 'Medición', 'Complementario', 'Leer y registrar diversas mediciones del tiempo en relojes análogos y digitales, usando los conceptos A.M., P.M. y 24 horas.', ['Convierten horas entre formato de 12 horas (A.M./P.M.) y formato de 24 horas.']],
    ['OA 21', 'Medición', 'Complementario', 'Realizar conversiones entre unidades de tiempo en el contexto de la resolución de problemas: el número de segundos en un minuto, el número de minutos en una hora, el número de días en un mes y el número de meses en un año.', ['Resuelven problemas convirtiendo entre horas, minutos, días y meses.']],
    ['OA 22', 'Medición', 'Basal', 'Medir longitudes con unidades estandarizadas (m, cm) y realizar transformaciones entre estas unidades (m a cm, y viceversa), en el contexto de la resolución de problemas.', ['Miden longitudes en metros y centímetros y expresan medidas equivalentes.']]
]);

addUnidad('4° BASICO', 'MATEMATICA', 3, 'Unidad 3: Fracciones, números decimales, simetría, traslación, rotación y ángulos', [
    ['OA 08', 'Números y Operaciones', 'Basal', 'Demostrar que comprende las fracciones con denominadores 100, 12, 10, 8, 6, 5, 4, 3, 2: explicando que una fracción representa la parte de un todo o de un grupo de elementos y un lugar en la recta numérica.', ['Representan fracciones en regiones, conjuntos y en la recta numérica.', 'Comparan y ordenan fracciones usando modelos pictóricos.']],
    ['OA 09', 'Números y Operaciones', 'Basal', 'Resolver adiciones y sustracciones de fracciones con igual denominador (denominadores 100, 12, 10, 8, 6, 5, 4, 3, 2) de manera concreta y pictórica en el contexto de la resolución de problemas.', ['Suman y restan fracciones de igual denominador en problemas cotidianos.']],
    ['OA 10', 'Números y Operaciones', 'Complementario', 'Identificar, escribir y representar fracciones propias y los números mixtos hasta el 5 de manera concreta, pictórica y simbólica, en el contexto de la resolución de problemas.', ['Representan números mixtos y fracciones propias en forma pictórica y simbólica.']],
    ['OA 17', 'Geometría', 'Basal', 'Demostrar que comprenden una línea de simetría: identificando figuras simétricas 2D; creando figuras simétricas 2D; dibujando una o más líneas de simetría en figuras 2D.', ['Trazan ejes de simetría y completan figuras simétricas en cuadrículas.']],
    ['OA 18', 'Geometría', 'Basal', 'Trasladar, rotar y reflejar figuras 2D.', ['Realizan traslaciones, reflexiones y rotaciones de figuras 2D en cuadrículas.']],
    ['OA 19', 'Geometría', 'Complementario', 'Construir ángulos con el transportador y compararlos.', ['Miden y construyen ángulos en grados sexagesimales usando el transportador.']]
]);

addUnidad('4° BASICO', 'MATEMATICA', 4, 'Unidad 4: Números decimales, área, volumen, encuestas, pictogramas y gráficos de barra', [
    ['OA 11', 'Números y Operaciones', 'Basal', 'Describir y representar decimales (décimos y centésimos): representándolos en forma concreta, pictórica y simbólica, de manera manual y/o con software educativo; comparándolos y ordenándolos hasta la centésima.', ['Relacionan fracciones con denominador 10 y 100 con números decimales.', 'Comparan y ordenan décimos y centésimos en la recta numérica.']],
    ['OA 12', 'Números y Operaciones', 'Complementario', 'Resolver adiciones y sustracciones de decimales, empleando el valor posicional hasta la centésima en el contexto de la resolución de problemas.', ['Suman y restan números decimales hasta la centésima alineando la coma decimal.']],
    ['OA 23', 'Medición', 'Basal', 'Demostrar que comprenden el concepto de área de un rectángulo y de un cuadrado: reconociendo que el área de una superficie se mide en unidades cuadradas; seleccionando y justificando la elección de la unidad estandarizada (cm² y m²).', ['Calculan el área de rectángulos y cuadrados usando cuadrículas y multiplicación de lados.', 'Construyen diferentes rectángulos de igual área.']],
    ['OA 24', 'Medición', 'Complementario', 'Demostrar que comprenden el concepto de volumen de un cuerpo: seleccionando una unidad no estandarizada para medir el volumen de un cuerpo; reconociendo que el volumen se mide en unidades de cubo.', ['Determinan el volumen de cuerpos geométricos contando cubos unitarios.']],
    ['OA 25', 'Datos y Probabilidades', 'Complementario', 'Realizar encuestas, analizar los datos, comparar con los resultados de muestras aleatorias, usando tablas y gráficos.', ['Analizan y comparan datos obtenidos en encuestas usando tablas de frecuencia.']],
    ['OA 26', 'Datos y Probabilidades', 'Complementario', 'Realizar experimentos aleatorios lúdicos y cotidianos, y tabular y representar mediante gráficos de manera manual y/o con software educativo los resultados obtenidos.', ['Registran frecuencias de experimentos aleatorios en gráficos de barras.']],
    ['OA 27', 'Datos y Probabilidades', 'Basal', 'Leer e interpretar pictogramas y gráficos de barra simple con escala, y comunicar sus conclusiones.', ['Extraen información y formulan conclusiones a partir de gráficos de barra con escala y pictogramas.']]
]);

// ==========================================
// 5° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('5° BASICO', 'MATEMATICA', 1, 'Unidad 1: Números naturales hasta 1.000 millones, operatoria combinada, patrones y ecuaciones', [
    ['OA 01', 'Números y Operaciones', 'Complementario', 'Representar y describir números naturales de hasta más de 6 dígitos y menores que 1 000 millones: identificando el valor posicional de los dígitos; componiendo y descomponiendo números naturales en forma estándar y expandida.', ['Leen, escriben y descomponen en forma estándar y expandida grandes números.', 'Ordenan y ubican números de hasta 9 cifras en la recta numérica.']],
    ['OA 02', 'Números y Operaciones', 'Complementario', 'Aplicar estrategias de cálculo mental para la multiplicación: anexar ceros cuando se multiplica por un múltiplo de 10; doblar y dividir por 2 en forma repetida; usando las propiedades conmutativa, asociativa y distributiva.', ['Multiplican mentalmente aplicando anexar ceros y propiedades de las operaciones.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la multiplicación de números naturales de dos dígitos por números naturales de dos dígitos: estimando productos; aplicando estrategias de cálculo mental; resolviendo problemas rutinarios y no rutinarios.', ['Multiplican números de dos dígitos por dos dígitos usando el algoritmo estándar.', 'Resuelven problemas estimando y calculando productos.']],
    ['OA 04', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la división con dividendos de tres dígitos y divisores de un dígito: interpretando el resto; resolviendo problemas rutinarios y no rutinarios que impliquen divisiones.', ['Dividen números de tres cifras por un dígito e interpretan el resto según el contexto del problema.']],
    ['OA 05', 'Números y Operaciones', 'Complementario', 'Realizar cálculos que involucren las cuatro operaciones, aplicando las reglas relativas a paréntesis y la prevalencia de la multiplicación y la división por sobre la adición y la sustracción cuando corresponda.', ['Resuelven ejercicios de operatoria combinada respetando el orden de las operaciones y paréntesis.']],
    ['OA 06', 'Números y Operaciones', 'Basal', 'Resolver problemas rutinarios y no rutinarios que involucren las cuatro operaciones y combinaciones de ellas, que incluyan situaciones con dinero, usando la calculadora y el computador en ámbitos numéricos superiores al 10 000.', ['Resuelven problemas de varios pasos combinando las cuatro operaciones aritméticas.']],
    ['OA 14', 'Patrones y Álgebra', 'Basal', 'Descubrir alguna regla que explique una sucesión dada y que permita hacer predicciones.', ['Determinan la regla general de una secuencia numérica o geométrica y calculan términos futuros.']],
    ['OA 15', 'Patrones y Álgebra', 'Basal', 'Resolver problemas, usando ecuaciones e inecuaciones de un paso, que involucren adiciones y sustracciones, en forma pictórica y simbólica.', ['Modelan y resuelven problemas mediante ecuaciones e inecuaciones de un paso.']]
]);

addUnidad('5° BASICO', 'MATEMATICA', 2, 'Unidad 2: Plano cartesiano, congruencia, medición de longitudes y área de triángulos y cuadriláteros', [
    ['OA 16', 'Geometría', 'Basal', 'Identificar y dibujar puntos en el primer cuadrante del plano cartesiano, dadas sus coordenadas en números naturales.', ['Ubican puntos y dibujan polígonos en el primer cuadrante del plano cartesiano a partir de pares ordenados (x, y).']],
    ['OA 17', 'Geometría', 'Basal', 'Describir y dar ejemplos de aristas y caras de figuras 3D y lados de figuras 2D: que son paralelos; que se intersectan; que son perpendiculares.', ['Identifican rectas, lados y caras paralelas y perpendiculares en figuras 2D y 3D.']],
    ['OA 18', 'Geometría', 'Basal', 'Demostrar que comprenden el concepto de congruencia, usando la traslación, la reflexión y la rotación en cuadrículas y mediante software geométrico.', ['Demuestran que dos figuras son congruentes mediante transformaciones isométricas.']],
    ['OA 19', 'Medición', 'Basal', 'Medir longitudes con unidades estandarizadas (m, cm, mm) en el contexto de la resolución de problemas.', ['Miden longitudes en metros, centímetros y milímetros seleccionando la unidad pertinente.']],
    ['OA 20', 'Medición', 'Complementario', 'Realizar transformaciones entre unidades de medidas de longitud: km a m, m a cm, cm a mm y viceversa, de manera manual y/o usando software educativo.', ['Transforman unidades de longitud (km, m, cm, mm) para resolver problemas.']],
    ['OA 21', 'Medición', 'Basal', 'Diseñar y construir diferentes rectángulos, dados el perímetro, el área o ambos, y sacar conclusiones.', ['Construyen rectángulos que cumplen condiciones dadas de área y perímetro.']],
    ['OA 22', 'Medición', 'Basal', 'Calcular áreas de triángulos, de paralelogramos y de trapecios, y estimar áreas de figuras irregulares aplicando las siguientes estrategias: conteo de cuadrículas; comparación con el área de un rectángulo; completar figuras por traslación.', ['Deduzcan y aplican las fórmulas de área de triángulos, paralelogramos y trapecios.', 'Estiman áreas de figuras irregulares en cuadrículas.']]
]);

addUnidad('5° BASICO', 'MATEMATICA', 3, 'Unidad 3: Fracciones propias, impropias, números mixtos y números decimales hasta la milésima', [
    ['OA 07', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden las fracciones propias: representándolas de manera concreta, pictórica y simbólica; creando grupos de fracciones equivalentes –simplificando y amplificando–; comparando fracciones propias con igual y distinto denominador.', ['Amplifican y simplifican fracciones para obtener fracciones equivalentes.', 'Comparan y ordenan fracciones de distinto denominador.']],
    ['OA 08', 'Números y Operaciones', 'Complementario', 'Demostrar que comprenden las fracciones impropias de uso común de denominadores 2, 3, 4, 5, 6, 8, 10, 12 y los números mixtos asociados: usando material concreto y pictórico para representarlas, de manera manual y/o con software educativo.', ['Transforman fracciones impropias a números mixtos y viceversa y las ubican en la recta numérica.']],
    ['OA 09', 'Números y Operaciones', 'Complementario', 'Resolver adiciones y sustracciones con fracciones propias con denominadores menores o iguales a 12: de manera pictórica y simbólica; amplificando o simplificando.', ['Suman y restan fracciones de distinto denominador igualando denominadores por amplificación.']],
    ['OA 10', 'Números y Operaciones', 'Basal', 'Determinar el decimal que corresponde a fracciones con denominador 2, 4, 5 y 10.', ['Expresan fracciones con denominador 2, 4, 5 y 10 como números decimales y viceversa.']],
    ['OA 11', 'Números y Operaciones', 'Basal', 'Comparar y ordenar decimales hasta la milésima.', ['Leen, comparan y ordenan números decimales hasta la milésima en la recta numérica.']],
    ['OA 12', 'Números y Operaciones', 'Complementario', 'Resolver adiciones y sustracciones de decimales, empleando el valor posicional hasta la milésima.', ['Resuelven adiciones y sustracciones de números decimales hasta la milésima.']],
    ['OA 13', 'Números y Operaciones', 'Basal', 'Resolver problemas rutinarios y no rutinarios, aplicando adiciones y sustracciones de fracciones propias o decimales hasta la milésima.', ['Resuelven problemas contextualizados que combinan suma y resta de fracciones y decimales.']]
]);

addUnidad('5° BASICO', 'MATEMATICA', 4, 'Unidad 4: Tablas, gráficos de barra y de línea, promedio de datos, diagramas de tallo y hojas y probabilidades', [
    ['OA 23', 'Datos y Probabilidades', 'Basal', 'Calcular el promedio de datos e interpretarlo en su contexto.', ['Calculan la media aritmética de un conjunto de datos y explican su significado en el contexto.']],
    ['OA 24', 'Datos y Probabilidades', 'Basal', 'Describir la posibilidad de ocurrencia de un evento en base a un experimento aleatorio, empleando los términos seguro – posible – poco posible – imposible.', ['Clasifican eventos aleatorios como seguros, posibles, poco posibles o imposibles.']],
    ['OA 25', 'Datos y Probabilidades', 'Complementario', 'Comparar probabilidades de distintos eventos sin calcularlas.', ['Comparan cualitativamente la probabilidad de ocurrencia de distintos resultados en experimentos aleatorios.']],
    ['OA 26', 'Datos y Probabilidades', 'Basal', 'Leer, interpretar y completar tablas, gráficos de barra simple y gráficos de línea y comunicar sus conclusiones.', ['Interpretan tendencias en gráficos de línea y comparan datos en gráficos de barras.']],
    ['OA 27', 'Datos y Probabilidades', 'Complementario', 'Utilizar diagramas de tallo y hojas para representar datos provenientes de muestras aleatorias.', ['Construyen e interpretan diagramas de tallo y hojas para organizar conjuntos de datos.']]
]);

// ==========================================
// 6° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('6° BASICO', 'MATEMATICA', 1, 'Unidad 1: Múltiplos y factores, fracciones, números mixtos, decimales, razones y porcentajes', [
    ['OA 01', 'Números y Operaciones', 'Complementario', 'Demostrar que comprenden los factores y múltiplos: determinando los múltiplos y factores de números naturales menores de 100; identificando números primos y compuestos; resolviendo problemas que involucran múltiplos.', ['Determinan factores y múltiplos de números naturales.', 'Identifican números primos y compuestos y calculan el mínimo común múltiplo.']],
    ['OA 02', 'Números y Operaciones', 'Complementario', 'Realizar cálculos que involucren las cuatro operaciones en el contexto de la resolución de problemas, utilizando la calculadora en ámbitos superiores a 10 000.', ['Resuelven problemas de operatoria combinada con grandes números.']],
    ['OA 03', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden el concepto de razón de manera concreta, pictórica y simbólica, en forma manual y/o usando software educativo.', ['Representan razones de manera pictórica y simbólica.', 'Resuelven problemas que involucran razones equivalentes.']],
    ['OA 04', 'Números y Operaciones', 'Complementario', 'Demostrar que comprenden el concepto de porcentaje de manera concreta, pictórica y simbólica, de forma manual y/o usando software educativo.', ['Expresan porcentajes como fracción de denominador 100 y como decimal.', 'Calculan porcentajes de uso común (10%, 25%, 50%, 75%) en problemas cotidianos.']],
    ['OA 05', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden las fracciones y números mixtos: identificando y determinando equivalencias entre fracciones impropias y números mixtos, usando material concreto y representaciones pictóricas, en forma manual y/o con software educativo.', ['Transforman entre fracciones impropias y números mixtos y los ubican en la recta numérica.']],
    ['OA 06', 'Números y Operaciones', 'Complementario', 'Resolver adiciones y sustracciones de fracciones propias e impropias y números mixtos con numeradores y denominadores de hasta dos dígitos.', ['Suman y restan números mixtos y fracciones con distinto denominador.']],
    ['OA 07', 'Números y Operaciones', 'Basal', 'Demostrar que comprenden la multiplicación y la división de decimales por números naturales de un dígito, múltiplos de 10 y decimales hasta la milésima de manera concreta, pictórica y simbólica.', ['Multiplican y dividen números decimales por naturales y potencias de 10.']],
    ['OA 08', 'Números y Operaciones', 'Basal', 'Resolver problemas rutinarios y no rutinarios que involucren adiciones y sustracciones de fracciones propias, impropias, números mixtos o decimales hasta la milésima.', ['Resuelven problemas combinados de suma y resta con fracciones, números mixtos y decimales.']]
]);

addUnidad('6° BASICO', 'MATEMATICA', 2, 'Unidad 2: Expresiones algebraicas, patrones en tablas, ecuaciones de primer grado', [
    ['OA 09', 'Patrones y Álgebra', 'Complementario', 'Demostrar que comprenden la relación entre los valores de una tabla y aplicarla en la resolución de problemas sencillos: identificando patrones entre los valores de la tabla; formulando una regla con lenguaje matemático.', ['Formulan reglas algebraicas para describir secuencias numéricas en tablas de valores.']],
    ['OA 10', 'Patrones y Álgebra', 'Complementario', 'Representar generalizaciones de relaciones entre números naturales, usando expresiones con letras y ecuaciones.', ['Traducen enunciados en lenguaje natural a expresiones algebraicas con variables.']],
    ['OA 11', 'Patrones y Álgebra', 'Basal', 'Resolver ecuaciones de primer grado con una incógnita, utilizando estrategias como: usando una balanza; usar la descomposición y la correspondencia 1 a 1 entre los términos en cada lado de la ecuación y aplicando procedimientos formales de resolución.', ['Resuelven ecuaciones de primer grado con una incógnita mediante balanzas y procedimientos formales.', 'Modelan y resuelven problemas mediante ecuaciones.']]
]);

addUnidad('6° BASICO', 'MATEMATICA', 3, 'Unidad 3: Construcción de triángulos, ángulos, teselaciones, área de superficie y volumen de cubos y paralelepípedos', [
    ['OA 12', 'Geometría', 'Complementario', 'Construir y comparar triángulos de acuerdo a la medida de sus lados y/o sus ángulos con instrumentos geométricos o software geométrico.', ['Clasifican y construyen triángulos según la medida de sus lados y de sus ángulos.']],
    ['OA 13', 'Geometría', 'Basal', 'Demostrar que comprenden el concepto de área de una superficie en cubos y paralelepípedos, calculando el área de sus redes (plantillas) asociadas.', ['Calculan el área total de la superficie de cubos y paralelepípedos a partir de sus redes.']],
    ['OA 14', 'Geometría', 'Complementario', 'Realizar teselados de figuras 2D usando traslaciones, reflexiones y rotaciones.', ['Construyen teselaciones regulares y semirregulares aplicando transformaciones isométricas.']],
    ['OA 15', 'Geometría', 'Complementario', 'Construir ángulos agudos, obtusos, rectos, extendidos y completos con instrumentos geométricos o software geométrico.', ['Construyen y clasifican ángulos según su medida usando transportador.']],
    ['OA 16', 'Geometría', 'Basal', 'Identificar los ángulos que se forman entre dos rectas que se cortan (pares de ángulos opuestos por el vértice y pares de ángulos complementarios).', ['Determinan medidas de ángulos opuestos por el vértice, complementarios y suplementarios.']],
    ['OA 17', 'Geometría', 'Complementario', 'Demostrar de manera concreta, pictórica y simbólica que la suma de los ángulos interiores de un triángulo es 180º y de un cuadrilátero es 360º.', ['Aplican la propiedad de la suma de ángulos interiores en triángulos (180°) y cuadriláteros (360°).']],
    ['OA 18', 'Medición', 'Basal', 'Calcular la superficie de cubos y paralelepípedos expresando el resultado en cm² y m².', ['Resuelven problemas de cálculo de superficie de prismas rectos en cm² y m².']],
    ['OA 19', 'Medición', 'Basal', 'Calcular el volumen de cubos y paralelepípedos, expresando el resultado en cm³, m³ y mm³.', ['Calculan el volumen de cubos y paralelepípedos multiplicando largo, ancho y alto.']],
    ['OA 20', 'Medición', 'Complementario', 'Estimar y medir ángulos usando el transportador, expresando las mediciones en grados.', ['Miden ángulos con precisión usando el transportador.']],
    ['OA 21', 'Medición', 'Basal', 'Calcular ángulos en rectas paralelas cortadas por una transversal y en triángulos.', ['Determinan ángulos desconocidos entre paralelas cortadas por una transversal y en triángulos.']]
]);

addUnidad('6° BASICO', 'MATEMATICA', 4, 'Unidad 4: Diagramas de puntos y de tallo y hojas, gráficos de barra doble y circulares y probabilidades', [
    ['OA 22', 'Datos y Probabilidades', 'Complementario', 'Comparar distribuciones de dos grupos, provenientes de muestras aleatorias, usando diagramas de puntos y de tallo y hojas.', ['Comparan dos poblaciones o muestras a partir de diagramas de puntos y de tallo y hojas.']],
    ['OA 23', 'Datos y Probabilidades', 'Basal', 'Conjeturar acerca de la tendencia de resultados obtenidos en repeticiones de un mismo experimento con dados, monedas u otros, de manera manual y/o usando software educativo.', ['Calculan frecuencias relativas en experimentos aleatorios repetidos y analizan su tendencia.']],
    ['OA 24', 'Datos y Probabilidades', 'Basal', 'Leer e interpretar gráficos de barra doble y circulares y comunicar sus conclusiones.', ['Interpretan información porcentual en gráficos circulares y comparan series en gráficos de barra doble.']]
]);

// ==========================================
// 7° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('7° BASICO', 'MATEMATICA', 1, 'Unidad 1: Números enteros, adición y sustracción, multiplicación y división de fracciones y decimales, porcentajes y potencias', [
    ['OA 01', 'Números', 'Basal', 'Mostrar que comprenden la adición y la sustracción de números enteros: representando los números enteros en la recta numérica; representándolas de manera concreta, pictórica y simbólica; dándole significado a los símbolos + y – según el contexto.', ['Ubican, comparan y ordenan números enteros en la recta numérica.', 'Resuelven adiciones y sustracciones de números enteros y problemas en contextos cotidianos (temperaturas, saldos).']],
    ['OA 02', 'Números', 'Complementario', 'Explicar la multiplicación y la división de fracciones positivas: utilizando representaciones concretas, pictóricas y simbólicas; relacionándolas con la multiplicación y la división de números decimales.', ['Multiplican y dividen fracciones positivas y números decimales.', 'Relacionan operatoria de fracciones con su representación decimal.']],
    ['OA 03', 'Números', 'Basal', 'Resolver problemas que involucren la multiplicación y la división de fracciones y de decimales positivos de manera concreta, pictórica y simbólica (de forma manual y/o con software educativo).', ['Resuelven problemas contextualizados que requieren multiplicar y dividir fracciones y decimales.']],
    ['OA 04', 'Números', 'Basal', 'Mostrar que comprenden el concepto de porcentaje: representándolo de manera pictórica; calculando de varias maneras; aplicándolo a situaciones sencillas.', ['Calculan porcentajes usando proporciones, fracciones y decimales.', 'Resuelven problemas comerciales y cotidianos de descuentos, IVA e incrementos porcentuales.']],
    ['OA 05', 'Números', 'Complementario', 'Utilizar potencias de base 10 con exponente natural: usando los términos potencia, base, exponente, elevado; definiendo y usando el exponente 0 en el sistema decimal; expresando números naturales en notación científica (sistema decimal).', ['Expresan grandes números utilizando potencias de base 10 y notación científica.']]
]);

addUnidad('7° BASICO', 'MATEMATICA', 2, 'Unidad 2: Expresiones algebraicas, proporcionalidad directa e inversa, ecuaciones e inecuaciones lineales', [
    ['OA 06', 'Álgebra y Funciones', 'Basal', 'Utilizar el lenguaje algebraico para generalizar relaciones entre números, para establecer y formular reglas y propiedades y construir ecuaciones.', ['Traducen expresiones del lenguaje natural al algebraico y valorizan expresiones algebraicas.']],
    ['OA 07', 'Álgebra y Funciones', 'Complementario', 'Reducir expresiones algebraicas, reuniendo términos semejantes para obtener expresiones de la forma ax + by + cz (a, b, c ∈ Z).', ['Reducen términos semejantes con coeficientes enteros y fraccionarios.']],
    ['OA 08', 'Álgebra y Funciones', 'Basal', 'Demostrar que comprenden las proporciones directas e inversas: realizando tablas de valores para relaciones proporcionales; graficando los valores de la tabla; explicando las características de la gráfica; resolviendo problemas de la vida diaria y de otras asignaturas.', ['Identifican y diferencian relaciones de proporcionalidad directa e inversa.', 'Determinan la constante de proporcionalidad, grafican y resuelven problemas.']],
    ['OA 09', 'Álgebra y Funciones', 'Complementario', 'Modelar y resolver problemas diversos de la vida diaria y de otras asignaturas, que involucran ecuaciones e inecuaciones lineales de la forma: ax = b; x/a = b (a, b y c ∈ Z; a ≠ 0); ax < b; ax > b; x/a < b; x/a > b.', ['Resuelven ecuaciones e inecuaciones lineales de un paso y representan el conjunto solución.']]
]);

addUnidad('7° BASICO', 'MATEMATICA', 3, 'Unidad 3: Polígonos, área de paralelogramos, triángulos y trapecios, círculo y circunferencia y construcciones geométricas', [
    ['OA 10', 'Geometría', 'Complementario', 'Descubrir relaciones que involucran ángulos exteriores o interiores de diferentes polígonos.', ['Calculan la suma de los ángulos interiores y exteriores de polígonos convexos.']],
    ['OA 11', 'Geometría', 'Basal', 'Mostrar que comprenden el círculo: describiendo las relaciones entre el radio, el diámetro y el perímetro del círculo; estimando de manera intuitiva el perímetro y el área de un círculo; aplicando las aproximaciones del perímetro y del área en la resolución de problemas.', ['Caracterizan la circunferencia y el círculo e identifican el número pi (π).', 'Calculan el perímetro y el área del círculo en problemas geométricos y cotidianos.']],
    ['OA 12', 'Geometría', 'Complementario', 'Construir objetos geométricos de manera manual y/o con software educativo: líneas, como las perpendiculares, las paralelas, las bisectrices y alturas en triángulos y cuadriláteros; puntos, como el punto medio, el centro de gravedad, el centro del círculo inscrito y del circunscrito.', ['Construyen simetrales, bisectrices, alturas y transversales de gravedad en triángulos.']],
    ['OA 13', 'Geometría', 'Basal', 'Desarrollar y aplicar la fórmula del área de triángulos, paralelogramos y trapecios.', ['Resuelven problemas de cálculo de áreas de triángulos, paralelogramos, trapecios y figuras compuestas.']],
    ['OA 14', 'Geometría', 'Basal', 'Identificar puntos en el plano cartesiano, usando pares ordenados y vectores de forma concreta (juegos) y pictórica.', ['Ubican puntos en los cuatro cuadrantes del plano cartesiano y representan desplazamientos mediante vectores.']]
]);

addUnidad('7° BASICO', 'MATEMATICA', 4, 'Unidad 4: Muestreo, tablas de frecuencia, gráficos estadísticos, medidas de tendencia central y probabilidades', [
    ['OA 15', 'Probabilidad y Estadística', 'Complementario', 'Estimar el porcentaje de algunas características de una población desconocida por medio del muestreo.', ['Realizan inferencias sobre una población a partir del porcentaje observado en una muestra aleatoria.']],
    ['OA 16', 'Probabilidad y Estadística', 'Basal', 'Representar datos obtenidos en una muestra mediante tablas de frecuencias absolutas y relativas, utilizando gráficos apropiados, de manera manual y/o con software educativo.', ['Construyen tablas de frecuencias absolutas, relativas y porcentuales.', 'Seleccionan y justifican el tipo de gráfico más adecuado para representar un conjunto de datos.']],
    ['OA 17', 'Probabilidad y Estadística', 'Complementario', 'Mostrar que comprenden las medidas de tendencia central y el rango: determinando las medidas de tendencia central para realizar inferencias sobre la población; determinando la medida de tendencia central adecuada para responder un problema planteado.', ['Calculan e interpretan la media, mediana, moda y rango de un conjunto de datos.']],
    ['OA 18', 'Probabilidad y Estadística', 'Basal', 'Explicar las probabilidades de eventos obtenidos por medio de experimentos de manera manual y/o con software educativo: estimándolas de manera intuitiva; utilizando frecuencias relativas; relacionándolas con razones, fracciones o porcentaje.', ['Estiman la probabilidad de un evento mediante su frecuencia relativa y aplican la regla de Laplace en casos equiprobables.']]
]);

// ==========================================
// 8° BÁSICO - MATEMÁTICA
// ==========================================
addUnidad('8° BASICO', 'MATEMATICA', 1, 'Unidad 1: Multiplicación y división de números enteros y racionales, potencias y raíces cuadradas', [
    ['OA 01', 'Números', 'Basal', 'Mostrar que comprenden la multiplicación y la división de números enteros: representándolos de manera concreta, pictórica y simbólica; aplicando procedimientos usados en la multiplicación y la división de números naturales; aplicando la regla de los signos de la operación.', ['Multiplican y dividen números enteros aplicando la regla de los signos.', 'Resuelven problemas cotidianos que involucran las cuatro operaciones en Z.']],
    ['OA 02', 'Números', 'Basal', 'Utilizar las operaciones de multiplicación y división con los números racionales en el contexto de la resolución de problemas: representándolos en la recta numérica; involucrando diferentes conjuntos numéricos (fracciones, decimales y números enteros).', ['Realizan operaciones combinadas con números racionales expresados como fracción y decimal.', 'Resuelven problemas contextualizados en el conjunto Q.']],
    ['OA 03', 'Números', 'Basal', 'Explicar la multiplicación, la división y el proceso de formar potencias de potencias de base natural y exponente natural hasta 3, de manera concreta, pictórica y simbólica.', ['Aplican las propiedades de multiplicación y división de potencias de igual base o igual exponente y potencia de una potencia.']],
    ['OA 04', 'Números', 'Basal', 'Mostrar que comprenden las raíces cuadradas de números naturales: estimándolas de manera intuitiva; representándolas de manera concreta, pictórica y simbólica; aplicándolas en situaciones geométricas y en la vida diaria.', ['Calculan raíces cuadradas exactas y estiman raíces inexactas ubicándolas en la recta numérica.']],
    ['OA 05', 'Números', 'Complementario', 'Resolver problemas que involucran variaciones porcentuales en contextos diversos, usando representaciones pictóricas y registrando el proceso de manera simbólica; por ejemplo: el interés anual del ahorro.', ['Resuelven problemas de variaciones porcentuales sucesivas, IPC, descuentos e interés simple.']]
]);

addUnidad('8° BASICO', 'MATEMATICA', 2, 'Unidad 2: Expresiones algebraicas, función lineal y afín, ecuaciones e inecuaciones lineales', [
    ['OA 06', 'Álgebra y Funciones', 'Complementario', 'Mostrar que comprenden las operaciones de expresiones algebraicas: representándolas de manera pictórica y simbólica; relacionándolas con el área de cuadrados, rectángulos y volúmenes de paralelepípedos; determinando formas factorizadas.', ['Multiplican expresiones algebraicas (monomio por polinomio y binomio por binomio) y factorizan por factor común.']],
    ['OA 07', 'Álgebra y Funciones', 'Basal', 'Mostrar que comprenden la noción de función por medio de un cambio lineal: utilizando tablas; usando metáforas de máquinas; estableciendo reglas entre x e y; representando de manera gráfica (plano cartesiano, diagramas de Venn), de manera manual y/o con software educativo.', ['Identifican y representan funciones lineales y = mx mediante tablas, fórmulas y gráficas en el plano cartesiano.']],
    ['OA 08', 'Álgebra y Funciones', 'Complementario', 'Modelar situaciones de la vida diaria y de otras asignaturas, usando ecuaciones lineales de la forma: ax = b; x/a = b, a ≠ 0; ax + b = c; x/a + b = c; ax = b + cx; a(x + b) = c; ax + b = cx + d (a, b, c, d, e ∈ Q).', ['Resuelven ecuaciones lineales con coeficientes racionales e incógnita en ambos lados de la igualdad.']],
    ['OA 09', 'Álgebra y Funciones', 'Complementario', 'Resolver inecuaciones lineales con coeficientes racionales en el contexto de la resolución de problemas, por medio de representaciones gráficas, simbólicas, de manera manual y/o con software educativo.', ['Resuelven inecuaciones de primer grado con coeficientes racionales y representan la solución en la recta numérica.']],
    ['OA 10', 'Álgebra y Funciones', 'Basal', 'Mostrar que comprenden la función afín: generalizando como la suma de una constante con una función lineal; trasladando funciones lineales en el plano cartesiano; determinando el cambio constante de un intervalo a otro, de manera gráfica y simbólica.', ['Grafican funciones afines f(x) = mx + n, interpretan la pendiente m y el coeficiente de posición n, y modelan problemas reales.']]
]);

addUnidad('8° BASICO', 'MATEMATICA', 3, 'Unidad 3: Área y volumen de prismas y cilindros, teorema de Pitágoras y transformaciones isométricas', [
    ['OA 11', 'Geometría', 'Basal', 'Desarrollar las fórmulas para encontrar el área de superficies y el volumen de prismas rectos con diferentes bases y cilindros: estimando de manera intuitiva área de superficie y volumen; desplegando la red de prismas rectos para encontrar la fórmula del área de superficie.', ['Calculan el área total y el volumen de prismas rectos de distintas bases y de cilindros en problemas aplicados.']],
    ['OA 12', 'Geometría', 'Basal', 'Explicar, de manera concreta, pictórica y simbólica, la validez del teorema de Pitágoras y aplicar a la resolución de problemas geométricos y de la vida cotidiana, de manera manual y/o con software educativo.', ['Verifican el teorema de Pitágoras y su recíproco.', 'Aplican el teorema de Pitágoras para calcular longitudes en triángulos rectángulos, figuras 2D, 3D y plano cartesiano.']],
    ['OA 13', 'Geometría', 'Basal', 'Describir la posición y el movimiento (traslaciones, rotaciones y reflexiones) de figuras 2D, de manera manual y/o con software educativo, utilizando: los vectores para la traslación; los ejes del plano cartesiano como ejes de reflexión; los puntos del plano para las rotaciones.', ['Aplican traslaciones según un vector, reflexiones respecto a ejes y rotaciones en el plano cartesiano determinando las coordenadas resultantes.']],
    ['OA 14', 'Geometría', 'Complementario', 'Componer rotaciones, traslaciones y reflexiones en el plano cartesiano y en el espacio, de manera manual y/o con software educativo, y aplicar a las simetrías de polígonos y poliedros, y a la resolución de problemas geométricos relacionados con el arte.', ['Realizan composiciones de transformaciones isométricas en el plano cartesiano.']]
]);

addUnidad('8° BASICO', 'MATEMATICA', 4, 'Unidad 4: Medidas de posición (percentiles y cuartiles), diagramas de cajón y principio combinatorio multiplicativo', [
    ['OA 15', 'Probabilidad y Estadística', 'Basal', 'Mostrar que comprenden las medidas de posición, percentiles y cuartiles: identificando la población que está sobre o bajo el percentil; representándolas con diagramas, incluyendo el diagrama de cajón, de manera manual y/o con software educativo; utilizándolas para comparar poblaciones.', ['Calculan cuartiles y percentiles para datos ordenados.', 'Construyen e interpretan diagramas de cajón (boxplot) para comparar dos o más distribuciones.']],
    ['OA 16', 'Probabilidad y Estadística', 'Complementario', 'Evaluar la forma en que los datos están presentados: comparando la información de los mismos datos representada en distintos tipos de gráficos para determinar fortalezas y debilidades de cada uno; reconociendo manipulaciones de gráficos.', ['Evalúan críticamente gráficos estadísticos detectando distorsiones en los ejes o representaciones engañosas.']],
    ['OA 17', 'Probabilidad y Estadística', 'Basal', 'Explicar el principio combinatorio multiplicativo: a partir de situaciones concretas; representándolo con tablas y árboles regulares, de manera manual y/o con software educativo; utilizándolo para calcular la probabilidad de un evento compuesto.', ['Aplican el principio multiplicativo y diagramas de árbol para contar casos posibles y calcular probabilidades de eventos compuestos.']]
]);

// ==========================================
// I° MEDIO - MATEMÁTICA
// ==========================================
addUnidad('I° MEDIO', 'MATEMATICA', 1, 'Unidad 1: Operatoria en los números racionales y potencias de base racional y exponente entero', [
    ['OA 01', 'Números', 'Basal', 'Calcular operaciones con números racionales en forma simbólica.', ['Transforman decimales finitos, periódicos y semiperiódicos a fracción.', 'Resuelven operaciones combinadas y problemas con números racionales.']],
    ['OA 02', 'Números', 'Basal', 'Mostrar que comprenden las potencias de base racional y exponente entero: transfiriendo propiedades de la multiplicación y división de potencias a los ámbitos numéricos correspondientes; relacionándolas con el crecimiento y decrecimiento de cantidades.', ['Aplican propiedades de las potencias de base racional y exponente entero.', 'Modelan situaciones de crecimiento y decrecimiento exponencial con potencias.']]
]);

addUnidad('I° MEDIO', 'MATEMATICA', 2, 'Unidad 2: Productos notables, factorización, sistema de ecuaciones lineales (2x2) y relaciones lineales en dos variables', [
    ['OA 03', 'Álgebra y Funciones', 'Basal', 'Desarrollar los productos notables de manera concreta, pictórica y simbólica: transformando productos en sumas y viceversa; aplicándolos a situaciones concretas; completando el cuadrado de binomio.', ['Desarrollan cuadrados de binomio, suma por su diferencia y producto de binomios con término común.', 'Factorizan expresiones algebraicas aplicando productos notables.']],
    ['OA 04', 'Álgebra y Funciones', 'Basal', 'Resolver sistemas de ecuaciones lineales (2x2) relacionados con problemas de la vida diaria y de otras asignaturas, mediante representaciones gráficas y simbólicas, de manera manual y/o con software educativo.', ['Resuelven sistemas de ecuaciones lineales 2x2 por métodos gráfico, igualación, sustitución y reducción.', 'Analizan la existencia y unicidad de soluciones de un sistema lineal y modelan problemas.']],
    ['OA 05', 'Álgebra y Funciones', 'Complementario', 'Graficar relaciones lineales en dos variables de la forma f(x, y) = ax + by; por ejemplo: un haz de rectas paralelas en el plano cartesiano, líneas de nivel en planos inclinados (techo), propagación de olas en el mar y la formación de algunas capas de rocas.', ['Grafican e interpretan familias de rectas asociadas a ecuaciones lineales de dos variables ax + by = c.']]
]);

addUnidad('I° MEDIO', 'MATEMATICA', 3, 'Unidad 3: Sector y segmento circular, área y volumen del cono, homotecia, teorema de Tales y semejanza', [
    ['OA 06', 'Geometría', 'Complementario', 'Desarrollar la fórmula de los valores del área y del perímetro de sectores y segmentos circulares, respectivamente, a partir de ángulos centrales de 60°, 90°, 120° y 180°, por medio de representaciones concretas.', ['Calculan la longitud de arcos y el área de sectores y segmentos circulares.']],
    ['OA 07', 'Geometría', 'Basal', 'Desarrollar las fórmulas para encontrar el área de la superficie y el volumen del cono: desplegando la red del cono para la fórmula del área de superficie; experimentando de manera concreta para encontrar la relación entre el volumen del cilindro y el cono.', ['Calculan la generatriz, el área basal, lateral y total, y el volumen de conos rectos en problemas aplicados.']],
    ['OA 08', 'Geometría', 'Basal', 'Mostrar que comprenden el concepto de homotecia: relacionándola con la perspectiva, el funcionamiento de instrumentos ópticos y el ojo humano; midiendo segmentos adecuados para determinar las propiedades de la homotecia; aplicando propiedades de la homotecia en la construcción de objetos.', ['Construyen figuras homotéticas con razón positiva y negativa.', 'Relacionan la homotecia con perímetros, áreas y vectores.']],
    ['OA 09', 'Geometría', 'Complementario', 'Desarrollar el teorema de Tales mediante las propiedades de la homotecia, para aplicarlo en la resolución de problemas.', ['Aplican el teorema de Tales y el teorema general de Tales para calcular medidas de segmentos proporcionales.']],
    ['OA 10', 'Geometría', 'Basal', 'Aplicar propiedades de semejanza y de proporcionalidad a modelos a escala y otras situaciones de la vida diaria y otras asignaturas.', ['Aplican los criterios de semejanza de triángulos (AA, LAL, LLL) y los teoremas de Euclides en la resolución de problemas.']]
]);

addUnidad('I° MEDIO', 'MATEMATICA', 4, 'Unidad 4: Nube de puntos, comparación de poblaciones, reglas de las probabilidades (aditiva y multiplicativa) y paseos aleatorios', [
    ['OA 11', 'Probabilidad y Estadística', 'Complementario', 'Representar datos obtenidos en una muestra mediante tablas de frecuencias absolutas y relativas, utilizando gráficos apropiados, de manera manual y/o con software educativo.', ['Analizan y comparan datos bivariados utilizando tablas de doble entrada y gráficos estadísticos.']],
    ['OA 12', 'Probabilidad y Estadística', 'Complementario', 'Registrar distribuciones de dos características distintas, de una misma población, en una tabla de doble entrada y en una nube de puntos.', ['Construyen nubes de puntos (diagramas de dispersión) e identifican intuitivamente correlaciones lineales.']],
    ['OA 13', 'Probabilidad y Estadística', 'Complementario', 'Comparar poblaciones mediante la confección de gráficos "xy" para dos atributos de muestras, de manera concreta y pictórica: utilizando nubes de puntos en dos colores; separando ambos grupos mediante una recta trazada de manera intuitiva.', ['Clasifican y comparan dos poblaciones en un diagrama de dispersión bicolor.']],
    ['OA 14', 'Probabilidad y Estadística', 'Basal', 'Desarrollar las reglas de las probabilidades, la regla aditiva, la regla multiplicativa y la combinación de ambas, de manera concreta, pictórica y simbólica, de manera manual y/o con software educativo, en el contexto de la resolución de problemas.', ['Aplican la regla aditiva (unión de eventos disjuntos y no disjuntos) y la regla multiplicativa de probabilidades usando diagramas de Venn y árboles.']],
    ['OA 15', 'Probabilidad y Estadística', 'Complementario', 'Mostrar que comprenden el concepto de azar: experimentando con la tabla de Galton y con paseos aleatorios sencillos de manera manual y/o con software educativo; realizando análisis estadísticos y empezando a percibir regularidades.', ['Simulan y calculan probabilidades en paseos aleatorios y en la tabla de Galton.']]
]);

// ==========================================
// II° MEDIO - MATEMÁTICA
// ==========================================
addUnidad('II° MEDIO', 'MATEMATICA', 1, 'Unidad 1: Números reales, raíces enésimas, potencias de exponente racional y logaritmos', [
    ['OA 01', 'Números', 'Basal', 'Realizar cálculos y estimaciones que involucren operaciones con números reales: utilizando la descomposición de raíces y las propiedades de las raíces; combinando raíces con números racionales; resolviendo problemas que involucren estas operaciones en contextos diversos.', ['Identifican números irracionales y los ubican o aproximan en la recta real.', 'Operan y racionalizan expresiones con raíces cuadradas y enésimas.']],
    ['OA 02', 'Números', 'Basal', 'Mostrar que comprenden las relaciones entre potencias, raíces enésimas y logaritmos: comparando representaciones de potencias de exponente racional con raíces enésimas en la recta numérica; convirtiendo raíces enésimas a potencias de exponente racional y viceversa; describiendo la relación entre potencias y logaritmos.', ['Convierten entre potencias de exponente fraccionario, raíces enésimas y logaritmos.', 'Aplican las propiedades de las raíces y de los logaritmos para simplificar expresiones y resolver problemas.']]
]);

addUnidad('II° MEDIO', 'MATEMATICA', 2, 'Unidad 2: Ecuaciones cuadráticas, función cuadrática y función inversa', [
    ['OA 03', 'Álgebra y Funciones', 'Basal', 'Mostrar que comprenden la función cuadrática f(x)= ax² + bx + c (a≠0): reconociendo la función cuadrática f(x) = ax² en situaciones de la vida diaria y otras asignaturas; representándola en tablas y gráficos de manera manual y/o con software educativo; determinando puntos especiales de su gráfica.', ['Grafican funciones cuadráticas determinando concavidad, vértice, eje de simetría e intersecciones con los ejes.', 'Modelan problemas de lanzamiento de proyectiles y optimización de áreas mediante funciones cuadráticas.']],
    ['OA 04', 'Álgebra y Funciones', 'Basal', 'Resolver, de manera concreta, pictórica y simbólica o usando herramientas tecnológicas, ecuaciones cuadráticas de la forma: ax² = b; (ax + b)² = c; ax² + bx = 0; ax² + bx = c (a, b, c son números racionales, a ≠ 0).', ['Resuelven ecuaciones de segundo grado mediante factorización, completación de cuadrados y fórmula general.', 'Analizan la naturaleza de las soluciones utilizando el discriminante (Δ).']],
    ['OA 05', 'Álgebra y Funciones', 'Complementario', 'Mostrar que comprenden la inversa de una función: utilizando la metáfora de una máquina; representándola por medio de tablas y gráficos, de manera manual y/o con software educativo; utilizando la reflexión de la gráfica de la función sobre la recta y = x.', ['Determinan algebraica y gráficamente la función inversa de funciones lineales, afines y cuadráticas restringidas.']],
    ['OA 06', 'Álgebra y Funciones', 'Complementario', 'Explicar el cambio porcentual constante en intervalos de tiempo por medio de funciones recursivas, en el contexto del interés compuesto, la depreciación de valores u otros.', ['Resuelven problemas de interés compuesto, inflación y crecimiento porcentual constante.']]
]);

addUnidad('II° MEDIO', 'MATEMATICA', 3, 'Unidad 3: Área y volumen de la esfera y razones trigonométricas en el triángulo rectángulo', [
    ['OA 07', 'Geometría', 'Basal', 'Desarrollar las fórmulas del área de la superficie y del volumen de la esfera: conjeturando la fórmula; representando de manera concreta y simbólica, de manera manual y/o con software educativo; resolviendo problemas de la vida diaria y de geometría.', ['Calculan el área de la superficie y el volumen de esferas, semiesferas y cuerpos compuestos en problemas aplicados.']],
    ['OA 08', 'Geometría', 'Basal', 'Mostrar que comprenden las razones trigonométricas de seno, coseno y tangente en triángulos rectángulos: relacionándolas con las propiedades de la semejanza y los ángulos; explicándolas de manera pictórica y simbólica; aplicándolas para determinar ángulos o medidas de lados.', ['Determinan las razones trigonométricas seno, coseno y tangente en triángulos rectángulos.', 'Resuelven problemas geométricos y cotidianos que involucran ángulos de elevación y de depresión.']],
    ['OA 09', 'Geometría', 'Complementario', 'Aplicar las razones trigonométricas en diversos contextos en la composición y descomposición de vectores y determinar la proyección de un vector sobre otro.', ['Descomponen vectores en el plano cartesiano utilizando seno y coseno de su ángulo director.']]
]);

addUnidad('II° MEDIO', 'MATEMATICA', 4, 'Unidad 4: Variables aleatorias, probabilidad condicional, permutaciones y combinatoria', [
    ['OA 10', 'Probabilidad y Estadística', 'Complementario', 'Mostrar que comprenden las variables aleatorias finitas: definiendo la variable; determinando los posibles valores de la incógnita; calculando su probabilidad; graficando sus distribuciones.', ['Definen variables aleatorias discretas finitas y construyen su función y gráfico de distribución de probabilidad.']],
    ['OA 11', 'Probabilidad y Estadística', 'Basal', 'Utilizar permutaciones y la combinatoria sencilla para calcular probabilidades de eventos y resolver problemas.', ['Calculan permutaciones, variaciones y combinaciones con y sin repetición.', 'Aplican técnicas de conteo combinatorio para calcular probabilidades de eventos.']],
    ['OA 12', 'Probabilidad y Estadística', 'Basal', 'Mostrar que comprenden el rol de la probabilidad en la sociedad: revisando informaciones de los medios de comunicación, tales como juegos de azar y encuestas; explicando cómo una decisión informada puede basarse en probabilidades.', ['Evalúan situaciones de incertidumbre, juegos de azar y toma de decisiones fundamentando con el cálculo de probabilidades.']]
]);

// ==========================================
// III° MEDIO - MATEMÁTICA
// ==========================================
addUnidad('III° MEDIO', 'MATEMATICA', 1, 'Unidad 1: Toma de decisiones en situaciones de incerteza: medidas de dispersión y probabilidad condicionada', [
    ['OA 02', 'Estadística y Probabilidades', 'Basal', 'Tomar decisiones en situaciones de incerteza que involucren el análisis de datos estadísticos con medidas de dispersión y probabilidades condicionales.', ['Calculan e interpretan el rango, desviación media, varianza, desviación estándar y coeficiente de variación para comparar la homogeneidad de dos o más conjuntos de datos.', 'Calculan probabilidades condicionadas y probabilidad total utilizando tablas de contingencia, diagramas de árbol y la fórmula P(A|B).', 'Justifican decisiones en contextos reales basándose en medidas de dispersión y probabilidad condicionada.']]
]);

addUnidad('III° MEDIO', 'MATEMATICA', 2, 'Unidad 2: Modelamiento de fenómenos mediante las funciones exponencial y logarítmica', [
    ['OA 01', 'Números', 'Complementario', 'Resolver problemas de adición, sustracción, multiplicación y división de números complejos C, en forma pictórica, simbólica y con uso de herramientas tecnológicas.', ['Representan números complejos en forma binomial, par ordenado y en el plano de Argand.', 'Calculan el conjugado, el módulo y las cuatro operaciones con números complejos.']],
    ['OA 03', 'Álgebra y Funciones', 'Basal', 'Aplicar modelos matemáticos que describen fenómenos o situaciones de crecimiento y decrecimiento, que involucran las funciones exponencial y logarítmica, de forma manuscrita, con uso de herramientas tecnológicas y promoviendo la búsqueda, selección, contrastación y verificación de información.', ['Analizan y grafican funciones exponenciales y logarítmicas identificando dominio, recorrido, asíntotas y monotonía.', 'Modelan y resuelven problemas de crecimiento poblacional, desintegración radiactiva, escalas logarítmicas (pH, sismos, decibeles) e interés compuesto.']]
]);

addUnidad('III° MEDIO', 'MATEMATICA', 3, 'Unidad 3: Relaciones métricas en la circunferencia: ángulos y segmentos', [
    ['OA 04', 'Geometría', 'Basal', 'Resolver problemas de geometría euclidiana que involucren relaciones métricas entre ángulos, arcos, cuerdas y secantes en la circunferencia, de forma manuscrita y con uso de herramientas tecnológicas.', ['Determinan medidas de ángulos del centro, inscritos, semiinscritos, interiores y exteriores en la circunferencia.', 'Aplican los teoremas de las cuerdas, de las secantes y de la secante y la tangente para calcular longitudes de segmentos en la circunferencia.']]
]);

addUnidad('III° MEDIO', 'MATEMATICA', 4, 'Unidad 4: Integración de modelamiento funcional, análisis estadístico y relaciones geométricas', [
    ['OA 02', 'Estadística y Probabilidades', 'Basal', 'Evaluar críticamente estudios estadísticos y probabilísticos aplicando medidas de dispersión y probabilidad condicional en proyectos integrados.', ['Elaboran informes de toma de decisiones integrando medidas de tendencia central, dispersión y probabilidad condicional.']],
    ['OA 03', 'Álgebra y Funciones', 'Basal', 'Comparar y contrastar modelos lineales, cuadráticos, exponenciales y logarítmicos para explicar fenómenos naturales y sociales.', ['Seleccionan y ajustan el modelo funcional más adecuado (exponencial o logarítmico) para un conjunto de datos reales.']],
    ['OA 04', 'Geometría', 'Basal', 'Integrar relaciones angulares y métricas en la circunferencia con semejanza y trigonometría en problemas de diseño y arquitectura.', ['Resuelven problemas geométricos complejos que combinan propiedades de la circunferencia y triángulos.']]
]);

// ==========================================
// IV° MEDIO - MATEMÁTICA
// ==========================================
addUnidad('IV° MEDIO', 'MATEMATICA', 1, 'Unidad 1: Matemática financiera y toma de decisiones económicas: créditos, ahorro, inversión y presupuesto', [
    ['OA 01', 'Álgebra y Funciones', 'Basal', 'Fundamentar decisiones en el ámbito financiero y económico personal o comunitario, a partir de modelos que permitan evaluar las condiciones de los productos financieros (tasas de interés, CAE, impuestos, inflación, etc.).', ['Calculan y comparan el costo total de créditos (consumo, hipotecario, tarjetas) utilizando interés simple, compuesto y CAE.', 'Analizan liquidaciones de sueldo, descuentos previsionales (AFP, salud), impuestos (IVA, renta) y ahorro previsional para elaborar presupuestos fundamentados.']]
]);

addUnidad('IV° MEDIO', 'MATEMATICA', 2, 'Unidad 2: Modelamiento mediante funciones potencia, trigonométricas (seno y coseno) y funciones definidas por tramos', [
    ['OA 02', 'Álgebra y Funciones', 'Complementario', 'Construir modelos de situaciones o fenómenos de crecimiento, decrecimiento y periódicos que involucren funciones potencia de exponente entero y trigonométricas sen(x) y cos(x), de forma manuscrita y con uso de herramientas tecnológicas.', ['Grafican y analizan funciones potencia f(x) = a·x^n con exponente entero positivo y negativo.', 'Modelan fenómenos periódicos (ondas, mareas, ciclos biológicos) mediante funciones sinusoidales determinando amplitud, período, frecuencia y desfase.']]
]);

addUnidad('IV° MEDIO', 'MATEMATICA', 3, 'Unidad 3: Distribución binomial y distribución normal en la toma de decisiones bajo incertidumbre', [
    ['OA 03', 'Estadística y Probabilidades', 'Basal', 'Construir modelos de situaciones o fenómenos aleatorios mediante las distribuciones de probabilidad binomial y normal, y utilizarlos para fundamentar decisiones en situaciones de incerteza.', ['Modelan experimentos de Bernoulli repetidos mediante la distribución binomial B(n, p) y calculan probabilidades asociadas.', 'Estandarizan variables aleatorias continuas (puntaje Z) y calculan probabilidades utilizando la distribución normal N(μ, σ).']]
]);

addUnidad('IV° MEDIO', 'MATEMATICA', 4, 'Unidad 4: Geometría analítica en el plano: rectas, circunferencias y posiciones relativas', [
    ['OA 04', 'Geometría', 'Basal', 'Resolver problemas acerca de rectas y circunferencias en el plano, mediante su representación analítica, de forma manuscrita y con uso de herramientas tecnológicas.', ['Determinan la distancia entre dos puntos, el punto medio y la ecuación principal y general de la recta.', 'Analizan condiciones de paralelismo y perpendicularidad entre rectas.', 'Determinan la ecuación canónica y general de la circunferencia y analizan las posiciones relativas entre rectas y circunferencias en el plano cartesiano.']]
]);

module.exports = oas;
