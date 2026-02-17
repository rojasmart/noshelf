import api from "@/hooks/use-api";
import { useUser } from "@/hooks/use-user";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RequestBookScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-requests"); // "my-requests", "incoming", or "my-library"
  const { user } = useUser();

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "#FFA500"; // Orange
      case "ACCEPTED":
        return "#007AFF"; // Blue
      case "RESERVED":
        return "#007AFF"; // Blue
      case "COMPLETED":
        return "#28a745"; // Green
      default:
        return "#666"; // Gray
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "RESERVED":
        return "Reserved";
      case "COMPLETED":
        return "Completed ✅";
      default:
        return status;
    }
  };

  const renderTransferBadge = (status: string) => {
    if (status.toUpperCase() === "COMPLETED") {
      return (
        <View style={styles.transferBadge}>
          <Text style={styles.transferBadgeText}>📚 Book Transferred</Text>
        </View>
      );
    }
    return null;
  };

  const renderBookOriginBadge = (book: any) => {
    // Verifica se este livro foi adquirido via request completado
    const wasAcquired = requests.some((req) => req.book_title === book.title && req.book_author === book.author && req.status === "COMPLETED");

    if (wasAcquired) {
      return (
        <View style={styles.acquiredBadge}>
          <Text style={styles.acquiredBadgeText}>📖 Acquired via Request</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.originalBadge}>
          <Text style={styles.originalBadgeText}>⭐ Original Book</Text>
        </View>
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRequests();
      fetchIncomingRequests();
      fetchMyBooks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get(`/users/${user?.id}/outgoing-requests`);
      console.log("Outgoing requests for user", user?.id, ":", response.data);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await api.get(`/users/${user?.id}/incoming-requests`);
      setIncomingRequests(response.data);
      console.log("Incoming requests:", response.data);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  const fetchMyBooks = async () => {
    try {
      const response = await api.get(`/users/${user?.id}/books`);
      setMyBooks(response.data);
      console.log("My books:", response.data);
    } catch (error) {
      console.error("Error fetching my books:", error);
    }
  };

  const openChat = (requestId: number, isOwner: boolean) => {
    router.push({
      pathname: "/request-chat" as any,
      params: {
        requestId: requestId.toString(),
        userId: user?.id.toString(),
        isOwner: isOwner.toString(),
      },
    });
  };

  const cancelRequest = async (requestId: number) => {
    try {
      await api.delete(`/requests/${requestId}`);
      Alert.alert("Success", "Request canceled successfully!");
      fetchMyRequests(); // Refresh the list
    } catch (error) {
      console.error("Error canceling request:", error);
      Alert.alert("Error", "Failed to cancel request.");
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      await api.put(`/requests/${requestId}/accept`);
      Alert.alert("Success", "Request accepted successfully!");
      fetchIncomingRequests(); // Refresh the list
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request.");
    }
  };

  const confirmDelivery = async (requestId: number) => {
    try {
      await api.put(`/requests/${requestId}/confirm-delivery`);
      Alert.alert("Success", "Delivery confirmed successfully!");
      fetchMyRequests(); // Refresh both lists
      fetchIncomingRequests();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      Alert.alert("Error", "Failed to confirm delivery.");
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
      <Text style={styles.title}>Book Requests</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === "my-requests" && styles.activeTab]} onPress={() => setActiveTab("my-requests")}>
          <Text style={[styles.tabText, activeTab === "my-requests" && styles.activeTabText]}>My Requests ({requests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "incoming" && styles.activeTab]} onPress={() => setActiveTab("incoming")}>
          <Text style={[styles.tabText, activeTab === "incoming" && styles.activeTabText]}>Incoming ({incomingRequests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "my-library" && styles.activeTab]} onPress={() => setActiveTab("my-library")}>
          <Text style={[styles.tabText, activeTab === "my-library" && styles.activeTabText]}>My Library ({myBooks.length})</Text>
        </TouchableOpacity>
      </View>

      {/* My Requests Tab */}
      {activeTab === "my-requests" && (
        <>
          {requests.length > 0 ? (
            <ScrollView style={styles.scrollView}>
              {requests.map((request: any) => (
                <View key={request.id} style={styles.requestCard}>
                  <Text style={styles.bookTitle}>
                    {request.book_title} by {request.book_author}
                  </Text>
                  <Text style={styles.requesterInfo}>
                    Requested from: {request.owner_name} ({request.owner_email})
                  </Text>
                  <Text style={styles.requestMessage}>Message: {request.message}</Text>
                  <Text style={[styles.requestStatus, { color: getStatusColor(request.status) }]}>
                    Status: {getStatusDisplayText(request.status)}
                  </Text>
                  <Text style={styles.requestDate}>Date: {new Date(request.created_at).toLocaleDateString()}</Text>

                  {renderTransferBadge(request.status)}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={() => openChat(request.id, false)}>
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>

                    {request.status === "PENDING" && (
                      <TouchableOpacity style={styles.cancelButton} onPress={() => cancelRequest(request.id)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    )}

                    {request.status === "ACCEPTED" && (
                      <TouchableOpacity style={styles.confirmButton} onPress={() => confirmDelivery(request.id)}>
                        <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You haven't requested any books yet.</Text>
              <Text style={styles.emptySubtext}>Browse available books and make your first request!</Text>
            </View>
          )}
        </>
      )}

      {/* Incoming Requests Tab */}
      {activeTab === "incoming" && (
        <>
          {incomingRequests.length > 0 ? (
            <ScrollView style={styles.scrollView}>
              {incomingRequests.map((request: any) => (
                <View key={request.id} style={styles.requestCard}>
                  <Text style={styles.bookTitle}>
                    {request.book_title} by {request.book_author}
                  </Text>
                  <Text style={styles.requesterInfo}>
                    Requested by: {request.requester_name} ({request.requester_email})
                  </Text>
                  <Text style={styles.requestMessage}>Message: {request.message}</Text>
                  <Text style={[styles.requestStatus, { color: getStatusColor(request.status) }]}>
                    Status: {getStatusDisplayText(request.status)}
                  </Text>
                  <Text style={styles.requestDate}>Requested: {new Date(request.created_at).toLocaleDateString()}</Text>

                  {renderTransferBadge(request.status)}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={() => openChat(request.id, true)}>
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>

                    {request.status === "PENDING" && (
                      <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRequest(request.id)}>
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No incoming requests for your books.</Text>
              <Text style={styles.emptySubtext}>When someone requests your books, they'll appear here!</Text>
            </View>
          )}
        </>
      )}

      {/* My Library Tab */}
      {activeTab === "my-library" && (
        <>
          {myBooks.length > 0 ? (
            <ScrollView style={styles.scrollView}>
              {myBooks.map((book: any) => (
                <View key={book.copy_id} style={styles.myBookCard}>
                  <Text style={styles.myBookTitle}>
                    {book.title} by {book.author}
                  </Text>
                  <Text style={styles.myBookInfo}>ISBN: {book.isbn}</Text>
                  <Text style={styles.myBookInfo}>Condition: {book.condition}</Text>
                  <Text style={styles.myBookInfo}>Status: {book.status}</Text>

                  {renderBookOriginBadge(book)}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You don't have any books yet.</Text>
              <Text style={styles.emptySubtext}>Add your first book to get started!</Text>
            </View>
          )}
        </>
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
    flex: 1,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  requesterInfo: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  chatButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  acceptButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  transferBadge: {
    backgroundColor: "#28a745",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  transferBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  acquiredBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  acquiredBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  originalBadge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  originalBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  myBookCard: {
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
  myBookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  myBookInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
});
