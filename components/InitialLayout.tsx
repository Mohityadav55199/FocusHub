import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      ensureUser().catch(console.error);
    }

    const inAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)/login");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
