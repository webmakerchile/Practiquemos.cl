export interface QuestionIcon {
  library: 'mci' | 'ion' | 'fa5';
  name: string;
  color: string;
  bgColor: string;
}

const KEYWORD_ICONS: Array<{ kw: string[]; icon: QuestionIcon }> = [
  { kw: ['pare', 'señal pare', 'octagonal roja', 'octogonal', 'detenerse completamente'], icon: { library: 'mci', name: 'octagon', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['ceda el paso', 'triángulo invertido', 'ceda paso', 'ceder el paso'], icon: { library: 'mci', name: 'triangle-outline', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['30 km', '30km', 'máxima 30'], icon: { library: 'mci', name: 'speedometer-slow', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['40 km', '40km', 'máxima 40'], icon: { library: 'mci', name: 'speedometer-slow', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['50 km', '50km', 'máxima 50', 'zona urbana'], icon: { library: 'mci', name: 'speedometer-medium', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['60 km', '60km', 'máxima 60'], icon: { library: 'mci', name: 'speedometer-medium', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['80 km', '80km', 'máxima 80'], icon: { library: 'mci', name: 'speedometer', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['100 km', '100km', 'máxima 100'], icon: { library: 'mci', name: 'speedometer', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['120 km', '120km', 'máxima 120'], icon: { library: 'mci', name: 'speedometer', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['velocidad', 'exceso de velocidad', 'límite de velocidad', 'velocidad máxima'], icon: { library: 'mci', name: 'speedometer', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['no adelantar', 'prohibido adelantar', 'prohibido sobrepasar'], icon: { library: 'mci', name: 'cancel', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['adelantar', 'adelantamiento', 'sobrepasar', 'rebasar'], icon: { library: 'mci', name: 'car-side', color: '#fff', bgColor: '#f59e0b' } },
  { kw: ['no girar', 'prohibido girar', 'no virar'], icon: { library: 'mci', name: 'cancel', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['dirección prohibida', 'prohibido el tránsito', 'acceso prohibido', 'no entrar'], icon: { library: 'mci', name: 'minus-circle', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['gire derecha', 'solo derecha', 'obligación derecha'], icon: { library: 'mci', name: 'arrow-right-bold-circle', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['gire izquierda', 'solo izquierda', 'obligación izquierda'], icon: { library: 'mci', name: 'arrow-left-bold-circle', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['curva', 'curvas'], icon: { library: 'mci', name: 'road-variant', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['rotonda', 'glorieta', 'redondel'], icon: { library: 'mci', name: 'rotate-right', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['pendiente', 'bajada', 'cuesta abajo', 'cuesta arriba'], icon: { library: 'mci', name: 'trending-up', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['doble sentido', 'doble vía', 'ambos sentidos'], icon: { library: 'mci', name: 'swap-vertical', color: '#333', bgColor: '#fbbf24' } },

  { kw: ['semáforo', 'semaforo', 'señal luminosa', 'luz de tránsito'], icon: { library: 'mci', name: 'traffic-light', color: '#fff', bgColor: '#059669' } },
  { kw: ['luz roja', 'roja del semáforo'], icon: { library: 'mci', name: 'traffic-light', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['luz verde', 'verde del semáforo'], icon: { library: 'mci', name: 'traffic-light', color: '#fff', bgColor: '#059669' } },
  { kw: ['luz amarilla', 'amarilla del semáforo', 'ámbar'], icon: { library: 'mci', name: 'traffic-light', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['cruce peatonal', 'paso peatonal', 'paso de cebra', 'cruce de peatones'], icon: { library: 'mci', name: 'walk', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['peatón', 'peatones', 'peatonal'], icon: { library: 'mci', name: 'walk', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['zona escolar', 'escuela', 'niños cruzando', 'zona de niños'], icon: { library: 'mci', name: 'school', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['cruce ferroviario', 'paso a nivel', 'ferrocarril', 'vías del tren', 'tren'], icon: { library: 'mci', name: 'train', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['badén', 'baden', 'lomada', 'resalto', 'reductor de velocidad', 'lomo de toro'], icon: { library: 'mci', name: 'wave', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['estacionamiento prohibido', 'no estacionar', 'prohibido estacionar'], icon: { library: 'mci', name: 'parking', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['estacionar', 'estacionamiento'], icon: { library: 'mci', name: 'parking', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['autopista', 'autoexpreso', 'vía rápida', 'carretera'], icon: { library: 'mci', name: 'highway', color: '#fff', bgColor: '#059669' } },
  { kw: ['animales', 'ganado', 'animal en la vía'], icon: { library: 'mci', name: 'cow', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['obras', 'trabajo vial', 'trabajadores', 'zona de trabajo', 'construcción'], icon: { library: 'mci', name: 'hammer-wrench', color: '#333', bgColor: '#f97316' } },
  { kw: ['hospital', 'centro de salud', 'clínica'], icon: { library: 'mci', name: 'hospital-box', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['gasolinera', 'estación de servicio', 'bencinera', 'combustible', 'gasolina', 'bencina'], icon: { library: 'mci', name: 'gas-station', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['bicicleta', 'ciclista', 'ciclovía'], icon: { library: 'mci', name: 'bicycle', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['calle sin salida', 'sin salida'], icon: { library: 'mci', name: 'close-circle', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['virar en u', 'giro en u', 'vuelta en u'], icon: { library: 'mci', name: 'arrow-u-left-top', color: '#fff', bgColor: '#dc2626' } },

  { kw: ['cinturón', 'cinturon', 'cinturón de seguridad', 'abrocharse', 'abrochar'], icon: { library: 'mci', name: 'seatbelt', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['casco', 'casco protector'], icon: { library: 'mci', name: 'hard-hat', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['espejo', 'espejos', 'retrovisor', 'retrovisores'], icon: { library: 'mci', name: 'car-side', color: '#fff', bgColor: '#0ea5e9' } },
  { kw: ['volante', 'manos al volante'], icon: { library: 'mci', name: 'steering', color: '#fff', bgColor: '#334155' } },
  { kw: ['luces', 'focos', 'faros', 'luces altas', 'luces bajas', 'luces de cruce', 'luces largas', 'luces cortas', 'encender luces', 'iluminación'], icon: { library: 'mci', name: 'car-light-dimmed', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['neumático', 'neumatico', 'neumáticos', 'llanta', 'llantas', 'rueda', 'presión de los neumáticos', 'banda de rodadura'], icon: { library: 'mci', name: 'tire', color: '#fff', bgColor: '#334155' } },
  { kw: ['freno', 'frenos', 'frenado', 'frenar', 'freno de mano', 'distancia de frenado', 'abs', 'sistema de frenos', 'líquido de frenos', 'pastillas'], icon: { library: 'mci', name: 'car-brake-abs', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['motor', 'encender el motor', 'apagar el motor', 'revoluciones', 'arranque'], icon: { library: 'mci', name: 'engine', color: '#fff', bgColor: '#334155' } },
  { kw: ['aceite', 'lubricante', 'lubricación', 'nivel de aceite'], icon: { library: 'mci', name: 'oil', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['batería', 'bateria', 'alternador'], icon: { library: 'mci', name: 'car-battery', color: '#fff', bgColor: '#334155' } },
  { kw: ['temperatura', 'sobrecalentamiento', 'recalentamiento', 'refrigerante', 'termómetro'], icon: { library: 'mci', name: 'thermometer-alert', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['radiador', 'sistema de refrigeración', 'enfriamiento'], icon: { library: 'mci', name: 'thermometer', color: '#fff', bgColor: '#0ea5e9' } },
  { kw: ['embrague', 'clutch', 'pedal de embrague'], icon: { library: 'mci', name: 'cog', color: '#fff', bgColor: '#334155' } },
  { kw: ['transmisión', 'caja de cambios', 'cambio de marcha', 'engranaje', 'marcha'], icon: { library: 'mci', name: 'cogs', color: '#fff', bgColor: '#334155' } },
  { kw: ['suspensión', 'amortiguador', 'amortiguadores'], icon: { library: 'mci', name: 'wrench', color: '#fff', bgColor: '#334155' } },

  { kw: ['alcohol', 'alcoholemia', 'ebriedad', 'estado de ebriedad', 'ley emilia', 'tolerancia cero', 'conducir ebrio', 'alcotest', 'alcoholímetro'], icon: { library: 'mci', name: 'glass-wine', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['licencia', 'licencia de conducir', 'permiso de conducir', 'renovar licencia'], icon: { library: 'mci', name: 'card-account-details', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['multa', 'infracción', 'sanción', 'parte', 'penalización'], icon: { library: 'mci', name: 'alert-circle', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['accidente', 'colisión', 'choque', 'siniestro', 'volcamiento', 'atropello'], icon: { library: 'mci', name: 'car-crash', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['distancia de seguimiento', 'distancia prudente', 'distancia segura', 'metros de distancia', 'distancia entre vehículos', '2 segundos', 'tres segundos', 'dos segundos'], icon: { library: 'mci', name: 'car-multiple', color: '#fff', bgColor: '#f59e0b' } },
  { kw: ['intersección', 'cruce de calles', 'cruce', 'preferencia de paso', 'derecho de vía', 'prioridad'], icon: { library: 'mci', name: 'directions-fork', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['lluvia', 'piso mojado', 'superficie mojada', 'mojado', 'aquaplaning', 'hidroplaneo'], icon: { library: 'mci', name: 'weather-pouring', color: '#fff', bgColor: '#64748b' } },
  { kw: ['niebla', 'neblina', 'visibilidad reducida', 'poca visibilidad'], icon: { library: 'mci', name: 'weather-fog', color: '#fff', bgColor: '#64748b' } },
  { kw: ['noche', 'nocturna', 'oscuridad', 'conducir de noche'], icon: { library: 'mci', name: 'weather-night', color: '#fff', bgColor: '#1e293b' } },
  { kw: ['carga', 'camión', 'transporte de carga', 'peso máximo', 'sobrecarga'], icon: { library: 'mci', name: 'truck', color: '#fff', bgColor: '#334155' } },
  { kw: ['documentos', 'documentación', 'revisión técnica', 'permiso de circulación', 'seguro obligatorio', 'soap'], icon: { library: 'mci', name: 'file-document', color: '#fff', bgColor: '#2563eb' } },
  { kw: ['viraje', 'girar', 'doblar', 'cambio de pista', 'cambio de carril', 'señalizar'], icon: { library: 'mci', name: 'arrow-decision', color: '#fff', bgColor: '#0ea5e9' } },
  { kw: ['retroceder', 'reversa', 'marcha atrás'], icon: { library: 'mci', name: 'arrow-left-bold', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['carril', 'pista', 'vía'], icon: { library: 'mci', name: 'road', color: '#fff', bgColor: '#334155' } },
  { kw: ['vehículo de emergencia', 'sirena', 'paso de emergencia'], icon: { library: 'mci', name: 'ambulance', color: '#fff', bgColor: '#dc2626' } },

  { kw: ['primeros auxilios', 'primer auxilio', 'socorrer', 'socorro', 'auxilio'], icon: { library: 'mci', name: 'medical-bag', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['rcp', 'reanimación', 'respiración artificial', 'resucitación', 'masaje cardíaco', 'paro cardíaco'], icon: { library: 'mci', name: 'heart-pulse', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['hemorragia', 'sangrado', 'sangre', 'torniquete'], icon: { library: 'mci', name: 'water', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['fractura', 'hueso roto', 'inmovilizar', 'férula', 'esguince', 'luxación'], icon: { library: 'mci', name: 'bone', color: '#fff', bgColor: '#f97316' } },
  { kw: ['quemadura', 'quemado'], icon: { library: 'mci', name: 'fire', color: '#fff', bgColor: '#f97316' } },
  { kw: ['extintor', 'extinguidor', 'incendio', 'fuego'], icon: { library: 'mci', name: 'fire-extinguisher', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['triángulo', 'triangulo', 'señalización de emergencia', 'baliza'], icon: { library: 'mci', name: 'triangle-outline', color: '#333', bgColor: '#fbbf24' } },
  { kw: ['ambulancia', 'emergencia médica', 'servicio de emergencia', 'bomberos', 'carabineros', 'samu'], icon: { library: 'mci', name: 'ambulance', color: '#fff', bgColor: '#dc2626' } },
  { kw: ['herido', 'víctima', 'lesionado', 'inconsciente', 'conmoción', 'shock', 'desmayo'], icon: { library: 'mci', name: 'account-alert', color: '#fff', bgColor: '#f97316' } },
  { kw: ['posición lateral', 'posición de seguridad', 'posición de recuperación'], icon: { library: 'mci', name: 'human', color: '#fff', bgColor: '#059669' } },
  { kw: ['botiquín', 'kit de emergencia', 'kit de primeros auxilios'], icon: { library: 'mci', name: 'medical-bag', color: '#fff', bgColor: '#dc2626' } },

  { kw: ['contaminación', 'emisiones', 'gases', 'monóxido', 'co2', 'escape', 'tubo de escape', 'polución'], icon: { library: 'mci', name: 'factory', color: '#fff', bgColor: '#64748b' } },
  { kw: ['catalizador', 'catalítico', 'convertidor catalítico'], icon: { library: 'mci', name: 'wrench', color: '#fff', bgColor: '#334155' } },
  { kw: ['reciclaje', 'reciclar', 'desechos', 'residuos'], icon: { library: 'mci', name: 'recycle', color: '#fff', bgColor: '#059669' } },
  { kw: ['medio ambiente', 'ambiental', 'ecológico', 'eco-conducción', 'ahorro de combustible', 'eficiencia energética'], icon: { library: 'mci', name: 'leaf', color: '#fff', bgColor: '#059669' } },
  { kw: ['ruido', 'contaminación acústica', 'sonora', 'bocina', 'claxon'], icon: { library: 'mci', name: 'volume-high', color: '#fff', bgColor: '#f59e0b' } },
];

const CATEGORY_ICONS: Record<string, QuestionIcon> = {
  'Señalización': { library: 'mci', name: 'traffic-light', color: '#fff', bgColor: '#059669' },
  'Señales Reglamentarias': { library: 'mci', name: 'octagon', color: '#fff', bgColor: '#dc2626' },
  'Señales Preventivas': { library: 'mci', name: 'alert', color: '#333', bgColor: '#fbbf24' },
  'Señales Informativas': { library: 'mci', name: 'information', color: '#fff', bgColor: '#2563eb' },
  'Ley de Tránsito': { library: 'mci', name: 'scale-balance', color: '#fff', bgColor: '#1d4ed8' },
  'Conducción Segura': { library: 'mci', name: 'shield-check', color: '#fff', bgColor: '#2563eb' },
  'Conducción Defensiva': { library: 'mci', name: 'eye', color: '#fff', bgColor: '#f59e0b' },
  'Mecánica Básica': { library: 'mci', name: 'wrench', color: '#fff', bgColor: '#334155' },
  'Medio Ambiente': { library: 'mci', name: 'leaf', color: '#fff', bgColor: '#059669' },
  'Primeros Auxilios': { library: 'mci', name: 'medical-bag', color: '#fff', bgColor: '#dc2626' },
};

export function getQuestionIcon(question: { pregunta: string; categoria: string; id: number }): QuestionIcon {
  const text = question.pregunta.toLowerCase();

  for (const { kw, icon } of KEYWORD_ICONS) {
    for (const k of kw) {
      if (text.includes(k.toLowerCase())) {
        return icon;
      }
    }
  }

  return CATEGORY_ICONS[question.categoria] || { library: 'mci', name: 'car', color: '#fff', bgColor: '#2563eb' };
}
