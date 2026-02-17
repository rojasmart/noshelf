import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";

export default function ExploreScreen() {
  const [groupedBooks, setGroupedBooks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");
      setGroupedBooks(response.data);
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

  const navigateToMunicipality = (municipality: string) => {
    console.log("Navigating to municipality:", municipality);
    console.log("Books for this municipality:", groupedBooks[municipality]);
    router.push({
      pathname: "/municipality",
      params: {
        municipality,
        books: JSON.stringify(groupedBooks[municipality] || []),
      },
    });
  };

  const regions = {
    "Grande Lisboa": [
      "Alcochete",
      "Almada",
      "Amadora",
      "Barreiro",
      "Cascais",
      "Lisboa (capital)",
      "Loures",
      "Mafra",
      "Moita",
      "Montijo",
      "Odivelas",
      "Oeiras",
      "Palmela",
      "Seixal",
      "Sesimbra",
      "Setúbal",
      "Sintra",
      "Vila Franca de Xira",
    ],
  };

  return (
    <ThemedView style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Available Books</ThemedText>
      </ThemedView>

      <ScrollView>
        {loading ? (
          <ThemedView style={styles.stepContainer}>
            <ThemedText>Loading books...</ThemedText>
          </ThemedView>
        ) : (
          Object.entries(regions).map(([region, municipalities]) => (
            <ThemedView key={region} style={styles.stepContainer}>
              <ThemedText type="subtitle">{region}</ThemedText>
              {municipalities.map((municipality) => (
                <TouchableOpacity key={municipality} style={styles.stepContainer} onPress={() => navigateToMunicipality(municipality)}>
                  <ThemedText>
                    {municipality}: {groupedBooks[municipality]?.length || 0} items
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          ))
        )}
      </ScrollView>
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
