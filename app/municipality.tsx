import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MunicipalityScreen() {
  const { municipality, books } = useLocalSearchParams();
  const { user } = useUser();

  // Parse the books from JSON string
  const booksArray = books ? JSON.parse(books as string) : [];

  const requestBook = async (copyId: number, title: string) => {
    if (!user) {
      Alert.alert("Login Required", "Please register first to request books!");
      return;
    }

    try {
      await api.post("/requests", {
        copy_id: copyId,
        requester_id: user.id,
        message: `I would like to borrow "${title}"`,
      });
      Alert.alert("Success", "Book request sent successfully!");
    } catch (error) {
      console.error("Error requesting book:", error);
      Alert.alert("Error", "Failed to send request. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{municipality}</Text>
      <ScrollView>
        {booksArray.length > 0 ? (
          booksArray.map((book: any, index: number) => (
            <View key={index} style={styles.bookContainer}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text>Author: {book.author}</Text>
              <Text>ISBN: {book.isbn}</Text>
              {user && (
                <TouchableOpacity style={styles.requestButton} onPress={() => requestBook(book.copy_id, book.title)}>
                  <Text style={styles.requestButtonText}>Request Book</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text>No books available in this municipality.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bookContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
