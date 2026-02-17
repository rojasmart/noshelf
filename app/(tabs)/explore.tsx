import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";

export default function ExploreScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestBook = async (bookId: number, title: string) => {
    if (!user) {
      alert("Please register first to request books!");
      return;
    }

    try {
      await api.post("/requests", {
        book_id: bookId,
        requester_id: user.id,
        message: `I would like to borrow "${title}"`,
      });
      alert("Book request sent successfully!");
    } catch (error) {
      console.error("Error requesting book:", error);
      alert("Failed to send request. Please try again.");
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Available Books</ThemedText>
      </ThemedView>

      {!user && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText>Please register first to request books!</ThemedText>
        </ThemedView>
      )}

      {loading ? (
        <ThemedView style={styles.stepContainer}>
          <ThemedText>Loading books...</ThemedText>
        </ThemedView>
      ) : books.length > 0 ? (
        books.map((book: any) => (
          <ThemedView key={book.id} style={styles.stepContainer}>
            <ThemedText type="subtitle">{book.title}</ThemedText>
            <ThemedText>by {book.author}</ThemedText>
            <ThemedText>ISBN: {book.isbn}</ThemedText>
            {user && (
              <TouchableOpacity style={styles.button} onPress={() => requestBook(book.id, book.title)}>
                <ThemedText style={styles.buttonText}>Request Book</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        ))
      ) : (
        <ThemedView style={styles.stepContainer}>
          <ThemedText>No books available yet</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
