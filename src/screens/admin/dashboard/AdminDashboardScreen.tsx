import React, { useState, useEffect, ReactNode } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/AdminNavigator';
import { HamburgerMenu, Sidebar } from '../../../components/common';
import { ManagedRankList, DashboardRoleCard, AvailableRankList } from '../../../components/cards';
import { adminService } from '../../../services/api/admin';
import { ManagedRank, Rank } from '../../../types/admin';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ 
    managedRanksCount: 0,
    managedRanks: [] as ManagedRank[]
  });

  // Available ranks states
  const [availableRanks, setAvailableRanks] = useState<Rank[]>([]);
  const [availableRanksLoading, setAvailableRanksLoading] = useState(true);
  const [showAvailableRankList, setShowAvailableRankList] = useState(false);

  const [showRankList, setShowRankList] = useState(false);
  
  useEffect(() => {
    fetchDashboardStats();
    fetchAvailableRanks();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getDashboardStats();
      
      if (response.success && response.data) {
        setDashboardStats({
          managedRanksCount: response.data.managedRanksCount,
          managedRanks: response.data.managedRanks || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRanks = async () => {
    try {
      setAvailableRanksLoading(true);
      const response = await adminService.getAvailableRanks();
      
      if (response.success && response.data) {
        setAvailableRanks(response.data);
      } else {
        console.error('Failed to fetch available ranks:', response.error);
      }
    } catch (error) {
      console.error('Error fetching available ranks:', error);
    } finally {
      setAvailableRanksLoading(false);
    }
  };

  const handleMenuPress = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSidebarClose = () => {
    setMenuOpen(false);
  };

  const handleManagedRanksPress = () => {
    setShowRankList(true);
  };

  const handleAvailableRanksPress = () => {
    setShowAvailableRankList(true);
  };

  const handleRankPress = (rankId: number) => {
    // Navigate to ManageRank screen with the selected rank ID
    const selectedRank = dashboardStats.managedRanks.find(rank => rank.id === rankId);
    if (selectedRank) {
      navigation.navigate('ManageRank', { 
        rankId: rankId,
        rankName: selectedRank.name
      });
    }
    setShowRankList(false);
  };

  const handleAvailableRankPress = (rankId: number) => {
    // Find the selected rank
    const selectedRank = availableRanks.find(rank => rank.id === rankId);
    const rankName = selectedRank ? selectedRank.name : "this rank";
    
    Alert.alert(
      "Request Rank Assignment",
      `Would you like to request assignment to ${rankName}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Request", 
          onPress: async () => {
            try {
              // Submit the request using the API with a default reason
              const defaultReason = "I would like to expand my management responsibilities.";
              const response = await adminService.requestRankAssignment({
                rankId: rankId,
                requestReason: defaultReason
              });
              
              if (response.success) {
                Alert.alert(
                  "Request Submitted",
                  `Your assignment request for ${rankName} has been submitted for review.`,
                  [{ text: "OK" }]
                );
              } else {
                // Check for specific error messages
                if (response.error && response.error.includes('Admin not found')) {
                  Alert.alert(
                    "Account Setup Required",
                    "Your admin account requires additional setup. This can happen after self-unassignment from a rank. Please contact system support to reset your admin status.",
                    [
                      { text: "OK" },
                      { 
                        text: "Restart App", 
                        onPress: () => {
                          // Force a refresh by reloading the app
                          Alert.alert(
                            "Restart Required",
                            "Please close and restart the app, then log in again to refresh your credentials.",
                            [{ text: "OK" }]
                          );
                        } 
                      }
                    ]
                  );
                } else {
                  Alert.alert(
                    "Request Failed",
                    response.error || "There was an error submitting your request. Please try again.",
                    [{ text: "OK" }]
                  );
                }
              }
            } catch (error) {
              console.error('Error submitting rank request:', error);
              Alert.alert(
                "Error",
                "There was a problem submitting your request. Please try again later.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
    setShowAvailableRankList(false);
  };

  const renderManagedRanksValue = (): ReactNode => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#e3ac34" />;
    }
    return dashboardStats.managedRanksCount;
  };

  const renderAvailableRanksValue = (): ReactNode => {
    if (availableRanksLoading) {
      return <ActivityIndicator size="small" color="#e3ac34" />;
    }
    return availableRanks.length;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Hamburger Menu */}
      <HamburgerMenu onPress={handleMenuPress} />
      
      {/* Sidebar */}
      <Sidebar isVisible={menuOpen} onClose={handleSidebarClose} />
      
      {/* Managed Ranks List Modal */}
      <ManagedRankList
        visible={showRankList}
        onClose={() => setShowRankList(false)}
        ranks={dashboardStats.managedRanks}
        onRankPress={handleRankPress}
      />

      {/* Available Ranks List Modal */}
      <AvailableRankList
        visible={showAvailableRankList}
        onClose={() => setShowAvailableRankList(false)}
        ranks={availableRanks}
        onRankPress={handleAvailableRankPress}
        isLoading={availableRanksLoading}
      />
      
      <View style={styles.header}>
        {/* You can add header content here if needed */}
      </View>

      <View style={styles.cardsContainer}>
        <DashboardRoleCard 
          title="Managed Ranks" 
          description="Number of taxi ranks you manage"
          value={renderManagedRanksValue()}
          onPress={!isLoading ? handleManagedRanksPress : undefined}
        />
        
        <DashboardRoleCard 
          title="Available Ranks" 
          description="Unassigned ranks you can request"
          value={renderAvailableRanksValue()}
          onPress={!availableRanksLoading ? handleAvailableRanksPress : undefined}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
    width: '100%',
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginTop: 20,
  },
});

export default AdminDashboardScreen; 