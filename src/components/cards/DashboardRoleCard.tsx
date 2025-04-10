import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Dimensions
} from 'react-native';

interface DashboardRoleCardProps {
  title: string;
  value?: number | string | ReactNode;
  description?: string;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
// Reduce card width by 50% from previous size
const cardWidth = width * 0.425;

const DashboardRoleCard: React.FC<DashboardRoleCardProps> = ({ 
  title, 
  value,
  description, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer} />
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {value !== undefined && typeof value === 'number' || typeof value === 'string' ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        value && <View style={styles.valueContainer}>{value}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15, // Slightly reduce padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.135,
    shadowRadius: 8,
    elevation: 6,
    margin: 10,
  },
  iconContainer: {
    width: 60, // Reduce icon container size
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff8e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3b040',
    // Empty by design
  },
  title: {
    fontSize: 16, // Reduce font size
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 12, // Reduce font size
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 24, // Reduce font size
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
});

export default DashboardRoleCard; 