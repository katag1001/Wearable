import { useState } from "react";
import { router } from "expo-router";

import { getErrorMessage } from "@core/api/errors.js";

import { useSession } from "../../auth/SessionProvider";
import { Button, Message, Screen, TextField } from "../../components/ui";

// On success the root layout's guards open the app (or the style quiz).
export default function LoginScreen() {
  const { login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() && password;

  const handleLogin = async () => {
    setMessage("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (error) {
      setMessage(getErrorMessage(error, "Login failed"));
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="LovedWornSeen"
      subtitle="Log in to your wardrobe"
      centered
      edges={["top", "bottom"]}
    >
      <Message text={message} />

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={canSubmit ? handleLogin : undefined}
      />

      <Button
        label="Log in"
        onPress={handleLogin}
        disabled={!canSubmit}
        loading={submitting}
      />
      <Button
        label="Create an account"
        variant="text"
        onPress={() => router.push("/register")}
      />
    </Screen>
  );
}
