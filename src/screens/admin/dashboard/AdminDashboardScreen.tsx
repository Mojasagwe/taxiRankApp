import React, { useState, useEffect, ReactNode } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { HamburgerMenu, Sidebar } from '../../../components/common';
import { DashboardCard, ManagedRankList } from '../../../components/cards';
import { styles } from './AdminDashboardScreen.styles';
import { adminService } from '../../../services/api/admin';
import { ManagedRank } from '../../../types/admin';

const AdminDashboardScreen: React.FC = () => {
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
    // To be implemented: navigate to rank dashboard in the future
    console.log(`Selected rank ID: ${rankId}`);
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
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.cardsContainer}>
          <DashboardCard 
            title="Managed Ranks" 
            value={renderManagedRanksValue()}
            onPress={!isLoading ? handleManagedRanksPress : undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen; 