import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text,
  View
} from 'react-native';
import { styles } from './DashboardCard.styles';

interface DashboardCardProps {
  title: string;
  value?: number | string | ReactNode;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, onPress }) => {
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {value !== undefined && typeof value === 'number' || typeof value === 'string' ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        <View style={styles.value}>
          {value}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
    </CardContainer>
  );
};

export default DashboardCard; 