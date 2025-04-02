import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { adminService } from '../../services/api/admin';
import { AdminRegistrationRequest } from '../../types/admin';
import { styles } from './AdminPendingRequestsScreen.styles';

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
        Requested Ranks: {(item.rankCodes || []).length} {(item.rankCodes || []).length === 1 ? 'rank' : 'ranks'}
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
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
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

export default AdminPendingRequestsScreen; 