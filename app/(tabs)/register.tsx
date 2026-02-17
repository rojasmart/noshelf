import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [genres, setGenres] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true); // Start with login mode
  const [myBooks, setMyBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const { login, user, logout } = useUser();

  useEffect(() => {
    if (user) {
      fetchMyBooks();
    }
  }, [user]);

  const fetchMyBooks = async () => {
    if (!user) return;

    setBooksLoading(true);
    try {
      console.log("Fetching books for user ID:", user.id);
      const response = await api.get(`/users/${user.id}/books`);
      console.log("Books fetched:", response.data);
      setMyBooks(response.data);
    } catch (error: any) {
      console.error("Error fetching user books:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } finally {
      setBooksLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      await login(response.data);
      alert("Login successful!");

      // Clear form
      setEmail("");
      setPassword("");
    } catch (error: any) {
      if (error.response) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert("Login failed. Please check your credentials.");
      }
      console.error("Error logging in:", error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post("/register", {
        email,
        password,
        name,
        city,
        country,
        genres,
      });

      // Auto-login after successful registration
      await login(response.data);
      alert("User registered and logged in successfully!");

      // Clear form
      setEmail("");
      setPassword("");
      setName("");
      setCity("");
      setCountry("");
      setGenres("");
    } catch (error: any) {
      if (error.response) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert("An unexpected error occurred.");
      }
      console.error("Error registering user:", error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <ScrollView>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <View style={styles.userInfo}>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>City: {user.city}</Text>
            <Text style={styles.infoText}>Country: {user.country}</Text>
            <Text style={styles.infoText}>Favorite Genres: {user.genres}</Text>
          </View>

          {/* My Books Section */}
          <View style={styles.myBooksSection}>
            <Text style={styles.sectionTitle}>My Books</Text>
            {booksLoading ? (
              <Text style={styles.loadingText}>Loading your books...</Text>
            ) : myBooks.length > 0 ? (
              myBooks.map((book: any) => (
                <View key={book.id} style={styles.bookCard}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>by {book.author}</Text>
                  <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyBooksText}>No books added yet. Go to "Add Book" to share your first book!</Text>
            )}
          </View>

          <Button title="Logout" onPress={logout} />
        </ScrollView>
      ) : (
        <View>
          <Text style={styles.title}>{isLoginMode ? "Login" : "Register"}</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry
          />

          {!isLoginMode && (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name or nickname"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={genres}
                onChangeText={setGenres}
                placeholder="Enter your favorite genres (comma-separated)"
                placeholderTextColor="#888"
              />
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter your city" placeholderTextColor="#888" />
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Enter your country"
                placeholderTextColor="#888"
              />
            </>
          )}

          <Button title={isLoginMode ? "Login" : "Register"} onPress={isLoginMode ? handleLogin : handleRegister} />

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.switchText}>{isLoginMode ? "Don't have an account? Register here" : "Already have an account? Login here"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: "100%",
    color: "#fff",
  },
  userInfo: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: "#007AFF",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  myBooksSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
  bookCard: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 3,
  },
  bookIsbn: {
    fontSize: 12,
    color: "#888",
  },
  emptyBooksText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
});
