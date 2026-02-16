import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Button, Platform, StyleSheet, TextInput } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import api from "@/hooks/use-api";
import { Link, useNavigation } from "expo-router";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/send-magic-link", { email });
      alert("Magic Link enviado para o seu email!");
    } catch (error) {
      console.error("Erro ao enviar Magic Link:", error);
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
        <ThemedText type="title">Bem-vindo!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Registre seu email para acessar os recursos:</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Registar Email" onPress={handleLogin} />
        <ThemedText>Após registar o seu email, poderá adicionar, listar e requisitar livros.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert("Action pressed")} />
            <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => alert("Share pressed")} />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction title="Delete" icon="trash" destructive onPress={() => alert("Delete pressed")} />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>{`Tap the Explore tab to learn more about what's included in this starter app.`}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.backendMessageContainer}>
        <ThemedText style={styles.backendMessageText}>Backend Message: {message}</ThemedText>
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
  },
});
