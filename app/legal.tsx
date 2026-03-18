import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <Text style={styles.sectionTitle}>Política de Privacidad</Text>
        <Text style={styles.lastUpdated}>Última actualización: Marzo 2026</Text>

        <Text style={styles.heading}>1. Datos que recolectamos</Text>
        <Text style={styles.body}>
          Practiquemos.cl recopila la siguiente información personal cuando creas una cuenta:{'\n'}
          • Nombre completo{'\n'}
          • Correo electrónico{'\n'}
          • Nombre de usuario{'\n'}
          • Tipo de licencia seleccionada{'\n'}
          • Progreso en exámenes y resultados de práctica{'\n'}
          • Preguntas guardadas como favoritas
        </Text>

        <Text style={styles.heading}>2. Cómo usamos tus datos</Text>
        <Text style={styles.body}>
          Utilizamos tu información para:{'\n'}
          • Personalizar tu experiencia de aprendizaje{'\n'}
          • Guardar tu progreso y estadísticas{'\n'}
          • Gestionar tu cuenta y plan de suscripción{'\n'}
          • Mejorar nuestros servicios y contenido educativo{'\n'}
          • Comunicarnos contigo sobre tu cuenta
        </Text>

        <Text style={styles.heading}>3. Cómo almacenamos tus datos</Text>
        <Text style={styles.body}>
          Tus datos se almacenan de forma segura en servidores protegidos. Las contraseñas se cifran utilizando algoritmos de hashing seguros (bcrypt). No almacenamos información de tarjetas de crédito ni datos financieros directamente; los pagos son procesados por plataformas de pago seguras de terceros.
        </Text>

        <Text style={styles.heading}>4. Tus derechos</Text>
        <Text style={styles.body}>
          Como usuario, tienes derecho a:{'\n'}
          • Acceder a tus datos personales desde tu perfil{'\n'}
          • Solicitar la corrección de tus datos{'\n'}
          • Eliminar tu cuenta y todos los datos asociados en cualquier momento desde la sección de perfil{'\n'}
          • Exportar tus datos de progreso{'\n'}
          • Retirar tu consentimiento para el uso de tus datos
        </Text>

        <Text style={styles.heading}>5. Eliminación de cuenta</Text>
        <Text style={styles.body}>
          Puedes eliminar tu cuenta en cualquier momento desde la pantalla de perfil. Al eliminar tu cuenta, se borrarán permanentemente todos tus datos, incluyendo resultados de exámenes, favoritos y progreso por categoría. Esta acción es irreversible.
        </Text>

        <Text style={styles.heading}>6. Compartir datos con terceros</Text>
        <Text style={styles.body}>
          No vendemos ni compartimos tu información personal con terceros, excepto con los proveedores de servicios de pago necesarios para procesar transacciones y con los servicios de infraestructura necesarios para operar la aplicación.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Términos de Servicio</Text>
        <Text style={styles.lastUpdated}>Última actualización: Marzo 2026</Text>

        <Text style={styles.heading}>1. Aceptación de los términos</Text>
        <Text style={styles.body}>
          Al crear una cuenta y utilizar Practiquemos.cl, aceptas estos términos de servicio y nuestra política de privacidad. Si no estás de acuerdo, no debes utilizar la aplicación.
        </Text>

        <Text style={styles.heading}>2. Descripción del servicio</Text>
        <Text style={styles.body}>
          Practiquemos.cl es una plataforma educativa diseñada para ayudarte a preparar el examen teórico de licencia de conducir en Chile. El contenido incluye preguntas de práctica, explicaciones y material de estudio.
        </Text>

        <Text style={styles.heading}>3. Cuentas de usuario</Text>
        <Text style={styles.body}>
          • Debes proporcionar información veraz al registrarte{'\n'}
          • Eres responsable de mantener la confidencialidad de tu contraseña{'\n'}
          • No debes compartir tu cuenta con otras personas{'\n'}
          • Nos reservamos el derecho de suspender cuentas que violen estos términos
        </Text>

        <Text style={styles.heading}>4. Planes y pagos</Text>
        <Text style={styles.body}>
          • El plan gratuito permite un número limitado de exámenes diarios{'\n'}
          • Los planes Premium otorgan acceso completo por un período determinado (10 o 30 días){'\n'}
          • Los pagos en iOS se procesan a través de la App Store de Apple{'\n'}
          • Los pagos en Android y web se procesan a través de Mercado Pago{'\n'}
          • Los precios están sujetos a cambios con previo aviso{'\n'}
          • Los planes Premium no son suscripciones con renovación automática; se adquieren como compras únicas por un período determinado
        </Text>

        <Text style={styles.heading}>5. Gestión de compras y reembolsos</Text>
        <Text style={styles.body}>
          Para usuarios de iOS:{'\n'}
          • Las compras se procesan a través de tu cuenta de Apple y están sujetas a los términos de Apple{'\n'}
          • Para gestionar tus compras, ve a Ajustes {'>'} tu nombre {'>'} Suscripciones en tu dispositivo iOS{'\n'}
          • Puedes restaurar compras previas desde la pantalla de Packs Premium dentro de la aplicación{'\n'}
          • Los reembolsos deben solicitarse directamente a Apple a través de reportaproblem.apple.com{'\n'}
          {'\n'}
          Para usuarios de Android y Web:{'\n'}
          • Las compras se procesan a través de Mercado Pago{'\n'}
          • Para consultas sobre pagos o reembolsos, contáctanos en practiquemos.cl@gmail.com
        </Text>

        <Text style={styles.heading}>6. Contenido educativo</Text>
        <Text style={styles.body}>
          El contenido de Practiquemos.cl es de carácter educativo y complementario. No garantizamos la aprobación del examen oficial. Las preguntas se basan en el material oficial pero pueden diferir del examen real.
        </Text>

        <Text style={styles.heading}>7. Propiedad intelectual</Text>
        <Text style={styles.body}>
          Todo el contenido, diseño, código y marca de Practiquemos.cl son propiedad de sus creadores. No está permitido copiar, reproducir o distribuir el contenido sin autorización previa.
        </Text>

        <Text style={styles.heading}>8. Limitación de responsabilidad</Text>
        <Text style={styles.body}>
          Practiquemos.cl se ofrece "tal cual". No nos hacemos responsables por interrupciones del servicio, pérdida de datos o resultados en el examen oficial.
        </Text>

        <Text style={styles.heading}>9. Contacto</Text>
        <Text style={styles.body}>
          Para consultas sobre estos términos o la política de privacidad, contáctanos en practiquemos.cl@gmail.com
        </Text>

        <Text style={styles.copyright}>© 2026 Practiquemos.cl - Todos los derechos reservados</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_700Bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, marginBottom: 4 },
  lastUpdated: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, marginBottom: 16 },
  heading: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.primary, marginTop: 16, marginBottom: 8 },
  body: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  copyright: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
});
