import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import FormInput from '../inputs/FormInput';
import { TaxiTerminal } from '../../types/admin';

interface TerminalEditorModalProps {
  visible: boolean;
  onClose: () => void;
  terminal: TaxiTerminal | null;
  onSave: (terminal: TaxiTerminal) => void;
}

const TerminalEditorModal: React.FC<TerminalEditorModalProps> = ({
  visible,
  onClose,
  terminal,
  onSave: _onSave
}) => {
  const [name, setName] = useState('');
  const [fare, setFare] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [distance, setDistance] = useState('');
  const [departureSchedule, setDepartureSchedule] = useState('');

  useEffect(() => {
    if (terminal) {
      setName(terminal.name);
      setFare(terminal.fare.toString());
      setTravelTime(terminal.travelTime);
      setDistance(terminal.distance);
      setDepartureSchedule(terminal.departureSchedule || '');
    } else {
      resetForm();
    }
  }, [terminal, visible]);

  const resetForm = () => {
    setName('');
    setFare('');
    setTravelTime('');
    setDistance('');
    setDepartureSchedule('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {terminal?.id ? 'Edit Terminal' : 'Add New Terminal'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Terminal Name*</Text>
              <FormInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Pretoria"
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fare (R)*</Text>
              <FormInput
                value={fare}
                onChangeText={setFare}
                placeholder="e.g. 150"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Travel Time*</Text>
              <FormInput
                value={travelTime}
                onChangeText={setTravelTime}
                placeholder="e.g. 1 hour 30 minutes"
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Distance*</Text>
              <FormInput
                value={distance}
                onChangeText={setDistance}
                placeholder="e.g. 58km"
                style={styles.input}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Departure Schedule</Text>
              <FormInput
                value={departureSchedule}
                onChangeText={setDepartureSchedule}
                placeholder="e.g. Every 30 minutes from 6AM-7PM"
                style={styles.input}
              />
              <Text style={styles.helperText}>
                When taxis typically depart to this destination
              </Text>
            </View>
          </View>
          
          <View style={styles.bottomPadding} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '90%',
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
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  bottomPadding: {
    height: 20,
  },
});

export default TerminalEditorModal; 