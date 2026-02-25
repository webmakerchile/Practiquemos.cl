const SIGN_IMAGES: Record<string, string> = {
  pare: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chilean_Road_Sign_R1-1.svg/200px-Chilean_Road_Sign_R1-1.svg.png',
  ceda_paso: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chilean_Road_Sign_R1-2.svg/200px-Chilean_Road_Sign_R1-2.svg.png',
  velocidad_max_30: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Chilean_Road_Sign_R4-1_30.svg/200px-Chilean_Road_Sign_R4-1_30.svg.png',
  velocidad_max_40: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Chilean_Road_Sign_R4-1_40.svg/200px-Chilean_Road_Sign_R4-1_40.svg.png',
  velocidad_max_50: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chilean_Road_Sign_R4-1_50.svg/200px-Chilean_Road_Sign_R4-1_50.svg.png',
  velocidad_max_60: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Chilean_Road_Sign_R4-1_60.svg/200px-Chilean_Road_Sign_R4-1_60.svg.png',
  velocidad_max_80: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Chilean_Road_Sign_R4-1_80.svg/200px-Chilean_Road_Sign_R4-1_80.svg.png',
  velocidad_max_100: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Chilean_Road_Sign_R4-1_100.svg/200px-Chilean_Road_Sign_R4-1_100.svg.png',
  velocidad_max_120: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Chilean_Road_Sign_R4-1_120.svg/200px-Chilean_Road_Sign_R4-1_120.svg.png',
  no_adelantar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chilean_Road_Sign_R5-1.svg/200px-Chilean_Road_Sign_R5-1.svg.png',
  no_girar_izquierda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Chilean_Road_Sign_R3-2.svg/200px-Chilean_Road_Sign_R3-2.svg.png',
  no_girar_derecha: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Chilean_Road_Sign_R3-1.svg/200px-Chilean_Road_Sign_R3-1.svg.png',
  direccion_prohibida: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Chilean_Road_Sign_R2-1.svg/200px-Chilean_Road_Sign_R2-1.svg.png',
  solo_derecha: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Chilean_Road_Sign_R6-1.svg/200px-Chilean_Road_Sign_R6-1.svg.png',
  solo_izquierda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Chilean_Road_Sign_R6-2.svg/200px-Chilean_Road_Sign_R6-2.svg.png',
  curva_derecha: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Chilean_Road_Sign_P1-1.svg/200px-Chilean_Road_Sign_P1-1.svg.png',
  curva_izquierda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Chilean_Road_Sign_P1-2.svg/200px-Chilean_Road_Sign_P1-2.svg.png',
  curva_peligrosa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Chilean_Road_Sign_P1-1.svg/200px-Chilean_Road_Sign_P1-1.svg.png',
  peatones: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Chilean_Road_Sign_P5-2.svg/200px-Chilean_Road_Sign_P5-2.svg.png',
  ninos: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Chilean_Road_Sign_P5-1.svg/200px-Chilean_Road_Sign_P5-1.svg.png',
  semaforo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Chilean_Road_Sign_P7-1.svg/200px-Chilean_Road_Sign_P7-1.svg.png',
  cruce_ferroviario: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Chilean_Road_Sign_P3-1.svg/200px-Chilean_Road_Sign_P3-1.svg.png',
  badenes: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Chilean_Road_Sign_P8-2.svg/200px-Chilean_Road_Sign_P8-2.svg.png',
  calle_sin_salida: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Chilean_Road_Sign_I5-1.svg/200px-Chilean_Road_Sign_I5-1.svg.png',
  estacionamiento: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chilean_Road_Sign_I4-1.svg/200px-Chilean_Road_Sign_I4-1.svg.png',
  no_estacionar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Chilean_Road_Sign_R8-1.svg/200px-Chilean_Road_Sign_R8-1.svg.png',
  cruce_peatonal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Chilean_Road_Sign_I2-1.svg/200px-Chilean_Road_Sign_I2-1.svg.png',
  autopista: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chilean_Road_Sign_I1-1.svg/200px-Chilean_Road_Sign_I1-1.svg.png',
  zona_escolar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Chilean_Road_Sign_P5-1.svg/200px-Chilean_Road_Sign_P5-1.svg.png',
  animales: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Chilean_Road_Sign_P6-1.svg/200px-Chilean_Road_Sign_P6-1.svg.png',
  obras: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Chilean_Road_Sign_P9-1.svg/200px-Chilean_Road_Sign_P9-1.svg.png',
  amarilla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Chilean_Road_Sign_P1-1.svg/200px-Chilean_Road_Sign_P1-1.svg.png',
  roja_octogonal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chilean_Road_Sign_R1-1.svg/200px-Chilean_Road_Sign_R1-1.svg.png',
  triangulo_invertido: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chilean_Road_Sign_R1-2.svg/200px-Chilean_Road_Sign_R1-2.svg.png',
  luz_roja: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Traffic_lights_3_states.svg/80px-Traffic_lights_3_states.svg.png',
  luz_verde: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Traffic_lights_3_states.svg/80px-Traffic_lights_3_states.svg.png',
  luz_amarilla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Traffic_lights_3_states.svg/80px-Traffic_lights_3_states.svg.png',
  semaforo_peatonal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Traffic_lights_3_states.svg/80px-Traffic_lights_3_states.svg.png',
};

const KEYWORD_MAP: Array<{ keywords: string[]; imageKey: string }> = [
  { keywords: ['PARE', 'señal de PARE', 'octagonal roja', 'octogonal'], imageKey: 'pare' },
  { keywords: ['CEDA EL PASO', 'ceda el paso', 'triángulo invertido'], imageKey: 'ceda_paso' },
  { keywords: ['30 km', '30km', 'velocidad máxima de 30'], imageKey: 'velocidad_max_30' },
  { keywords: ['40 km', '40km', 'velocidad máxima de 40'], imageKey: 'velocidad_max_40' },
  { keywords: ['50 km', '50km', 'velocidad máxima de 50'], imageKey: 'velocidad_max_50' },
  { keywords: ['60 km', '60km', 'velocidad máxima de 60'], imageKey: 'velocidad_max_60' },
  { keywords: ['80 km', '80km', 'velocidad máxima de 80'], imageKey: 'velocidad_max_80' },
  { keywords: ['100 km', '100km', 'velocidad máxima de 100'], imageKey: 'velocidad_max_100' },
  { keywords: ['120 km', '120km', 'velocidad máxima de 120'], imageKey: 'velocidad_max_120' },
  { keywords: ['no adelantar', 'prohibido adelantar', 'prohibido sobrepasar'], imageKey: 'no_adelantar' },
  { keywords: ['no girar a la izquierda', 'prohibido girar izquierda'], imageKey: 'no_girar_izquierda' },
  { keywords: ['no girar a la derecha', 'prohibido girar derecha'], imageKey: 'no_girar_derecha' },
  { keywords: ['dirección prohibida', 'prohibido el tránsito', 'acceso prohibido'], imageKey: 'direccion_prohibida' },
  { keywords: ['solo derecha', 'únicamente derecha', 'gire derecha'], imageKey: 'solo_derecha' },
  { keywords: ['solo izquierda', 'únicamente izquierda', 'gire izquierda'], imageKey: 'solo_izquierda' },
  { keywords: ['curva a la derecha', 'curva pronunciada derecha'], imageKey: 'curva_derecha' },
  { keywords: ['curva a la izquierda', 'curva pronunciada izquierda'], imageKey: 'curva_izquierda' },
  { keywords: ['curva peligrosa', 'curvas peligrosas', 'doble curva'], imageKey: 'curva_peligrosa' },
  { keywords: ['peatones', 'paso peatonal', 'cruce peatonal'], imageKey: 'cruce_peatonal' },
  { keywords: ['zona escolar', 'escuela', 'niños', 'zona de niños'], imageKey: 'zona_escolar' },
  { keywords: ['semáforo', 'semaforo', 'luz roja', 'luz verde', 'luz amarilla', 'señal luminosa'], imageKey: 'semaforo' },
  { keywords: ['cruce ferroviario', 'paso a nivel', 'ferrocarril', 'tren'], imageKey: 'cruce_ferroviario' },
  { keywords: ['baden', 'badén', 'lomada', 'resalto'], imageKey: 'badenes' },
  { keywords: ['estacionamiento prohibido', 'no estacionar', 'prohibido estacionar'], imageKey: 'no_estacionar' },
  { keywords: ['estacionamiento', 'zona de estacionamiento'], imageKey: 'estacionamiento' },
  { keywords: ['autopista', 'autoexpreso', 'vía rápida'], imageKey: 'autopista' },
  { keywords: ['animales', 'ganado', 'animal'], imageKey: 'animales' },
  { keywords: ['obras', 'trabajo vial', 'trabajadores'], imageKey: 'obras' },
  { keywords: ['amarilla', 'romboidales', 'fondo amarillo', 'preventiva'], imageKey: 'amarilla' },
  { keywords: ['octogonal', 'octagonal', 'fondo rojo reglamentaria'], imageKey: 'roja_octogonal' },
];

const VISUAL_CATEGORIES = [
  'Señalización',
  'Señales Reglamentarias',
  'Señales Preventivas',
  'Señales Informativas',
];

export function getQuestionImage(question: { pregunta: string; categoria: string; id: number }): string | null {
  if (!VISUAL_CATEGORIES.includes(question.categoria)) {
    return null;
  }

  const text = question.pregunta.toLowerCase();

  for (const { keywords, imageKey } of KEYWORD_MAP) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        return SIGN_IMAGES[imageKey] || null;
      }
    }
  }

  if (question.categoria === 'Señales Reglamentarias') {
    return SIGN_IMAGES['pare'];
  }
  if (question.categoria === 'Señales Preventivas') {
    return SIGN_IMAGES['amarilla'];
  }
  if (question.categoria === 'Señales Informativas') {
    return SIGN_IMAGES['calle_sin_salida'];
  }
  if (question.categoria === 'Señalización') {
    return SIGN_IMAGES['semaforo'];
  }

  return null;
}
