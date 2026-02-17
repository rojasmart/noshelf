import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const { user } = useUser();

  const addBook = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please register first to add books!");
      return;
    }

    if (!title || !author) {
      Alert.alert("Missing Information", "Please fill in at least the title and author.");
      return;
    }

    try {
      console.log("Adding book with user ID:", user.id);
      console.log("Book data:", { title, author, isbn: isbn || `NO-ISBN-${Date.now()}` });

      const response = await api.post(`/books?owner_id=${user.id}`, {
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
