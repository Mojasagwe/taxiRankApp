import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaxiTerminal } from '../../types/admin';

interface TerminalCardProps {
  terminal: TaxiTerminal;
  isEditing?: boolean;
  onEdit?: (terminal: TaxiTerminal) => void;
  onDelete?: (terminalId: number) => void;
}

const TerminalCard: React.FC<TerminalCardProps> = ({ 
  terminal, 
  isEditing = false,
  onEdit,
  onDelete
}) => {
  return (
    <View style={styles.terminalCard}>
      <View style={styles.terminalHeader}>
        <Text style={styles.terminalName}>{terminal.name}</Text>
        <Text style={styles.terminalFare}>R{terminal.fare}</Text>
      </View>
      
      <View style={styles.terminalDetails}>
        <Text style={styles.terminalInfo}>Travel Time: {terminal.travelTime}</Text>
        <Text style={styles.terminalInfo}>Distance: {terminal.distance}</Text>
        {terminal.departureSchedule && (
          <Text style={styles.terminalInfo}>
            Schedule: {terminal.departureSchedule}
          </Text>
        )}
      </View>
      
      {isEditing && (
        <View style={styles.terminalActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit && onEdit(terminal)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete && onDelete(terminal.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  terminalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  terminalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  terminalFare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e3ac34',
  },
  terminalDetails: {
    marginBottom: 10,
  },
  terminalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  terminalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    paddingVertical: 5,
  },
  editButtonText: {
    fontSize: 14,
    color: '#e3ac34',
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: 14,
    color: 'red',
  },
});

export default TerminalCard; 