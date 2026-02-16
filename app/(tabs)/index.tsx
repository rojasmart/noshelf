import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import api from "@/hooks/use-api";
import { useNavigation } from "expo-router";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const response = await api.post("/register", { email, password });
      alert("User registered successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  useEffect(() => {
    api
      .get("/")
      .then((response) => setMessage(response.data.message))
      .catch((error) => console.error("Erro ao conectar ao backend:", error));
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={require("@/assets/images/noshelf-book.jpg")} style={styles.reactLogo} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Register</ThemedText>
        <ThemedText>Register to access the app features. Once registered, you can explore, add, and request books.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore Lists</ThemedText>
        <ThemedText>Browse through the available books near you and discover what others are sharing.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Add a Book</ThemedText>
        <ThemedText>Share your books with the community by adding them to the app.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Request a Book</ThemedText>
        <ThemedText>Request books from others and start a conversation to arrange the exchange.</ThemedText>
      </ThemedView>
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
});
