import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={require("@/assets/images/noshelf-book.jpg")} style={styles.reactLogo} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Books</ThemedText>
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
    </ParallaxScrollView>
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
  reactLogo: {
    height: 278,
    width: 390,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  backendMessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  backendMessageText: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    color: "#fff",
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
