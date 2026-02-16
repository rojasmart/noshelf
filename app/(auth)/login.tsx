import api from "@/hooks/use-api";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendMagicLink = async () => {
    try {
      const response = await api.post("/send-magic-link", { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Erro ao enviar Magic Link.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insira seu email:</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Enviar Magic Link" onPress={sendMagicLink} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  message: {
    marginTop: 10,
    color: "green",
  },
});
