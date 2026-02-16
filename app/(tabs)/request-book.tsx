import api from "@/hooks/use-api";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function RequestBookScreen() {
  const [bookId, setBookId] = useState("");
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const requestBook = async () => {
    try {
      const response = await api.post("/requests", { bookId, message });
      setResponseMessage("Pedido enviado com sucesso!");
    } catch (error) {
      setResponseMessage("Erro ao enviar pedido.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedir Livro</Text>
      <TextInput style={styles.input} value={bookId} onChangeText={setBookId} placeholder="ID do Livro" />
      <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Mensagem (opcional)" />
      <Button title="Pedir Livro" onPress={requestBook} />
      {responseMessage && <Text style={styles.response}>{responseMessage}</Text>}
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
  response: {
    marginTop: 10,
    color: "green",
  },
});
