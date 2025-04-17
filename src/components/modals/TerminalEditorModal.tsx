import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import FormInput from '../inputs/FormInput';
import { TaxiTerminal } from '../../types/admin';

interface TerminalEditorModalProps {
  visible: boolean;
  onClose: () => void;
  terminal: TaxiTerminal | null;
  onSave: (terminal: TaxiTerminal) => void;
}

// Mapping between abbreviated and full day names
const DAY_MAPPINGS = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday'
};

// Full day names for the UI
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  
  // Time pickers state
  const [showTravelTimePicker, setShowTravelTimePicker] = useState(false);
  const [travelTimeDate, setTravelTimeDate] = useState(new Date());

  useEffect(() => {
    if (terminal) {
      setName(terminal.name);
      setFare(terminal.fare.toString());
      setTravelTime(terminal.travelTime);
      setDistance(terminal.distance.replace(/[^0-9.]/g, ''));
      
      // Convert abbreviated days to full days if needed
      if (terminal.operatingDays && terminal.operatingDays.length > 0) {
        const normalizedDays = terminal.operatingDays.map(day => {
          // If it's already a full day name, return it
          if (day.length > 3) return day;
          
          // Otherwise, convert abbreviated to full (Mon -> Monday)
          // @ts-ignore: Type safety handled by checking length
          return DAY_MAPPINGS[day] || day;
        });
        setOperatingDays(normalizedDays);
      } else {
        setOperatingDays([]);
      }
    } else {
      resetForm();
    }
  }, [terminal, visible]);

  const resetForm = () => {
    setName('');
    setFare('');
    setTravelTime('');
    setDistance('');
    setOperatingDays([]);
    setTravelTimeDate(new Date());
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleDistanceChange = (text: string) => {
    // Only allow numbers and decimal points
    const numericValue = text.replace(/[^0-9.]/g, '');
    setDistance(numericValue);
  };

  const handleDayToggle = (day: string) => {
    if (operatingDays.includes(day)) {
      // Remove day if already selected
      setOperatingDays(operatingDays.filter(d => d !== day));
    } else {
      // Add day if not already selected
      setOperatingDays([...operatingDays, day]);
    }
  };

  const handleSave = () => {
    // Validate input
    if (!name.trim()) {
      Alert.alert('Error', 'Terminal name is required');
      return;
    }
    
    if (!fare.trim() || isNaN(Number(fare))) {
      Alert.alert('Error', 'Please enter a valid fare amount');
      return;
    }
    
    if (!travelTime.trim()) {
      Alert.alert('Error', 'Travel time is required');
      return;
    }
    
    if (!distance.trim() || isNaN(Number(distance))) {
      Alert.alert('Error', 'Please enter a valid distance');
      return;
    }
    
    if (operatingDays.length === 0) {
      Alert.alert('Error', 'Please select at least one operating day');
      return;
    }
    
    // Current timestamp for createdAt/updatedAt
    const timestamp = new Date().toISOString();
    
    // Convert operating days to abbreviated format for API
    const abbreviatedDays = operatingDays.map(day => day.substring(0, 3));
    
    if (terminal) {
      // Update existing terminal
      const updatedTerminal: TaxiTerminal = {
        ...terminal,
        name,
        fare: Number(fare),
        travelTime,
        distance: `${distance}km`,
        operatingDays: abbreviatedDays,
        updatedAt: timestamp
      };
      
      _onSave(updatedTerminal);
    } else {
      // Create new terminal
      const newTerminal: TaxiTerminal = {
        id: Math.floor(Math.random() * 1000000), // Temporary ID that will be replaced by the server
        name,
        fare: Number(fare),
        travelTime,
        distance: `${distance}km`,
        operatingDays: abbreviatedDays,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      _onSave(newTerminal);
    }
    
    // Close modal and reset form
    resetForm();
    onClose();
  };

  const formatDuration = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const handleTravelTimeConfirm = (date: Date) => {
    setTravelTimeDate(date);
    setTravelTime(formatDuration(date));
    setShowTravelTimePicker(false);
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
          
          <ScrollView style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Terminal Name*</Text>
              <FormInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Pretoria"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fare (R)*</Text>
              <FormInput
                value={fare}
                onChangeText={setFare}
                placeholder="e.g. 150"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Travel Time*</Text>
              <TouchableOpacity 
                onPress={() => setShowTravelTimePicker(true)}
                activeOpacity={0.7}
              >
                <FormInput
                  value={travelTime}
                  onChangeText={(text) => setTravelTime(text)}
                  placeholder="e.g. 1 hour 30 minutes"
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              <DatePicker
                modal
                open={showTravelTimePicker}
                date={travelTimeDate}
                mode="time"
                title="Select Travel Time"
                onConfirm={handleTravelTimeConfirm}
                onCancel={() => setShowTravelTimePicker(false)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Distance (km)*</Text>
              <FormInput
                value={distance}
                onChangeText={handleDistanceChange}
                placeholder="e.g. 58"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Operating Days*</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      operatingDays.includes(day) && styles.selectedDayButton
                    ]}
                    onPress={() => handleDayToggle(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        operatingDays.includes(day) && styles.selectedDayButtonText
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>
                Select days when taxis operate on this route
              </Text>
            </View>
            
            {/* Add bottom padding to ensure content doesn't get hidden behind fixed buttons */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
          
          {/* Fixed action buttons */}
          <View style={styles.fixedButtonContainer}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    position: 'relative', // Needed for absolute positioning of buttons
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
    paddingBottom: 0, // Remove bottom padding as we'll add it with the spacer
  },
  formGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  timeInput: {
    backgroundColor: '#f5f5f5',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    justifyContent: 'flex-start',
  },
  dayButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDayButton: {
    backgroundColor: '#e3ac34',
    borderColor: '#e3ac34',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  fixedButtonContainer: {
    width: '100%',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e3ac34',
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 80, // Provide space for the fixed buttons
  },
});

export default TerminalEditorModal; 