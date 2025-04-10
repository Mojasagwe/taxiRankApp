import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/AdminNavigator';
import { useAuth } from '../../../context/AuthContext';
import FormInput from '../../../components/inputs/FormInput';

type AdminProfileScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminProfile'>;

const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation<AdminProfileScreenNavigationProp>();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form state - Personal Info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  // Form state - Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Admin info
  const [adminId] = useState(user?.id || '');
  const [rankName] = useState('Main Taxi Rank');
  const [adminSince] = useState('Jan 2023');
  const [adminLevel] = useState(user?.role || 'ADMIN');

  // Reviews placeholder data
  const [reviews] = useState([
    { id: '1', rating: 4.5, comment: 'Great administrator, very responsive', author: 'John D.', date: '2023-05-15' },
    { id: '2', rating: 5, comment: 'Excellent management of the rank', author: 'Sarah M.', date: '2023-06-22' },
  ]);

  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Reset form values
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setPhoneNumber(user?.phoneNumber || '');
    setStreetAddress('');
    setCity('');
    setProvince('');
    setPostalCode('');
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Basic validation
      if (!firstName || !lastName || !email || !phoneNumber) {
        Alert.alert('Error', 'All fields are required');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
      
      // Update profile 
      const success = await updateProfile({
        firstName,
        lastName,
        email,
        phoneNumber,
        // We'd typically store address in a separate field or object in the user profile
      });
      
      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <FormInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <FormInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <FormInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <FormInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
          </View>
        );
      
      case 'address':
        return (
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Street Address</Text>
              <FormInput
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="Street Address"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>City</Text>
              <FormInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Province</Text>
              <FormInput
                value={province}
                onChangeText={setProvince}
                placeholder="Province"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Postal Code</Text>
              <FormInput
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Postal Code"
                editable={isEditing}
                style={[styles.input, !isEditing && styles.disabledInput]}
              />
            </View>
          </View>
        );
      
      case 'admin':
        return (
          <View style={styles.formContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admin ID:</Text>
              <Text style={styles.infoValue}>{adminId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rank Name:</Text>
              <Text style={styles.infoValue}>{rankName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admin Since:</Text>
              <Text style={styles.infoValue}>{adminSince}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admin Level:</Text>
              <Text style={styles.infoValue}>{adminLevel}</Text>
            </View>
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.reviewsContainer}>
            {reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewRating}>★ {review.rating}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewAuthor}>- {review.author}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
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
        
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>
              {user?.firstName?.charAt(0) || 'A'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.profileRole}>Rank Administrator</Text>
        </View>
        
        {/* Navigation tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
            onPress={() => setActiveTab('personal')}
          >
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
              Contact
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'address' && styles.activeTab]}
            onPress={() => setActiveTab('address')}
          >
            <Text style={[styles.tabText, activeTab === 'address' && styles.activeTabText]}>
              Address
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
            onPress={() => setActiveTab('admin')}
          >
            <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>
              Admin Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab content */}
        {renderTabContent()}
        
        {/* Action buttons */}
        {isEditing && (activeTab === 'personal' || activeTab === 'address') && (
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 24,
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
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3ac34',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInitial: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileRole: {
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
  formContainer: {
    marginTop: 10,
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
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
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  reviewsContainer: {
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e3ac34',
  },
  reviewDate: {
    fontSize: 14,
    color: '#888',
  },
  reviewComment: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default AdminProfileScreen; 