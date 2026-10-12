import { tokenCache } from "@/cache";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex = convexUrl
  ? new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    })
  : null;

export default function ClerkAndConvexProvider({ children }: { children: React.ReactNode }) {
  if (!convex || !publishableKey) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>⚙️ FocusHub Setup</Text>
          <Text style={styles.subtitle}>
            {!convexUrl && !publishableKey
              ? "Convex backend and Clerk authentication keys are not yet configured."
              : !convexUrl
              ? "Missing EXPO_PUBLIC_CONVEX_URL in environment."
              : "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment."}
          </Text>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Quick Setup Steps:</Text>
            <Text style={styles.step}>
              1. Check your terminal running <Text style={styles.code}>npm run dev</Text> to authorize Convex login in your browser.
            </Text>
            <Text style={styles.step}>
              2. Convex will automatically create <Text style={styles.code}>.env.local</Text> with your <Text style={styles.code}>EXPO_PUBLIC_CONVEX_URL</Text>.
            </Text>
            <Text style={styles.step}>
              3. Set your <Text style={styles.code}>EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY</Text> in <Text style={styles.code}>.env.local</Text>.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>{children}</ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    maxWidth: 520,
    width: "100%",
    backgroundColor: COLORS.surface,
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 20,
    lineHeight: 20,
  },
  box: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
  },
  boxTitle: {
    color: COLORS.white,
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 14,
  },
  step: {
    color: COLORS.grey,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  code: {
    color: COLORS.primary,
    fontFamily: "monospace",
  },
});
