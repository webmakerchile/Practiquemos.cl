# Practiquemos.cl - Documento de Entrega

**Plataforma de preparacion para el examen de licencia de conducir en Chile**
Desarrollado por WebMakerChile

---

## Bienvenido a Practiquemos.cl

Tu plataforma ya esta lista y funcionando. A continuacion te explicamos todo lo que necesitas saber para comenzar a usarla.

---

## Como empezar

### Paso 1: Crear tu cuenta

1. Ingresa a la aplicacion desde tu navegador o dispositivo movil
2. Toca el boton **"Registrarse"**
3. Completa tus datos (nombre de usuario, contrasena, nombre completo y email)
4. Una vez registrado, notifica a WebMakerChile tu nombre de usuario para que te otorguen los permisos de administrador

### Paso 2: Acceso de administrador

Una vez que WebMakerChile te otorgue los permisos, tendras acceso al **Panel de Administrador** desde el menu principal de la app.

---

## Que incluye tu plataforma

### Para los usuarios

- **6 tipos de licencia**: Clase B, A2, A4, C, D y E
- **1.591 preguntas** en la base de datos, incluyendo 306 preguntas oficiales de CONASET
- **Examenes de practica**: Modo simulacion (con timer) y modo aprendizaje (con explicaciones)
- **Temario completo**: 11 capitulos de material de estudio con secciones detalladas
- **Historial de examenes**: Los usuarios pueden ver sus resultados pasados
- **Preguntas favoritas**: Pueden guardar preguntas para repasarlas despues
- **Progreso por categoria**: Seguimiento visual del avance en cada tema
- **Lectura en voz alta**: Las preguntas y explicaciones se pueden escuchar con voz natural
- **Sonidos interactivos**: Efectos de sonido al responder correcta o incorrectamente
- **Mascota copiloto**: Un companero animado que motiva al usuario durante el estudio
- **Imagenes en las preguntas**: 68 imagenes ilustrativas para facilitar el aprendizaje

### Configuracion de examenes por licencia

| Licencia | Preguntas | Puntaje para aprobar | Tiempo |
|----------|-----------|---------------------|--------|
| Clase B  | 35        | 33/38 (87%)         | 45 min |
| Clase A2 | 20        | 16/20 (80%)         | 30 min |
| Clase A4 | 35        | 70%                 | 45 min |
| Clase C  | 20        | 15/20 (75%)         | 30 min |
| Clase D  | 12        | 9/12 (75%)          | 20 min |
| Clase E  | 10        | 7/10 (70%)          | 20 min |

---

## Panel de Administrador

Como administrador, puedes gestionar toda la plataforma:

### Gestion de usuarios
- **Crear usuarios** con nombre, email, contrasena, tipo de licencia, plan y rol
- **Editar usuarios**: Cambiar nombre, email, contrasena, plan (gratuito/premium) y rol
- **Eliminar usuarios** (con confirmacion de seguridad)
- **Buscar usuarios** por nombre, usuario o email
- **Filtrar** por tipo: todos, premium, gratuitos o administradores
- **Ver detalles** de cada usuario: fecha de registro, ultimo login, vigencia del plan, tipo de licencia

### Gestion de preguntas
- **Buscar y filtrar** preguntas por categoria, tipo de licencia, dificultad y origen
- **Crear nuevas preguntas** con opciones, respuesta correcta y explicacion
- **Editar preguntas** existentes
- **Desactivar preguntas** que no quieras mostrar (no se eliminan, solo se ocultan)

### Planes premium
La plataforma ofrece un modelo freemium:
- **Plan gratuito**: Acceso limitado a examenes
- **Premium 10 dias**: $2.990 CLP
- **Premium 30 dias**: $4.990 CLP

Desde el panel de administrador puedes otorgar premium manualmente a cualquier usuario.

---

## Pagos

### Web y Android
Los pagos se procesan a traves de **Mercado Pago** (Checkout Pro). Los usuarios pueden pagar directamente desde la app y su plan se activa automaticamente.

### iOS (App Store)
Para compras dentro de la app en iPhone/iPad, se utiliza **RevenueCat** integrado con el sistema de compras de Apple. Esto requiere una cuenta de Apple Developer (gestionada por WebMakerChile).

---

## Informacion tecnica importante

### Acceso a la plataforma
- **Web**: Disponible desde cualquier navegador en practiquemos.cl
- **iOS**: Pendiente de publicacion en App Store (requiere cuenta Apple Developer)
- **Android**: Pendiente de publicacion en Google Play Store

### Seguridad
- Las contrasenas se almacenan encriptadas (nunca en texto plano)
- Las sesiones de usuario son seguras con tokens de autenticacion
- Politica de privacidad y terminos de servicio incluidos en la seccion Legal de la app

### Base de datos
- Todas las preguntas, usuarios y resultados se almacenan en una base de datos PostgreSQL segura
- Los datos se respaldan automaticamente

---

## Contacto y soporte

Para cualquier consulta tecnica o soporte:
- **Email**: practiquemos.cl@gmail.com
- **Desarrollador**: WebMakerChile

---

*Documento generado el 18 de marzo de 2026*
*Version 1.0 - Plataforma Practiquemos.cl*
