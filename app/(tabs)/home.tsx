import api from "@/hooks/use-api";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(10);
  const [books, setBooks] = useState<{ id: number; location: { lat: number; lon: number }; title: string; author: string }[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get(`/books/nearby?lat=0&lon=0&radius_km=${radius}`);
        setBooks(response.data);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
      }
    };

    fetchBooks();
  }, [radius]);

  const saveSettings = async () => {
    try {
      await api.put("/user/settings", { email, city });
      alert("Configurações salvas!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {books.map((book) => (
          <Marker
            key={book.id}
            coordinate={{ latitude: book.location.lat, longitude: book.location.lon }}
            title={book.title}
            description={book.author}
          />
        ))}
      </MapView>
      <View style={styles.settings}>
        <Text>Email:</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Seu email" />
        <Text>Cidade:</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Sua cidade" />
        <Button title="Salvar Configurações" onPress={saveSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  settings: {
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
