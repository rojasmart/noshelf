import api from "@/hooks/use-api";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");

  const addBook = async () => {
    try {
      await api.post("/books", { title, author, isbn });
      alert("Livro adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Livro</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título" />
      <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Autor" />
      <TextInput style={styles.input} value={isbn} onChangeText={setIsbn} placeholder="ISBN" />
      <Button title="Adicionar Livro" onPress={addBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
