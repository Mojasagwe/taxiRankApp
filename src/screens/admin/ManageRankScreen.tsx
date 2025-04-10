import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
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
// Import will be used when API integration is implemented
// import { adminService } from '../../services/api/admin';

type ManageRankScreenRouteProp = RouteProp<AdminStackParamList, 'ManageRank'>;
type ManageRankScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const ManageRankScreen: React.FC = () => {
  const route = useRoute<ManageRankScreenRouteProp>();
  const navigation = useNavigation<ManageRankScreenNavigationProp>();
  const { rankId, rankName } = route.params;

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
    try {
      setIsLoading(true);
      // This would be an API call in a real app
      // For now, we'll mock the data
      const mockRankDetails: RankDetails = {
        id: rankId,
        name: rankName,
        code: `RANK-${rankId}`,
        description: "Main taxi rank serving the Johannesburg area.",
        address: "123 Main Road",
        city: "Johannesburg",
        province: "Gauteng",
        latitude: -26.2041,
        longitude: 28.0473,
        contactPhone: "+27 11 123 4567",
        contactEmail: "info@joburgtaxirank.co.za",
        operatingHours: "6AM - 7PM",
        openTime: "06:00",
        closeTime: "19:00",
        capacity: 120,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        terminals: [
          {
            id: 1,
            name: "Pretoria",
            fare: 150,
            travelTime: "1 hour 30 minutes",
            distance: "58km",
            departureSchedule: "Every 30 minutes from 6AM-7PM",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: "Bloemfontein",
            fare: 450,
            travelTime: "4 hours",
            distance: "398km",
            departureSchedule: "Twice daily at 7AM and 12PM",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        rankAdmins: [],
        imageUrl: "https://via.placeholder.com/300"
      };

      // In a real app, this would come from an API
      // const response = await adminService.getRankDetails(rankId);
      // const rankDetails = response.data;
      
      setRankDetails(mockRankDetails);
      
      // Set the form state
      setName(mockRankDetails.name);
      setDescription(mockRankDetails.description);
      setAddress(mockRankDetails.address);
      setCity(mockRankDetails.city);
      setProvince(mockRankDetails.province);
      setLatitude(mockRankDetails.latitude.toString());
      setLongitude(mockRankDetails.longitude.toString());
      setContactPhone(mockRankDetails.contactPhone);
      setContactEmail(mockRankDetails.contactEmail);
      setOpenTime(mockRankDetails.openTime);
      setCloseTime(mockRankDetails.closeTime);
      setTerminals(mockRankDetails.terminals);
    } catch (error) {
      console.error('Failed to fetch rank details:', error);
      Alert.alert('Error', 'Failed to fetch rank details');
    } finally {
      setIsLoading(false);
    }
  }, [rankId, rankName]);

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
        terminals
      };
      
      // This would be an API call in a real app
      // await adminService.updateRankDetails(rankId, updatedRankDetails);
      
      // Update the state
      setRankDetails(updatedRankDetails);
      
      Alert.alert('Success', 'Rank details updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update rank details:', error);
      Alert.alert('Error', 'Failed to update rank details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTerminal = () => {
    setSelectedTerminal({
      id: Date.now(), // Temporary ID
      name: '',
      fare: 0,
      travelTime: '',
      distance: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowTerminalModal(true);
  };

  const handleEditTerminal = (terminal: TaxiTerminal) => {
    setSelectedTerminal(terminal);
    setShowTerminalModal(true);
  };

  const handleDeleteTerminal = (terminalId: number) => {
    Alert.alert(
      'Delete Terminal',
      'Are you sure you want to delete this terminal?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedTerminals = terminals.filter(t => t.id !== terminalId);
            setTerminals(updatedTerminals);
            if (rankDetails) {
              setRankDetails({
                ...rankDetails,
                terminals: updatedTerminals
              });
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleTerminalSave = (terminal: TaxiTerminal) => {
    const exists = terminals.some(t => t.id === terminal.id);
    let updatedTerminals;
    
    if (exists) {
      updatedTerminals = terminals.map(t => 
        t.id === terminal.id ? terminal : t
      );
    } else {
      updatedTerminals = [...terminals, terminal];
    }
    
    setTerminals(updatedTerminals);
    if (rankDetails) {
      setRankDetails({
        ...rankDetails,
        terminals: updatedTerminals
      });
    }
    setShowTerminalModal(false);
    setSelectedTerminal(null);
    
    // Auto-save changes if in edit mode
    if (isEditing) {
      handleSave();
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
      </View>
    );
  };

  const renderContactTab = () => {
    return (
      <View style={styles.tabContent}>
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
              />
            ))}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'contact':
        return renderContactTab();
      case 'terminals':
        return renderTerminalsTab();
      default:
        return null;
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
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map placeholder as full-width element */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Map integration will be implemented here
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.rankImageSection}>
            {rankDetails?.imageUrl ? (
              <Image 
                source={{ uri: rankDetails.imageUrl }} 
                style={styles.rankImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.rankImagePlaceholder}>
                <Text style={styles.rankImagePlaceholderText}>
                  {rankDetails?.name?.charAt(0) || 'R'}
                </Text>
              </View>
            )}
            <Text style={styles.rankName}>{rankDetails?.name}</Text>
            <Text style={styles.rankLocation}>{rankDetails?.city}, {rankDetails?.province}</Text>
          </View>
          
          {/* Navigation tabs */}
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
              style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
              onPress={() => setActiveTab('contact')}
            >
              <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                Contact
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
          
          {/* Action buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
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
        </View>
      </ScrollView>
      
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
    marginBottom: -58,
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
  rankImageSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -40,
  },
  rankImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },
  rankImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#e3ac34',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankImagePlaceholderText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
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
});

export default ManageRankScreen; 