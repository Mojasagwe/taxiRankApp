import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { adminService } from '../../services/api/admin';
import { AdminRegistrationRequest, Rank } from '../../types/admin';

type AdminRequestDetailsRouteProp = RouteProp<AdminStackParamList, 'AdminRequestDetails'>;
type AdminRequestDetailsNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminRequestDetails'>;

const AdminRequestDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AdminRequestDetailsNavigationProp>();
  const route = useRoute<AdminRequestDetailsRouteProp>();
  const { requestId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<AdminRegistrationRequest | null>(null);
  const [ranks, setRanks] = useState<Record<string, Rank>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Rejection modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch request details
      const response = await adminService.getRequestDetails(requestId);
      if (response.success && response.data) {
        setRequest(response.data);
        
        // Fetch rank details for each rank ID
        const ranksData: Record<string, Rank> = {};
        for (const rankCode of response.data.rankCodes) {
          // In a real app, you might want to batch these requests
          try {
            // We're assuming there's an API to get rank details by ID
            // If there isn't, you might need to get all available ranks and filter
            const rankResponse = await adminService.getAvailableRanks();
            if (rankResponse.success && rankResponse.data) {
              const rank = rankResponse.data.find(r => r.code === rankCode);
              if (rank) {
                ranksData[rankCode] = rank;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch rank ${rankCode}:`, error);
          }
        }
        
        setRanks(ranksData);
      } else {
        setError(response.error || 'Failed to load request details');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load request details');
      Alert.alert('Error', error.message || 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const response = await adminService.reviewRequest(requestId, { approved: true });
      
      if (response.success) {
        Alert.alert(
          'Approved Successfully',
          'The admin registration request has been approved.',
          [{ text: 'OK', onPress: () => navigation.navigate('AdminPendingRequests') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to approve request');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await adminService.reviewRequest(requestId, {
        approved: false,
        rejectionReason: rejectionReason.trim()
      });
      
      if (response.success) {
        setShowRejectionModal(false);
        Alert.alert(
          'Rejected Successfully',
          'The admin registration request has been rejected.',
          [{ text: 'OK', onPress: () => navigation.navigate('AdminPendingRequests') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to reject request');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('AdminPendingRequests')}
          >
            <Text style={styles.backButtonText}>← Back to Requests</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Request not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRequestDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('AdminPendingRequests')}
        >
          <Text style={styles.backButtonText}>← Back to Requests</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Request Details</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{request.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, styles.statusBadge]}>{request.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted:</Text>
            <Text style={styles.infoValue}>{formatDate(request.submittedAt)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{request.firstName} {request.lastName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{request.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{request.phoneNumber}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested Ranks</Text>
          {request.rankCodes.map(rankCode => {
            const rank = ranks[rankCode];
            return (
              <View key={rankCode} style={styles.rankItem}>
                {rank ? (
                  <>
                    <Text style={styles.rankName}>{rank.name}</Text>
                    <Text style={styles.rankDescription}>{rank.description}</Text>
                    <Text style={styles.rankAddress}>
                      {rank.location?.address || rank.address}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.rankUnknown}>Rank Code: {rankCode} (Details unavailable)</Text>
                )}
              </View>
            );
          })}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.approveButton, isSubmitting && styles.disabledButton]}
            onPress={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Approve</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.rejectButton, isSubmitting && styles.disabledButton]}
            onPress={() => setShowRejectionModal(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Rejection Modal */}
      <Modal
        visible={showRejectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Provide Rejection Reason</Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline={true}
              numberOfLines={3}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRejectionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
                onPress={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Rejection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  infoLabel: {
    width: 100,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#fff9e6',
    color: '#ff9800',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  rankItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  rankDescription: {
    fontSize: 14,
    color: '#666',
  },
  rankAddress: {
    fontSize: 14,
    color: '#666',
  },
  rankUnknown: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminRequestDetailsScreen; 