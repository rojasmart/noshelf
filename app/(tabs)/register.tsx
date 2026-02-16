import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [genres, setGenres] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true); // Start with login mode
  const { login, user, logout } = useUser();

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
        <View>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <View style={styles.userInfo}>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>City: {user.city}</Text>
            <Text style={styles.infoText}>Country: {user.country}</Text>
            <Text style={styles.infoText}>Favorite Genres: {user.genres}</Text>
          </View>
          <Button title="Logout" onPress={logout} />
        </View>
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
});
