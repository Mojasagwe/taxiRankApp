import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import FormInput from '../../components/inputs/FormInput';
import TerminalEditorModal from '../../components/modals/TerminalEditorModal';
import { PrimaryButton } from '../../components/buttons';
import { TerminalCard } from '../../components/cards';
import { RankDetails, TaxiTerminal } from '../../types/admin';
// Import the admin service for API integration
import { adminService } from '../../services/api/admin';

type ManageRankScreenRouteProp = RouteProp<AdminStackParamList, 'ManageRank'>;
type ManageRankScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const ManageRankScreen: React.FC = () => {
  const route = useRoute<ManageRankScreenRouteProp>();
  const navigation = useNavigation<ManageRankScreenNavigationProp>();
  const { rankId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [rankDetails, setRankDetails] = useState<RankDetails | null>(null);
  
  // Terminal being edited
  const [selectedTerminal, setSelectedTerminal] = useState<TaxiTerminal | null>(null);
  const [showTerminalModal, setShowTerminalModal] = useState(false);

  // Form state for rank details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [terminals, setTerminals] = useState<TaxiTerminal[]>([]);

  const fetchRankDetails = useCallback(async () => {
    // Helper function to fetch terminals
    const fetchTerminals = async () => {
      try {
        const terminalsResponse = await adminService.getTerminals(rankId);
        if (terminalsResponse.success && terminalsResponse.data) {
          setTerminals(terminalsResponse.data);
          return true;
        } else {
          console.error('Failed to fetch terminals:', terminalsResponse.error);
          return false;
        }
      } catch (error) {
        console.error('Error fetching terminals:', error);
        return false;
      }
    };

    try {
      setIsLoading(true);
      
      // First, fetch dashboard stats to get the list of ranks
      const dashboardResponse = await adminService.getDashboardStats();
      
      if (!dashboardResponse.success || !dashboardResponse.data) {
        throw new Error(dashboardResponse.error || 'Failed to fetch dashboard stats');
      }
      
      // Find the specific rank from the managed ranks array
      const rank = dashboardResponse.data.managedRanks.find(r => r.id === rankId);
      
      if (!rank) {
        throw new Error('Rank not found in managed ranks');
      }
      
      // Extract operating hours into open and close time
      let openTime = '06:00';
      let closeTime = '18:00';
      
      if (rank.operatingHours) {
        const times = rank.operatingHours.split('-');
        if (times.length === 2) {
          openTime = times[0].trim();
          closeTime = times[1].trim();
        }
      }
      
      // Create a RankDetails object from the rank data
      const rankDetails: RankDetails = {
        id: rank.id,
        name: rank.name,
        code: rank.code || `RANK-${rank.id}`,
        description: rank.description || '',
        address: rank.address || '',
        city: rank.city || '',
        province: rank.province || '',
        latitude: rank.latitude || 0,
        longitude: rank.longitude || 0,
        contactPhone: rank.contactPhone || '',
        contactEmail: rank.contactEmail || '',
        operatingHours: rank.operatingHours || '',
        openTime: openTime,
        closeTime: closeTime,
        capacity: rank.capacity || 0,
        isActive: rank.isActive !== undefined ? rank.isActive : true,
        createdAt: rank.createdAt || new Date().toISOString(),
        updatedAt: rank.updatedAt || new Date().toISOString(),
        terminals: [], // Will be populated below
        rankAdmins: rank.rankAdmins || [],
        imageUrl: rank.imageUrl
      };
      
      // Set the rank details
      setRankDetails(rankDetails);
      
      // Set the form state
      setName(rankDetails.name);
      setDescription(rankDetails.description);
      setAddress(rankDetails.address);
      setCity(rankDetails.city);
      setProvince(rankDetails.province);
      setLatitude(rankDetails.latitude.toString());
      setLongitude(rankDetails.longitude.toString());
      setContactPhone(rankDetails.contactPhone);
      setContactEmail(rankDetails.contactEmail);
      setOpenTime(rankDetails.openTime);
      setCloseTime(rankDetails.closeTime);
      
      // Try to fetch terminals, but continue even if it fails
      const terminalsSuccess = await fetchTerminals();
      if (!terminalsSuccess) {
        // Use empty terminals array if fetching fails
        setTerminals([]);
        console.warn('Using empty terminals list due to fetch failure');
      }
      
    } catch (error) {
      console.error('Failed to fetch rank details:', error);
      Alert.alert('Error', 'Failed to fetch rank details');
    } finally {
      setIsLoading(false);
    }
  }, [rankId]);

  useEffect(() => {
    fetchRankDetails();
  }, [fetchRankDetails]);

  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    if (rankDetails) {
      // Reset form state to original values
      setName(rankDetails.name);
      setDescription(rankDetails.description);
      setAddress(rankDetails.address);
      setCity(rankDetails.city);
      setProvince(rankDetails.province);
      setLatitude(rankDetails.latitude.toString());
      setLongitude(rankDetails.longitude.toString());
      setContactPhone(rankDetails.contactPhone);
      setContactEmail(rankDetails.contactEmail);
      setOpenTime(rankDetails.openTime);
      setCloseTime(rankDetails.closeTime);
    }
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      if (!rankDetails) return;
      
      setIsLoading(true);
      
      // Basic validation
      if (!name || !description || !address || !city || !province) {
        Alert.alert('Error', 'All fields are required');
        setIsLoading(false);
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (contactEmail && !emailRegex.test(contactEmail)) {
        Alert.alert('Error', 'Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      // Update rank details
      const updatedRankDetails: RankDetails = {
        ...rankDetails,
        name,
        description,
        address,
        city,
        province,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        contactPhone,
        contactEmail,
        openTime,
        closeTime,
        terminals,
        operatingHours: `${openTime}-${closeTime}`
      };
      
      // Call the API to update rank details
      const updateResult = await adminService.updateRankDetails(rankId, {
        name: updatedRankDetails.name,
        description: updatedRankDetails.description,
        address: updatedRankDetails.address,
        city: updatedRankDetails.city,
        province: updatedRankDetails.province,
        latitude: updatedRankDetails.latitude,
        longitude: updatedRankDetails.longitude,
        contactPhone: updatedRankDetails.contactPhone,
        contactEmail: updatedRankDetails.contactEmail,
        operatingHours: updatedRankDetails.operatingHours,
        capacity: updatedRankDetails.capacity,
        isActive: updatedRankDetails.isActive
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update rank details');
      }
      
      // Update local state with the response data
      if (updateResult.data) {
        // For terminals, keep the current terminals state as it's managed separately
        setRankDetails({
          ...updateResult.data,
          terminals
        });
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Rank details updated successfully');
    } catch (error: any) {
      console.error('Save rank details error:', error);
      Alert.alert('Error', error.message || 'Failed to save rank details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTerminal = () => {
    setSelectedTerminal(null);
    setShowTerminalModal(true);
  };

  const handleEditTerminal = (terminal: TaxiTerminal) => {
    setSelectedTerminal(terminal);
    setShowTerminalModal(true);
  };

  const handleDeleteTerminal = async (terminalId: number) => {
    try {
      // Confirm deletion
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this terminal?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              
              const deleteResult = await adminService.deleteTerminal(rankId, terminalId);
              
              if (!deleteResult.success) {
                throw new Error(deleteResult.error || 'Failed to delete terminal');
              }
              
              // Remove the terminal from the list
              setTerminals(prevTerminals => 
                prevTerminals.filter(t => t.id !== terminalId)
              );
              
              Alert.alert('Success', 'Terminal deleted successfully');
              setIsLoading(false);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Delete terminal error:', error);
      Alert.alert('Error', error.message || 'Failed to delete terminal');
      setIsLoading(false);
    }
  };

  const handleTerminalSave = async (terminal: TaxiTerminal) => {
    try {
      setIsLoading(true);
      
      if (selectedTerminal) {
        // Update existing terminal
        const updateResult = await adminService.updateTerminal(rankId, terminal.id, terminal);
        
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Failed to update terminal');
        }
        
        // Update the terminals list
        setTerminals(prevTerminals => 
          prevTerminals.map(t => t.id === terminal.id ? (updateResult.data || terminal) : t)
        );
        
        Alert.alert('Success', 'Terminal updated successfully');
      } else {
        // Create new terminal
        const createResult = await adminService.addTerminal(rankId, terminal);
        
        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to add terminal');
        }
        
        // Add the new terminal to the list
        if (createResult.data) {
          setTerminals(prevTerminals => [...prevTerminals, createResult.data!]);
        }
        
        Alert.alert('Success', 'Terminal added successfully');
      }
      
      setShowTerminalModal(false);
      setSelectedTerminal(null);
    } catch (error: any) {
      console.error('Save terminal error:', error);
      Alert.alert('Error', error.message || 'Failed to save terminal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfUnassign = async () => {
    try {
      // Confirm with the user before unassigning
      Alert.alert(
        'Confirm Unassign',
        'Are you sure you want to unassign yourself from this rank? You will no longer be able to manage it.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Unassign',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              
              const result = await adminService.selfUnassignFromRank(rankId);
              
              if (!result.success) {
                throw new Error(result.error || 'Failed to unassign from rank');
              }
              
              Alert.alert('Success', 'You have been unassigned from this rank');
              // Navigate back after successful unassignment
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Self-unassign error:', error);
      Alert.alert('Error', error.message || 'Failed to unassign from rank');
      setIsLoading(false);
    }
  };

  const renderDetailsTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Rank Name</Text>
          <FormInput
            value={name}
            onChangeText={setName}
            placeholder="Rank Name"
            editable={isEditing}
            style={[styles.input, !isEditing && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <FormInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
            numberOfLines={3}
            editable={isEditing}
            style={[styles.input, styles.textArea, !isEditing && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <FormInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street Address"
            editable={isEditing}
            style={[styles.input, !isEditing && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>City</Text>
            <FormInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              editable={isEditing}
              style={[styles.input, !isEditing && styles.disabledInput]}
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Province</Text>
            <FormInput
              value={province}
              onChangeText={setProvince}
              placeholder="Province"
              editable={isEditing}
              style={[styles.input, !isEditing && styles.disabledInput]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Phone</Text>
          <FormInput
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="Contact Phone"
            keyboardType="phone-pad"
            editable={isEditing}
            style={[styles.input, !isEditing && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Email</Text>
          <FormInput
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="Contact Email"
            keyboardType="email-address"
            editable={isEditing}
            style={[styles.input, !isEditing && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Opening Time</Text>
            <FormInput
              value={openTime}
              onChangeText={setOpenTime}
              placeholder="e.g., 06:00"
              editable={isEditing}
              style={[styles.input, !isEditing && styles.disabledInput]}
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Closing Time</Text>
            <FormInput
              value={closeTime}
              onChangeText={setCloseTime}
              placeholder="e.g., 19:00"
              editable={isEditing}
              style={[styles.input, !isEditing && styles.disabledInput]}
            />
          </View>
        </View>

        {/* Self-unassign button at the bottom */}
        {!isEditing && (
          <View style={styles.selfUnassignContainer}>
            <TouchableOpacity 
              style={styles.selfUnassignButton}
              onPress={handleSelfUnassign}
            >
              <Text style={styles.selfUnassignButtonText}>
                Unassign myself from this rank
              </Text>
            </TouchableOpacity>
            <Text style={styles.selfUnassignNote}>
              Note: You will no longer be able to manage this rank after unassigning.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTerminalsTab = () => {
    return (
      <View style={styles.tabContent}>
        {isEditing && (
          <PrimaryButton 
            title="Add New Terminal"
            onPress={handleAddTerminal}
          />
        )}
        
        {terminals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No terminals added yet</Text>
          </View>
        ) : (
          <>
            {terminals.map(terminal => (
              <TerminalCard 
                key={terminal.id}
                terminal={terminal}
                isEditing={isEditing}
                onEdit={handleEditTerminal}
                onDelete={handleDeleteTerminal}
                onToggleActive={handleToggleTerminalActive}
              />
            ))}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </View>
    );
  };

  // Handle toggling terminal active status
  const handleToggleTerminalActive = async (terminalId: number, isActive: boolean) => {
    try {
      setIsLoading(true);
      
      // Call the API to update terminal status
      const updateResult = await adminService.updateTerminalStatus(rankId, terminalId, isActive);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update terminal status');
      }
      
      // Update the terminals list with the new status
      setTerminals(prevTerminals => 
        prevTerminals.map(t => 
          t.id === terminalId ? { ...t, isActive } : t
        )
      );
      
      Alert.alert(
        'Success', 
        `Terminal ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      console.error('Toggle terminal status error:', error);
      Alert.alert('Error', error.message || 'Failed to update terminal status');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'terminals':
        return renderTerminalsTab();
      default:
        return renderDetailsTab();
    }
  };

  if (isLoading && !rankDetails) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e3ac34" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Rank</Text>
        {!isEditing ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : activeTab === 'terminals' ? (
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      
      <ScrollView contentContainerStyle={[
        styles.scrollContent, 
        isEditing && activeTab !== 'terminals' && styles.scrollContentWithButtons
      ]}>
        {/* Map placeholder as full-width element */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Map integration will be implemented here
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.rankInfoSection}>
            <Text style={styles.rankName}>{rankDetails?.name}</Text>
            <Text style={styles.rankLocation}>{rankDetails?.city}, {rankDetails?.province}</Text>
          </View>
          
          {/* Navigation tabs - without Contact tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'details' && styles.activeTab]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'terminals' && styles.activeTab]}
              onPress={() => setActiveTab('terminals')}
            >
              <Text style={[styles.tabText, activeTab === 'terminals' && styles.activeTabText]}>
                Terminals
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab content */}
          {renderTabContent()}
        </View>
      </ScrollView>
      
      {/* Fixed Bottom Action Buttons */}
      {isEditing && activeTab !== 'terminals' && (
        <View style={styles.fixedActionButtons}>
          <TouchableOpacity 
            style={[styles.cancelButton, isLoading && styles.disabledButton]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Terminal Editor Modal */}
      <TerminalEditorModal
        visible={showTerminalModal}
        onClose={() => {
          setShowTerminalModal(false);
          setSelectedTerminal(null);
        }}
        terminal={selectedTerminal}
        onSave={handleTerminalSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithButtons: {
    paddingBottom: 150, // Increased padding to account for buttons at 25% from bottom
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#e3ac34',
    fontWeight: '500',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#e3ac34',
    fontWeight: '500',
  },
  spacer: {
    width: 40,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e3ac34',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#e3ac34',
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 10,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e3ac34',
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  fixedActionButtons: {
    position: 'absolute',
    bottom: '1%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  rankInfoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rankName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rankLocation: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
  selfUnassignContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  selfUnassignButton: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  selfUnassignButtonText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: '500',
  },
  selfUnassignNote: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ManageRankScreen; 