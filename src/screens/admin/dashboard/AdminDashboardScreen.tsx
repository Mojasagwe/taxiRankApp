import React, { useState, useEffect, ReactNode } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/AdminNavigator';
import { HamburgerMenu, Sidebar } from '../../../components/common';
import { ManagedRankList, DashboardRoleCard } from '../../../components/cards';
import { adminService } from '../../../services/api/admin';
import { ManagedRank } from '../../../types/admin';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ 
    managedRanksCount: 0,
    managedRanks: [] as ManagedRank[]
  });
  const [showRankList, setShowRankList] = useState(false);
  
  useEffect(() => {
    fetchDashboardStats();
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

  const handleMenuPress = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSidebarClose = () => {
    setMenuOpen(false);
  };

  const handleManagedRanksPress = () => {
    setShowRankList(true);
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

  const renderManagedRanksValue = (): ReactNode => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#e3ac34" />;
    }
    return dashboardStats.managedRanksCount;
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
        
        {/* You can add more cards here in the future */}
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
    justifyContent: 'flex-start',
    paddingLeft: 20,
    marginTop: 20,
  },
});

export default AdminDashboardScreen; 