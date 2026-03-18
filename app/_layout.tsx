import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, Platform, Dimensions } from "react-native";
import { Asset } from "expo-asset";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { UserProvider } from "@/lib/UserContext";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

SplashScreen.preventAutoHideAsync().catch(() => {});

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="exam" />
      <Stack.Screen name="results" />
      <Stack.Screen name="plans" />
      <Stack.Screen name="history" />
      <Stack.Screen name="temario" />
      <Stack.Screen name="temario-detail" />
      <Stack.Screen name="mi-curso" />
      <Stack.Screen name="favoritos" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="admin-questions" />
      <Stack.Screen name="contacto" />
      <Stack.Screen name="nosotros" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}

const splashLogo = require('../assets/images/logo-splash.png');

const preloadAssets = [
  require('../assets/images/logo-splash.png'),
  require('../assets/images/logo-completo-header.png'),
  require('../assets/images/mascota-cuerpo.png'),
  require('../assets/images/mascota-hablando.png'),
  require('../assets/images/mascota-pensando.png'),
  require('../assets/images/mascota-cabeza.png'),
  require('../assets/images/icon-test-basico.png'),
  require('../assets/images/icon-test-intermedio.png'),
  require('../assets/images/icon-test-avanzado.png'),
  require('../assets/images/icon-test-diario.png'),
  require('../assets/images/icon-temario.png'),
];

const ORB_CONFIG = [
  { x: SCREEN_W * 0.1, y: SCREEN_H * 0.15, size: 80, color: 'rgba(59, 130, 246, 0.3)' },
  { x: SCREEN_W * 0.7, y: SCREEN_H * 0.1, size: 60, color: 'rgba(251, 191, 36, 0.25)' },
  { x: SCREEN_W * 0.15, y: SCREEN_H * 0.7, size: 50, color: 'rgba(96, 165, 250, 0.2)' },
  { x: SCREEN_W * 0.75, y: SCREEN_H * 0.65, size: 70, color: 'rgba(251, 191, 36, 0.2)' },
  { x: SCREEN_W * 0.4, y: SCREEN_H * 0.85, size: 40, color: 'rgba(147, 197, 253, 0.25)' },
  { x: SCREEN_W * 0.55, y: SCREEN_H * 0.2, size: 35, color: 'rgba(253, 224, 71, 0.2)' },
];

function SplashPreload({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(30);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const footerOpacity = useSharedValue(0);
  const orbsOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.85);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 500, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );

    ringOpacity.value = withDelay(200, withTiming(0.2, { duration: 600 }));
    ringScale.value = withDelay(200, withTiming(1.1, { duration: 1500, easing: Easing.out(Easing.ease) }));

    orbsOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    badgeOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    badgeScale.value = withDelay(350, withSpring(1, { damping: 10, stiffness: 150 }));

    textOpacity.value = withDelay(550, withTiming(1, { duration: 450 }));
    textY.value = withDelay(550, withTiming(0, { duration: 450, easing: Easing.out(Easing.ease) }));

    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

    progressOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
    progressWidth.value = withDelay(1000, withTiming(100, { duration: 1600, easing: Easing.inOut(Easing.cubic) }));

    footerOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));

    const exitTimer = setTimeout(onFinish, 3200);
    return () => clearTimeout(exitTimer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const progressContainerStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const orbsStyle = useAnimatedStyle(() => ({
    opacity: orbsOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1.5,
    borderColor: `rgba(251, 191, 36, ${interpolate(ringOpacity.value, [0, 1], [0, 0.25])})`,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={ss.splashContainer}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0c1d4d', '#1d4ed8', '#2563eb', '#1e40af']}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, orbsStyle]}>
        {ORB_CONFIG.map((orb, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              borderRadius: orb.size / 2,
              backgroundColor: orb.color,
            }}
          />
        ))}
      </Animated.View>

      <View style={ss.centered}>
        <View style={ss.logoArea}>
          <Animated.View style={ringStyle} />
          <Animated.View style={[ss.logoCard, logoStyle]}>
            <Image
              source={splashLogo}
              style={ss.logo}
              resizeMode="contain"
              fadeDuration={0}
            />
          </Animated.View>
        </View>

        <Animated.View style={[ss.badge, badgeStyle]}>
          <Text style={ss.badgeText}>Examen de Conducir Chile</Text>
        </Animated.View>

        <Animated.View style={textStyle}>
          <Text style={ss.title}>¡Bienvenido!</Text>
        </Animated.View>

        <Animated.View style={subtitleStyle}>
          <Text style={ss.subtitle}>Tu copiloto para aprobar{'\n'}el examen de conducir</Text>
        </Animated.View>

        <Animated.View style={[ss.progressOuter, progressContainerStyle]}>
          <View style={ss.progressTrack}>
            <Animated.View style={[ss.progressFill, progressStyle]} />
          </View>
          <Text style={ss.progressLabel}>Preparando tu experiencia...</Text>
        </Animated.View>
      </View>

      <Animated.View style={[ss.footer, footerStyle]}>
        <View style={ss.footerLine} />
        <Text style={ss.footerText}>Desarrollado por WebMakerChile</Text>
      </Animated.View>
    </View>
  );
}

const ss = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logo: {
    width: 260,
    height: 110,
  },
  badge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: '#fbbf24',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  progressOuter: {
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: 220,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  progressLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 34 : 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  footerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
});

export default function RootLayout() {
  const splashHidden = useRef(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    Asset.loadAsync(preloadAssets).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!splashHidden.current) {
        splashHidden.current = true;
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  if (showSplash) {
    return <SplashPreload onFinish={handleSplashFinish} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <UserProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
            </UserProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
