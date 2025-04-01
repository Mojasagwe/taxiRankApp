import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { adminService } from '../../services/api/admin';
import { AdminRegistrationRequest } from '../../types/admin';

type AdminPendingRequestsScreenNavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'AdminPendingRequests'
>;

const AdminPendingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<AdminPendingRequestsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<AdminRegistrationRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getPendingRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError(response.error || 'Failed to load pending requests');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load pending requests');
      Alert.alert('Error', error.message || 'Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderRequestItem = ({ item }: { item: AdminRegistrationRequest }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => navigation.navigate('AdminRequestDetails', { requestId: item.id })}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.phone}>{item.phoneNumber}</Text>
      <Text style={styles.date}>Submitted: {formatDate(item.submittedAt)}</Text>
      <Text style={styles.ranksCount}>
        Requested Ranks: {item.rankCodes.length} {item.rankCodes.length === 1 ? 'rank' : 'ranks'}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading pending requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pending Admin Requests</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPendingRequests}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending requests found</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={isLoading}
          onRefresh={fetchPendingRequests}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    padding: 15,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff9800',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  email: {
    fontSize: 16,
    color: '#0066cc',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ranksCount: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 15,
  },
});

export default AdminPendingRequestsScreen; 