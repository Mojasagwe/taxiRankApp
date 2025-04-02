import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { styles } from './Sidebar.styles';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const { user, logout } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  
  // Use useMemo to avoid recreating the Animated.Value on every render
  const sidebarPosition = useMemo(
    () => new Animated.Value(isVisible ? 0 : -screenWidth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    Animated.timing(sidebarPosition, {
      toValue: isVisible ? 0 : -screenWidth,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [isVisible, screenWidth, sidebarPosition]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfilePress = () => {
    // To be implemented
    console.log('Navigate to admin profile');
    onClose();
  };

  const handleMenuItemPress = (screen: string) => {
    console.log(`Navigate to ${screen}`);
    onClose();
    // Will be implemented for each screen
  };

  const handleInviteTaxiRank = () => {
    console.log('Navigate to invite taxi rank');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.overlayBackground}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarPosition }] }
        ]}
      >
        <View style={styles.sidebarContent}>
          <View>
            {/* Profile Section */}
            <TouchableOpacity 
              style={styles.profileSection}
              onPress={handleProfilePress}
            >
              <View style={styles.profileImageContainer}>
                {/* Default profile icon */}
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {user?.firstName?.charAt(0) || 'A'}
                  </Text>
                </View>
              </View>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileRole}>Admin</Text>
            </TouchableOpacity>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Help')}
              >
                <Text style={styles.menuItemText}>Help & Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Reports')}
              >
                <Text style={styles.menuItemText}>Reports & Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Settings')}
              >
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bottom Menu Items */}
          <View style={styles.bottomMenuItems}>
            <TouchableOpacity 
              style={styles.inviteItem}
              onPress={handleInviteTaxiRank}
            >
              <Text style={styles.inviteText}>Invite a Taxi Rank</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.logoutItem}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default Sidebar; 