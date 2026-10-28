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
// 1° A 4° BÁSICO - INGLÉS (Propuesta Curricular MINEDUC)
// ==========================================
const unidadesInglesBasicaInicial = {
    '1° BASICO': [
        [1, 'Unit 1: In my classroom (Greetings, school objects and classroom instructions)'],
        [2, 'Unit 2: My family and my pets (Family members, pets and numbers 1-10)'],
        [3, 'Unit 3: My body and my clothes (Parts of the body, colors and toys)'],
        [4, 'Unit 4: Let\'s celebrate! (Food, birthday parties and weather)']
    ],
    '2° BASICO': [
        [1, 'Unit 1: At the zoo (Wild animals, actions and numbers 1-20)'],
        [2, 'Unit 2: My house and my things (Rooms of the house, furniture and prepositions)'],
        [3, 'Unit 3: What\'s the weather like? (Weather, clothes and seasons)'],
        [4, 'Unit 4: Jobs and my community (Occupations, places in town and daily routines)']
    ],
    '3° BASICO': [
        [1, 'Unit 1: My clothes and my week (Clothing, days of the week and preferences)'],
        [2, 'Unit 2: The natural world (Animals, habitats and abilities with can/can\'t)'],
        [3, 'Unit 3: Delicious food! (Healthy food, meals and likes/dislikes)'],
        [4, 'Unit 4: Technology and free time (Sports, hobbies and gadgets)']
    ],
    '4° BASICO': [
        [1, 'Unit 1: How do you feel? (Feelings, health problems and school subjects)'],
        [2, 'Unit 2: Around town (Places in the city, directions and means of transport)'],
        [3, 'Unit 3: What\'s the time? (Daily routines, telling the time and months)'],
        [4, 'Unit 4: Let\'s go shopping! (Numbers up to 100, prices and celebrations)']
    ]
};

for (const [nivel, unidades] of Object.entries(unidadesInglesBasicaInicial)) {
    for (const [numU, nombreU] of unidades) {
        addUnidad(nivel, 'INGLES', numU, nombreU, [
            ['OA 01', 'Comprensión Auditiva', 'Basal', 'Comprender textos leídos por un adulto o en formato audiovisual, breves y simples, como rimas, chants, canciones, cuentos y diálogos asociados a los temas de la unidad.', ['Identifican vocabulario clave e instrucciones orales apoyándose en imágenes y gestos.', 'Siguen rimas, canciones y diálogos breves en inglés.']],
            ['OA 02', 'Comprensión Auditiva', 'Complementario', 'Comprender textos orales relacionados con temas conocidos o de otras asignaturas que contengan las funciones y el vocabulario temático de la unidad.', ['Reconocen información específica (colores, números, objetos, lugares) en textos escuchados.']],
            ['OA 05', 'Comprensión de Lectura', 'Basal', 'Leer y demostrar comprensión de textos como cuentos, rimas, chants, tarjetas de saludo, instrucciones y textos informativos muy breves y simples.', ['Asocian palabras y oraciones simples leídas con sus respectivas ilustraciones.', 'Ordenan secuencias de cuentos o instrucciones breves.']],
            ['OA 07', 'Expresión Oral', 'Basal', 'Participar en interacciones de la clase y exposiciones muy breves y simples, acerca de temas conocidos o de otras asignaturas, usando apoyo visual y frases modelo.', ['Responden preguntas simples y participan en diálogos breves utilizando vocabulario de la unidad.']],
            ['OA 09', 'Expresión Escrita', 'Basal', 'Escribir, sobre la base de imágenes, palabras, rótulos y oraciones simples para identificar objetos, describir personas o lugares y expresar preferencias.', ['Completan fichas, rotulan imágenes y escriben oraciones breves siguiendo un modelo.']]
        ]);
    }
}

// ==========================================
// 5° A 8° BÁSICO - INGLÉS (Bases Curriculares 5° a 8° Básico)
// ==========================================
const unidadesIngles5a8 = {
    '5° BASICO': [
        [1, 'Unit 1: My world (Personal information, school life, family and routines)'],
        [2, 'Unit 2: The place where I live (My house, neighborhood, town and rooms)'],
        [3, 'Unit 3: What we eat (Food, drinks, healthy habits and recipes)'],
        [4, 'Unit 4: What\'s the weather like? (Weather, seasons, clothes and holidays)']
    ],
    '6° BASICO': [
        [1, 'Unit 1: Food and health (Healthy lifestyle, sports, illnesses and advice)'],
        [2, 'Unit 2: Around town (Places in the city, occupations, directions and rules)'],
        [3, 'Unit 3: The natural world (Animals, habitats, geographical features and environment)'],
        [4, 'Unit 4: Let\'s travel! (Means of transport, holidays, past experiences and plans)']
    ],
    '7° BASICO': [
        [1, 'Unit 1: Feelings and opinions (Emotions, personal opinions, youth life and friendship)'],
        [2, 'Unit 2: Healthy habits (Nutrition, physical activity, quantity expressions and routines)'],
        [3, 'Unit 3: Sports and free timeactivities (Sports, equipment, past events and biographies)'],
        [4, 'Unit 4: Green issues (Environment, recycling, climate change and volunteer work)']
    ],
    '8° BASICO': [
        [1, 'Unit 1: Information and communication technologies (Apps, social media, technology and preferences)'],
        [2, 'Unit 2: Countries, cultures and customs (Cultural diversity, traditions, comparisons and travel)'],
        [3, 'Unit 3: Going places (Tourism, itineraries, future plans and predictions)'],
        [4, 'Unit 4: Future matters (Clean energy, technological advances, environment and conditions)']
    ]
};

for (const [nivel, unidades] of Object.entries(unidadesIngles5a8)) {
    for (const [numU, nombreU] of unidades) {
        addUnidad(nivel, 'INGLES', numU, nombreU, [
            ['OA 01', 'Comprensión Auditiva', 'Basal', 'Demostrar comprensión de ideas generales e información explícita en textos orales adaptados y auténticos simples, literarios y no literarios, en diversos formatos audiovisuales acerca de los temas de la unidad.', ['Identifican la idea general y detalles específicos en diálogos, anuncios y reportajes breves en inglés.', 'Extraen información clave completando tablas u organizadores gráficos.']],
            ['OA 02', 'Comprensión Auditiva', 'Complementario', 'Identificar palabras y frases clave, expresiones de uso frecuente, vocabulario temático, conectores y sonidos propios del inglés en textos orales.', ['Reconocen expresiones idiomáticas, conectores y pronunciación de vocabulario temático de la unidad.']],
            ['OA 05', 'Comprensión de Lectura', 'Complementario', 'Leer y demostrar comprensión de textos adaptados y auténticos simples no literarios, que contengan palabras de uso frecuente, familias de palabras y repetición de frases.', ['Localizan información específica mediante lectura rápida (scanning) y global (skimming).']],
            ['OA 06', 'Comprensión de Lectura', 'Basal', 'Leer comprensivamente textos no literarios, como notas, postales, invitaciones, tarjetas de saludo, menús, recetas, diálogos, instrucciones o emails, identificando propósito del texto, ideas generales e información explícita.', ['Identifican el propósito comunicativo, las ideas principales y detalles en correos, artículos y folletos.', 'Relacionan el contenido leído con sus propios conocimientos y experiencias.']],
            ['OA 09', 'Comprensión de Lectura', 'Basal', 'Usar las siguientes estrategias para apoyar la comprensión de los textos leídos, tanto en formato digital como impreso: prelectura, lectura y poslectura.', ['Apoyan su comprensión lectora utilizando cognados, claves contextuales, elementos visuales y diccionarios.']],
            ['OA 12', 'Expresión Oral', 'Basal', 'Expresarse oralmente, ya sea en diálogos, presentaciones o actividades grupales, con apoyo de lenguaje visual y/o digital, en torno a los temas del año.', ['Participan en diálogos, juegos de rol y presentaciones breves aplicando las estructuras gramaticales y el vocabulario de la unidad.']],
            ['OA 14', 'Expresión Escrita', 'Basal', 'Escribir, de acuerdo a un modelo y con apoyo de lenguaje visual, textos no literarios (como email, postal, agenda, invitación, noticia, folleto) y textos literarios (como rimas, tiras cómicas) con el propósito de compartir información en torno a los temas del año.', ['Escriben textos breves (correos, descripciones, afiches, relatos) aplicando vocabulario temático, conectores y estructuras del nivel.']],
            ['OA 15', 'Expresión Escrita', 'Complementario', 'Escribir para informar, expresar opiniones y narrar acerca de los temas de la unidad, aplicando el proceso de escritura (planificación, borrador, revisión y edición).', ['Planifican y revisan sus textos corrigiendo ortografía, puntuación y estructuras gramaticales básicas en inglés.']]
        ]);
    }
}

// ==========================================
// I° Y II° MEDIO - INGLÉS
// ==========================================
const unidadesIngles1y2Medio = {
    'I° MEDIO': [
        [1, 'Unit 1: Jobs (Work world, youth employment, interviews, skills and personal goals)'],
        [2, 'Unit 2: Education and lifelong learning (Study habits, school challenges, learning styles and technology in education)'],
        [3, 'Unit 3: The Arts (Music, visual arts, literature, cinema, cultural expressions and reviews)'],
        [4, 'Unit 4: Traditions and festivities (Celebrations around the world, heritage, myths and cultural identity)']
    ],
    'II° MEDIO': [
        [1, 'Unit 1: Globalization and communication (Global issues, intercultural communication, media and stereotypes)'],
        [2, 'Unit 2: Technology and its effects (Inventions, digital footprint, artificial intelligence and daily life impact)'],
        [3, 'Unit 3: Outstanding people (Leaders, scientists, artists, role models, biographies and human rights)'],
        [4, 'Unit 4: Sustainable development (Renewable energies, environmental protection, eco-friendly actions and future challenges)']
    ]
};

for (const [nivel, unidades] of Object.entries(unidadesIngles1y2Medio)) {
    for (const [numU, nombreU] of unidades) {
        addUnidad(nivel, 'INGLES', numU, nombreU, [
            ['OA 01', 'Comprensión Auditiva', 'Basal', 'Demostrar comprensión de ideas generales e información explícita en textos orales adaptados y auténticos simples, literarios y no literarios, en diversos formatos audiovisuales (como exposiciones orales, conversaciones, entrevistas, descripciones, instrucciones, noticias, documentales y películas) acerca de los temas de la unidad.', ['Identifican ideas principales, puntos de vista del hablante y detalles específicos en entrevistas, podcasts y reportajes.', 'Sintetizan la información escuchada mediante esquemas y resúmenes.']],
            ['OA 04', 'Comprensión Auditiva', 'Complementario', 'Seleccionar y usar estrategias para apoyar la comprensión de los textos escuchados: hacer predicciones, escuchar con un propósito, tomar notas y confirmar predicciones.', ['Toman apuntes estructurados y verifican hipótesis de escucha en textos audiovisuales.']],
            ['OA 08', 'Comprensión de Lectura', 'Basal', 'Demostrar conocimiento y uso del lenguaje en conversaciones, discusiones y exposiciones por medio de las siguientes funciones: expresar cantidades, describir frecuencia, expresar opiniones, dar consejos, relatar hechos pasados y planes futuros, conectar ideas y describir procesos.', ['Utilizan adecuadamente tiempos verbales, verbos modales y conectores discursivos en interacciones orales.']],
            ['OA 09', 'Comprensión de Lectura', 'Basal', 'Demostrar comprensión de ideas generales e información explícita en textos adaptados y auténticos simples, en formato impreso o digital, acerca de temas variados y del interés de los alumnos.', ['Analizan artículos, biografías, reseñas e infografías distinguiendo ideas centrales, argumentos y datos de apoyo.']],
            ['OA 10', 'Comprensión de Lectura', 'Complementario', 'Demostrar comprensión de textos no literarios (como descripciones, artículos de revista, procedimientos, catálogos, avisos publicitarios, emails, diálogos, páginas web, biografías, gráficos, reseñas, noticias) al identificar propósito, ideas generales, información específica y detalles.', ['Evalúan el propósito comunicativo, el tono del autor y las relaciones causa-efecto en textos informativos y argumentativos.']],
            ['OA 12', 'Comprensión de Lectura', 'Basal', 'Seleccionar y usar estrategias para apoyar la comprensión de los textos leídos: prelectura (hacer predicciones), lectura (focalizar la atención, inferir significados por contexto) y poslectura (resumir y organizar información).', ['Infieren el significado de vocabulario desconocido por contexto y elaboran organizadores gráficos de poslectura.']],
            ['OA 14', 'Expresión Escrita', 'Basal', 'Escribir una variedad de textos breves, como cuentos, correos electrónicos, folletos, rimas, descripciones, biografías, instrucciones, artículos, cartas y resúmenes utilizando los pasos del proceso de escritura (organizar ideas, redactar, revisar, editar, publicar).', ['Redactan artículos, correos formales, biografías o reseñas organizando párrafos coherentes con introducción, desarrollo y cierre.']],
            ['OA 16', 'Expresión Escrita', 'Complementario', 'Demostrar conocimiento y uso del lenguaje en sus textos escritos por medio de las funciones y estructuras gramaticales correspondientes al nivel.', ['Emplean vocabulario variado, conectores lógicos y estructuras gramaticales precisas en sus producciones escritas.']]
        ]);
    }
}

// ==========================================
// III° Y IV° MEDIO - INGLÉS (Plan Común FG)
// ==========================================
const unidadesIngles3y4Medio = {
    'III° MEDIO': [
        [1, 'Unit 1: My first job (Entering the workforce, CV, cover letters, job interviews and labor rights)'],
        [2, 'Unit 2: Custom and traditions (Cultural heritage, global citizenship, diversity and social changes)'],
        [3, 'Unit 3: Health and modern life (Mental and physical wellbeing, stress management, nutrition and medical advances)'],
        [4, 'Unit 4: Aier and sustainable world (Volunteerism, social action, environmental responsibility and innovation)']
    ],
    'IV° MEDIO': [
        [1, 'Unit 1: Youth rights and responsibilities (Human rights, civic participation, ethics and youth challenges)'],
        [2, 'Unit 2: Discoveries and creations (Scientific breakthroughs, technological ethics, art and human progress)'],
        [3, 'Unit 3: Keeping up with technology (Digital society, cybersecurity, future professions and lifelong learning)'],
        [4, 'Unit 4: Life projects and global challenges (Higher education, career paths, global issues and personal vision)']
    ]
};

for (const [nivel, unidades] of Object.entries(unidadesIngles3y4Medio)) {
    for (const [numU, nombreU] of unidades) {
        addUnidad(nivel, 'INGLES', numU, nombreU, [
            ['OA 01', 'Comprensión (Lectura y Auditiva)', 'Basal', 'Comprender información central de textos orales y escritos en contextos relacionados con sus intereses e inquietudes, con el fin de conocer las maneras en que otras culturas abordan dichos contextos.', ['Extraen y comparan las ideas centrales, posturas y perspectivas culturales en artículos, charlas (TED talks), entrevistas y reportajes en inglés.']],
            ['OA 02', 'Comprensión y Expresión', 'Complementario', 'Producir textos orales y escritos claros en contextos relacionados con sus intereses e inquietudes, con el fin de expresar una postura personal crítica que respeta otras posturas.', ['Expresan y fundamentan su postura en debates, foros, ensayos breves y presentaciones orales respetando puntos de vista diversos.']],
            ['OA 03', 'Expresión Oral y Escrita', 'Basal', 'Utilizar su conocimiento del inglés en la comprensión y producción de textos orales y escritos breves y claros, con el fin de construir una postura personal crítica en contextos relacionados con sus intereses e inquietudes.', ['Redactan textos funcionales y argumentativos (CV, cartas de postulación, ensayos de opinión, reseñas críticas) aplicando estructuras avanzadas y vocabulario preciso.']],
            ['OA 04', 'Expresión Oral y Escrita', 'Basal', 'Producir y comprender con fluidez textos orales y escritos breves y claros en situaciones comunicativas que involucren otras visiones de mundo y la propia, con el fin de interactuar y tomar conciencia de su propia identidad.', ['Interactúan con fluidez y pertinencia comunicativa en entrevistas simuladas, discusiones grupales y proyectos colaborativos en inglés.']]
        ]);
    }
}

module.exports = oas;
