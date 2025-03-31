import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Image,
  ImageSourcePropType,
  Dimensions
} from 'react-native';

interface RoleCardProps {
  title: string;
  description: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.4;

const RoleCard: React.FC<RoleCardProps> = ({ 
  title, 
  description, 
  icon,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Image
          source={icon}
          style={styles.icon}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.135,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff8e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e3b040',
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RoleCard; 