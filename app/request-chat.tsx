import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import api from "@/hooks/use-api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function RequestChatScreen() {
  const { requestId, userId, isOwner } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Polling: atualiza mensagens a cada 5 segundos
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/requests/${requestId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post(`/requests/${requestId}/messages`, null, {
        params: {
          content: newMessage,
          sender_id: userId,
        },
      });

      setNewMessage("");
      fetchMessages(); // Atualiza as mensagens
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Chat - Request #{requestId}</ThemedText>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageCard, message.sender_id === parseInt(userId as string) ? styles.ownMessage : styles.otherMessage]}
          >
            <ThemedText style={styles.senderName}>{message.sender_name}</ThemedText>
            <ThemedText style={styles.messageContent}>{message.content}</ThemedText>
            <ThemedText style={styles.messageTime}>{new Date(message.created_at).toLocaleString()}</ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput style={styles.textInput} value={newMessage} onChangeText={setNewMessage} placeholder="Type your message..." multiline />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <ThemedText style={styles.sendButtonText}>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
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
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageCard: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  ownMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 11,
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
