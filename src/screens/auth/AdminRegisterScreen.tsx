import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { adminService } from '../../services/api/admin';
import { Rank } from '../../types/admin';
import { styles } from '../../styles/adminRegisterScreen.styles';
import FormInput from '../../components/inputs/FormInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import LinkButton from '../../components/buttons/LinkButton';

type AdminRegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'AdminRegister'>;

// Additional styles for dropdown elements
const dropdownStyles = StyleSheet.create({
  badgeText: {
    color: "#333"
  },
  arrowDown: {
    color: '#999',
    fontSize: 18
  },
  arrowDownActive: {
    color: '#e3ac34',
    fontSize: 18
  },
  arrowUp: {
    color: '#e3ac34',
    fontSize: 18
  },
  searchContainer: {
    borderBottomColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  searchInput: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#f9f9f9'
  },
  searchInputFocused: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#f9f9f9'
  },
  listItemLabel: {
    color: '#333'
  },
  selectedItemLabel: {
    fontWeight: 'bold', 
    color: '#333'
  },
  selectedItemContainer: {
    backgroundColor: '#fff8e6'
  },
  activeBorder: {
    borderColor: '#e3ac34',
    borderWidth: 1.2
  }
});

const AdminRegisterScreen: React.FC = () => {
  const navigation = useNavigation<AdminRegisterScreenNavigationProp>();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Focus state for search
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Ranks selection
  const [availableRanks, setAvailableRanks] = useState<Rank[]>([]);
  const [selectedRankCodes, setSelectedRankCodes] = useState<string[]>([]);
  
  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<{label: string, value: string}[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [ranksLoading, setRanksLoading] = useState(true);

  // Fetch available ranks when component mounts
  useEffect(() => {
    fetchAvailableRanks();
  }, []);

  const fetchAvailableRanks = async () => {
    try {
      setRanksLoading(true);
      const response = await adminService.getAvailableRanks();
      
      if (response.success && response.data) {
        setAvailableRanks(response.data);
        // Transform ranks into dropdown items
        const items = response.data.map(rank => ({
          label: rank.name,
          value: rank.code
        }));
        setDropdownItems(items);
      } else {
        Alert.alert('Error', response.error || 'Failed to load available ranks');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load available ranks');
    } finally {
      setRanksLoading(false);
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    // Password matching
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Rank selection validation
    if (selectedRankCodes.length === 0 && availableRanks.length > 0) {
      Alert.alert('Error', 'Please select at least one taxi rank');
      return false;
    }

    // Verify all selected rank codes exist in available ranks
    const availableRankCodes = availableRanks.map(rank => rank.code);
    const invalidCodes = selectedRankCodes.filter(code => !availableRankCodes.includes(code));
    
    if (invalidCodes.length > 0) {
      Alert.alert('Error', `Invalid rank codes selected: ${invalidCodes.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const response = await adminService.submitRegistrationRequest({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        preferredPaymentMethod: 'CASH',
        selectedRankCodes: selectedRankCodes,
        justification: 'N/A', // Provide a default value
        designation: 'Rank Administrator', // Provide a default value
        professionalExperience: 'N/A' // Provide a default value
      });

      if (response.success) {
        Alert.alert(
          'Registration Submitted',
          'Your admin registration request has been submitted for review. You will be notified when it has been processed.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error: any) {
      // Don't show error popup for AsyncStorage errors
      if (!error.message?.includes('AsyncStorage') && !error.message?.includes('non-critical')) {
        Alert.alert('Error', error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle backdrop press to close dropdown
  const handleBackdropPress = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Admin Account</Text>
        <Text style={styles.subtitle}>Sign up as a Taxi Rank Administrator</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Backdrop overlay when dropdown is open */}
        {dropdownOpen && (
          <Pressable 
            style={styles.dropdownBackdrop}
            onPress={handleBackdropPress}
          />
        )}
        
        <View style={styles.form}>
          <View style={[styles.inputGroup, { opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              autoCapitalize="words"
              editable={!dropdownOpen}
            />
          </View>

          <View style={[styles.inputGroup, { opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              autoCapitalize="words"
              editable={!dropdownOpen}
            />
          </View>

          <View style={[styles.inputGroup, { opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!dropdownOpen}
            />
          </View>

          <View style={[styles.inputGroup, { opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              editable={!dropdownOpen}
            />
          </View>

          <View style={[
            styles.inputGroup, 
            styles.ranksSection, 
            { 
              zIndex: Platform.OS === 'ios' ? 9999 : undefined, 
              elevation: Platform.OS === 'android' ? 999 : undefined,
              marginTop: 20,
              marginBottom: 15,
              opacity: 1 // Always maintain full opacity for dropdown
            }
          ]}>
            {ranksLoading ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : availableRanks.length === 0 ? (
              <View style={styles.noRanksContainer}>
                <Text style={styles.noRanksText}>No available ranks found</Text>
                <Text style={styles.noRanksSubText}>
                  This could be because all ranks already have admins assigned.
                  Please contact system support if you believe this is an error.
                </Text>
              </View>
            ) : (
              <>
                <View style={[
                  styles.dropdownContainer, 
                  dropdownOpen && styles.dropdownContainerOpen,
                  { position: 'relative' }  // Ensure the dropdown container has position relative
                ]}>
                  <DropDownPicker
                    open={dropdownOpen}
                    value={selectedRankCodes}
                    items={dropdownItems}
                    setOpen={setDropdownOpen}
                    setValue={setSelectedRankCodes}
                    setItems={setDropdownItems}
                    multiple={true}
                    mode="BADGE"
                    badgeDotColors={["#e3ac34"]}
                    badgeColors={["#fff8e6"]}
                    badgeTextStyle={dropdownStyles.badgeText}
                    placeholder="Select taxi ranks"
                    style={[
                      styles.dropdown,
                      !dropdownOpen && styles.dropdownShadow,
                      dropdownOpen && dropdownStyles.activeBorder,
                    ]}
                    zIndex={Platform.OS === 'ios' ? 9999 : undefined}
                    zIndexInverse={Platform.OS === 'ios' ? 1000 : undefined}
                    containerStyle={{ 
                      marginTop: 0,
                      position: 'relative' 
                    }}
                    dropDownContainerStyle={[
                      styles.dropdownList, 
                      { 
                        marginTop: 0,
                        borderColor: '#e3ac34',
                        maxHeight: 150,
                        position: 'absolute',  // Position the dropdown absolutely
                        top: '100%',           // Position it right below the trigger
                        left: 0,
                        right: 0
                      }
                    ]}
                    listItemLabelStyle={dropdownStyles.listItemLabel}
                    selectedItemLabelStyle={dropdownStyles.selectedItemLabel}
                    selectedItemContainerStyle={dropdownStyles.selectedItemContainer}
                    ArrowDownIconComponent={() => (
                      <Text style={dropdownOpen ? dropdownStyles.arrowDownActive : dropdownStyles.arrowDown}>▼</Text>
                    )}
                    ArrowUpIconComponent={() => (
                      <Text style={dropdownStyles.arrowUp}>▲</Text>
                    )}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    searchable={true}
                    searchPlaceholder="Search for a rank..."
                    searchContainerStyle={dropdownStyles.searchContainer}
                    searchTextInputStyle={searchFocused ? dropdownStyles.searchInputFocused : dropdownStyles.searchInput}
                    searchTextInputProps={{
                      onFocus: () => setSearchFocused(true),
                      onBlur: () => setSearchFocused(false)
                    }}
                    min={1}
                    max={10}
                  />
                </View>
                <Text style={styles.helperText}>Select the taxi ranks you wish to manage</Text>
              </>
            )}
          </View>

          <View style={[styles.inputGroup, { zIndex: 1, opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!dropdownOpen}
            />
          </View>

          <View style={[styles.inputGroup, { zIndex: 1, opacity: dropdownOpen ? 0.835 : 1 }]}>
            <FormInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!dropdownOpen}
            />
          </View>

          <View style={{ opacity: dropdownOpen ? 0.835 : 1 }}>
            <PrimaryButton
              title="Submit Registration"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={dropdownOpen}
            />

            <LinkButton
              title="Already have an account? Sign in"
              onPress={() => navigation.navigate('Login')}
              disabled={dropdownOpen}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminRegisterScreen; 