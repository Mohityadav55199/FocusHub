import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, View, StyleSheet } from "react-native";

import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // update the native navigation bar on Android.
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
          <View style={styles.webContainer}>
            <InitialLayout />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </ClerkAndConvexProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
    ...(Platform.OS === "web"
      ? {
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }
      : {}),
  },
  webContainer: {
    flex: 1,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          maxWidth: 480,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#1f1f1f",
        }
      : {}),
  },
});
