// The app's boot sequence and top-level navigation.
//
// 1. The splash screen stays up while saved data loads from the device
//    (useStorageReady) and the saved login is checked (useAuthSession).
// 2. Then one of three areas opens, decided by Stack.Protected:
//    logged out -> (auth); logged in but quiz not done -> style-quiz;
//    otherwise -> (tabs). When the login changes, the router moves to
//    the area that's now allowed.

import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { configureCore } from "@core/config.js";
import { colors } from "@core/theme/tokens.js";
import { PagedCacheProvider } from "@core/cache/PagedCacheProvider.jsx";

import { SessionProvider, useSession } from "../auth/SessionProvider";
import { Button, EmptyState, Screen } from "../components/ui";
import { API_URL, CLOUD_NAME, UPLOAD_PRESET } from "../platform/config";
import { storage } from "../platform/storage";
import { useStorageReady } from "../platform/useStorageReady";

SplashScreen.preventAutoHideAsync();

// Before any screen uses core/. Storage is read only once it's loaded.
configureCore({
  apiUrl: API_URL,
  storage,
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
});

// Shown instead of a blank screen if any screen crashes.
export function ErrorBoundary({ error, retry }) {
  console.error("Screen crashed:", error);

  return (
    <Screen scroll={false} edges={["top", "bottom"]}>
      <EmptyState
        title="Something went wrong"
        text="Sorry - that screen hit a problem."
      >
        <Button label="Try again" onPress={retry} />
      </EmptyState>
    </Screen>
  );
}

export default function RootLayout() {
  const storageReady = useStorageReady();

  if (!storageReady) {
    return null;
  }

  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { isCheckingToken, loggedIn, needsStyleQuiz } = useSession();

  useEffect(() => {
    if (!isCheckingToken) {
      SplashScreen.hide();
    }
  }, [isCheckingToken]);

  if (isCheckingToken) {
    return null;
  }

  return (
    <PagedCacheProvider loggedIn={loggedIn}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={loggedIn && !needsStyleQuiz}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="account" />
          <Stack.Screen name="item" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="build-outfit"
            options={{
              headerShown: true,
              headerTintColor: colors.main,
              headerShadowVisible: false,
              headerBackTitle: "Outfits",
            }}
          />
          <Stack.Screen
            name="outfit"
            options={{
              headerShown: true,
              headerTintColor: colors.main,
              headerShadowVisible: false,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={loggedIn && needsStyleQuiz}>
          <Stack.Screen name="style-quiz" />
        </Stack.Protected>

        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </PagedCacheProvider>
  );
}
