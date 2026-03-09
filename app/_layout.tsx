import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { UserProvider } from "@/lib/UserContext";
import { VoiceProvider } from "@/lib/VoiceContext";
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
      <Stack.Screen name="voice-settings" />
    </Stack>
  );
}

export default function RootLayout() {
  const splashHidden = useRef(false);

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

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <UserProvider>
              <VoiceProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </VoiceProvider>
            </UserProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
