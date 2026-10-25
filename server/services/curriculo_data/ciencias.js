/**
 * Catálogo Curricular MINEDUC - Ciencias Naturales (1° a 8° Básico),
 * Biología, Física, Química (I° y II° Medio) y Ciencias para la Ciudadanía (III°/IV° Medio)
 * Incluye distribución por Unidades (1 a 4) e Indicadores de Evaluación oficiales.
 */

const CIENCIAS_CURRICULO = [
  // ==========================================
  // 1° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '1° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Vida', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Reconocer y observar, por medio de la exploración, que los seres vivos crecen, responden a estímulos del medio, se reproducen y necesitan agua, alimento y aire.',
    indicadores: [
      'Diferencian seres vivos de elementos no vivos u objetos inertes del entorno.',
      'Identifican las necesidades básicas de animales y plantas (agua, luz, aire, alimento).',
      'Describen cambios experimentados por seres vivos durante su crecimiento.',
      'Observan y registran respuestas de animales frente a estímulos (frío, luz, sonido).'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Cuerpo Humano', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Identificar y describir la ubicación y la función de los sentidos proponiendo medidas para protegerlos y prevenir riesgos.',
    indicadores: [
      'Relacionan los órganos de los sentidos (ojos, oídos, piel, nariz, lengua) con sus funciones.',
      'Describen sensaciones captadas mediante cada uno de los sentidos.',
      'Proponen acciones de cuidado e higiene personal para proteger los órganos sensoriales.',
      'Identifican situaciones de riesgo cotidiano para la vista y el oído en el hogar y colegio.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias Físicas y Químicas', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Complementario',
    descripcion: 'Explorar y describir diferentes tipos de materiales en diversos objetos (madera, vidrio, metal, plástico, goma) clasificándolos según sus propiedades.',
    indicadores: [
      'Identifican materiales comunes presentes en objetos escolares y del hogar.',
      'Clasifican materiales según propiedades como dureza, flexibilidad, transparencia y textura.',
      'Distinguen materiales frágiles de resistentes mediante pruebas simples de manipulación.',
      'Proponen materiales idóneos para fabricar objetos de uso cotidiano según su función.'
    ]
  },
  {
    nivel: '1° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Tierra y el Universo', unidad: 'Unidad 4', codigo: 'OA 11', categoria: 'Basal',
    descripcion: 'Describir y registrar el ciclo diario (día y noche) y las diferencias entre las cuatro estaciones del año y sus efectos en los seres vivos y el ambiente.',
    indicadores: [
      'Diferencian actividades humanas realizadas durante el día de las que se realizan de noche.',
      'Describen características climáticas distintivas de cada estación del año en su localidad.',
      'Explican cambios observados en plantas y conductas de animales al cambiar de estación.',
      'Registran datos sencillos del tiempo atmosférico (lluvia, viento, sol) con símbolos iconográficos.'
    ]
  },

  // ==========================================
  // 2° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '2° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Cuerpo Humano', unidad: 'Unidad 1', codigo: 'OA 07', categoria: 'Basal',
    descripcion: 'Identificar la ubicación y explicar la función de algunas partes del cuerpo que son fundamentales para vivir: corazón, pulmones, estómago, esqueleto y músculos.',
    indicadores: [
      'Ubican en esquemas del cuerpo humano el corazón, pulmones, estómago, esqueleto y músculos.',
      'Explican que el corazón bombea sangre y los pulmones permiten el intercambio gaseoso.',
      'Describen cómo el esqueleto y los músculos permiten el sostén y movimiento del cuerpo.',
      'Proponen rutinas de actividad física diaria y alimentación sana para cuidar su organismo.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Vida', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Observar y describir las características de los principales grupos de animales vertebrados (mamíferos, aves, reptiles, anfibios y peces).',
    indicadores: [
      'Clasifican animales vertebrados según su cubierta corporal (pelos, plumas, escamas, piel desnuda).',
      'Comparan estructuras de respiración y locomoción (aletas, patas, alas) en diversos hábitats.',
      'Diferencian animales ovíparos de vivíparos dando ejemplos autóctonos de la fauna chilena.',
      'Observan y comparan ciclos de vida de aves, anfibios y mamíferos destacando metamorfosis.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Tierra', unidad: 'Unidad 3', codigo: 'OA 09', categoria: 'Complementario',
    descripcion: 'Observar y describir las características del agua en la naturaleza (escurre, transparente, inodora, adopta forma del recipiente, se congela y evapora).',
    indicadores: [
      'Comprueban experimentalmente que el agua líquida escurre y no tiene forma propia.',
      'Verifican mediante mezclas simples que el agua es capaz de disolver diversas sustancias.',
      'Identifican los estados del agua (líquido, sólido, gaseoso) en la naturaleza (ríos, glaciares, nubes).',
      'Proponen acciones concretas para el ahorro y uso responsable del agua en la escuela.'
    ]
  },
  {
    nivel: '2° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'El Tiempo Atmosférico', unidad: 'Unidad 4', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Reconocer y medir el tiempo atmosférico (temperatura, precipitación, viento) utilizando instrumentos sencillos como termómetros y pluviómetros.',
    indicadores: [
      'Utilizan termómetros ambientales para registrar temperaturas a distintas horas del día.',
      'Construyen veletas caseras para determinar la dirección del viento en el patio escolar.',
      'Grafican las variaciones de precipitaciones semanales en tablas de doble entrada.',
      'Relacionan el pronóstico meteorológico con la vestimenta y prevención de resfríos.'
    ]
  },

  // ==========================================
  // 3° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '3° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Vida', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Observar y describir las necesidades de las plantas y su relación con la raíz, el tallo, las hojas, las flores y las semillas en su reproducción.',
    indicadores: [
      'Identifican las funciones de raíz, tallo y hojas en la nutrición y soporte vegetal.',
      'Diseñan experimentos sencillos para evidenciar la necesidad de luz solar y agua en la fotosíntesis.',
      'Describen la polinización y la formación de frutos a partir de las flores.',
      'Clasifican hojas y semillas según criterios morfológicos observables.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias Físicas', unidad: 'Unidad 2', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Demostrar, por medio de la investigación experimental, las propiedades de la luz (viaja en línea recta, se refleja y se refracta).',
    indicadores: [
      'Comprueban que la luz viaja en línea recta observando la formación de sombras nítidas.',
      'Diferencian cuerpos luminosos (fuentes de luz) de cuerpos iluminados.',
      'Clasifican materiales en transparentes, translúcidos y opacos según su comportamiento con la luz.',
      'Experimentan con espejos y prismas demostrando la reflexión y refracción lumínica.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias Físicas (Sonido)', unidad: 'Unidad 3', codigo: 'OA 10', categoria: 'Complementario',
    descripcion: 'Investigar en forma experimental y explicar las características del sonido; por ejemplo: viaja en todas direcciones, se absorbe o refleja, y tiene tono e intensidad.',
    indicadores: [
      'Demuestran que el sonido se produce por la vibración de un cuerpo material.',
      'Diferencian sonidos graves de agudos (tono) y sonidos fuertes de débiles (intensidad).',
      'Comprueban que el sonido necesita un medio material (sólido, líquido o gas) para propagarse.',
      'Identifican medidas de protección contra la contaminación acústica en la comunidad.'
    ]
  },
  {
    nivel: '3° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Tierra y el Universo', unidad: 'Unidad 4', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Describir las características de algunos de los componentes del Sistema Solar (Sol, planetas, lunas, cometas y asteroides) y los movimientos de rotación y traslación.',
    indicadores: [
      'Construyen maquetas o modelos a escala del Sistema Solar ubicando los planetas en orden.',
      'Explican que el movimiento de rotación de la Tierra sobre su eje genera el día y la noche.',
      'Explican que el movimiento de traslación de la Tierra en torno al Sol genera las estaciones.',
      'Comparan planetas rocosos y gaseosos destacando dimensiones y distancias relativas.'
    ]
  },

  // ==========================================
  // 4° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '4° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Materia y Fuerza', unidad: 'Unidad 1', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Demostrar, por medio de la investigación experimental, que la materia tiene masa y ocupa espacio (volumen), y que los estados sólido, líquido y gaseoso tienen características propias.',
    indicadores: [
      'Miden la masa de sólidos y líquidos utilizando balanzas y expresándola en gramos y kilogramos.',
      'Miden el volumen de líquidos y sólidos irregulares usando probetas graduadas en mililitros.',
      'Comparan la forma y volumen de sólidos, líquidos y gases a partir de su estructura corpuscular.',
      'Comprueban que el aire tiene masa y ocupa volumen mediante pruebas con jeringas y globos.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Fuerzas en la Naturaleza', unidad: 'Unidad 2', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Demostrar, por medio de la investigación experimental, los efectos de la aplicación de fuerzas sobre objetos: cambio de forma, rapidez y dirección del movimiento.',
    indicadores: [
      'Identifican fuerzas de contacto (roce, empuje) y fuerzas a distancia (gravedad, magnetismo).',
      'Miden fuerzas con dinamómetros calibrados expresando resultados en Newtons.',
      'Comprueban los efectos del roce sobre el frenado de objetos en diferentes superficies.',
      'Explican la atracción y repulsión entre polos de imanes y cargas electrostáticas.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Tierra', unidad: 'Unidad 3', codigo: 'OA 15', categoria: 'Basal',
    descripcion: 'Describir por medio de modelos que la Tierra tiene una estructura de capas (corteza, manto y núcleo) con características distintivas en cuanto a composición, rigidez y temperatura.',
    indicadores: [
      'Modelan con plasticina o dibujos las capas concéntricas de la geosfera (corteza, manto, núcleo).',
      'Comparan el estado físico y las temperaturas relativas de cada capa terrestre.',
      'Explican la teoría de placas tectónicas y su relación con la sismicidad en Chile.',
      'Diseñan y practican protocolos escolares de seguridad y evacuación frente a sismos y tsunamis.'
    ]
  },
  {
    nivel: '4° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ecosistemas y Cadenas Tróficas', unidad: 'Unidad 4', codigo: 'OA 01', categoria: 'Complementario',
    descripcion: 'Reconocer, por medio de la exploración, que un ecosistema está compuesto por elementos vivos (bióticos) y no vivos (abióticos) que interactúan entre sí.',
    indicadores: [
      'Identifican componentes bióticos y abióticos en un ecosistema terrestre y acuático chileno.',
      'Construyen cadenas y redes tróficas reconociendo productores, consumidores y descomponedores.',
      'Predicen consecuencias en la cadena trófica ante la extinción o introducción de especies invasoras.',
      'Proponen acciones para proteger áreas silvestres protegidas y parques nacionales.'
    ]
  },

  // ==========================================
  // 5° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '5° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Ciencias de la Tierra (Hidrosfera)', unidad: 'Unidad 1', codigo: 'OA 12', categoria: 'Basal',
    descripcion: 'Describir la distribución del agua dulce y salada en la Tierra, considerando océanos, glaciares, ríos y lagos, aguas subterráneas y nubes, y su importancia para la vida.',
    indicadores: [
      'Grafican en tortas porcentuales la proporción de agua salada (97%) y agua dulce (3%) en el planeta.',
      'Identifican a los glaciares y campos de hielo como las mayores reservas de agua dulce en Chile.',
      'Explican el ciclo hidrológico y la formación de corrientes marinas en las costas de Chile (Humboldt).',
      'Analizan el impacto de la sobreexplotación hídrica y la contaminación en ríos y lagos.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Cuerpo Humano y Sistemas', unidad: 'Unidad 2', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Reconocer y explicar que los seres vivos están formados por una o más células y que estas se organizan en tejidos, órganos y sistemas con funciones específicas.',
    indicadores: [
      'Utilizan el microscopio óptico o lupas para observar células vegetales de cebolla y animales.',
      'Diferencian organismos unicelulares (bacterias, protozoos) de pluricelulares.',
      'Secuencian los niveles de organización biológica: célula $\\rightarrow$ tejido $\\rightarrow$ órgano $\\rightarrow$ sistema $\\rightarrow$ organismo.',
      'Relacionan el funcionamiento coordinado del sistema digestivo, circulatorio, respiratorio y excretor.'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Nutrición y Salud', unidad: 'Unidad 3', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Analizar el consumo de alimento diario (variedad, tamaño de las porciones) reconociendo que los alimentos son fuente de energía y materiales para el crecimiento y reparación.',
    indicadores: [
      'Clasifican los nutrientes (glúcidos, lípidos, proteínas, vitaminas y minerales) y sus funciones biológicas.',
      'Interpretan tablas nutricionales y sellos de advertencia ("Altos en") en alimentos procesados.',
      'Calculan requerimientos calóricos según edad, género y nivel de actividad física.',
      'Proponen dietas balanceadas para prevenir enfermedades metabólicas crónicas (obesidad, diabetes).'
    ]
  },
  {
    nivel: '5° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Energía y Electricidad', unidad: 'Unidad 4', codigo: 'OA 08', categoria: 'Complementario',
    descripcion: 'Reconocer los cambios que la energía produce en la materia; explicar que la energía no se crea ni se destruye, solo se transforma, y construir circuitos eléctricos simples.',
    indicadores: [
      'Identifican diversas manifestaciones de energía: térmica, lumínica, cinética, potencial y química.',
      'Explican transformaciones de energía en electrodomésticos y centrales de generación eléctrica.',
      'Construyen circuitos eléctricos en serie y en paralelo identificando fuente, conductores e interruptor.',
      'Diferencian materiales conductores de aislantes eléctricos mediante ensayos empíricos de laboratorio.'
    ]
  },

  // ==========================================
  // 6° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '6° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Fotosíntesis y Ecosistemas', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar, a partir de una investigación experimental, los requerimientos de agua, dióxido de carbono y energía lumínica para la producción de azúcar y liberación de oxígeno en la fotosíntesis.',
    indicadores: [
      'Escriben la ecuación química balanceada cualitativa de la fotosíntesis celular.',
      'Demuestran experimentalmente la liberación de oxígeno y acumulación de almidón en hojas verdes.',
      'Explican el rol de la clorofila y los cloroplastos en la captación de energía lumínica.',
      'Analizan la importancia de los productores fotosintéticos como base de todas las tramas alimentarias.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Sexualidad y Sistemas Reproductores', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Identificar y describir las funciones de las principales estructuras del sistema reproductor humano femenino y masculino, y los cambios biopsicosociales en la pubertad.',
    indicadores: [
      'Rotulan y describen las estructuras anatómicas y fisiológicas del aparato reproductor femenino y masculino.',
      'Explican las fases del ciclo menstrual ovárico y uterino y su regulación hormonal (estrógenos y progesterona).',
      'Describen los caracteres sexuales primarios y secundarios que emergen durante la pubertad.',
      'Promueven el autocuidado, la higiene íntima y el respeto a la afectividad y diversidad humana.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Materia y Cambios de Estado', unidad: 'Unidad 3', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Explicar que la materia está formada por partículas en constante movimiento (modelo cinético molecular) y asociarlo con la temperatura y los cambios de estado.',
    indicadores: [
      'Modelan el comportamiento molecular en sólidos, líquidos y gases considerando atracción y energía cinética.',
      'Grafican curvas de calentamiento del agua identificando puntos de fusión ($0^{\\circ}C$) y ebullición ($100^{\\circ}C$).',
      'Diferencian calor (energía en tránsito) de temperatura (medida de la energía cinética promedio).',
      'Explican fenómenos de evaporación, condensación, sublimación y solidificación en la atmósfera.'
    ]
  },
  {
    nivel: '6° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Atmósfera y Suelo', unidad: 'Unidad 4', codigo: 'OA 16', categoria: 'Complementario',
    descripcion: 'Describir las capas de la atmósfera (troposfera, estratosfera) y las características del suelo (horizontes, permeabilidad), evaluando el impacto de la erosión y la contaminación.',
    indicadores: [
      'Identifican los gases principales de la atmósfera terrestre ($N_2, O_2, CO_2$) y la capa de ozono.',
      'Explican el efecto invernadero natural y el calentamiento global antrópico.',
      'Miden experimentalmente la porosidad y retención de humedad en suelos arenosos, arcillosos y limosos.',
      'Proponen técnicas agroecológicas para evitar la desertificación y erosión de suelos en Chile.'
    ]
  },

  // ==========================================
  // 7° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '7° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Microbiología e Inmunología', unidad: 'Unidad 1', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen el rol de los microorganismos (virus, bacterias y hongos) en la salud humana, biotecnología y el funcionamiento del sistema inmune.',
    indicadores: [
      'Comparan estructuras celulares procariontes, eucariontes y partículas virales acelulares.',
      'Explican los mecanismos de inmunidad innata (barreras primarias) y adaptativa (anticuerpos y linfocitos).',
      'Analizan la importancia de la vacunación masiva en la erradicación de epidemias históricas.',
      'Describen aplicaciones biotecnológicas benéficas de bacterias y levaduras en la industria y biorremediación.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Sexualidad e Infecciones de Transmisión', unidad: 'Unidad 2', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Explicar los aspectos biológicos, afectivos y sociales de la sexualidad humana, reconociendo medidas de prevención de infecciones de transmisión sexual (ITS) y métodos de control de la natalidad.',
    indicadores: [
      'Identifican vías de transmisión, síntomas y medidas preventivas del VIH/SIDA, VPH, sífilis y gonorrea.',
      'Clasifican métodos anticonceptivos en naturales, de barrera, hormonales y quirúrgicos evaluando su eficacia.',
      'Promueven relaciones interpersonales basadas en el consentimiento, la empatía y la responsabilidad afectiva.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Materia y Enlace Químico', unidad: 'Unidad 3', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Investigar experimentalmente y explicar la clasificación de la materia en sustancias puras (elementos y compuestos) y mezclas (homogéneas y heterogéneas).',
    indicadores: [
      'Diferencian elementos químicos de compuestos moleculares mediante fórmulas químicas ($H_2O, NaCl, O_2$).',
      'Diseñan y ejecutan procedimientos de separación de mezclas: filtración, decantación, tamizado y destilación.',
      'Diferencian disoluciones de suspensiones y coloides basándose en el efecto Tyndall.',
      'Calculan concentraciones porcentuales masa-masa y masa-volumen en disoluciones de laboratorio.'
    ]
  },
  {
    nivel: '7° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Fuerzas y Presión', unidad: 'Unidad 4', codigo: 'OA 08', categoria: 'Complementario',
    descripcion: 'Planificar y conducir investigaciones para explicar los efectos de la fuerza gravitacional, elástica y de roce, y el concepto de presión en sólidos, líquidos y gases.',
    indicadores: [
      'Calculan la fuerza peso ($P = m \\cdot g$) reconociendo la diferencia conceptual con la masa inercial.',
      'Aplican la Ley de Hooke ($F = k \\cdot \\Delta x$) en resortes midiendo elongaciones elásticas.',
      'Calculan presión mecánica ($P = F/A$) expresando el resultado en Pascales ($N/m^2$).',
      'Demuestran la existencia de la presión atmosférica e hidrostática mediante experimentos de Torricelli y manómetros.'
    ]
  },

  // ==========================================
  // 8° BÁSICO - CIENCIAS NATURALES
  // ==========================================
  {
    nivel: '8° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Célula y Nutrición Celular', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen la relación entre la función de una célula y sus partes, considerando membrana celular, núcleo, mitocondrias, cloroplastos y ribosomas.',
    indicadores: [
      'Describen la función de organelos celulares en el transporte, respiración celular y síntesis proteica.',
      'Explican el transporte a través de la membrana celular: difusión simple, facilitada y transporte activo.',
      'Modelan el flujo de nutrientes y oxígeno desde los capilares sanguíneos hacia el espacio intracelular.',
      'Relacionan disfunciones mitocondriales con déficits energéticos en tejidos musculares y nerviosos.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Nutrición Humana y Circuitos Sistémicos', unidad: 'Unidad 2', codigo: 'OA 05', categoria: 'Basal',
    descripcion: 'Explicar, con apoyo de modelos, la digestión de alimentos y la absorción de nutrientes en el sistema digestivo, y su distribución por el sistema circulatorio.',
    indicadores: [
      'Describen la digestión mecánica y enzimática en boca, estómago e intestino delgado (amilasas, proteasas, lipasas).',
      'Explican la absorción de aminoácidos y glucosa en las microvellosidades intestinales hacia la sangre.',
      'Modelan el circuito vascular mayor y menor destacando la oxigenación en los alvéolos pulmonares.',
      'Analizan el impacto del tabaquismo y el sedentarismo en la arteriosclerosis y accidentes cerebrovasculares.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Estructura Atómica y Tabla Periódica', unidad: 'Unidad 3', codigo: 'OA 13', categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen que la materia está constituida por átomos formados por protones, neutrones y electrones, y su organización en la tabla periódica.',
    indicadores: [
      'Comparan los modelos atómicos históricos de Thomson, Rutherford y Bohr.',
      'Determinan el número atómico ($Z$), número másico ($A$) y cantidad de neutrones en isótopos.',
      'Identifican grupos (familias) y períodos en la Tabla Periódica relacionándolos con electrones de valencia.',
      'Explican la formación de enlaces iónicos y covalentes basándose en la regla del octeto.'
    ]
  },
  {
    nivel: '8° Básico', asignatura: 'CIENCIAS NATURALES', eje: 'Circuitos y Corriente Eléctrica', unidad: 'Unidad 4', codigo: 'OA 10', categoria: 'Complementario',
    descripcion: 'Analizar un circuito eléctrico domiciliario y aplicar la Ley de Ohm ($V = I \\cdot R$) para calcular voltaje, intensidad de corriente y potencia eléctrica consumida.',
    indicadores: [
      'Aplican la Ley de Ohm calculando resistencia eléctrica ($R$), voltaje ($V$) e intensidad ($I$).',
      'Calculan la potencia eléctrica ($P = V \\cdot I$) y el consumo en kilowatt-hora ($kWh$) de aparatos domésticos.',
      'Identifican dispositivos de protección domiciliaria: automáticos termomagnéticos, disyuntores diferenciales y conexión a tierra.',
      'Proponen auditorías de eficiencia energética para reducir la huella de carbono escolar.'
    ]
  },

  // ==========================================
  // I° MEDIO - BIOLOGÍA
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'BIOLOGIA', eje: 'Evolución y Biodiversidad', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Analizar e interpretar evidencias de la evolución (registro fósil, anatomía comparada, embriología y biología molecular) que demuestran el origen común de las especies.',
    indicadores: [
      'Explican el principio de la selección natural postulado por Darwin y Wallace frente al lamarckismo.',
      'Diferencian estructuras homólogas (divergencia evolutiva) de análogas (convergencia evolutiva).',
      'Interpretan árboles filogenéticos y cladogramas basados en secuenciación de ADN y citocromo c.',
      'Evalúan el impacto de las extinciones masivas en la radiación adaptativa de la biosfera.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'BIOLOGIA', eje: 'Dinámica de Ecosistemas', unidad: 'Unidad 2', codigo: 'OA 06', categoria: 'Basal',
    descripcion: 'Desarrollar modelos sobre el flujo de energía y el ciclo de la materia (carbono, nitrógeno, fósforo y agua) en los ecosistemas, evaluando perturbaciones antrópicas.',
    indicadores: [
      'Construyen pirámides ecológicas de número, biomasa y energía aplicando la regla del 10% trófico.',
      'Explican los ciclos biogeoquímicos del carbono y nitrógeno destacando bacterias fijadoras.',
      'Analizan las causas y consecuencias de la eutrofización en lagos y zonas costeras chilenas.',
      'Proponen proyectos de conservación biológica y restauración de cuencas hidrográficas degradadas.'
    ]
  },

  // ==========================================
  // I° MEDIO - FÍSICA
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'FISICA', eje: 'Ondas y Sonido', unidad: 'Unidad 1', codigo: 'OA 08', categoria: 'Basal',
    descripcion: 'Explicar fenómenos ondulatorios del sonido (reflexión, refracción, difracción, interferencia y efecto Doppler) mediante la ecuación fundamental de ondas ($v = \\lambda \\cdot f$).',
    indicadores: [
      'Calculan longitud de onda ($\\lambda$), frecuencia ($f$) y velocidad de propagación ($v$).',
      'Explican el fenómeno de resonancia acústica y eco a partir de la reflexión del sonido.',
      'Describen la variación aparente del tono en fuentes sonoras en movimiento (efecto Doppler).',
      'Analizan el rango auditivo humano ($20 - 20.000 Hz$) y aplicaciones médicas del ultrasonido.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'FISICA', eje: 'Luz y Óptica Geométrica', unidad: 'Unidad 2', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Comprender el comportamiento dual de la luz y la formación de imágenes en espejos planos, cóncavos, convexos y lentes convergentes y divergentes.',
    indicadores: [
      'Aplican la ley de Snell para la refracción lumínica en medios de diferente índice óptico.',
      'Trazan rayos notables para construir imágenes reales y virtuales en lentes y espejos.',
      'Explican defectos refractivos de la visión humana (miopía, hipermetropía) y su corrección óptica.',
      'Describen la dispersión cromática de la luz blanca en prismas formando el espectro visible.'
    ]
  },

  // ==========================================
  // I° MEDIO - QUÍMICA
  // ==========================================
  {
    nivel: 'I° Medio', asignatura: 'QUIMICA', eje: 'Reacciones Químicas y Leyes Ponderales', unidad: 'Unidad 1', codigo: 'OA 17', categoria: 'Basal',
    descripcion: 'Explicar las reacciones químicas mediante la reorganización atómica y balancear ecuaciones químicas aplicando la Ley de Conservación de la Materia de Lavoisier.',
    indicadores: [
      'Identifican reactivos y productos reconociendo evidencias empíricas de reacción química (precipitado, gas, calor).',
      'Balancean ecuaciones químicas por el método de tanteo y algebraico.',
      'Verifican experimentalmente la Ley de Conservación de la Masa en sistemas cerrados.',
      'Clasifican reacciones en síntesis, descomposición, desplazamiento y combustión.'
    ]
  },
  {
    nivel: 'I° Medio', asignatura: 'QUIMICA', eje: 'Estequiometría y Mol', unidad: 'Unidad 2', codigo: 'OA 18', categoria: 'Basal',
    descripcion: 'Aplicar el concepto de mol, masa molar y número de Avogadro ($6,022 \\times 10^{23}$) en cálculos estequiométricos de reactivo limitante y rendimiento de reacción.',
    indicadores: [
      'Convierten entre masa en gramos, moles y número de moléculas o átomos.',
      'Calculan masas molares ($g/mol$) a partir de las masas atómicas de la Tabla Periódica.',
      'Determinan el reactivo limitante y reactivo en exceso en mezclas estequiométricas no ideales.',
      'Calculan el porcentaje de rendimiento teórico y real de síntesis químicas industriales.'
    ]
  },

  // ==========================================
  // II° MEDIO - BIOLOGÍA
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'BIOLOGIA', eje: 'Genética y Ciclo Celular', unidad: 'Unidad 1', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Desarrollar modelos que expliquen el ciclo celular incluyendo la replicación del ADN, mitosis y meiosis, y su importancia en la variabilidad genética y cáncer.',
    indicadores: [
      'Secuencian las fases de la mitosis (profase, metafase, anafase, telofase) y la citocinesis.',
      'Explican el entrecruzamiento (crossing-over) y la permutación cromosómica en meiosis como fuentes de diversidad.',
      'Analizan los puntos de control del ciclo celular y la pérdida de regulación en la carcinogénesis.',
      'Resuelven cruzamientos genéticos mendelianos mono y dihíbridos mediante cuadros de Punnett.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'BIOLOGIA', eje: 'Sistemas de Integración y Neurobiología', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Explicar cómo el sistema nervioso y endocrino coordinan la homeostasis corporal mediante la transmisión del impulso nervioso y retroalimentación hormonal.',
    indicadores: [
      'Describen la generación y propagación del potencial de acción axónico y la sinapsis química.',
      'Explican el eje hipotálamo-hipófisis y los mecanismos de feedback negativo en la tiroides y páncreas.',
      'Analizan los efectos neurobiológicos del consumo de alcohol, nicotina y drogas psicotrópicas.',
      'Modelan el arco reflejo autónomo y somático frente a estímulos nociceptivos.'
    ]
  },

  // ==========================================
  // II° MEDIO - FÍSICA
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'FISICA', eje: 'Cinemática y Dinámica', unidad: 'Unidad 1', codigo: 'OA 09', categoria: 'Basal',
    descripcion: 'Analizar el movimiento rectilíneo uniforme (MRU) y rectilíneo uniformemente acelerado (MRUA) mediante ecuaciones y gráficos de posición, velocidad y aceleración en función del tiempo.',
    indicadores: [
      'Calculan velocidad, aceleración y distancia recorrida aplicando ecuaciones cinemáticas estándar.',
      'Interpretan gráficos $x-t$, $v-t$ y $a-t$ deduciendo pendientes y áreas bajo la curva.',
      'Resuelven problemas de caída libre y lanzamiento vertical considerando la gravedad local.',
      'Aplican las Leyes de Newton ($F = m \\cdot a$) y diagramas de cuerpo libre en planos inclinados.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'FISICA', eje: 'Energía y Momento Lineal', unidad: 'Unidad 2', codigo: 'OA 10', categoria: 'Basal',
    descripcion: 'Explicar el trabajo mecánico ($W = F \\cdot d \\cdot \\cos\\theta$), la potencia y la conservación de la energía mecánica total en sistemas conservativos y disipativos.',
    indicadores: [
      'Calculan energía cinética ($E_c = \\frac{1}{2}mv^2$) y energía potencial gravitatoria ($E_p = mgh$).',
      'Demuestran la conservación de la energía mecánica ($E_m = E_c + E_p$) en montañas rusas y péndulos.',
      'Calculan el trabajo efectuado por fuerzas no conservativas (roce) como disipación térmica.',
      'Aplican el principio de conservación de la cantidad de movimiento ($p = m \\cdot v$) en choques elásticos e inelásticos.'
    ]
  },

  // ==========================================
  // II° MEDIO - QUÍMICA
  // ==========================================
  {
    nivel: 'II° Medio', asignatura: 'QUIMICA', eje: 'Soluciones Químicas', unidad: 'Unidad 1', codigo: 'OA 14', categoria: 'Basal',
    descripcion: 'Explicar las propiedades coligativas de las soluciones (descenso crioscópico, aumento ebulloscópico, presión osmótica) y preparar disoluciones molares en el laboratorio.',
    indicadores: [
      'Calculan concentraciones molares ($M$), molales ($m$) y fracción molar ($X$) con solutos moleculares e iónicos.',
      'Determinan el factor de Van \'t Hoff ($i$) en electrolitos fuertes y no electrolitos.',
      'Aplican fórmulas de aumento del punto de ebullición ($\\Delta T_e = K_e \\cdot m \\cdot i$) y descenso de congelación.',
      'Explican la presión osmótica ($\\Pi = M R T$) y sus implicancias en la diálisis médica y células vegetales.'
    ]
  },
  {
    nivel: 'II° Medio', asignatura: 'QUIMICA', eje: 'Gases Ideales y Termoquímica', unidad: 'Unidad 2', codigo: 'OA 15', categoria: 'Basal',
    descripcion: 'Comprender las leyes de los gases ideales ($PV = nRT$) y los conceptos termoquímicos de entalpía ($\\Delta H$), entropía ($\\Delta S$) y espontaneidad de Gibbs ($\\Delta G$).',
    indicadores: [
      'Aplican la ecuación de estado de gases ideales para calcular presión, volumen, temperatura y densidad.',
      'Diferencian reacciones endotérmicas ($\\Delta H > 0$) de exotérmicas ($\\Delta H < 0$) mediante diagramas energéticos.',
      'Calculan la energía libre de Gibbs ($\\Delta G = \\Delta H - T\\Delta S$) determinando la espontaneidad del proceso.'
    ]
  },

  // ==========================================
  // III° / IV° MEDIO - CIENCIAS PARA LA CIUDADANÍA
  // ==========================================
  {
    nivel: 'III° Medio', asignatura: 'CIENCIAS PARA LA CIUDADANIA', eje: 'Salud y Bienestar', unidad: 'Unidad 1', codigo: 'OA 01', categoria: 'Basal',
    descripcion: 'Analizar, a partir de evidencias científicas, los factores de riesgo de enfermedades crónicas no transmisibles (sedentarismo, tabaco, estrés) y proponer estilos de vida saludables.',
    indicadores: [
      'Evalúan la evidencia epidemiológica que vincula dietas hipercalóricas con hipertensión y diabetes.',
      'Diseñan planes integrales de actividad física y bienestar socioemocional escolar.',
      'Debaten sobre políticas de etiquetado nutricional e impuestos a productos nocivos.'
    ]
  },
  {
    nivel: 'III° Medio', asignatura: 'CIENCIAS PARA LA CIUDADANIA', eje: 'Ambiente y Sostenibilidad', unidad: 'Unidad 2', codigo: 'OA 02', categoria: 'Basal',
    descripcion: 'Diseñar proyectos comunitarios de mitigación y adaptación frente al cambio climático y la crisis hídrica regional, considerando huella ecológica y economía circular.',
    indicadores: [
      'Calculan la huella de carbono e hídrica de la comunidad educativa proponiendo metas de reducción.',
      'Implementan sistemas de reciclaje de residuos orgánicos mediante compostaje y lombricultura.',
      'Proponen alternativas de transición energética hacia energías renovables no convencionales (solar, eólica).'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'CIENCIAS PARA LA CIUDADANIA', eje: 'Seguridad y Prevención de Riesgos', unidad: 'Unidad 1', codigo: 'OA 03', categoria: 'Basal',
    descripcion: 'Evaluar riesgos socio-naturales en el territorio chileno (terremotos, aluviones, incendios forestales) y la eficacia de los sistemas de alerta temprana y planificación urbana.',
    indicadores: [
      'Construyen mapas de amenazas y vulnerabilidades de la cuenca o comuna escolar.',
      'Analizan causas antrópicas en la propagación de megaincendios y tomas de terreno en quebradas.',
      'Proponen mejoras a los protocolos de emergencia del Plan Integral de Seguridad Escolar (PISE).'
    ]
  },
  {
    nivel: 'IV° Medio', asignatura: 'CIENCIAS PARA LA CIUDADANIA', eje: 'Tecnología y Sociedad', unidad: 'Unidad 2', codigo: 'OA 04', categoria: 'Basal',
    descripcion: 'Debatir los alcances bioéticos y sociales del desarrollo tecnológico contemporáneo, como la inteligencia artificial, transgénicos y edición génica con CRISPR-Cas9.',
    indicadores: [
      'Explican los fundamentos de la biotecnología molecular y la terapia génica en medicina.',
      'Evalúan ventajas y controversias del cultivo de organismos genéticamente modificados en la agricultura.',
      'Formulan declaraciones de principios éticos frente al uso de algoritmos biométricos y privacidad de datos.'
    ]
  }
];

module.exports = { CIENCIAS_CURRICULO };
