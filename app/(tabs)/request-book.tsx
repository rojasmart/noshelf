import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RequestBookScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get("/requests");
      // Filter requests made by the current user
      const myRequests = response.data.filter((req) => req.requester_id === user?.id);
      setRequests(myRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      await api.delete(`/requests/${requestId}`);
      Alert.alert("Success", "Request canceled successfully!");
      fetchMyRequests(); // Refresh the list
    } catch (error) {
      console.error("Error canceling request:", error);
      Alert.alert("Error", "Failed to cancel request.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Book Requests</Text>
        <Text style={styles.loginPrompt}>Please register first to request books!</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Book Requests</Text>

      {requests.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestStatus}>Status: {request.status || "PENDING"}</Text>
              <Text style={styles.requestMessage}>{request.message}</Text>
              <Text style={styles.requestDate}>Requested: {new Date(request.created_at).toLocaleDateString()}</Text>

              {request.status === "PENDING" && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelRequest(request.id)}>
                  <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No book requests yet</Text>
          <Text style={styles.emptySubtext}>Go to Explore to request books from other users!</Text>
        </View>
      )}
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  loginPrompt: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  requestMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  requestDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
});
