// Log in and Register - only reachable while logged out (see ../_layout.jsx).

import { Stack } from "expo-router";

// Logging out (or opening the app logged out) lands on Log in.
export const unstable_settings = {
  anchor: "login",
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
