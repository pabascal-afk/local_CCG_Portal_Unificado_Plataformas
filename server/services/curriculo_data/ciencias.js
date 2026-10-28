/**
 * Catálogo Oficial Curricular MINEDUC - Ciencias Naturales (1° a 8° Básico),
 * Biología, Física y Química (I° y II° Medio) y Ciencias para la Ciudadanía (III° y IV° Medio).
 * Incluye Unidades Oficiales (1 a 4 con nombre oficial), todos los OAs (Basales y Complementarios) e Indicadores.
 */

const CIENCIAS_CURRICULO = [];

function addUnidad(nivel, asignatura, unidad, nombreUnidad, lista) {
  const tituloCompleto = nombreUnidad.startsWith('Unidad') ? nombreUnidad : `${unidad}: ${nombreUnidad}`;
  lista.forEach(([codigo, eje, categoria, descripcion, indicadores]) => {
    CIENCIAS_CURRICULO.push({
      nivel,
      asignatura,
      unidad,
      nombre_unidad: tituloCompleto,
      eje,
      codigo,
      categoria,
      descripcion,
      indicadores
    });
  });
}

const CN = 'CIENCIAS NATURALES';

// ============================================================================
// 1° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('1° Básico', CN, 'Unidad 1', 'Hábitos de vida saludable y los sentidos', [
  ['OA 06', 'Ciencias de la Vida', 'Basal', 'Identificar y describir la ubicación y la función de los sentidos, proponiendo medidas para protegerlos y para prevenir situaciones de riesgo.', ['Asocian cada órgano de los sentidos con su función perceptiva.', 'Proponen medidas de autocuidado para proteger ojos, oídos, piel, nariz y lengua.']],
  ['OA 07', 'Ciencias de la Vida', 'Basal', 'Describir, dar ejemplos y practicar hábitos de vida saludable para mantener el cuerpo sano y prevenir enfermedades (actividad física, aseo del cuerpo, lavado de alimentos y alimentación saludable, entre otros).', ['Identifican hábitos de higiene corporal, lavado de manos y salud bucal.', 'Distinguen alimentos saludables y la importancia del ejercicio físico diario.']]
]);

addUnidad('1° Básico', CN, 'Unidad 2', 'Los seres vivos y su entorno', [
  ['OA 01', 'Ciencias de la Vida', 'Basal', 'Reconocer y observar, por medio de la exploración, que los seres vivos crecen, responden a estímulos del medio, se reproducen y necesitan agua, alimento y aire para vivir, comparándolos con las cosas no vivas.', ['Diferencian seres vivos de materia inerte a partir de sus características vitales.', 'Observan respuestas de plantas y animales frente a estímulos.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Observar y comparar animales de acuerdo a características como tamaño, cubierta corporal, estructuras de desplazamiento y hábitat, entre otras.', ['Clasifican animales según cubierta corporal (pelos, plumas, escamas) y forma de desplazamiento.']],
  ['OA 03', 'Ciencias de la Vida', 'Complementario', 'Observar e identificar, por medio de la exploración, las estructuras principales de las plantas: hojas, flores, tallos y raíces.', ['Reconocen raíz, tallo, hojas, flores y frutos en plantas del entorno.']],
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Reconocer y comparar diversas plantas y animales de nuestro país, considerando las características observables, y proponiendo medidas para su cuidado.', ['Identifican flora y fauna nativa de Chile y proponen acciones para su protección.']]
]);

addUnidad('1° Básico', CN, 'Unidad 3', 'Los materiales y sus usos cotidianos', [
  ['OA 08', 'Ciencias Físicas y Químicas', 'Basal', 'Explorar y describir los diferentes tipos de materiales en diversos objetos, clasificándolos según sus propiedades (goma-flexible, plástico-impermeable) e identificando su uso en la vida cotidiana.', ['Clasifican objetos cotidianos según el material (madera, metal, vidrio, plástico, papel) y sus propiedades (flexibilidad, transparencia, impermeabilidad).']],
  ['OA 09', 'Ciencias Físicas y Químicas', 'Complementario', 'Observar y describir los cambios que se producen en los materiales al aplicarles fuerza, luz, calor y agua.', ['Experimentan y registran cambios de forma, color o temperatura en materiales cotidianos.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Complementario', 'Diseñar instrumentos tecnológicos simples considerando diversos materiales y sus propiedades para resolver problemas cotidianos.', ['Construyen un objeto sencillo seleccionando materiales adecuados a su función.']]
]);

addUnidad('1° Básico', CN, 'Unidad 4', 'El Sol, la Tierra y las estaciones del año', [
  ['OA 11', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir y registrar el ciclo diario y las diferencias entre el día y la noche, a partir de la observación del Sol, la Luna, las estrellas y la luminosidad del cielo, entre otras, y sus efectos en los seres vivos y el ambiente.', ['Relacionan la presencia del Sol con el día y su ausencia con la noche.', 'Describen comportamientos de animales diurnos y nocturnos.']],
  ['OA 12', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Describir y comunicar los cambios del ciclo de las estaciones y sus efectos en los seres vivos y el ambiente.', ['Caracterizan otoño, invierno, primavera y verano y sus efectos en plantas y animales.']]
]);

// ============================================================================
// 2° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('2° Básico', CN, 'Unidad 1', 'Órganos internos del cuerpo humano y actividad física', [
  ['OA 07', 'Ciencias de la Vida', 'Basal', 'Identificar la ubicación y explicar la función de algunas partes del cuerpo que son fundamentales para vivir: corazón, pulmones, estómago, esqueleto y músculos.', ['Ubican corazón, pulmones, estómago, esqueleto y músculos en esquemas del cuerpo humano.', 'Explican la función básica de soporte, movimiento, respiración, circulación y digestión.']],
  ['OA 08', 'Ciencias de la Vida', 'Basal', 'Explicar la importancia de la actividad física para el desarrollo de los músculos y el fortalecimiento del corazón, proponiendo formas de ejercitarla e incorporarla en sus hábitos diarios.', ['Relacionan el ejercicio físico regular con el fortalecimiento muscular y cardiorrespiratorio.']]
]);

addUnidad('2° Básico', CN, 'Unidad 2', 'Animales vertebrados e invertebrados y sus hábitats', [
  ['OA 01', 'Ciencias de la Vida', 'Complementario', 'Observar, describir y clasificar los vertebrados en mamíferos, aves, reptiles, anfibios y peces, a partir de características como cubierta corporal, presencia de mamas y estructuras para la respiración, entre otras.', ['Clasifican animales vertebrados en sus cinco grupos principales según criterios observables.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Observar, describir y clasificar, por medio de la exploración, las características de los animales sin columna vertebral, como insectos, arácnidos, crustáceos, entre otros, y compararlos con los vertebrados.', ['Distinguen insectos, arácnidos y crustáceos y los comparan con los animales vertebrados.']],
  ['OA 03', 'Ciencias de la Vida', 'Basal', 'Observar y comparar las características de las etapas del ciclo de vida de distintos animales (mamíferos, aves, insectos y anfibios), relacionándolas con su hábitat.', ['Secuencian los ciclos de vida y metamorfosis de anfibios e insectos en comparación con mamíferos y aves.']],
  ['OA 04', 'Ciencias de la Vida', 'Complementario', 'Observar y comparar las características de distintos hábitats, identificando la luminosidad, humedad y temperatura necesarias para la supervivencia de los animales que habitan en él.', ['Relacionan las condiciones de diversos hábitats con los seres vivos que los habitan.']],
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Observar e identificar algunos animales nativos que se encuentran en peligro de extinción, así como el deterioro de su hábitat, proponiendo medidas para protegerlos.', ['Identifican especies nativas amenazadas en Chile (huemul, chinchilla, picaflor de Juan Fernández) y medidas para conservar su hábitat.']]
]);

addUnidad('2° Básico', CN, 'Unidad 3', 'El agua y sus estados en la naturaleza', [
  ['OA 09', 'Ciencias Físicas y Químicas', 'Basal', 'Observar y describir, por medio de la investigación experimental, algunas características del agua, como la de escurrir, adaptarse a la forma del recipiente, disolver algunos sólidos, como el azúcar y la sal, ser transparente e inodora, y evaporarse y congelarse con los cambios de temperatura.', ['Comprueban experimentalmente propiedades físicas del agua y su capacidad disolvente.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Complementario', 'Identificar y comparar, por medio de la exploración, los estados sólido, líquido y gaseoso del agua.', ['Reconocen hielo, agua líquida y vapor de agua como estados del agua.']],
  ['OA 11', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir el ciclo del agua en la naturaleza, reconociendo que el agua es un recurso preciado y proponiendo acciones cotidianas para su cuidado.', ['Explican las etapas del ciclo del agua (evaporación, condensación, precipitación) y prácticas de ahorro hídrico.']]
]);

addUnidad('2° Básico', CN, 'Unidad 4', 'El tiempo atmosférico y las estaciones', [
  ['OA 12', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Reconocer y describir algunas características del tiempo atmosférico, como precipitaciones (lluvia, granizo, nieve), viento y temperatura ambiente, entre otras, y sus cambios a lo largo del año.', ['Registran condiciones del tiempo atmosférico utilizando símbolos y mediciones sencillas.']],
  ['OA 13', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Medir algunas características del tiempo atmosférico, construyendo y utilizando algunos instrumentos tecnológicos útiles para su localidad, como termómetro, pluviómetro o veleta.', ['Construyen y utilizan un pluviómetro o veleta para registrar el tiempo atmosférico.']],
  ['OA 14', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir la relación de los cambios del tiempo atmosférico con las estaciones del año y sus efectos sobre los seres vivos y el ambiente.', ['Explican cómo las variaciones estacionales del tiempo atmosférico influyen en las plantas, los animales y las actividades humanas.']]
]);

// ============================================================================
// 3° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('3° Básico', CN, 'Unidad 1', 'La luz y el sonido', [
  ['OA 08', 'Ciencias Físicas y Químicas', 'Complementario', 'Distinguir fuentes naturales y artificiales de luz, como el Sol, las ampolletas y el fuego, entre otras.', ['Clasifican fuentes luminosas en naturales y artificiales.']],
  ['OA 09', 'Ciencias Físicas y Químicas', 'Basal', 'Investigar experimentalmente y explicar algunas características de la luz; por ejemplo: viaja en línea recta, se refleja, puede ser separada en colores.', ['Demuestran experimentalmente la propagación rectilínea, reflexión y descomposición de la luz blanca.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Basal', 'Investigar experimentalmente y explicar las características del sonido; por ejemplo: viaja en todas las direcciones, se absorbe o se refleja, se transmite por medio de distintos materiales, tiene tono e intensidad.', ['Relacionan el sonido con vibraciones y distinguen intensidad (fuerte/débil) y tono (agudo/grave).']]
]);

addUnidad('3° Básico', CN, 'Unidad 2', 'El Sistema Solar y los movimientos de la Tierra', [
  ['OA 11', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir las características de algunos de los componentes del Sistema Solar (Sol, planetas, lunas, cometas y asteroides) en relación con su tamaño, localización, apariencia y distancia relativa a la Tierra, entre otros.', ['Ordenan los planetas del Sistema Solar respecto del Sol y comparan sus características.']],
  ['OA 12', 'Ciencias de la Tierra y el Universo', 'Basal', 'Explicar, por medio de modelos, los movimientos de rotación y traslación, considerando sus efectos en la Tierra.', ['Modelan la rotación terrestre y la sucesión del día y la noche.', 'Explican la traslación terrestre y la inclinación del eje en el origen de las estaciones del año.']],
  ['OA 13', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Diseñar y construir modelos tecnológicos para explicar eventos del Sistema Solar, como las fases de la Luna y los eclipses de Sol y de Luna, entre otros.', ['Representan con modelos las fases lunares y los eclipses solar y lunar.']]
]);

addUnidad('3° Básico', CN, 'Unidad 3', 'Las plantas y su importancia para los seres vivos y el medioambiente', [
  ['OA 01', 'Ciencias de la Vida', 'Basal', 'Observar y describir, por medio de la investigación experimental, las necesidades de las plantas y su relación con la raíz, el tallo y las hojas.', ['Explican la absorción de agua por la raíz, el transporte por el tallo y la captación de luz y aire en las hojas.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Observar, registrar e identificar variadas plantas de nuestro país, incluyendo vegetales autóctonos y cultivos principales a nivel nacional y regional.', ['Reconocen especies vegetales nativas de Chile y cultivos agrícolas relevantes.']],
  ['OA 03', 'Ciencias de la Vida', 'Complementario', 'Observar y describir algunos cambios de las plantas con flor durante su ciclo de vida (germinación, crecimiento, reproducción, formación de la flor y del fruto), reconociendo la importancia de la polinización y de la dispersión de la semilla.', ['Secuencian el ciclo de vida de plantas con flor y explican la polinización y dispersión de semillas.']],
  ['OA 04', 'Ciencias de la Vida', 'Basal', 'Describir la importancia de las plantas para los seres vivos, el ser humano y el medio ambiente (por ejemplo: alimentación, aire para respirar, productos derivados, ornamentación, uso medicinal) proponiendo y comunicando medidas de cuidado.', ['Fundamentan el rol productor de oxígeno y alimento de las plantas y proponen medidas de reforestación y cuidado.']],
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Explicar la importancia de usar adecuadamente los recursos, proponiendo acciones y construyendo instrumentos tecnológicos para reutilizarlos, reducirlos y reciclarlos en la casa y en la escuela.', ['Aplican la regla de las 3R (reducir, reutilizar y reciclar) clasificando desechos escolares.']]
]);

addUnidad('3° Básico', CN, 'Unidad 4', 'Alimentación saludable e higiene de los alimentos', [
  ['OA 06', 'Ciencias de la Vida', 'Basal', 'Clasificar los alimentos, distinguiendo sus efectos sobre la salud, y proponer hábitos alimenticios saludables.', ['Agrupan alimentos según su función nutricional (estructurales, energéticos, reguladores) e interpretan sellos de advertencia nutricional.']],
  ['OA 07', 'Ciencias de la Vida', 'Complementario', 'Proponer, comunicar y ejercitar buenas prácticas de higiene en la manipulación de alimentos para prevenir enfermedades.', ['Aplican normas de higiene en el lavado de manos y conservación de alimentos para prevenir infecciones alimentarias.']]
]);

// ============================================================================
// 4° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('4° Básico', CN, 'Unidad 1', 'Propiedades de la materia y las fuerzas', [
  ['OA 09', 'Ciencias Físicas y Químicas', 'Complementario', 'Demostrar, por medio de la investigación experimental, que la materia tiene masa y ocupa espacio, usando materiales del entorno.', ['Comprueban que sólidos, líquidos y gases tienen masa y volumen.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Complementario', 'Comparar los tres estados de la materia (sólido, líquido y gaseoso) en relación con criterios como la capacidad de fluir, cambiar de forma y volumen, entre otros.', ['Comparan forma definida o variable y capacidad de fluir o comprimirse en sólidos, líquidos y gases.']],
  ['OA 11', 'Ciencias Físicas y Químicas', 'Basal', 'Medir la masa, el volumen y la temperatura de la materia (sólido, líquido y gaseoso), utilizando instrumentos y unidades de medida apropiados.', ['Miden masa en gramos/kilogramos con balanza, volumen en mL/L con probeta y temperatura en °C con termómetro.']],
  ['OA 12', 'Ciencias Físicas y Químicas', 'Basal', 'Demostrar, por medio de la investigación experimental, los efectos de la aplicación de fuerzas sobre objetos, considerando cambios en la forma, la rapidez y la dirección del movimiento, entre otros.', ['Experimentan los efectos de fuerzas de contacto y a distancia (rozamiento, magnética, peso) sobre cuerpos.']]
]);

addUnidad('4° Básico', CN, 'Unidad 2', 'La Tierra: estructura interna, placas tectónicas y riesgos naturales', [
  ['OA 15', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Describir, por medio de modelos, que la Tierra tiene una estructura de capas (corteza, manto y núcleo) con características distintivas en cuanto a su composición, rigidez y temperatura.', ['Caracterizan corteza, manto y núcleo terrestre en función de su profundidad, estado y temperatura.']],
  ['OA 16', 'Ciencias de la Tierra y el Universo', 'Basal', 'Explicar los cambios de la superficie de la Tierra a partir de la interacción de sus capas y los movimientos de las placas tectónicas (sismos, tsunamis y erupciones volcánicas).', ['Relacionan el movimiento de las placas tectónicas con la ocurrencia de sismos, tsunamis y actividad volcánica en Chile.']],
  ['OA 17', 'Ciencias de la Tierra y el Universo', 'Basal', 'Proponer medidas de prevención y seguridad ante riesgos naturales en la escuela, la calle y el hogar, para desarrollar una cultura preventiva.', ['Practican planes de seguridad escolar y familiar frente a sismos, tsunamis y erupciones volcánicas.']]
]);

addUnidad('4° Básico', CN, 'Unidad 3', 'Sistemas esquelético, muscular y nervioso', [
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Identificar y describir, usando modelos, estructuras del sistema esquelético y algunas de sus funciones como protección (costillas y cráneo), soporte (vértebras y columna vertebral) y movimiento (pelvis y fémur).', ['Reconocen huesos principales del esqueleto humano y su rol de soporte, protección y movimiento.']],
  ['OA 06', 'Ciencias de la Vida', 'Basal', 'Explicar, con apoyo de modelos, el movimiento del cuerpo, considerando la acción coordinada de músculos, huesos, tendones y articulación (ejemplo: brazo y pierna), y describir los beneficios de la actividad física para el sistema músculo-esquelético.', ['Explican la acción antagónica de músculos (como bíceps y tríceps) junto a huesos, tendones y articulaciones.']],
  ['OA 07', 'Ciencias de la Vida', 'Basal', 'Identificar estructuras del sistema nervioso y describir algunas de sus funciones, como conducción de información (médula espinal y nervios) y elaboración y control (cerebro).', ['Describen la función del cerebro, la médula espinal y los nervios en las respuestas voluntarias y reflejas.']],
  ['OA 08', 'Ciencias de la Vida', 'Complementario', 'Investigar en diversas fuentes y comunicar los efectos que produce el consumo excesivo de alcohol en la salud humana (como descoordinación, confusión y lentitud, entre otras).', ['Explican los efectos nocivos del alcohol sobre el sistema nervioso y la salud integral.']]
]);

addUnidad('4° Básico', CN, 'Unidad 4', 'Los ecosistemas, cadenas alimentarias y protección ambiental', [
  ['OA 01', 'Ciencias de la Vida', 'Basal', 'Reconocer, por medio de la exploración, que un ecosistema está compuesto por elementos vivos (animales, plantas, etc.) y no vivos (piedras, aguas, tierra, etc.) que interactúan entre sí.', ['Distinguen factores bióticos y abióticos y sus interacciones en ecosistemas terrestres y acuáticos.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Observar y comparar adaptaciones de plantas y animales para sobrevivir en los ecosistemas en relación con su estructura y conducta; por ejemplo: cubierta corporal, camuflaje, tipo de hojas, hibernación, entre otras.', ['Dan ejemplos de adaptaciones morfológicas y conductuales de flora y fauna chilena.']],
  ['OA 03', 'Ciencias de la Vida', 'Complementario', 'Dar ejemplos de cadenas alimentarias, identificando la función de los organismos productores, consumidores y descomponedores, en diferentes ecosistemas de Chile.', ['Representan cadenas tróficas identificando productores, consumidores (primarios, secundarios) y descomponedores.']],
  ['OA 04', 'Ciencias de la Vida', 'Basal', 'Analizar los efectos de la actividad humana en ecosistemas de Chile, proponiendo medidas para protegerlos (parques nacionales y vedas, entre otras).', ['Evalúan impactos de la tala, caza, incendios y contaminación, y valoran las áreas silvestres protegidas y vedas.']]
]);

// ============================================================================
// 5° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('5° Básico', CN, 'Unidad 1', 'El agua en el planeta y su cuidado', [
  ['OA 12', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir la distribución del agua dulce y salada en la Tierra, considerando océanos, glaciares, ríos y lagos, aguas subterráneas, nubes, vapor de agua, etc., y comparar sus volúmenes, reconociendo la escasez relativa de agua dulce.', ['Comparan en gráficos la proporción de agua salada y agua dulce en la hidrósfera y las reservas de glaciares en Chile.']],
  ['OA 13', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Analizar y describir las características de los océanos y lagos: variación de temperatura, luminosidad y presión en relación con la profundidad, diversidad de flora y fauna, movimiento de las aguas, como olas, mareas y corrientes (El Niño y Humboldt).', ['Explican cómo varían temperatura, presión y luz con la profundidad marina y la importancia de la corriente de Humboldt.']],
  ['OA 14', 'Ciencias de la Tierra y el Universo', 'Basal', 'Investigar y explicar efectos positivos y negativos de la actividad humana en los océanos, lagos, ríos, glaciares, entre otros, proponiendo acciones de protección de las reservas hídricas en Chile y comunicando sus resultados.', ['Analizan fuentes de contaminación hídrica y proponen medidas concretas de protección y uso sustentable del agua.']]
]);

addUnidad('5° Básico', CN, 'Unidad 2', 'Organización de los seres vivos y sistemas del cuerpo humano', [
  ['OA 01', 'Ciencias de la Vida', 'Basal', 'Reconocer y explicar que los seres vivos están formados por una o más células y que estas se organizan en tejidos, órganos y sistemas.', ['Secuencian los niveles de organización biológica: célula, tejido, órgano, sistema y organismo.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Identificar y describir, por medio de modelos, las estructuras básicas del sistema digestivo (boca, esófago, estómago, hígado, intestino delgado, intestino grueso, recto y ano) y sus funciones en la digestión, la absorción de alimentos y la eliminación de desechos.', ['Explican los procesos de ingestión, digestión, absorción de nutrientes y egestión.']],
  ['OA 03', 'Ciencias de la Vida', 'Complementario', 'Explicar, por medio de modelos, la respiración (inspiración-espiración-intercambio de oxígeno y dióxido de carbono), identificando las estructuras básicas del sistema respiratorio (nariz, tráquea, bronquios, alvéolos, pulmones).', ['Describen la mecánica ventilatoria y el intercambio gaseoso en los alvéolos pulmonares.']],
  ['OA 04', 'Ciencias de la Vida', 'Basal', 'Explicar la función de transporte del sistema circulatorio (sustancias alimenticias, oxígeno y dióxido de carbono), identificando sus estructuras básicas (corazón, vasos sanguíneos y sangre).', ['Explican cómo el sistema circulatorio integra la nutrición y respiración celular transportando nutrientes, O2 y desechos.']]
]);

addUnidad('5° Básico', CN, 'Unidad 3', 'Nutrición, microorganismos y salud humana', [
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Analizar el consumo diario de alimentos (variedad, tamaño y frecuencia de porciones), reconociendo los alimentos para el crecimiento, la reparación, el desarrollo y el movimiento del cuerpo.', ['Evalúan dietas cotidianas según el aporte de proteínas, carbohidratos, lípidos, vitaminas, minerales y agua.']],
  ['OA 06', 'Ciencias de la Vida', 'Basal', 'Investigar en diversas fuentes y comunicar los efectos nocivos que produce el cigarrillo (humo del tabaco) en los sistemas circulatorio y respiratorio.', ['Explican las consecuencias del tabaquismo sobre los pulmones, vías respiratorias y sistema cardiovascular.']],
  ['OA 07', 'Ciencias de la Vida', 'Basal', 'Investigar e identificar algunos microorganismos beneficiosos y dañinos para la salud (bacterias, virus y hongos), y proponer medidas de cuidado e higiene del cuerpo.', ['Distinguen agentes infecciosos (bacterias, virus, hongos) de la microbiota beneficiosa y fundamentan hábitos de prevención.']]
]);

addUnidad('5° Básico', CN, 'Unidad 4', 'La energía eléctrica y sus circuitos', [
  ['OA 08', 'Ciencias Físicas y Químicas', 'Complementario', 'Reconocer los cambios que experimenta la energía eléctrica al pasar de una forma a otra (eléctrica a calórica, sonora, lumínica, etc.) e investigar los principales aportes de científicos en su estudio a través del tiempo.', ['Identifican transformaciones de energía eléctrica en artefactos del hogar.']],
  ['OA 09', 'Ciencias Físicas y Químicas', 'Basal', 'Construir un circuito eléctrico simple (cable, ampolleta, interruptor y pila), usarlo para resolver problemas cotidianos y explicar su funcionamiento.', ['Arman y representan esquemáticamente circuitos eléctricos simples identificando generador, conductor, receptor e interruptor.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Complementario', 'Observar y distinguir, por medio de la investigación experimental, los materiales conductores (cobre y aluminio) y aisladores (plástico y goma) de electricidad, relacionándolos con la manipulación segura de artefactos tecnológicos y circuitos eléctricos domiciliarios.', ['Clasifican materiales en conductores y aislantes eléctricos y aplican normas de seguridad eléctrica.']],
  ['OA 11', 'Ciencias Físicas y Químicas', 'Basal', 'Explicar la importancia de la energía eléctrica en la vida cotidiana y proponer medidas para promover su ahorro y su uso responsable.', ['Proponen medidas de eficiencia y ahorro energético en el hogar y el colegio.']]
]);

// ============================================================================
// 6° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('6° Básico', CN, 'Unidad 1', 'Las capas de la Tierra y la actividad humana', [
  ['OA 16', 'Ciencias de la Tierra y el Universo', 'Basal', 'Describir las características de las capas de la Tierra (atmósfera, litósfera e hidrósfera) que posibilitan el desarrollo de la vida y proveen recursos para el ser humano, y proponer medidas de protección de dichas capas.', ['Caracterizan atmósfera, hidrósfera y litósfera y explican cómo sus condiciones hacen posible la vida.', 'Evalúan efectos de la contaminación atmosférica, hídrica y del suelo, proponiendo medidas de mitigación.']],
  ['OA 17', 'Ciencias de la Tierra y el Universo', 'Complementario', 'Investigar experimentalmente la formación del suelo, sus propiedades (como color, textura y capacidad de retención de agua) y la importancia de protegerlo de la contaminación, comunicando sus resultados.', ['Comparan tipos de suelo (arenoso, limoso, arcilloso, orgánico) según su permeabilidad y fertilidad.']],
  ['OA 18', 'Ciencias de la Tierra y el Universo', 'Basal', 'Explicar las consecuencias de la erosión sobre la superficie de la Tierra, identificando los agentes que la provocan, como el viento, el agua y las actividades humanas.', ['Distinguen erosión natural (hídrica, eólica) y antrópica (deforestación, sobrepastoreo) y proponen soluciones de conservación de suelos.']]
]);

addUnidad('6° Básico', CN, 'Unidad 2', 'Sistema reproductor, pubertad y vida saludable', [
  ['OA 04', 'Ciencias de la Vida', 'Basal', 'Identificar y describir las funciones de las principales estructuras del sistema reproductor humano femenino y masculino, y describir el proceso de la fecundación y el desarrollo embrionario.', ['Describen la anatomía y función de los órganos reproductores masculino y femenino, los gametos y la fecundación.']],
  ['OA 05', 'Ciencias de la Vida', 'Basal', 'Describir y comparar los cambios que se producen en la pubertad en mujeres y hombres, reconociéndola como una etapa del desarrollo humano.', ['Explican los cambios físicos, psicológicos y sociales de la pubertad y adolescencia como parte natural del desarrollo.']],
  ['OA 06', 'Ciencias de la Vida', 'Complementario', 'Reconocer los beneficios de realizar actividad física en forma regular y de cuidar la higiene corporal en el período de la pubertad.', ['Relacionan la higiene diaria y la actividad física con el bienestar físico y emocional en la adolescencia.']],
  ['OA 07', 'Ciencias de la Vida', 'Basal', 'Investigar y comunicar los efectos nocivos de algunas drogas para la salud, proponiendo conductas de protección.', ['Analizan factores de riesgo y de protección frente al consumo de tabaco, alcohol y otras drogas.']]
]);

addUnidad('6° Básico', CN, 'Unidad 3', 'La fotosíntesis y las relaciones alimentarias en los ecosistemas', [
  ['OA 01', 'Ciencias de la Vida', 'Basal', 'Explicar, a partir de una investigación experimental, los requerimientos de agua, dióxido de carbono y energía lumínica para la producción de azúcar y la liberación de oxígeno en la fotosíntesis, comunicando sus resultados y los aportes de científicos en este campo a través del tiempo.', ['Explican los reactantes (agua, CO2, energía lumínica) y productos (glucosa y O2) del proceso de fotosíntesis.']],
  ['OA 02', 'Ciencias de la Vida', 'Complementario', 'Representar, por medio de modelos, la transferencia de energía y materia desde los organismos fotosintéticos a otros seres vivos por medio de cadenas y redes alimentarias en diferentes ecosistemas.', ['Construyen redes tróficas analizando el flujo de materia y energía desde los organismos autótrofos.']],
  ['OA 03', 'Ciencias de la Vida', 'Basal', 'Analizar los efectos de la actividad humana sobre las redes alimentarias.', ['Evalúan cómo la introducción de especies exóticas, la sobreexplotación y la contaminación alteran el equilibrio de las tramas tróficas.']]
]);

addUnidad('6° Básico', CN, 'Unidad 4', 'La energía, el calor y los cambios de estado de la materia', [
  ['OA 08', 'Ciencias Físicas y Químicas', 'Basal', 'Explicar que la energía es necesaria para que los objetos cambien y los seres vivos realicen sus procesos vitales, y que la mayoría de los recursos energéticos proviene directa o indirectamente del Sol.', ['Reconocen manifestaciones de la energía (cinética, potencial, térmica, lumínica, química) y su conservación.']],
  ['OA 09', 'Ciencias Físicas y Químicas', 'Complementario', 'Investigar en forma experimental la transformación de la energía de una forma a otra, dando ejemplos y comunicando sus conclusiones.', ['Describen transformaciones energéticas en procesos cotidianos y naturales.']],
  ['OA 10', 'Ciencias Físicas y Químicas', 'Basal', 'Clasificar los recursos naturales energéticos en no renovables y renovables y proponer medidas para el uso responsable de la energía.', ['Comparan energías renovables (solar, eólica, geotérmica, hidráulica) con combustibles fósiles no renovables.']],
  ['OA 13', 'Ciencias Físicas y Químicas', 'Basal', 'Demostrar, mediante la investigación experimental, los cambios de estado de la materia, como fusión, evaporación, ebullición, condensación, solidificación y sublimación, en base al modelo corpuscular.', ['Explican los cambios de estado por absorción o liberación de energía térmica utilizando el modelo corpuscular de la materia.']],
  ['OA 14', 'Ciencias Físicas y Químicas', 'Complementario', 'Diferenciar entre calor y temperatura, considerando que el calor es una forma de energía que fluye entre cuerpos a distinta temperatura.', ['Distinguen conceptual y experimentalmente temperatura (agitación térmica) de calor (energía en tránsito) y equilibrio térmico.']]
]);

// ============================================================================
// 7° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('7° Básico', CN, 'Unidad 1', 'Comportamiento de la materia y su clasificación', [
  ['OA 13', 'Química', 'Basal', 'Investigar experimentalmente y explicar el comportamiento de gases ideales en situaciones cotidianas, considerando factores como la presión, el volumen y la temperatura y las leyes que los modelan.', ['Explican las leyes de Boyle, Charles y Gay-Lussac relacionando presión, volumen y temperatura a partir de la teoría cinético-molecular.']],
  ['OA 14', 'Química', 'Basal', 'Investigar experimentalmente y explicar la clasificación de la materia en sustancias puras y mezclas (homogéneas y heterogéneas), los procedimientos de separación de mezclas (decantación, filtración, tamizado y destilación), considerando su aplicación industrial en la metalurgia, la minería y el tratamiento de aguas servidas.', ['Diferencian elementos, compuestos y mezclas homogéneas y heterogéneas.', 'Aplican técnicas de separación de mezclas (filtración, decantación, tamizado y destilación).']],
  ['OA 15', 'Química', 'Complementario', 'Investigar experimentalmente los cambios de la materia y argumentar a partir de evidencias empíricas que estos pueden ser físicos o químicos.', ['Distinguen cambios físicos de reacciones químicas a partir de evidencias observables (cambio de color, liberación de gas, variación térmica).']]
]);

addUnidad('7° Básico', CN, 'Unidad 2', 'Fuerza y ciencias de la Tierra', [
  ['OA 07', 'Física', 'Basal', 'Planificar y conducir una investigación experimental para proveer evidencias que expliquen los efectos de las fuerzas gravitacional, de roce y elástica, entre otras, en situaciones cotidianas.', ['Representan vectores de fuerza y analizan efectos del peso, roce, fuerza normal y ley de Hooke.']],
  ['OA 08', 'Física', 'Complementario', 'Explorar y describir cualitativamente la presión, considerando sus efectos en: sólidos, como en herramientas y calzado; líquidos, como en máquinas hidráulicas; gases, como en la atmósfera.', ['Relacionan fuerza y área de contacto en la presión en sólidos, fluidos y presión atmosférica.']],
  ['OA 09', 'Física y Tierra', 'Basal', 'Explicar, con el modelo de la tectónica de placas, los patrones de distribución de la actividad geológica (volcanes y sismos), los tipos de interacción entre las placas (convergente, divergente y transformante) y su importancia en la teoría de la deriva continental.', ['Explican los límites convergente, divergente y transformante y las corrientes de convección del manto.']],
  ['OA 10', 'Física y Tierra', 'Complementario', 'Explicar, sobre la base de evidencias y por medio de modelos, la actividad volcánica y sus consecuencias en la naturaleza y la sociedad.', ['Modelan la formación del magma y erupciones volcánicas, evaluando riesgos asociados.']],
  ['OA 11', 'Física y Tierra', 'Complementario', 'Crear modelos que expliquen el ciclo de las rocas, la formación y modificación de las rocas ígneas, metamórficas y sedimentarias, en función de la temperatura, la presión y la erosión.', ['Explican las transformaciones entre rocas ígneas, sedimentarias y metamórficas.']],
  ['OA 12', 'Física y Tierra', 'Basal', 'Demostrar, por medio de modelos, que comprenden que el clima en la Tierra, tanto local como global, es dinámico y se produce por la interacción de múltiples variables, como la presión, la temperatura y la humedad atmosférica, la circulación de la atmósfera y del agua, la posición geográfica, la rotación y la traslación de la Tierra.', ['Distinguen tiempo atmosférico de clima y analizan factores y elementos climáticos y el cambio climático global.']]
]);

addUnidad('7° Básico', CN, 'Unidad 3', 'Microorganismos y barreras defensivas del cuerpo humano', [
  ['OA 04', 'Biología', 'Complementario', 'Desarrollar modelos que expliquen las barreras defensivas (primaria, secundaria y terciaria) del cuerpo humano, considerando: agentes patógenos como Escherichia coli y el virus de la gripe; el uso de vacunas y medicamentos; alteraciones en sus respuestas como en las alergias, las enfermedades autoinmunes y los rechazos de trasplantes de órganos.', ['Explican la inmunidad innata (barreras físicas y fagocitosis) y adaptativa (linfocitos y anticuerpos) y el mecanismo de acción de las vacunas.']],
  ['OA 05', 'Biología', 'Basal', 'Comparar, usando modelos, microorganismos como virus, bacterias y hongos, en relación con: características estructurales (tamaño, forma y estructuras); características comunes de los seres vivos (alimentación, reproducción, respiración, etc.); efectos sobre la salud humana (positivos y negativos).', ['Comparan estructuras y reproducción de bacterias, hongos, protozoos y virus.', 'Valoran aplicaciones biotecnológicas de los microorganismos y el uso responsable de antibióticos y antivirales.']],
  ['OA 06', 'Biología', 'Complementario', 'Investigar en diversas fuentes las relaciones ecológicas entre microorganismos y otros seres vivos.', ['Describen relaciones simbióticas, descomponedoras y patógenas de los microorganismos.']]
]);

addUnidad('7° Básico', CN, 'Unidad 4', 'Sexualidad, reproducción humana y autocuidado', [
  ['OA 01', 'Biología', 'Complementario', 'Explicar los aspectos biológicos, afectivos y sociales que se integran en la sexualidad, considerando los cambios físicos que ocurren durante la pubertad y la responsabilidad afectiva.', ['Reconocen las dimensiones biológica, psicológica, afectiva y sociocultural de la sexualidad humana.']],
  ['OA 02', 'Biología', 'Basal', 'Explicar la formación de un nuevo individuo, considerando: el ciclo menstrual (días fértiles, menstruación y ovulación); la participación de espermatozoides y ovocitos; métodos de control de la natalidad; la paternidad y la maternidad responsables.', ['Explican las fases del ciclo ovárico y uterino, la fecundación y la eficacia de diversos métodos de regulación de la fertilidad.']],
  ['OA 03', 'Biología', 'Basal', 'Describir, por medio de la investigación, las características de infecciones de transmisión sexual (ITS), como sida y herpes, entre otros, considerando sus mecanismos de transmisión y medidas de prevención.', ['Identifican agentes causales, vías de transmisión y medidas de prevención de ITS (VIH/sida, sífilis, gonorrea, VPH).']]
]);

// ============================================================================
// 8° BÁSICO - CIENCIAS NATURALES
// ============================================================================
addUnidad('8° Básico', CN, 'Unidad 1', 'Nutrición y salud: integración de sistemas en el cuerpo humano', [
  ['OA 05', 'Biología', 'Basal', 'Explicar, basados en evidencias, la interacción de sistemas del cuerpo humano organizados por estructuras especializadas que contribuyen a su equilibrio, considerando: la digestión de los alimentos por medio de la acción de enzimas digestivas y su absorción o paso a la sangre; el rol del sistema circulatorio en el transporte de sustancias como nutrientes, gases, desechos metabólicos y anticuerpos; el proceso de ventilación pulmonar e intercambio gaseoso a nivel alveolar; el rol del sistema excretor en relación con la filtración de la sangre, la regulación de la cantidad de agua en el cuerpo y la eliminación de desechos.', ['Explican de forma integrada cómo los sistemas digestivo, respiratorio, circulatorio y excretor suministran nutrientes y oxígeno a las células y eliminan desechos metabólicos.']],
  ['OA 06', 'Biología', 'Complementario', 'Investigar experimentalmente y explicar las características de los nutrientes (carbohidratos, proteínas, grasas, vitaminas, minerales y agua) en los alimentos y sus efectos para la salud humana.', ['Calculan tasa metabólica basal y requerimientos nutricionales equilibrados.']],
  ['OA 07', 'Biología', 'Basal', 'Analizar y evaluar, basados en evidencias, los factores que contribuyen a mantener un cuerpo saludable, proponiendo un plan que considere: un consumo de alimentos equilibrado, un ejercicio físico regular y evitar el consumo de alcohol, tabaco y drogas.', ['Diseñan un plan integral de salud preventiva y vida activa basado en indicadores nutricionales y fisiológicos.']]
]);

addUnidad('8° Básico', CN, 'Unidad 2', 'La célula como unidad funcional y estructural de la vida', [
  ['OA 01', 'Biología', 'Basal', 'Explicar que los modelos de la célula han evolucionado sobre la base de evidencias, como las aportadas por científicos como Hooke, Leeuwenhoek, Virchow, Schleiden y Schwann.', ['Explican los postulados de la teoría celular y el aporte de la microscopía.']],
  ['OA 02', 'Biología', 'Basal', 'Desarrollar modelos que expliquen la relación entre la función de una célula y sus partes, considerando: sus estructuras (núcleo, citoplasma, membrana celular, pared celular, vacuolas, mitocondria, cloroplastos, entre otros); células eucariontes (animal y vegetal) y procariontes; tipos celulares (como intestinal, muscular, nervioso, pancreático).', ['Comparan células procariontes y eucariontes (animales y vegetales) identificando la función de cada organelo.', 'Relacionan la diferenciación celular con la función específica de distintos tejidos.']],
  ['OA 03', 'Biología', 'Complementario', 'Explicar, por medio de la experimentación, los mecanismos de intercambio de partículas entre la célula (en animales y plantas) y su ambiente por difusión y osmosis.', ['Explican el transporte pasivo (difusión simple, facilitada y osmosis) y activo a través de la membrana plasmática.']],
  ['OA 04', 'Biología', 'Complementario', 'Crear modelos que expliquen el rol de las plantas en el flujo de materia y energía, considerando estructuras como estomas, xilema y floema.', ['Modelan el transporte de savia bruta y elaborada y el intercambio gaseoso estomático.']]
]);

addUnidad('8° Básico', CN, 'Unidad 3', 'Electricidad y energía térmica', [
  ['OA 08', 'Física', 'Complementario', 'Analizar las fuerzas eléctricas, considerando: los tipos de electricidad; los métodos de electrización (fricción, contacto e inducción); la planificación, conducción y evaluación de experimentos para evidenciar las interacciones eléctricas.', ['Explican fenómenos electrostáticos de atracción y repulsión y métodos de electrización.']],
  ['OA 09', 'Física', 'Complementario', 'Investigar, explicar y evaluar las tecnologías que permiten la generación de energía eléctrica, como ocurre en pilas o baterías, en paneles fotovoltaicos y en generadores (eólicos, hidroeléctricos o nucleares, entre otros).', ['Comparan el funcionamiento e impacto ambiental de diversas centrales generadoras de electricidad.']],
  ['OA 10', 'Física', 'Basal', 'Analizar un circuito eléctrico domiciliario y comparar experimentalmente los circuitos eléctricos en serie y en paralelo, en relación con la energía eléctrica, la diferencia de potencial, la intensidad de corriente, la potencia eléctrica, la resistencia eléctrica y la eficiencia energética.', ['Aplican la Ley de Ohm (V = I · R) y calculan potencia y consumo eléctrico en circuitos en serie y en paralelo.']],
  ['OA 11', 'Física', 'Basal', 'Desarrollar modelos e investigaciones experimentales que expliquen el calor como un proceso de transferencia de energía térmica entre dos o más cuerpos que están a diferentes temperaturas, considerando: las formas en que se propaga (conducción, convección y radiación); los efectos que produce (cambio de temperatura, deformación y cambio de estado); la cantidad de calor cedida y absorbida en procesos térmicos.', ['Explican la propagación del calor por conducción, convección y radiación, la dilatación térmica y el calor específico.']]
]);

addUnidad('8° Básico', CN, 'Unidad 4', 'Estudio y organización de la materia: modelos atómicos y tabla periódica', [
  ['OA 12', 'Química', 'Basal', 'Investigar y analizar cómo ha evolucionado el conocimiento de la constitución de la materia, considerando los aportes y las evidencias de: la teoría atómica de Dalton; los modelos atómicos desarrollados por Thomson, Rutherford y Bohr, entre otros.', ['Comparan la evolución de los modelos atómicos de Dalton, Thomson, Rutherford y Bohr, e identifican número atómico (Z) y másico (A).']],
  ['OA 13', 'Química', 'Complementario', 'Desarrollar modelos que expliquen que la materia está constituida por átomos que interactúan, generando diversas partículas y sustancias.', ['Representan enlaces iónicos y covalentes y estructuras de Lewis sencillas.']],
  ['OA 14', 'Química', 'Basal', 'Usar la tabla periódica como un modelo para predecir las propiedades relativas de los elementos químicos basados en los patrones de sus átomos, considerando: el número atómico; la masa atómica; la conductividad eléctrica; la conductividad térmica; el brillo; los enlaces que se pueden formar.', ['Ubican elementos en grupos y períodos de la tabla periódica y distinguen metales, no metales, metaloides y gases nobles.']]
]);

// ============================================================================
// I° MEDIO - BIOLOGÍA, FÍSICA Y QUÍMICA
// ============================================================================
addUnidad('I° Medio', 'BIOLOGIA', 'Unidad 1', 'Evolución y biodiversidad', [
  ['OA 01', 'Evolución y Biodiversidad', 'Complementario', 'Explicar, basándose en evidencias, que los fósiles se forman a partir de restos de animales y plantas, que se forman rocas sedimentarias y que se ubican de acuerdo a su antigüedad en los estratos de la Tierra.', ['Interpretan el registro fósil y la estratigrafía como evidencias de la historia evolutiva de la vida.']],
  ['OA 02', 'Evolución y Biodiversidad', 'Basal', 'Analizar e interpretar datos para proveer de evidencias que apoyen que la diversidad de organismos es el resultado de la evolución, considerando: evidencias de la evolución (como el registro fósil, las estructuras anatómicas homólogas, la embriología y las secuencias de ADN); los postulados de la teoría de la selección natural; los aportes de científicos como Darwin y Wallace a las teorías evolutivas.', ['Explican las evidencias anatómicas, embriológicas, biogeográficas y moleculares de la evolución.', 'Aplican los principios de la selección natural de Darwin y Wallace para explicar la adaptación de las especies.']],
  ['OA 03', 'Evolución y Biodiversidad', 'Complementario', 'Explicar, basados en evidencias, que la clasificación de la diversidad de organismos se construye a través del tiempo sobre la base de criterios taxonómicos que permiten organizarlos en grupos y subgrupos, identificando sus relaciones de parentesco con ancestros comunes.', ['Interpretan árboles filogenéticos y criterios taxonómicos de clasificación biológica.']]
]);

addUnidad('I° Medio', 'BIOLOGIA', 'Unidad 2', 'Organismos en ecosistemas', [
  ['OA 04', 'Ecología', 'Basal', 'Investigar y explicar cómo se organizan e interactúan los seres vivos en diversos ecosistemas, a partir de ejemplos de Chile, considerando: los niveles de organización de los seres vivos (como organismo, población, comunidad, ecosistema); las interacciones biológicas (como depredación, competencia, comensalismo, mutualismo, parasitismo).', ['Analizan propiedades de poblaciones (densidad, crecimiento exponencial y logístico) e interacciones intra e interespecíficas en ecosistemas chilenos.']],
  ['OA 05', 'Ecología', 'Complementario', 'Analizar e interpretar los factores no biológicos que se relacionan con la dinámica de los ecosistemas y la distribución de los organismos.', ['Relacionan factores abióticos con la distribución y abundancia de poblaciones.']]
]);

addUnidad('I° Medio', 'BIOLOGIA', 'Unidad 3', 'Materia y energía en ecosistemas', [
  ['OA 06', 'Ecología y Energía', 'Basal', 'Desarrollar modelos que expliquen: el ciclo del carbono, el nitrógeno, el agua y el fósforo, y su importancia biológica; los flujos de energía en un ecosistema (redes y pirámides tróficas); la eficiencia en la transferencia de energía entre niveles tróficos.', ['Explican la complementariedad entre fotosíntesis y respiración celular en el flujo de materia y energía.', 'Modelan pirámides ecológicas (regla del 10%) y los ciclos biogeoquímicos del C, N, P y H2O.']],
  ['OA 07', 'Ecología y Energía', 'Complementario', 'Explicar, por medio de una investigación, el rol de la fotosíntesis y la respiración celular en el ecosistema considerando el flujo de la energía y el ciclo de la materia.', ['Comparan insumos y productos energéticos de la fotosíntesis y la respiración celular.']]
]);

addUnidad('I° Medio', 'BIOLOGIA', 'Unidad 4', 'Impactos en ecosistemas y sustentabilidad', [
  ['OA 08', 'Ecología y Sustentabilidad', 'Basal', 'Explicar y evaluar los efectos de acciones humanas (conservación ambiental, cultivos, forestación y deforestación, entre otras) y de fenómenos naturales (sequías, erupciones volcánicas, entre otras) en relación con: el equilibrio de los ecosistemas; la disponibilidad de recursos naturales renovables y no renovables; las posibles medidas para un desarrollo sustentable.', ['Evalúan la huella ecológica, la pérdida de biodiversidad y el fenómeno de bioacumulación, proponiendo estrategias de desarrollo sustentable.']]
]);

// I° MEDIO - FÍSICA
addUnidad('I° Medio', 'FISICA', 'Unidad 1', 'Las ondas y el sonido', [
  ['OA 09', 'Ondas', 'Basal', 'Demostrar que comprende, por medio de la creación de modelos y experimentos, que las ondas transmiten energía y que se pueden reflejar, refractar y absorber, explicando y considerando: sus características (amplitud, frecuencia, longitud de onda y rapidez de propagación, entre otras); los criterios para clasificarlas (mecánicas, electromagnéticas, transversales, longitudinales); la transmisión y percepción del sonido.', ['Calculan frecuencia, período, longitud de onda y rapidez de propagación (v = λ · f).', 'Explican fenómenos ondulatorios del sonido: reflexión (eco, reverberación), refracción, difracción y efecto Doppler.']],
  ['OA 10', 'Ondas', 'Complementario', 'Explicar fenómenos del sonido perceptibles por las personas, como el eco, la resonancia y el efecto Doppler, entre otros, utilizando el modelo ondulatorio y por medio de la experimentación, considerando sus aplicaciones tecnológicas (ecógrafo, sonar, estetoscopio).', ['Relacionan el espectro audible, infrasonido y ultrasonido con aplicaciones médicas y tecnológicas.']]
]);

addUnidad('I° Medio', 'FISICA', 'Unidad 2', 'La luz y la óptica geométrica', [
  ['OA 11', 'Ondas y Luz', 'Basal', 'Explicar fenómenos luminosos, como la reflexión, la refracción, la interferencia y el efecto Doppler, entre otros, por medio de la experimentación y el uso de modelos, considerando: los modelos corpuscular y ondulatorio de la luz; las características y la propagación de la luz; la formación de imágenes (espejos y lentes); la formación de colores (difracción, colores primarios y secundarios, filtros); sus aplicaciones tecnológicas (camaras, telescopios, fibra óptica).', ['Explican la formación de imágenes en espejos planos y curvos (cóncavos y convexos) y en lentes convergentes y divergentes.', 'Describen el espectro electromagnético y las aplicaciones de sus distintas radiaciones.']]
]);

addUnidad('I° Medio', 'FISICA', 'Unidad 3', 'Sismología y ondas sísmicas', [
  ['OA 12', 'Tierra y Sismología', 'Complementario', 'Explorar y describir el funcionamiento del oído y de la vista humana en relación con la percepción de ondas sonoras y luminosas, y explicar el uso de lentes ópticos y audífonos.', ['Explican los defectos de la visión (miopía, hipermetropía, astigmatismo) y su corrección óptica.']],
  ['OA 13', 'Tierra y Sismología', 'Basal', 'Describir el origen y la propagación, por medio del modelo ondulatorio, de la energía liberada en un sismo, considerando: los parámetros que los describen (epicentro, hipocentro, área de ruptura, magnitud e intensidad); los tipos de ondas sísmicas (primarias, secundarias y superficiales); su importancia para conocer el interior de la Tierra.', ['Distinguen hipocentro y epicentro, escalas de magnitud (Richter, Mw) e intensidad (Mercalli) y ondas sísmicas P, S, Love y Rayleigh.']]
]);

addUnidad('I° Medio', 'FISICA', 'Unidad 4', 'Astronomía: el Universo y el Sistema Solar', [
  ['OA 14', 'Universo', 'Basal', 'Crear modelos que expliquen los fenómenos astronómicos del Sistema Solar relacionados con: los movimientos del Sistema Tierra-Luna y los fenómenos de luz y sombra, como las fases lunares y los eclipses; los movimientos de la Tierra respecto del Sol y sus consecuencias; la comparación de los distintos planetas con la Tierra en cuanto a su distancia al Sol, su tamaño, su período orbital, su temperatura y su composición.', ['Explican la observación astronómica en Chile y la estructura de planetas, estrellas y galaxias.']],
  ['OA 16', 'Universo', 'Complementario', 'Investigar y explicar sobre la investigación astronómica en Chile y el resto del mundo, considerando aspectos como el clima y las ventajas que ofrece nuestro país para la observación astronómica, la tecnología utilizada (telescopios, radiotelescopios) y la información que proporciona la luz y otras radiaciones emitidas por los astros.', ['Analizan evidencias cosmológicas de la expansión del Universo (corrimiento al rojo, radiación de fondo de microondas) y los observatorios astronómicos en el norte de Chile.']]
]);

// I° MEDIO - QUÍMICA
addUnidad('I° Medio', 'QUIMICA', 'Unidad 1', 'Reacciones químicas cotidianas', [
  ['OA 17', 'Reacciones Químicas', 'Complementario', 'Investigar experimentalmente y explicar, usando evidencias, que la fermentación, la combustión provocada por un motor y la oxidación de metales, entre otras, son reacciones químicas presentes en la vida diaria, considerando: la producción de gas, la formación de precipitados, el cambio de temperatura, color y olor, y la emisión de luz; la influencia de la cantidad de sustancia, la temperatura, el volumen y la presión en ellas; su representación simbólica en ecuaciones químicas; su impacto en los seres vivos y el entorno.', ['Identifican reactantes y productos en ecuaciones químicas y factores que afectan la velocidad de reacción.']],
  ['OA 18', 'Reacciones Químicas', 'Basal', 'Desarrollar un modelo que describa cómo el número total de átomos no varía en una reacción química y cómo la masa se conserva aplicando la ley de la conservación de la materia.', ['Explican la Ley de Conservación de la Masa de Lavoisier y balancean ecuaciones químicas por tanteo y método algebraico.']]
]);

addUnidad('I° Medio', 'QUIMICA', 'Unidad 2', 'Nomenclatura inorgánica', [
  ['OA 19', 'Compuestos Inorgánicos', 'Basal', 'Explicar la formación de compuestos binarios y ternarios, considerando las fuerzas eléctricas entre partículas y la nomenclatura inorgánica correspondiente (óxidos, anhídridos, hidruros, hidrácidos, hidróxidos, oxácidos y sales).', ['Formulan y nombran compuestos inorgánicos binarios y ternarios utilizando nomenclatura IUPAC, Stock y tradicional.']]
]);

addUnidad('I° Medio', 'QUIMICA', 'Unidad 3', 'Relaciones cuantitativas: el mol y la masa molar', [
  ['OA 20', 'Estequiometría', 'Basal', 'Establecer relaciones cuantitativas entre reactantes y productos en reacciones químicas (estequiometría) y explicar la formación de compuestos útiles para los seres vivos, como la formación de la glucosa en la fotosíntesis.', ['Calculan masa molar, cantidad de sustancia (mol), número de Avogadro, volumen molar y composición porcentual, fórmulas empírica y molecular.']]
]);

addUnidad('I° Medio', 'QUIMICA', 'Unidad 4', 'Estequiometría de las reacciones químicas', [
  ['OA 20', 'Estequiometría', 'Basal', 'Aplicar cálculos estequiométricos en ecuaciones químicas balanceadas determinando reactivo limitante, reactivo en exceso y rendimiento de una reacción química en procesos industriales y ambientales.', ['Resuelven problemas estequiométricos mol-mol, masa-masa y volumen-volumen identificando el reactivo limitante y el porcentaje de rendimiento.']]
]);

// ============================================================================
// II° MEDIO - BIOLOGÍA, FÍSICA Y QUÍMICA
// ============================================================================
addUnidad('II° Medio', 'BIOLOGIA', 'Unidad 1', 'Coordinación y regulación corporal: sistema nervioso', [
  ['OA 01', 'Organismo y Ambiente', 'Basal', 'Explicar cómo el sistema nervioso coordina las acciones del organismo para adaptarse a estímulos del ambiente por medio de señales transmitidas por neuronas a través de sinapsis, y, por medio de la experimentación, explicar y evaluar la acción de sustancias como el alcohol y las drogas sobre el sistema nervioso.', ['Explican la estructura y función del sistema nervioso central y periférico, el impulso nervioso y la transmisión sináptica.', 'Evalúan el efecto neurobiológico de drogas psicoactivas y el estrés sobre la salud mental y física.']]
]);

addUnidad('II° Medio', 'BIOLOGIA', 'Unidad 2', 'Sistema endocrino y regulación hormonal', [
  ['OA 02', 'Organismo y Ambiente', 'Basal', 'Crear modelos que expliquen la regulación de: la glicemia por medio del control de las hormonas pancreáticas; los caracteres sexuales y las funciones reproductivas por medio del control de las hormonas sexuales en el organismo.', ['Explican el mecanismo de retroalimentación negativa hormonal en el control de la glicemia (insulina y glucagón) y la diabetes mellitus.', 'Describen la regulación neuroendocrina del eje hipotálamo-hipófisis-gónadas en la reproducción humana.']],
  ['OA 03', 'Organismo y Ambiente', 'Complementario', 'Explicar que la sexualidad humana y la reproducción son aspectos fundamentales de la vida del ser humano, considerando factores biológicos, afectivos y sociales.', ['Analizan métodos anticonceptivos hormonales y no hormonales y cuidados prenatales.']]
]);

addUnidad('II° Medio', 'BIOLOGIA', 'Unidad 3', 'Material genético y división celular', [
  ['OA 04', 'Herencia y Genética', 'Complementario', 'Describir la estructura y localización del ADN en células eucariontes y explicar el empaquetamiento cromosómico y el cariotipo humano.', ['Relacionan ADN, genes, cromatina y cromosomas homólogos en el núcleo celular.']],
  ['OA 05', 'Herencia y Genética', 'Basal', 'Explicar y evaluar la importancia de la mitosis y la meiosis para los organismos, considerando el ciclo celular, la mantención del número de cromosomas, la proliferación celular, la generación de variabilidad genética y alteraciones como el cáncer y las anomalías cromosómicas.', ['Comparan las fases y el significado biológico de la mitosis (crecimiento, regeneración) y la meiosis (gametogénesis y variabilidad por entrecruzamiento y permutación cromosómica).']]
]);

addUnidad('II° Medio', 'BIOLOGIA', 'Unidad 4', 'Genética mendeliana y manipulación genética', [
  ['OA 06', 'Herencia y Genética', 'Basal', 'Investigar y argumentar, basándose en evidencias, que el material genético se transmite de generación en generación en organismos como plantas y animales, considerando: la comparación de la mitosis y la meiosis; las causas y consecuencias de anomalías y pérdida de control de la división celular (tumor, cáncer, síndrome de Down, entre otros); los aportes históricos de Mendel a las leyes de la herencia.', ['Resuelven problemas de genética mendeliana (monohibridismo, dihibridismo) y herencia ligada al sexo, e interpretan genealogías.']],
  ['OA 07', 'Herencia y Genética', 'Complementario', 'Explicar las aplicaciones tecnológicas de la manipulación genética (como organismos transgénicos, terapia génica y clonación) y evaluar sus implicancias bioéticas, sociales y ambientales.', ['Debaten con fundamentos científicos y bioéticos sobre biotecnología, edición genética y transgénicos.']]
]);

// II° MEDIO - FÍSICA
addUnidad('II° Medio', 'FISICA', 'Unidad 1', 'El movimiento rectilíneo: cinemática', [
  ['OA 09', 'Fuerza y Movimiento', 'Basal', 'Analizar, sobre la base de la experimentación, el movimiento rectilíneo uniforme y acelerado de un objeto respecto de un sistema de referencia espacio-temporal, considerando variables como la posición, la velocidad y la aceleración en situaciones cotidianas.', ['Distinguen distancia recorrida de desplazamiento y rapidez de velocidad.', 'Resuelven problemas e interpretan gráficos de posición-tiempo, velocidad-tiempo y aceleración-tiempo en MRU, MRUA y caída libre.']]
]);

addUnidad('II° Medio', 'FISICA', 'Unidad 2', 'Las leyes de Newton y el momentum lineal', [
  ['OA 10', 'Fuerza y Movimiento', 'Basal', 'Explicar, por medio de investigaciones experimentales, los efectos que tiene una fuerza neta sobre un objeto, utilizando las leyes de Newton y el diagrama de cuerpo libre.', ['Construyen diagramas de cuerpo libre y aplican las tres leyes de Newton (inercia, F = m · a y acción-reacción) y la conservación del momentum lineal e impulso.']]
]);

addUnidad('II° Medio', 'FISICA', 'Unidad 3', 'Trabajo y energía mecánica', [
  ['OA 11', 'Energía Mecánica', 'Basal', 'Investigar experimentalmente y explicar, usando evidencias, que el trabajo mecánico transfiere energía a un sistema, y aplicar el principio de conservación de la energía mecánica considerando el efecto del roce y la disipación de energía.', ['Calculan trabajo mecánico, potencia, energía cinética y energía potencial gravitatoria y elástica.', 'Aplican el principio de conservación de la energía mecánica en sistemas conservativos y con roce.']]
]);

addUnidad('II° Medio', 'FISICA', 'Unidad 4', 'El Universo, gravedad y cosmología', [
  ['OA 12', 'Cosmología y Gravitación', 'Basal', 'Comprender que la fuerza de gravedad es una interacción universal atractiva y aplicar las leyes de Kepler y la Ley de Gravitación Universal de Newton para explicar el movimiento de planetas, satélites y mareas.', ['Aplican las tres leyes de Kepler y la Ley de Gravitación Universal de Newton para analizar órbitas planetarias y satelitales.']],
  ['OA 13', 'Cosmología y Gravitación', 'Complementario', 'Demostrar que comprenden que el conocimiento del Universo cambia y aumenta a partir de nuevas evidencias, explicando el modelo del Big Bang, la ley de Hubble y los modelos geocéntrico y heliocéntrico.', ['Contrastan los modelos cosmológicos históricos con la teoría del Big Bang y la expansión acelerada del Universo.']]
]);

// II° MEDIO - QUÍMICA
addUnidad('II° Medio', 'QUIMICA', 'Unidad 1', 'Las disoluciones químicas y su concentración', [
  ['OA 15', 'Disoluciones Químicas', 'Basal', 'Explicar, por medio de modelos y la experimentación, las propiedades de las soluciones en ejemplos cercanos, considerando: el estado físico (sólido, líquido y gaseoso); sus componentes (soluto y solvente); la cantidad de soluto disuelto (concentración).', ['Explican el proceso de solvatación, los factores que afectan la solubilidad (temperatura, presión, naturaleza química) y calculan concentraciones físicas (% m/m, % m/v, % v/v, ppm) y químicas (molaridad, molalidad, fracción molar) y diluciones.']]
]);

addUnidad('II° Medio', 'QUIMICA', 'Unidad 2', 'Propiedades coligativas de las disoluciones', [
  ['OA 16', 'Disoluciones Químicas', 'Complementario', 'Planificar y conducir una investigación experimental para proveer evidencias que expliquen las propiedades coligativas de las soluciones y su importancia en procesos cotidianos, biológicos e industriales.', ['Explican el descenso de la presión de vapor, el aumento ebulloscópico, el descenso crioscópico y la presión osmótica y sus aplicaciones.']]
]);

addUnidad('II° Medio', 'QUIMICA', 'Unidad 3', 'Química orgánica: propiedades del carbono e hidrocarburos', [
  ['OA 17', 'Química Orgánica', 'Basal', 'Crear modelos del carbono y explicar sus propiedades como base para la formación de moléculas útiles para los seres vivos (biomoléculas presentes en la célula) y el entorno (hidrocarburos como petróleo y sus derivados).', ['Explican la tetravalencia e hibridación (sp3, sp2, sp) del átomo de carbono.', 'Formulan y nombran hidrocarburos alifáticos (alcanos, alquenos, alquinos), cíclicos y aromáticos según reglas IUPAC.']]
]);

addUnidad('II° Medio', 'QUIMICA', 'Unidad 4', 'Funciones orgánicas e isomería', [
  ['OA 18', 'Química Orgánica', 'Basal', 'Desarrollar modelos que expliquen la estereoquímica e isomería de compuestos orgánicos como la glucosa, identificando sus grupos funcionales y sus aplicaciones.', ['Reconocen y nombran grupos funcionales orgánicos (alcoholes, éteres, aldehídos, cetonas, ácidos carboxílicos, ésteres, aminas, amidas y halogenuros) y distinguen isómeros estructurales y espaciales (geométricos y ópticos).']]
]);

// ============================================================================
// III° Y IV° MEDIO - CIENCIAS PARA LA CIUDADANÍA (MÓDULOS OFICIALES)
// ============================================================================
addUnidad('III° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 1', 'Módulo Bienestar y Salud: salud humana, estilo de vida y prevención', [
  ['OA 01', 'Bienestar y Salud', 'Basal', 'Analizar, sobre la base de la investigación, factores biológicos, ambientales y sociales que influyen en la salud humana (como la nutrición, el consumo de alimentos transgénicos, la actividad física, el estrés, el consumo de alcohol y drogas, y la exposición a rayos UV, plaguicidas, patógenos y elementos contaminantes, entre otros).', ['Evalúan con evidencia científica factores de riesgo y protección para la salud física y mental.', 'Diseñan campañas o estrategias de promoción de hábitos saludables en la comunidad escolar.']],
  ['OA 02', 'Bienestar y Salud', 'Basal', 'Investigar y comparar diversos agentes patógenos causantes de enfermedades (virus, bacterias, protozoos y hongos), su transmisión, el rol de las vacunas y los medicamentos, y las medidas de salud pública para el control de epidemias y pandemias.', ['Analizan mecanismos de transmisión de agentes infecciosos, inmunización colectiva (efecto rebaño) y resistencia bacteriana a los antibióticos.']]
]);

addUnidad('III° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 2', 'Módulo Seguridad, Prevención y Autocuidado: riesgos socioambientales y químicos', [
  ['OA 03', 'Seguridad y Autocuidado', 'Basal', 'Modelar los efectos del cambio climático en diversos ecosistemas y sus componentes biológicos, físicos y químicos, y evaluar posibles soluciones para su mitigación.', ['Analizan riesgos químicos, radiológicos y biológicos en el hogar, laboratorio y entorno urbano.', 'Evalúan protocolos de prevención de desastres socionaturales en Chile.']]
]);

addUnidad('III° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 3', 'Módulo Ambiente y Sostenibilidad: cambio climático y biodiversidad', [
  ['OA 03', 'Ambiente y Sostenibilidad', 'Basal', 'Analizar y modelar el efecto invernadero, el calentamiento global y la pérdida de biodiversidad en ecosistemas de Chile, proponiendo acciones locales de mitigación y adaptación.', ['Interpretan datos de emisiones de gases de efecto invernadero, acidificación oceánica y escasez hídrica en Chile.', 'Formulan proyectos colaborativos de sostenibilidad escolar.']]
]);

addUnidad('III° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 4', 'Módulo Tecnología y Sociedad: innovación científica y energética', [
  ['OA 04', 'Tecnología y Sociedad', 'Complementario', 'Investigar y comunicar cómo los avances científicos y tecnológicos (energías limpias, biotecnología, inteligencia artificial, nanotecnología) impactan la calidad de vida, el medioambiente y la toma de decisiones éticas en la sociedad.', ['Evalúan críticamente beneficios, costos e implicancias bioéticas y ambientales de desarrollos tecnológicos actuales.']]
]);

// IV° MEDIO - CIENCIAS PARA LA CIUDADANÍA
addUnidad('IV° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 1', 'Módulo Ambiente y Sostenibilidad: gestión sustentable de recursos y huella ecológica', [
  ['OA 03', 'Ambiente y Sostenibilidad', 'Basal', 'Modelar los efectos del cambio climático y de las actividades productivas sobre la disponibilidad de recursos hídricos, energéticos y alimentarios, diseñando soluciones basadas en la economía circular y el desarrollo sostenible.', ['Calculan huella de carbono y huella hídrica y proponen soluciones sustentables basadas en evidencia científica.']]
]);

addUnidad('IV° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 2', 'Módulo Tecnología y Sociedad: transición energética y desafíos digitales', [
  ['OA 04', 'Tecnología y Sociedad', 'Basal', 'Evaluar el impacto de las tecnologías de generación y transmisión de energía, las telecomunicaciones y la automatización en la sociedad contemporánea, considerando eficiencia energética, seguridad cibernética y sustentabilidad.', ['Comparan matrices energéticas, electromovilidad e hidrógeno verde en Chile y evalúan impactos de las tecnologías digitales.']]
]);

addUnidad('IV° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 3', 'Módulo Bienestar y Salud: medicina moderna, genética y salud pública', [
  ['OA 01', 'Bienestar y Salud', 'Basal', 'Analizar críticamente controversias sociocientíficas vinculadas a la salud pública, la farmacología, la ingeniería genética y el envejecimiento de la población.', ['Evalúan evidencia científica frente a pseudociencias y desinformación médica en medios digitales.']],
  ['OA 02', 'Bienestar y Salud', 'Complementario', 'Explicar el aporte de la biotecnología diagnóstica y terapéutica en la prevención y tratamiento de enfermedades crónicas e infecciosas.', ['Analizan el impacto de terapias génicas, medicina personalizada y políticas de salud pública en Chile.']]
]);

addUnidad('IV° Medio', 'CIENCIAS PARA LA CIUDADANIA', 'Unidad 4', 'Módulo Seguridad, Prevención y Autocuidado: resiliencia frente a riesgos naturales y antrópicos', [
  ['OA 03', 'Seguridad y Autocuidado', 'Basal', 'Diseñar e implementar un proyecto interdisciplinario de prevención y resiliencia comunitaria frente a amenazas sísmicas, volcánicas, climáticas o tecnológicas en su localidad.', ['Elaboran planes de gestión de riesgo y comunicación científica dirigidos a la comunidad escolar y local.']]
]);

module.exports = {
  CIENCIAS_CURRICULO
};
