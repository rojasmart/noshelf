import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [municipio, setMunicipio] = useState("");
  const { user } = useUser();

  const addBook = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please register first to add books!");
      return;
    }

    if (!title || !author || !municipio) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    try {
      console.log("Adding book with user ID:", user.id);
      console.log("Book data:", { title, author, isbn: isbn || `NO-ISBN-${Date.now()}`, municipio });

      const response = await api.post(`/books?owner_id=${user.id}&municipio=${municipio}`, {
        title,
        author,
        isbn: isbn || `NO-ISBN-${Date.now()}`, // Generate a unique identifier if no ISBN
      });

      console.log("Book added successfully:", response.data);
      Alert.alert("Success", "Book added successfully!");

      // Clear form
      setTitle("");
      setAuthor("");
      setIsbn("");
      setMunicipio("");
    } catch (error: any) {
      console.error("Error adding book:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      Alert.alert("Error", "Failed to add book. Please try again.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add Book</Text>
        <Text style={styles.loginPrompt}>Please register first to add books to the library!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Book to Library</Text>
      <Text style={styles.subtitle}>Share your books with the community</Text>

      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Book Title *" placeholderTextColor="#888" />

      <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Author *" placeholderTextColor="#888" />

      <TextInput style={styles.input} value={isbn} onChangeText={setIsbn} placeholder="ISBN (optional)" placeholderTextColor="#888" />

      <Picker selectedValue={municipio} onValueChange={(itemValue: string) => setMunicipio(itemValue)} style={styles.input}>
        <Picker.Item label="Select Municipality *" value="" />
        <Picker.Item label="Alcochete" value="Alcochete" />
        <Picker.Item label="Almada" value="Almada" />
        <Picker.Item label="Amadora" value="Amadora" />
        <Picker.Item label="Barreiro" value="Barreiro" />
        <Picker.Item label="Cascais" value="Cascais" />
        <Picker.Item label="Lisboa (capital)" value="Lisboa (capital)" />
        <Picker.Item label="Loures" value="Loures" />
        <Picker.Item label="Mafra" value="Mafra" />
        <Picker.Item label="Moita" value="Moita" />
        <Picker.Item label="Montijo" value="Montijo" />
        <Picker.Item label="Odivelas" value="Odivelas" />
        <Picker.Item label="Oeiras" value="Oeiras" />
        <Picker.Item label="Palmela" value="Palmela" />
        <Picker.Item label="Seixal" value="Seixal" />
        <Picker.Item label="Sesimbra" value="Sesimbra" />
        <Picker.Item label="Setúbal" value="Setúbal" />
        <Picker.Item label="Sintra" value="Sintra" />
        <Picker.Item label="Vila Franca de Xira" value="Vila Franca de Xira" />
      </Picker>

      <Button title="Add Book" onPress={addBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  loginPrompt: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
});
