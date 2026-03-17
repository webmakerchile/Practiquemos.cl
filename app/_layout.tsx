import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
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

function SplashPreload({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 500, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    dotsOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    progressWidth.value = withDelay(600, withTiming(100, { duration: 1800, easing: Easing.inOut(Easing.ease) }));

    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  return (
    <View style={splashStyles.container}>
      <StatusBar style="light" />
      <View style={splashStyles.content}>
        <Animated.View style={[splashStyles.logoContainer, logoStyle]}>
          <Image
            source={require('../assets/images/logo-splash.png')}
            style={splashStyles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[splashStyles.welcomeText, textStyle]}>
          ¡Bienvenido!
        </Animated.Text>

        <Animated.Text style={[splashStyles.subtitleText, subtitleStyle]}>
          Tu copiloto para aprobar el examen de conducir
        </Animated.Text>

        <View style={splashStyles.progressContainer}>
          <Animated.View style={[splashStyles.progressBar, progressStyle]} />
        </View>

        <Animated.Text style={[splashStyles.loadingText, dotsStyle]}>
          Preparando tu experiencia...
        </Animated.Text>
      </View>

      <Text style={splashStyles.footerText}>
        Desarrollado por WebMakerChile
      </Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 280,
    height: 120,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  progressContainer: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  footerText: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 34 : 50,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.5)',
  },
});

export default function RootLayout() {
  const splashHidden = useRef(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

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
    if (fontsLoaded && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (showSplash) {
    return <SplashPreload onFinish={() => setShowSplash(false)} />;
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
