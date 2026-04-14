# PROPUESTA COMERCIAL
## Plataforma Digital de Gestión para Autoescuelas
### Sistema Integral de Administración, Exámenes y Seguimiento de Alumnos

---

**Preparado por:** WebMakerChile — Diseño Web OlivaresArancibia Limitada
**Contacto:** Lucas Olivares Ramírez
**Email:** practiquemos.cl@gmail.com
**Fecha:** Abril 2026

---

## 1. RESUMEN EJECUTIVO

Se propone el desarrollo de una **plataforma digital integral para autoescuelas** que permita a las escuelas de conductores gestionar sus alumnos, monitorear su progreso de estudio, administrar accesos premium y automatizar comunicaciones. El sistema se construye como una extensión de la API existente de Practiquemos.cl, aprovechando el motor de exámenes y banco de preguntas ya desarrollado.

La plataforma consta de un **panel web de administración** para las autoescuelas, una **API robusta** que conecta con la app móvil existente (iOS y Android), y un sistema completo de **correos automáticos** para la comunicación con alumnos.

**Inversión total:** $8.000.000 CLP (IVA no incluido)
**Plazo estimado:** 17 a 21 semanas (4-5 meses)
**Modalidad:** Desarrollo por fases con entregas incrementales

---

## 2. ALCANCE DETALLADO DEL PROYECTO

---

### FASE 1 — Núcleo del Sistema
**Plazo:** 7-9 semanas | **Inversión:** $3.800.000 CLP

---

#### 2.1 ARQUITECTURA MULTI-TENANT
**Horas estimadas:** 20-25 hrs

El sistema permitirá que múltiples autoescuelas operen de forma completamente aislada dentro de la misma plataforma. Cada escuela solo verá y gestionará sus propios datos.

**Entregables:**
- Diseño de base de datos multi-tenant con aislamiento por escuela
- Cada autoescuela tiene su propio espacio aislado de datos
- Los alumnos de una escuela no son visibles para otra
- Configuración independiente por escuela (logo, nombre, datos de contacto)
- Sistema de subdominios o identificadores únicos por escuela
- Middleware de seguridad que garantiza el aislamiento de datos entre escuelas

**Criterios de aceptación:**
- Una autoescuela no puede ver, editar ni acceder a datos de otra
- Cada escuela puede personalizar su información básica
- El sistema soporta al menos 50 autoescuelas simultáneas sin degradación de rendimiento

---

#### 2.2 SISTEMA DE ROLES Y PERMISOS
**Horas estimadas:** 15-20 hrs

Se implementará un sistema jerárquico de roles que controla el acceso a cada funcionalidad de la plataforma.

**Roles definidos:**

| Rol | Permisos |
|-----|----------|
| **Super Administrador** | Gestión total de la plataforma, crear/eliminar autoescuelas, ver métricas globales, configuración del sistema |
| **Dueño de Autoescuela** | Gestión completa de su escuela: alumnos, profesores, códigos, facturación, reportes, configuración |
| **Profesor** | Ver alumnos asignados, monitorear progreso, generar reportes de sus alumnos, responder consultas |
| **Alumno** | Acceso a exámenes, temario, progreso personal (a través de la app móvil existente) |

**Entregables:**
- Sistema de autenticación con tokens seguros
- Middleware de autorización por rol en cada endpoint de la API
- Panel de gestión de roles (asignar, modificar, revocar permisos)
- Registro de actividad (log de acciones por usuario)
- Bloqueo automático tras intentos fallidos de acceso

**Criterios de aceptación:**
- Cada rol solo accede a las funciones que le corresponden
- Un profesor no puede ver alumnos de otro profesor (salvo que el dueño lo autorice)
- El log de actividad registra quién hizo qué y cuándo

---

#### 2.3 PANEL DE ADMINISTRACIÓN — GESTIÓN DE ALUMNOS
**Horas estimadas:** 20-25 hrs

Interfaz web completa para que las autoescuelas gestionen a todos sus alumnos.

**Funcionalidades:**
- **Listado de alumnos** con búsqueda por nombre, RUT, email, estado
- **Filtros avanzados:** por tipo de licencia, estado de plan (activo/expirado/gratuito), fecha de registro, profesor asignado
- **Crear alumno:** formulario con datos personales (nombre, RUT, email, teléfono, tipo de licencia)
- **Editar alumno:** modificar datos, cambiar tipo de licencia, asignar/reasignar profesor
- **Activar/Desactivar alumno:** suspender acceso sin eliminar datos
- **Eliminar alumno:** eliminación con confirmación y respaldo
- **Vista detalle del alumno:** perfil completo con toda su información y actividad
- **Importación masiva:** carga de alumnos mediante archivo CSV/Excel
- **Exportación:** descargar listado de alumnos en CSV/Excel

**Criterios de aceptación:**
- Búsqueda y filtrado responden en menos de 2 segundos
- La importación masiva soporta al menos 500 alumnos por carga
- Todos los campos obligatorios tienen validación en tiempo real

---

#### 2.4 DASHBOARD DE ESTADÍSTICAS
**Horas estimadas:** 25-30 hrs

Panel visual con métricas clave del rendimiento de los alumnos de la autoescuela.

**Métricas globales (vista autoescuela):**
- Total de alumnos activos vs inactivos
- Tasa de aprobación general (% de alumnos que aprueban exámenes de práctica)
- Promedio de exámenes realizados por alumno
- Distribución por tipo de licencia (gráfico de torta)
- Evolución mensual de nuevos registros (gráfico de líneas)
- Top 10 alumnos con mejor rendimiento
- Alumnos que necesitan atención (bajo rendimiento, inactivos)

**Métricas por alumno (vista detalle):**
- Cantidad de exámenes realizados y aprobados
- Porcentaje de acierto por categoría (señalización, normativa, primeros auxilios, etc.)
- Evolución del rendimiento en el tiempo (gráfico de líneas)
- Racha de estudio (días consecutivos activo)
- Tiempo promedio por examen
- Últimos exámenes con detalle de respuestas
- Áreas débiles identificadas automáticamente
- Comparación con el promedio de la escuela

**Entregables:**
- Dashboard interactivo con gráficos (barras, líneas, tortas)
- Filtros por rango de fechas, tipo de licencia, profesor
- Actualización en tiempo real de las métricas
- Diseño responsive (funciona en computador y tablet)

**Criterios de aceptación:**
- El dashboard carga en menos de 3 segundos
- Los gráficos son interactivos (hover muestra detalles)
- Los datos se actualizan automáticamente sin recargar la página

---

#### 2.5 SISTEMA DE CÓDIGOS DE ACCESO PREMIUM
**Horas estimadas:** 15-20 hrs

Permite a las autoescuelas generar códigos que activan el plan premium para sus alumnos.

**Funcionalidades:**
- **Generar códigos individuales:** código único por alumno
- **Generar códigos en lote:** crear 10, 50, 100 códigos de una vez
- **Tipos de código:**
  - Premium 10 días
  - Premium 30 días
  - Personalizado (la escuela define la duración)
- **Estado del código:** generado, activado, expirado, revocado
- **Asignación directa:** asignar código a un alumno específico desde el panel
- **Historial de uso:** quién usó cada código, cuándo y desde qué dispositivo
- **Revocación:** anular un código que aún no ha sido usado
- **Exportación:** descargar listado de códigos en CSV para impresión/distribución

**Criterios de aceptación:**
- Los códigos son únicos y no reutilizables
- Un código activado no puede ser revocado (el acceso persiste hasta su expiración)
- La generación en lote de 100 códigos toma menos de 5 segundos

---

#### 2.6 CORREOS AUTOMÁTICOS — BÁSICOS
**Horas estimadas:** 15-18 hrs

Primer conjunto de correos automáticos del sistema.

**Correos incluidos:**

| Correo | Disparador | Contenido |
|--------|-----------|-----------|
| **Bienvenida** | Alumno registrado por la autoescuela | Datos de acceso, instrucciones para descargar la app, enlace de activación |
| **Código de acceso** | Autoescuela asigna código premium | Código, instrucciones de canje, duración del plan |
| **Recuperación de contraseña** | Alumno solicita reset | Enlace seguro de recuperación con expiración de 24 hrs |
| **Confirmación de activación** | Alumno activa su código premium | Confirmación del plan, fecha de expiración, funcionalidades desbloqueadas |
| **Expiración de plan** | 3 días antes de que expire el premium | Aviso de vencimiento, invitación a renovar |

**Entregables:**
- Plantillas HTML responsivas con diseño profesional
- Sistema de cola de envío (evitar saturación)
- Registro de correos enviados (fecha, destinatario, estado)
- Configuración de remitente personalizado por autoescuela
- Prevención de spam (rate limiting, validación de emails)

**Criterios de aceptación:**
- Los correos se envían en menos de 60 segundos tras el evento disparador
- Las plantillas se ven correctamente en Gmail, Outlook y dispositivos móviles
- Existe un log consultable de todos los correos enviados

---

### FASE 2 — Expansión del Sistema
**Plazo:** 5-6 semanas | **Inversión:** $2.400.000 CLP

---

#### 2.7 GESTIÓN DE PROFESORES
**Horas estimadas:** 15-20 hrs

Módulo para que la autoescuela administre a su equipo de profesores.

**Funcionalidades:**
- CRUD de profesores (crear, editar, eliminar)
- Asignar alumnos a profesores específicos
- Vista de carga de trabajo (cuántos alumnos tiene cada profesor)
- Panel del profesor: ver solo sus alumnos asignados y su progreso
- Estadísticas por profesor: tasa de aprobación de sus alumnos, promedio de rendimiento
- Notificaciones al profesor cuando un alumno completa un examen

**Criterios de aceptación:**
- Un profesor solo ve alumnos que le fueron asignados
- La reasignación de alumnos es inmediata y sin pérdida de datos

---

#### 2.8 SISTEMA DE FACTURACIÓN PARA AUTOESCUELAS
**Horas estimadas:** 20-25 hrs

Control financiero básico para la autoescuela.

**Funcionalidades:**
- Registro de pagos de alumnos (monto, fecha, método de pago, concepto)
- Historial de transacciones por alumno
- Estado de cuenta por alumno (pagado, pendiente, vencido)
- Resumen mensual de ingresos
- Alertas de pagos vencidos
- Exportación de movimientos a Excel para contabilidad
- Notas y observaciones por transacción

**Criterios de aceptación:**
- Los montos se manejan en CLP sin errores de redondeo
- La exportación a Excel es compatible con software contable estándar
- El historial es inalterable (solo se pueden agregar notas, no modificar montos)

---

#### 2.9 BUSCADOR DE AUTOESCUELAS CON MAPA
**Horas estimadas:** 30-35 hrs

Módulo público donde los usuarios pueden encontrar autoescuelas cercanas.

**Funcionalidades:**
- Mapa interactivo con ubicación de autoescuelas registradas
- Búsqueda por comuna, ciudad o región
- Geolocalización: "Escuelas cerca de mí"
- Ficha de cada escuela: nombre, dirección, teléfono, email, horarios, servicios
- Filtros: tipo de licencia que enseñan, rango de precios, calificación
- Sistema de valoraciones y comentarios de alumnos
- Enlace directo para contactar por WhatsApp
- SEO optimizado para búsquedas locales ("autoescuela en Santiago", "escuela de conducir Viña del Mar")

**Criterios de aceptación:**
- El mapa carga en menos de 3 segundos
- La geolocalización funciona en dispositivos móviles y desktop
- Cada escuela puede actualizar su ficha desde su panel de administración

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
