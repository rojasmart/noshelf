import axios from "axios";
import { Link } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get("/test-connection");
        console.log("Connection successful:", response.data);
      } catch (error) {
        console.error("Connection failed:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
