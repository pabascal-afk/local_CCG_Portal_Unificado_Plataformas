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
// FILOSOFÍA (III° Y IV° MEDIO - Plan Común FG)
// ==========================================
addUnidad('III° MEDIO', 'FILOSOFIA', 1, 'Unidad 1: La filosofía nos permite cuestionar la realidad y a nosotros mismos', [
    ['OA 01', 'Filosofía', 'Basal', 'Describir las características del quehacer filosófico, considerando el problema de su origen y sentido, e identificando algunas de sus grandes preguntas y temas.', ['Explican el origen del filosofar a partir del asombro, la duda y las situaciones límite.', 'Distinguen las preguntas filosóficas de las preguntas científicas, empíricas o formales.']],
    ['OA 02', 'Filosofía', 'Complementario', 'Analizar y fundamentar diversas perspectivas filosóficas, considerando posibles relaciones con la cotidianidad, así como normas, valores, creencias y visiones de mundo de los pensadores que las desarrollaron.', ['Relacionan posturas filosóficas clásicas y modernas con sus contextos históricos y con dilemas cotidianos.']],
    ['OA 06', 'Métodos de la Filosofía', 'Basal', 'Aplicar principios y herramientas elementales de argumentación en el diálogo, la escritura y diferentes contextos, considerando la consistencia y rigurosidad lógica, la identificación de razonamientos falaces y las exigencias éticas del diálogo.', ['Construyen argumentos válidos y detectan falacias formales e informales en discusiones filosóficas.']]
]);

addUnidad('III° MEDIO', 'FILOSOFIA', 2, 'Unidad 2: La realidad, el cambio y el sentido de la existencia humana (Ontología y Metafísica)', [
    ['OA 02', 'Filosofía', 'Complementario', 'Analizar y fundamentar diversas perspectivas filosóficas sobre el ser, la apariencia y la realidad.', ['Contrastan perspectivas metafísicas sobre el ser y el devenir (Parménides, Heráclito, Platón, Aristóteles, Descartes).']],
    ['OA 03', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas al ser y la naturaleza de la realidad que sean significativas para su vida, considerando conceptos y teorías ontológicas fundamentales.', ['Formulan y analizan problemas ontológicos sobre la existencia, el tiempo, la mente y el cuerpo y la libertad humana.']],
    ['OA 05', 'Métodos de la Filosofía', 'Complementario', 'Dialogar filosóficamente sobre problemas ontológicos respetando la diversidad de perspectivas y evaluando rigurosamente los argumentos.', ['Participan en diálogos filosóficos fundamentando con conceptos ontológicos precisos.']]
]);

addUnidad('III° MEDIO', 'FILOSOFIA', 3, 'Unidad 3: El conocimiento, la ciencia y la verdad (Epistemología)', [
    ['OA 04', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas al conocimiento, la ciencia y la verdad que sean significativas para su vida, considerando conceptos y teorías epistemológicas fundamentales.', ['Contrastan las corrientes epistemológicas (racionalismo, empirismo, criticismo, escepticismo) respecto al origen y límites del conocimiento.', 'Analizan las teorías de la verdad (correspondencia, coherencia, consenso, pragmatismo) y el estatus del conocimiento científico.']],
    ['OA 06', 'Métodos de la Filosofía', 'Basal', 'Aplicar principios y herramientas elementales de argumentación en el diálogo y la escritura filosófica.', ['Escriben ensayos epistemológicos evaluando la validez de las premisas y la solidez de las conclusiones.']]
]);

addUnidad('III° MEDIO', 'FILOSOFIA', 4, 'Unidad 4: Diálogo filosófico y problemas contemporáneos de la ciencia y la tecnología', [
    ['OA 01', 'Filosofía', 'Basal', 'Describir las características del quehacer filosófico frente a las transformaciones científicas y tecnológicas actuales.', ['Analizan filosóficamente el impacto de la inteligencia artificial, la biotecnología y la técnica en la condición humana.']],
    ['OA 03', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas al ser y la realidad en el mundo contemporáneo.', ['Evalúan dilemas sobre realidad virtual, identidad personal y determinismo.']],
    ['OA 04', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas al conocimiento, la ciencia y la verdad en la era de la posverdad.', ['Examinan críticamente el fenómeno de la desinformación y la posverdad desde la epistemología.']]
]);

addUnidad('IV° MEDIO', 'FILOSOFIA', 1, 'Unidad 1: La filosofía como reflexión sobre la acción humana y la ética', [
    ['OA 01', 'Filosofía', 'Basal', 'Explicar los alcances, límites y fines del quehacer filosófico, considerando sus aportes al conocimiento y la acción, así como su relación con el saber científico y otras formas de conocimiento.', ['Justifican el aporte de la filosofía práctica para orientar la acción humana y el juicio moral.']],
    ['OA 02', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas a la praxis que sean significativas para su vida, considerando diversas teorías éticas fundamentales y conceptos como la justicia, la libertad y la igualdad.', ['Comparan las principales teorías éticas (ética de las virtudes de Aristóteles, deontología de Kant, utilitarismo de Mill, ética dialógica) frente a dilemas morales.']]
]);

addUnidad('IV° MEDIO', 'FILOSOFIA', 2, 'Unidad 2: Dilemas éticos y político-sociales: justicia, libertad, poder e igualdad', [
    ['OA 02', 'Filosofía', 'Basal', 'Formular preguntas filosóficas referidas a la praxis considerando conceptos como la justicia, la libertad, la responsabilidad y la igualdad.', ['Analizan teorías de la justicia y del contrato social (Hobbes, Locke, Rousseau, Rawls, Habermas) en relación con la convivencia democrática.']],
    ['OA 03', 'Filosofía', 'Complementario', 'Analizar y fundamentar problemas presentes en textos filosóficos, considerando sus supuestos, conceptos, métodos de razonamiento e implicancias en la vida cotidiana.', ['Deconstruyen textos de filosofía moral y política identificando sus tesis centrales y supuestos antropológicos.']],
    ['OA 05', 'Métodos de la Filosofía', 'Basal', 'Evaluar el impacto de ideas filosóficas relacionadas con la ontología, la epistemología y la ética en cuestiones actuales de la cultura, el mundo laboral, la tecnología, la política, las artes, entre otras posibilidades.', ['Debaten dilemas bioéticos, socioambientales y políticos fundamentando desde marcos éticos rigurosos.']]
]);

addUnidad('IV° MEDIO', 'FILOSOFIA', 3, 'Unidad 3: Filosofía, cultura, arte, género y tecnología en el mundo contemporáneo', [
    ['OA 03', 'Filosofía', 'Complementario', 'Analizar y fundamentar problemas presentes en textos filosóficos contemporáneos.', ['Analizan textos filosóficos sobre poder, técnica, género, estética y sociedad de consumo.']],
    ['OA 04', 'Métodos de la Filosofía', 'Basal', 'Dialogar filosóficamente sobre problemas contemporáneos de la ética y la política, confrontando diversas perspectivas y construyendo posturas autónomas.', ['Participan en seminarios socráticos y foros filosóficos construyendo argumentos propios y evaluando objeciones.']],
    ['OA 05', 'Métodos de la Filosofía', 'Basal', 'Evaluar el impacto de ideas filosóficas en cuestiones actuales de la cultura, el trabajo, la tecnología y la política.', ['Elaboran ensayos filosóficos analizando críticamente problemáticas del mundo contemporáneo.']]
]);

addUnidad('IV° MEDIO', 'FILOSOFIA', 4, 'Unidad 4: Síntesis filosófica: autonomía del pensamiento y responsabilidad ciudadana', [
    ['OA 01', 'Filosofía', 'Basal', 'Explicar los alcances, límites y fines del quehacer filosófico y su contribución a una ciudadanía crítica.', ['Sistematizan el aporte de la reflexión filosófica para el ejercicio de la autonomía moral y ciudadana.']],
    ['OA 02', 'Filosofía', 'Basal', 'Formular y defender posturas filosóficas fundamentadas en torno a problemas éticos y políticos contemporáneos.', ['Defienden oralmente y por escrito un ensayo filosófico original ante la comunidad educativa.']],
    ['OA 04', 'Métodos de la Filosofía', 'Basal', 'Dialogar filosóficamente aplicando exigencias lógicas, epistémicas y éticas de la argumentación.', ['Evalúan críticamente argumentos propios y ajenos en coloquios de cierre de ciclo.']]
]);

// ==========================================
// ARTES VISUALES (1° BÁSICO A II° MEDIO)
// ==========================================
const nivelesBasicaMedia = ['1° BASICO', '2° BASICO', '3° BASICO', '4° BASICO', '5° BASICO', '6° BASICO', '7° BASICO', '8° BASICO', 'I° MEDIO', 'II° MEDIO'];

const unidadesArtesPorCiclo = (nivel) => {
    if (['1° BASICO', '2° BASICO', '3° BASICO', '4° BASICO'].includes(nivel)) {
        return [
            [1, 'Unidad 1: Entorno natural, animales, plantas y experimentación con procedimientos de dibujo y pintura'],
            [2, 'Unidad 2: Entorno cultural, personas, paisajes y procedimientos de escultura y collage'],
            [3, 'Unidad 3: Universo, mitología, pueblos originarios y expresión visual tridimensional'],
            [4, 'Unidad 4: Obras de arte del patrimonio local y universal, movimientos artísticos y exposición']
        ];
    }
    if (['5° BASICO', '6° BASICO'].includes(nivel)) {
        return [
            [1, 'Unidad 1: Uso de las formas y del color: impresionismo, postimpresionismo y pintura expresiva'],
            [2, 'Unidad 2: La escultura, el volumen y el diseño en el espacio público y patrimonial'],
            [3, 'Unidad 3: Arte contemporáneo, grabado, fotografía y creación visual multimedial'],
            [4, 'Unidad 4: Diseño, patrimonio cultural americano y chileno, e instalación artística']
        ];
    }
    return [
        [1, 'Unidad 1: Creación visual, persona, naturaleza y experimentación con lenguajes pictóricos y gráficos'],
        [2, 'Unidad 2: Espacio, arquitectura, escultura, instalación y patrimonio cultural'],
        [3, 'Unidad 3: Artes mediales, fotografía, video, diseño e íconos sociales'],
        [4, 'Unidad 4: Difusión cultural, curaduría, montaje y apreciación crítica de las artes visuales']
    ];
};

for (const nivel of nivelesBasicaMedia) {
    for (const [numU, nombreU] of unidadesArtesPorCiclo(nivel)) {
        addUnidad(nivel, 'ARTES VISUALES', numU, nombreU, [
            ['OA 01', 'Expresar y Crear Visualmente', 'Basal', 'Crear trabajos de arte y diseños a partir de sus propias ideas y de la observación del entorno cultural y artístico, demostrando dominio de materiales, herramientas y procedimientos de las artes visuales.', ['Desarrollan bocetos y proyectos visuales fundamentados en la observación y la imaginación.', 'Experimentan y seleccionan materiales y soportes pertinentes a su propósito expresivo.']],
            ['OA 02', 'Expresar y Crear Visualmente', 'Complementario', 'Aplicar y combinar elementos del lenguaje visual (línea, forma, color, textura, volumen, espacio y composición) en trabajos de arte y diseño con diferentes propósitos expresivos y creativos.', ['Aplican intencionadamente contrastes cromáticos, texturas, proporciones y composición espacial en sus obras.']],
            ['OA 03', 'Expresar y Crear Visualmente', 'Basal', 'Crear trabajos de arte a partir de diversos desafíos, temas del entorno o referentes de la historia del arte, utilizando procedimientos de dibujo, pintura, grabado, escultura o artes mediales.', ['Ejecutan obras bidimensionales o tridimensionales demostrando cuidado técnico y originalidad.']],
            ['OA 04', 'Apreciar y Responder frente al Arte', 'Basal', 'Describir, analizar e interpretar obras de arte y diseño de diversas épocas y culturas, comunicando sus apreciaciones personales y juicios críticos sobre el lenguaje visual y el contexto.', ['Analizan elementos formales, simbólicos y contextuales de obras patrimoniales y contemporáneas.', 'Evalúan constructivamente sus propios trabajos visuales y los de sus pares.']]
        ]);
    }
}

// ==========================================
// MÚSICA (1° BÁSICO A II° MEDIO)
// ==========================================
const unidadesMusicaPorCiclo = (nivel) => {
    if (['1° BASICO', '2° BASICO', '3° BASICO', '4° BASICO'].includes(nivel)) {
        return [
            [1, 'Unidad 1: Escuchar, cualidades del sonido, pulso, ritmo y canto al unísono'],
            [2, 'Unidad 2: Expresión musical, juegos rítmicos, instrumentos de percusión y tradición oral'],
            [3, 'Unidad 3: Repertorio folclórico chileno y latinoamericano, danza e interpretación vocal e instrumental'],
            [4, 'Unidad 4: Creación sonora, relatos musicales, repertorio universal y presentación final']
        ];
    }
    return [
        [1, 'Unidad 1: Conociendo nuestra herencia musical: raíces folclóricas, americanas y repertorio vocal/instrumental'],
        [2, 'Unidad 2: Música, forma, polifonía e interpretación instrumental y vocal colaborativa'],
        [3, 'Unidad 3: La música en el cine, el teatro, los medios y la creación y arreglos musicales'],
        [4, 'Unidad 4: Compartiendo nuestra música: proyecto de interpretación, difusión y apreciación crítica']
    ];
};

for (const nivel of nivelesBasicaMedia) {
    for (const [numU, nombreU] of unidadesMusicaPorCiclo(nivel)) {
        addUnidad(nivel, 'MUSICA', numU, nombreU, [
            ['OA 01', 'Escuchar y Apreciar', 'Basal', 'Escuchar cualidades del sonido (altura, timbre, intensidad, duración) y elementos del lenguaje musical (pulsos, acentos, patrones, reiteraciones, contrastes, variaciones, dinámica, tempo) y representarlos de distintas formas.', ['Identifican auditivamente cualidades del sonido, timbres instrumentales y estructuras formales en obras escuchadas.']],
            ['OA 02', 'Escuchar y Apreciar', 'Complementario', 'Expresar sensaciones, emociones e ideas que les sugiere el sonido y la música escuchada, usando diversos medios expresivos (verbal, corporal, musical, visual).', ['Relacionan los recursos expresivos de una obra musical con las sensaciones, imágenes e ideas que evoca.']],
            ['OA 03', 'Escuchar y Apreciar', 'Basal', 'Escuchar música en forma abundante de diversos contextos y culturas, poniendo énfasis en tradición escrita (docta), tradición oral (folclor, música de pueblos originarios) y popular (jazz, rock, fusión, etc.).', ['Reconocen rasgos estilísticos y culturales del repertorio folclórico chileno, latinoamericano, popular y docto.']],
            ['OA 04', 'Interpretar y Crear', 'Basal', 'Cantar al unísono y a más voces y tocar instrumentos de percusión, melódicos y/o armónicos, demostrando precisión rítmica, afinación y expresividad.', ['Interpretan repertorio vocal e instrumental manteniendo el pulso, la afinación, la dinámica y el empaste grupal.']],
            ['OA 05', 'Interpretar y Crear', 'Complementario', 'Improvisar y crear ideas musicales con diversos medios sonoros con un dado propósito, utilizando las cualidades del sonido y elementos del lenguaje musical.', ['Crean acompañamientos rítmicos, arreglos sencillos o secuencias sonoras originales en grupo.']],
            ['OA 07', 'Reflexionar y Contextualizar', 'Basal', 'Identificar el rol de la música en la sociedad y reflexionar sobre sus propios procesos de audición, creación e interpretación musical.', ['Evalúan su desempeño musical individual y colectivo proponiendo mejoras técnicas y expresivas.']]
        ]);
    }
}

// ==========================================
// EDUCACIÓN FÍSICA Y SALUD (1° BÁSICO A II° MEDIO)
// ==========================================
const nivelesEdFisica = [...nivelesBasicaMedia, 'III° MEDIO', 'IV° MEDIO'];

for (const nivel of nivelesEdFisica) {
    const unidadesEF = [
        [1, 'Unidad 1: Habilidades motrices, acondicionamiento físico y vida activa saludable'],
        [2, 'Unidad 2: Juegos deportivos, deportes individuales y colectivos, táctica y trabajo en equipo'],
        [3, 'Unidad 3: Expresión motriz, danzas folclóricas y tradicionales, ritmo y coordinación'],
        [4, 'Unidad 4: Actividad física en el entorno natural, liderazgo, juego limpio y autocuidado']
    ];
    for (const [numU, nombreU] of unidadesEF) {
        addUnidad(nivel, 'EDUCACION FISICA Y SALUD', numU, nombreU, [
            ['OA 01', 'Habilidades Motrices', 'Basal', 'Demostrar control y aplicación de las habilidades motrices de locomoción, manipulación y estabilidad en una variedad de juegos, actividades gimnásticas y deportes individuales y colectivos.', ['Ejecutan secuencias motrices y fundamentos técnicos deportivos con coordinación, fluidez y control postural.']],
            ['OA 03', 'Habilidades Motrices', 'Complementario', 'Diseñar y aplicar estrategias y tácticas ofensivas y defensivas en juegos pre-deportivos y deportes colectivos, resolviendo problemas motrices en equipo.', ['Toman decisiones tácticas pertinentes de ocupación de espacios, pase y marca durante el juego colectivo.']],
            ['OA 05', 'Habilidades Motrices', 'Complementario', 'Ejecutar movimientos o elementos de danzas tradicionales, folclóricas y modernas, coordinando el ritmo con la expresión corporal.', ['Interpretan coreografías folclóricas y rítmicas demostrando coordinación espacio-temporal y trabajo colaborativo.']],
            ['OA 06', 'Vida Activa y Saludable', 'Basal', 'Ejecutar actividades físicas de intensidad moderada a vigorosa que desarrollen la condición física por medio de la práctica de ejercicios de resistencia cardiovascular, fuerza, flexibilidad y velocidad, estableciendo metas de superación personal.', ['Monitorean su frecuencia cardíaca y percepción de esfuerzo aplicando planes de entrenamiento orientados a la salud.']],
            ['OA 09', 'Vida Activa y Saludable', 'Basal', 'Practicar actividades físicas en forma segura, demostrando la adquisición de hábitos de higiene, posturales y de vida saludable (hidratación, alimentación equilibrada, calentamiento y vuelta a la calma).', ['Realizan calentamiento autónomo, mantienen hidratación adecuada y aplican medidas de seguridad e higiene personal.']],
            ['OA 11', 'Seguridad, Juego Limpio y Liderazgo', 'Basal', 'Practicar actividades físicas y/o juegos colectivos, demostrando responsabilidad, liderazgo, respeto por los demás y juego limpio (fair play).', ['Resuelven conflictos de manera pacífica, respetan las reglas y asumen roles de liderazgo positivo en la clase.']]
        ]);
    }
}

// ==========================================
// TECNOLOGÍA (1° BÁSICO A II° MEDIO)
// ==========================================
for (const nivel of nivelesBasicaMedia) {
    const unidadesTec = [
        [1, 'Unidad 1: Uso de software, herramientas digitales y búsqueda crítica de información (TIC)'],
        [2, 'Unidad 2: Identificación de necesidades y diseño de soluciones tecnológicas (Dibujo técnico y bocetos)'],
        [3, 'Unidad 3: Planificación y elaboración de objetos o sistemas tecnológicos y uso seguro de materiales'],
        [4, 'Unidad 4: Prueba, evaluación de calidad, impacto ambiental y comunicación de soluciones tecnológicas']
    ];
    for (const [numU, nombreU] of unidadesTec) {
        addUnidad(nivel, 'TECNOLOGIA', numU, nombreU, [
            ['OA 01', 'Diseñar, Hacer y Probar', 'Basal', 'Crear diseños de objetos o sistemas tecnológicos para resolver problemas o aprovechar oportunidades: desde diversos ámbitos tecnológicos y tópicos de otras asignaturas; representando sus ideas a través de dibujos a mano alzada, dibujo técnico o usando TIC.', ['Identifican oportunidades o necesidades del entorno y diseñan soluciones mediante bocetos, vistas y perspectivas.']],
            ['OA 02', 'Diseñar, Hacer y Probar', 'Basal', 'Planificar la elaboración de objetos o servicios tecnológicos, incorporando la secuencia de acciones, tiempos, costos y recursos necesarios o alternativos para lograr el resultado deseado.', ['Elaboran cartas Gantt o secuencias de operaciones especificando materiales, herramientas y medidas de seguridad.']],
            ['OA 03', 'Diseñar, Hacer y Probar', 'Complementario', 'Elaborar un producto u objeto tecnológico para resolver problemas y aprovechar oportunidades, seleccionando y demostrando dominio en el uso de técnicas, herramientas y materiales.', ['Construyen prototipos u objetos tecnológicos aplicando técnicas de medición, corte, unión y acabado con seguridad.']],
            ['OA 04', 'Diseñar, Hacer y Probar', 'Basal', 'Probar y evaluar la calidad de los trabajos propios o de otros, de forma individual o en equipos, aplicando criterios de funcionamiento, técnicos, medioambientales, estéticos y de seguridad.', ['Evalúan el funcionamiento, la sustentabilidad y la eficacia del objeto o servicio creado proponiendo mejoras.']],
            ['OA 05', 'Tecnologías de la Información y la Comunicación (TIC)', 'Basal', 'Usar software para organizar y comunicar ideas e información con diferentes propósitos mediante programas de presentación, hojas de cálculo, procesadores de texto o entornos de programación.', ['Utilizan herramientas ofimáticas y digitales de forma eficiente y segura para procesar datos y presentar proyectos.']]
        ]);
    }
}

// ==========================================
// ORIENTACIÓN (1° BÁSICO A II° MEDIO)
// ==========================================
for (const nivel of nivelesBasicaMedia) {
    const unidadesOri = [
        [1, 'Unidad 1: Crecimiento personal: autoconocimiento, identidad, autoestima y afectividad'],
        [2, 'Unidad 2: Bienestar y autocuidado: vida saludable, prevención de riesgos y bienestar socioemocional'],
        [3, 'Unidad 3: Relaciones interpersonales: empatía, buen trato, inclusión y resolución pacífica de conflictos'],
        [4, 'Unidad 4: Pertenencia, participación democrática en el curso y gestión del aprendizaje y proyecto de vida']
    ];
    for (const [numU, nombreU] of unidadesOri) {
        addUnidad(nivel, 'ORIENTACION', numU, nombreU, [
            ['OA 01', 'Crecimiento Personal', 'Basal', 'Observar, describir y valorar sus características, habilidades y fortalezas personales, reconociendo el sentido de sus acciones y proponiéndose metas de superación.', ['Identifican sus fortalezas personales, intereses y desafíos para el logro de sus metas académicas y formativas.']],
            ['OA 02', 'Crecimiento Personal', 'Basal', 'Identificar, distinguir y regular sus emociones y formas de expresarlas en relación consigo mismos y con los demás, favoreciendo el bienestar común.', ['Reconocen sus estados emocionales y aplican estrategias de autorregulación y expresión asertiva.']],
            ['OA 04', 'Bienestar y Autocuidado', 'Basal', 'Practicar en forma autónoma conductas protectoras y de autocuidado en relación con su cuerpo, su intimidad, el uso seguro de redes sociales y la prevención del consumo de sustancias.', ['Identifican factores de riesgo y protección en la vida cotidiana y en entornos digitales promoviendo el autocuidado.']],
            ['OA 05', 'Relaciones Interpersonales', 'Basal', 'Manifestar actitudes de solidaridad, empatía, inclusión y respeto, rechazando toda forma de violencia, acoso escolar (bullying o ciberbullying) y discriminación.', ['Practican el buen trato, la escucha activa y el respeto a la diversidad dentro de la comunidad escolar.']],
            ['OA 06', 'Relaciones Interpersonales', 'Complementario', 'Resolver conflictos de convivencia entre pares en forma guiada o autónoma, aplicando estrategias de diálogo, mediación y búsqueda de acuerdos pacíficos.', ['Aplican pasos de mediación y negociación pacífica frente a desacuerdos cotidianos en el curso.']],
            ['OA 07', 'Pertenencia y Participación Democrática', 'Basal', 'Participar activa y colaborativamente en la vida del curso y de la escuela (Consejo de Curso, proyectos solidarios, directivas) cumpliendo compromisos y acuerdos democráticos.', ['Organizan y evalúan iniciativas del Consejo de Curso asumiendo responsabilidades compartidas.']],
            ['OA 08', 'Gestión y Proyección del Aprendizaje', 'Complementario', 'Desarrollar hábitos de estudio, organización del tiempo y trabajo autónomo que favorezcan su proceso de aprendizaje y su proyecto de vida.', ['Planifican su estudio, utilizan técnicas de organización escolar y evalúan el cumplimiento de sus metas.']]
        ]);
    }
}

module.exports = oas;
