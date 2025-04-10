import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList
} from 'react-native';
import { ManagedRank } from '../../types/admin';
import { getListItemPadding, getScreenDimensions } from '../../utils/platformUtils';

interface ManagedRankListProps {
  visible: boolean;
  onClose: () => void;
  ranks: ManagedRank[];
  onRankPress?: (rankId: number) => void;
}

const ManagedRankList: React.FC<ManagedRankListProps> = ({
  visible,
  onClose,
  ranks,
  onRankPress
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Managed Ranks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {ranks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No ranks found</Text>
            </View>
          ) : (
            <FlatList
              data={ranks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.rankItem}
                  onPress={() => onRankPress && onRankPress(item.id)}
                >
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{item.name}</Text>
                    <Text style={styles.rankCity}>{item.city}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const { width, height, modalWidth } = getScreenDimensions();

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: modalWidth,
    maxHeight: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 10,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...getListItemPadding(),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  rankCity: {
    fontSize: 14,
    color: '#e3ac34',
  },
  chevron: {
    fontSize: 24,
    color: '#e3ac34',
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default ManagedRankList; 