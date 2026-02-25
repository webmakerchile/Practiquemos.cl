import { ImageSourcePropType } from 'react-native';

export interface QuestionVisual {
  type: 'image';
  source: ImageSourcePropType;
}

const IMG = {
  interseccionGiro: require('../assets/images/questions/interseccion-giro.png'),
  senalPare: require('../assets/images/questions/senal-pare.png'),
  velocidadUrbana: require('../assets/images/questions/velocidad-urbana.png'),
  crucePeatonal: require('../assets/images/questions/cruce-peatonal.png'),
  semaforoRojo: require('../assets/images/questions/semaforo-rojo.png'),
  adelantamiento: require('../assets/images/questions/adelantamiento.png'),
  autopista: require('../assets/images/questions/autopista.png'),
  estacionamiento: require('../assets/images/questions/estacionamiento.png'),
  lluvia: require('../assets/images/questions/lluvia.png'),
  conduccionNocturna: require('../assets/images/questions/conduccion-nocturna.png'),
  rotonda: require('../assets/images/questions/rotonda.png'),
  zonaEscolar: require('../assets/images/questions/zona-escolar.png'),
  cruceFerroviario: require('../assets/images/questions/cruce-ferroviario.png'),
  zonaObras: require('../assets/images/questions/zona-obras.png'),
  tablero: require('../assets/images/questions/tablero.png'),
  neumaticos: require('../assets/images/questions/neumaticos.png'),
  trianguloEmergencia: require('../assets/images/questions/triangulo-emergencia.png'),
  cinturon: require('../assets/images/questions/cinturon.png'),
  espejos: require('../assets/images/questions/espejos.png'),
  primerosAuxilios: require('../assets/images/questions/primeros-auxilios.png'),
  cedaPaso: require('../assets/images/questions/ceda-paso.png'),
  motor: require('../assets/images/questions/motor.png'),
  distanciaSegura: require('../assets/images/questions/distancia-segura.png'),
  niebla: require('../assets/images/questions/niebla.png'),
  alcohol: require('../assets/images/questions/alcohol.png'),
  accidente: require('../assets/images/questions/accidente.png'),
  cambioCarril: require('../assets/images/questions/cambio-carril.png'),
  noEstacionar: require('../assets/images/questions/no-estacionar.png'),
  luces: require('../assets/images/questions/luces.png'),
  medioAmbiente: require('../assets/images/questions/medio-ambiente.png'),
  curva: require('../assets/images/questions/curva.png'),
  vehiculoEmergencia: require('../assets/images/questions/vehiculo-emergencia.png'),
  ciclista: require('../assets/images/questions/ciclista.png'),
  volante: require('../assets/images/questions/volante.png'),
  frenos: require('../assets/images/questions/frenos.png'),
  licencia: require('../assets/images/questions/licencia.png'),
  extintor: require('../assets/images/questions/extintor.png'),
  bateria: require('../assets/images/questions/bateria.png'),
  senalesTipos: require('../assets/images/questions/senales-tipos.png'),
  gasolinera: require('../assets/images/questions/gasolinera.png'),
};

const KEYWORD_IMAGES: Array<{ kw: string[]; img: ImageSourcePropType }> = [
  { kw: ['pare', 'señal pare', 'octagonal roja', 'octogonal', 'detenerse completamente'], img: IMG.senalPare },
  { kw: ['ceda el paso', 'triángulo invertido', 'ceda paso', 'ceder el paso'], img: IMG.cedaPaso },
  { kw: ['30 km', '30km', '40 km', '40km', '50 km', '50km', '60 km', '60km', '80 km', '80km', '100 km', '100km', '120 km', '120km', 'velocidad máxima', 'límite de velocidad', 'exceso de velocidad'], img: IMG.velocidadUrbana },
  { kw: ['zona urbana'], img: IMG.velocidadUrbana },
  { kw: ['no adelantar', 'prohibido adelantar', 'prohibido sobrepasar', 'adelantar', 'adelantamiento', 'sobrepasar', 'rebasar'], img: IMG.adelantamiento },
  { kw: ['no girar', 'prohibido girar', 'no virar', 'gire derecha', 'solo derecha', 'gire izquierda', 'solo izquierda', 'dirección obligatoria'], img: IMG.interseccionGiro },
  { kw: ['dirección prohibida', 'prohibido el tránsito', 'acceso prohibido', 'no entrar'], img: IMG.senalPare },
  { kw: ['curva', 'curvas', 'curva peligrosa', 'doble curva'], img: IMG.curva },
  { kw: ['rotonda', 'glorieta', 'redondel'], img: IMG.rotonda },
  { kw: ['pendiente', 'bajada', 'cuesta abajo', 'cuesta arriba'], img: IMG.curva },
  { kw: ['doble sentido', 'doble vía', 'ambos sentidos'], img: IMG.cambioCarril },
  { kw: ['semáforo', 'semaforo', 'señal luminosa', 'luz de tránsito', 'luz roja', 'luz verde', 'luz amarilla', 'ámbar'], img: IMG.semaforoRojo },
  { kw: ['cruce peatonal', 'paso peatonal', 'paso de cebra', 'cruce de peatones', 'peatón', 'peatones', 'peatonal'], img: IMG.crucePeatonal },
  { kw: ['zona escolar', 'escuela', 'niños cruzando', 'zona de niños', 'niños'], img: IMG.zonaEscolar },
  { kw: ['cruce ferroviario', 'paso a nivel', 'ferrocarril', 'vías del tren', 'tren'], img: IMG.cruceFerroviario },
  { kw: ['badén', 'baden', 'lomada', 'resalto', 'reductor de velocidad', 'lomo de toro'], img: IMG.curva },
  { kw: ['estacionamiento prohibido', 'no estacionar', 'prohibido estacionar'], img: IMG.noEstacionar },
  { kw: ['estacionar', 'estacionamiento', 'aparcar'], img: IMG.estacionamiento },
  { kw: ['autopista', 'autoexpreso', 'vía rápida', 'carretera'], img: IMG.autopista },
  { kw: ['animales', 'ganado', 'animal en la vía'], img: IMG.curva },
  { kw: ['obras', 'trabajo vial', 'trabajadores', 'zona de trabajo', 'construcción'], img: IMG.zonaObras },
  { kw: ['hospital', 'centro de salud', 'clínica'], img: IMG.vehiculoEmergencia },
  { kw: ['gasolinera', 'estación de servicio', 'bencinera', 'combustible', 'gasolina', 'bencina'], img: IMG.gasolinera },
  { kw: ['bicicleta', 'ciclista', 'ciclovía'], img: IMG.ciclista },
  { kw: ['calle sin salida', 'sin salida'], img: IMG.senalesTipos },
  { kw: ['virar en u', 'giro en u', 'vuelta en u'], img: IMG.interseccionGiro },

  { kw: ['cinturón', 'cinturon', 'cinturón de seguridad', 'abrocharse', 'abrochar'], img: IMG.cinturon },
  { kw: ['casco', 'casco protector'], img: IMG.cinturon },
  { kw: ['espejo', 'espejos', 'retrovisor', 'retrovisores'], img: IMG.espejos },
  { kw: ['volante', 'manos al volante'], img: IMG.volante },
  { kw: ['luces', 'focos', 'faros', 'luces altas', 'luces bajas', 'luces de cruce', 'luces largas', 'luces cortas', 'encender luces', 'iluminación'], img: IMG.luces },
  { kw: ['neumático', 'neumatico', 'neumáticos', 'llanta', 'llantas', 'rueda', 'presión de los neumáticos', 'banda de rodadura'], img: IMG.neumaticos },
  { kw: ['freno', 'frenos', 'frenado', 'frenar', 'freno de mano', 'distancia de frenado', 'abs', 'sistema de frenos', 'líquido de frenos', 'pastillas'], img: IMG.frenos },
  { kw: ['motor', 'encender el motor', 'apagar el motor', 'revoluciones', 'arranque'], img: IMG.motor },
  { kw: ['aceite', 'lubricante', 'lubricación', 'nivel de aceite'], img: IMG.motor },
  { kw: ['batería', 'bateria', 'alternador'], img: IMG.bateria },
  { kw: ['temperatura', 'sobrecalentamiento', 'recalentamiento', 'refrigerante', 'termómetro', 'radiador', 'sistema de refrigeración', 'enfriamiento'], img: IMG.tablero },
  { kw: ['embrague', 'clutch', 'pedal de embrague'], img: IMG.motor },
  { kw: ['transmisión', 'caja de cambios', 'cambio de marcha', 'engranaje', 'marcha'], img: IMG.motor },
  { kw: ['suspensión', 'amortiguador', 'amortiguadores'], img: IMG.motor },
  { kw: ['tablero', 'indicador', 'instrumento', 'testigo', 'luz de advertencia', 'panel de control'], img: IMG.tablero },

  { kw: ['alcohol', 'alcoholemia', 'ebriedad', 'estado de ebriedad', 'ley emilia', 'tolerancia cero', 'conducir ebrio', 'alcotest', 'alcoholímetro'], img: IMG.alcohol },
  { kw: ['licencia', 'licencia de conducir', 'permiso de conducir', 'renovar licencia'], img: IMG.licencia },
  { kw: ['multa', 'infracción', 'sanción', 'parte', 'penalización'], img: IMG.licencia },
  { kw: ['accidente', 'colisión', 'choque', 'siniestro', 'volcamiento', 'atropello'], img: IMG.accidente },
  { kw: ['distancia de seguimiento', 'distancia prudente', 'distancia segura', 'metros de distancia', 'distancia entre vehículos', '2 segundos', 'tres segundos', 'dos segundos'], img: IMG.distanciaSegura },
  { kw: ['intersección', 'cruce de calles', 'cruce', 'preferencia de paso', 'derecho de vía', 'prioridad'], img: IMG.interseccionGiro },
  { kw: ['lluvia', 'piso mojado', 'superficie mojada', 'mojado', 'aquaplaning', 'hidroplaneo'], img: IMG.lluvia },
  { kw: ['niebla', 'neblina', 'visibilidad reducida', 'poca visibilidad'], img: IMG.niebla },
  { kw: ['noche', 'nocturna', 'oscuridad', 'conducir de noche'], img: IMG.conduccionNocturna },
  { kw: ['carga', 'camión', 'transporte de carga', 'peso máximo', 'sobrecarga'], img: IMG.autopista },
  { kw: ['documentos', 'documentación', 'revisión técnica', 'permiso de circulación', 'seguro obligatorio', 'soap'], img: IMG.licencia },
  { kw: ['viraje', 'girar', 'doblar', 'cambio de pista', 'cambio de carril', 'señalizar'], img: IMG.cambioCarril },
  { kw: ['retroceder', 'reversa', 'marcha atrás'], img: IMG.estacionamiento },
  { kw: ['carril', 'pista'], img: IMG.cambioCarril },
  { kw: ['vehículo de emergencia', 'sirena', 'paso de emergencia', 'ambulancia', 'bomberos', 'carabineros'], img: IMG.vehiculoEmergencia },

  { kw: ['primeros auxilios', 'primer auxilio', 'socorrer', 'socorro', 'auxilio'], img: IMG.primerosAuxilios },
  { kw: ['rcp', 'reanimación', 'respiración artificial', 'resucitación', 'masaje cardíaco', 'paro cardíaco'], img: IMG.primerosAuxilios },
  { kw: ['hemorragia', 'sangrado', 'sangre', 'torniquete'], img: IMG.primerosAuxilios },
  { kw: ['fractura', 'hueso roto', 'inmovilizar', 'férula', 'esguince', 'luxación'], img: IMG.primerosAuxilios },
  { kw: ['quemadura', 'quemado'], img: IMG.primerosAuxilios },
  { kw: ['extintor', 'extinguidor', 'incendio', 'fuego'], img: IMG.extintor },
  { kw: ['triángulo', 'triangulo', 'señalización de emergencia', 'baliza'], img: IMG.trianguloEmergencia },
  { kw: ['herido', 'víctima', 'lesionado', 'inconsciente', 'conmoción', 'shock', 'desmayo'], img: IMG.primerosAuxilios },
  { kw: ['posición lateral', 'posición de seguridad', 'posición de recuperación'], img: IMG.primerosAuxilios },
  { kw: ['botiquín', 'kit de emergencia', 'kit de primeros auxilios'], img: IMG.primerosAuxilios },

  { kw: ['contaminación', 'emisiones', 'gases', 'monóxido', 'co2', 'escape', 'tubo de escape', 'polución'], img: IMG.medioAmbiente },
  { kw: ['catalizador', 'catalítico', 'convertidor catalítico'], img: IMG.medioAmbiente },
  { kw: ['reciclaje', 'reciclar', 'desechos', 'residuos'], img: IMG.medioAmbiente },
  { kw: ['medio ambiente', 'ambiental', 'ecológico', 'eco-conducción', 'ahorro de combustible', 'eficiencia energética'], img: IMG.medioAmbiente },
  { kw: ['ruido', 'contaminación acústica', 'sonora', 'bocina', 'claxon'], img: IMG.medioAmbiente },

  { kw: ['señal reglamentaria', 'reglamentarias', 'forma circular', 'fondo blanco', 'borde rojo'], img: IMG.senalesTipos },
  { kw: ['señal preventiva', 'preventivas', 'forma de diamante', 'fondo amarillo', 'romboidales'], img: IMG.senalesTipos },
  { kw: ['señal informativa', 'informativas', 'fondo azul', 'rectángulo'], img: IMG.senalesTipos },
  { kw: ['señalización', 'señales de tránsito', 'tipos de señales', 'señalética'], img: IMG.senalesTipos },
  { kw: ['velocidad'], img: IMG.velocidadUrbana },
];

const CATEGORY_DEFAULTS: Record<string, ImageSourcePropType> = {
  'Señalización': IMG.senalesTipos,
  'Señales Reglamentarias': IMG.senalPare,
  'Señales Preventivas': IMG.curva,
  'Señales Informativas': IMG.senalesTipos,
  'Ley de Tránsito': IMG.licencia,
  'Conducción Segura': IMG.cinturon,
  'Conducción Defensiva': IMG.distanciaSegura,
  'Mecánica Básica': IMG.motor,
  'Medio Ambiente': IMG.medioAmbiente,
  'Primeros Auxilios': IMG.primerosAuxilios,
};

export function getQuestionImage(question: { pregunta: string; categoria: string; id: number }): QuestionVisual {
  const text = question.pregunta.toLowerCase();

  for (const { kw, img } of KEYWORD_IMAGES) {
    for (const k of kw) {
      if (text.includes(k.toLowerCase())) {
        return { type: 'image', source: img };
      }
    }
  }

  const fallback = CATEGORY_DEFAULTS[question.categoria];
  return { type: 'image', source: fallback || IMG.senalesTipos };
}
