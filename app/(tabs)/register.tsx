import api from "@/hooks/use-api";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [genres, setGenres] = useState("");

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
      alert("User registered successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name or nickname" placeholderTextColor="#888" />
      <TextInput
        style={styles.input}
        value={genres}
        onChangeText={setGenres}
        placeholder="Enter your favorite genres (comma-separated)"
        placeholderTextColor="#888"
      />
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter your city" placeholderTextColor="#888" />
      <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Enter your country" placeholderTextColor="#888" />
      <Button title="Register" onPress={handleRegister} />
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
});
