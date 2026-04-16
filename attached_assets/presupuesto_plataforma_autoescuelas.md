 actualizar su ficha desde su panel de administración

---

#### 2.10 CORREOS AUTOMÁTICOS — AVANZADOS
**Horas estimadas:** 10-12 hrs

Segundo conjunto de correos automáticos para engagement y retención.

**Correos incluidos:**

| Correo | Disparador | Contenido |
|--------|-----------|-----------|
| **Recordatorio de estudio** | Alumno lleva 3+ días sin entrar | Motivación, estadísticas, enlace directo a practicar |
| **Reporte semanal al alumno** | Cada lunes automáticamente | Resumen: exámenes hechos, % acierto, áreas a mejorar |
| **Reporte semanal al profesor** | Cada lunes automáticamente | Resumen de actividad de sus alumnos asignados |
| **Felicitación por logro** | Alumno aprueba examen o alcanza racha | Mensaje motivacional, insignia obtenida |
| **Alerta al admin** | Nuevo alumno registrado, alumno aprobó examen | Notificación a la autoescuela de eventos importantes |

**Criterios de aceptación:**
- Los correos de recordatorio no se envían más de una vez por semana al mismo alumno
- Los reportes semanales se generan y envían automáticamente sin intervención manual
- El alumno puede desuscribirse de correos no esenciales

---

### FASE 3 — Funcionalidades Premium
**Plazo:** 5-6 semanas | **Inversión:** $1.800.000 CLP

---

#### 2.11 CIRCUITOS PRÁCTICOS (SIMULADOR VISUAL)
**Horas estimadas:** 40-50 hrs

Simulador visual de recorridos de exámenes prácticos.

**Funcionalidades:**
- Mapa visual del circuito de examen con puntos de evaluación marcados
- Instrucciones paso a paso del recorrido
- Tips por punto de evaluación (qué revisa el examinador en cada tramo)
- Circuitos por comuna/ciudad (los recorridos varían según municipalidad)
- Modo estudio: recorrer el circuito virtualmente con explicaciones
- Galería de fotos/videos del recorrido real
- Los profesores pueden crear y subir circuitos personalizados

**Criterios de aceptación:**
- Al menos 5 circuitos de las principales comunas de Chile disponibles al lanzamiento
- La interfaz es intuitiva y funciona en móvil y desktop
- Los profesores pueden subir nuevos circuitos sin asistencia técnica

---

#### 2.12 FORO DE CONSULTAS CON PROFESORES
**Horas estimadas:** 25-30 hrs

Espacio de comunicación entre alumnos y profesores.

**Funcionalidades:**
- Alumnos pueden hacer preguntas sobre temas de estudio
- Profesores responden (solo los asignados al alumno o todos los de la escuela)
- Categorización por tema (señalización, normativa, conducción, etc.)
- Sistema de preguntas frecuentes automático (si la pregunta ya fue respondida antes, se sugiere)
- Notificación por correo cuando hay una respuesta
- Moderación por parte del dueño de la autoescuela
- Historial de conversaciones consultable

**Criterios de aceptación:**
- Un alumno recibe notificación cuando su pregunta es respondida
- Las preguntas se pueden marcar como "resuelta"
- El dueño de la escuela puede eliminar contenido inapropiado

---

#### 2.13 SISTEMA DE CONVENIOS EMPRESARIALES
**Horas estimadas:** 15-20 hrs

Gestión de acuerdos comerciales con empresas, universidades y otras instituciones.

**Funcionalidades:**
- Crear convenios con condiciones especiales (descuentos, planes custom)
- Asignar códigos de acceso masivos a una empresa/institución
- Dashboard de uso por convenio (cuántos alumnos lo usan, actividad)
- Página pública del convenio (landing personalizada)
- Reporte de ROI por convenio

**Criterios de aceptación:**
- Un convenio puede tener su propia landing con logo de la institución
- Los códigos del convenio se pueden rastrear separadamente de los regulares

---

#### 2.14 BOLSA DE TRABAJO
**Horas estimadas:** 20-25 hrs

Conexión entre autoescuelas que buscan profesores y profesores que buscan empleo.

**Funcionalidades:**
- Publicar ofertas de trabajo (autoescuelas)
- Crear perfil profesional (profesores)
- Búsqueda y filtrado de ofertas por ubicación, tipo de licencia, experiencia
- Postulación directa desde la plataforma
- Notificación por correo de nuevas ofertas que coinciden con el perfil
- Panel de gestión de postulaciones para la autoescuela

**Criterios de aceptación:**
- Las ofertas expiran automáticamente tras 30 días
- El profesor recibe confirmación de su postulación
- La autoescuela puede ver todos los postulantes y sus perfiles

---

#### 2.15 LANDING WEB PÚBLICA
**Horas estimadas:** 20-25 hrs

Sitio web público de la plataforma, similar a practicatest.cl.

**Funcionalidades:**
- Página de inicio con propuesta de valor
- Sección "Cómo funciona" con pasos para alumnos y autoescuelas
- Listado de planes y precios
- Registro de nuevos usuarios
- Registro de autoescuelas interesadas
- Blog/noticias (opcional, estructura preparada)
- Integración con buscador de autoescuelas
- SEO optimizado
- Responsive design (móvil, tablet, desktop)
- Integración con WhatsApp y redes sociales

**Criterios de aceptación:**
- La página carga en menos de 3 segundos
- Score de Google PageSpeed > 85
- Diseño profesional y consistente con la marca

---

## 3. ESPECIFICACIONES TÉCNICAS

### Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| **API Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | PostgreSQL con Drizzle ORM |
| **Panel Admin Web** | React (o framework web moderno) |
| **App Móvil** | Expo React Native (ya existente) |
| **Correos** | Servicio de email transaccional (SendGrid/Resend) |
| **Mapas** | Google Maps API o Mapbox |
| **Hosting** | Replit (backend + panel web) |
| **Almacenamiento** | PostgreSQL + almacenamiento de archivos |

### Integraciones

- API REST documentada para conexión app móvil ↔ backend ↔ panel web
- Webhooks para eventos en tiempo real
- Exportación de datos en CSV/Excel/PDF
- Sistema de correos transaccionales
- API de mapas para geolocalización

### Seguridad

- Autenticación con tokens seguros (Bearer)
- Encriptación de contraseñas (bcrypt)
- Aislamiento de datos multi-tenant
- Rate limiting para prevención de abuso
- Validación de datos en frontend y backend
- Registro de actividad (audit log)
- Backups automáticos de base de datos

---

## 4. RESUMEN DE INVERSIÓN

| Fase | Contenido | Plazo | Inversión |
|------|-----------|-------|-----------|
| **Fase 1** | API multi-tenant, roles, panel admin (alumnos, dashboard, códigos), correos básicos | 7-9 semanas | **$3.800.000 CLP** |
| **Fase 2** | Profesores, facturación, buscador de escuelas con mapa, correos avanzados | 5-6 semanas | **$2.400.000 CLP** |
| **Fase 3** | Circuitos prácticos, foro, convenios, bolsa de trabajo, landing web | 5-6 semanas | **$1.800.000 CLP** |
| | | | |
| **TOTAL** | **Plataforma completa** | **17-21 semanas** | **$8.000.000 CLP** |

*Valores en pesos chilenos. IVA no incluido.*

---

## 5. CONDICIONES COMERCIALES

### Forma de Pago

| Hito | Porcentaje | Monto | Momento |
|------|-----------|-------|---------|
| Anticipo inicio proyecto | 30% | $2.400.000 | Al firmar contrato |
| Entrega Fase 1 | 25% | $2.000.000 | Al completar Fase 1 |
| Entrega Fase 2 | 25% | $2.000.000 | Al completar Fase 2 |
| Entrega Fase 3 (final) | 20% | $1.600.000 | Al completar Fase 3 |

### Qué incluye

- Desarrollo completo de todas las funcionalidades descritas
- Código fuente entregado al cliente
- Documentación técnica de la API
- Manual de uso del panel de administración
- 30 días de soporte post-entrega por fase
- Corrección de bugs durante el periodo de garantía
- Despliegue en ambiente de producción

### Qué NO incluye

- Contenido (preguntas de examen, material de estudio) — debe ser proporcionado por el cliente
- Diseño de marca/logo de la plataforma
- Costos de servicios externos (hosting, correos, mapas) — se estiman en $15.000-$30.000 CLP/mes
- Mantenimiento posterior al periodo de garantía (puede cotizarse aparte)
- Desarrollo de la app móvil (ya existente)
- Publicación en App Store / Google Play de nuevas versiones

### Mantenimiento Post-Proyecto (Opcional)

| Plan | Incluye | Costo mensual |
|------|---------|---------------|
| **Básico** | Corrección de bugs, actualizaciones de seguridad, monitoreo | $150.000 CLP/mes |
| **Estándar** | Básico + mejoras menores, soporte prioritario | $300.000 CLP/mes |
| **Premium** | Estándar + nuevas funcionalidades (hasta 10 hrs/mes), soporte 24/7 | $500.000 CLP/mes |

---

## 6. CRONOGRAMA ESTIMADO

```
Semana  1-2   → Diseño de arquitectura y base de datos
Semana  2-4   → API multi-tenant + sistema de roles
Semana  4-6   → Panel admin: CRUD alumnos + dashboard
Semana  6-8   → Códigos de acceso + correos básicos
Semana  8-9   → Testing + ajustes Fase 1
                ── ENTREGA FASE 1 ──
Semana  9-11  → Gestión de profesores + facturación
Semana 11-13  → Buscador de escuelas con mapa
Semana 13-14  → Correos avanzados + testing
Semana 14-15  → Ajustes Fase 2
                ── ENTREGA FASE 2 ──
Semana 15-17  → Circuitos prácticos + foro
Semana 17-19  → Convenios + bolsa de trabajo
Semana 19-20  → Landing web pública
Semana 20-21  → Testing final + despliegue
                ── ENTREGA FASE 3 (FINAL) ──
```

---

## 7. GARANTÍAS

- **Garantía de funcionamiento:** 30 días post-entrega de cada fase
- **Corrección de bugs:** Sin costo durante el periodo de garantía
- **Código fuente:** Entregado al 100% al cliente al finalizar el proyecto
- **Documentación:** API documentada + manual de usuario del panel admin
- **Confidencialidad:** Los datos del proyecto y del cliente son tratados con total confidencialidad

---

## 8. SOBRE NOSOTROS

**WebMakerChile — Diseño Web OlivaresArancibia Limitada** es una empresa chilena de desarrollo de software especializada en plataformas educativas y aplicaciones móviles. Nuestro proyecto insignia, **Practiquemos.cl**, es una app de preparación para el examen de conducir que cuenta con más de 1.500 preguntas, múltiples tipos de licencia, voz profesional con IA, y está disponible en iOS, Android y Web.

---

*Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.*
*Para aceptar esta propuesta, favor confirmar por escrito a practiquemos.cl@gmail.com*
