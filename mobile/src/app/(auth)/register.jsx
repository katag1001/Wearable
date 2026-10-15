import { useState } from "react";
import { router } from "expo-router";

import { register } from "@core/api/auth.js";
import { getErrorMessage } from "@core/api/errors.js";

import { Button, Message, Screen, TextField } from "../../components/ui";

const emptyForm = { email: "", password: "", password2: "" };

// Like the web: on success the form clears and the user logs in.
export default function RegisterScreen() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (name) => (value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const canSubmit = form.email.trim() && form.password && form.password2;

  const handleRegister = async () => {
    setMessage({ text: "", type: "error" });
    setSubmitting(true);

    try {
      const data = await register({ ...form, email: form.email.trim() });

      setMessage({ text: data.message, type: data.ok ? "success" : "error" });

      if (data.ok) {
        setForm(emptyForm);
      }
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, "Registration failed"),
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Create an account"
      subtitle="Start building your wardrobe"
      centered
      edges={["top", "bottom"]}
    >
      <Message text={message.text} type={message.type} />

      <TextField
        label="Email"
        value={form.email}
        onChangeText={updateField("email")}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        value={form.password}
        onChangeText={updateField("password")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm password"
        value={form.password2}
        onChangeText={updateField("password2")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <Button
        label="Register"
        onPress={handleRegister}
        disabled={!canSubmit}
        loading={submitting}
      />
      <Button
        label="Back to log in"
        variant="text"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/login")
        }
      />
    </Screen>
  );
}
