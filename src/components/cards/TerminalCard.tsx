import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { TaxiTerminal } from '../../types/admin';

interface TerminalCardProps {
  terminal: TaxiTerminal;
  isEditing?: boolean;
  onEdit?: (terminal: TaxiTerminal) => void;
  onDelete?: (terminalId: number) => void;
  onToggleActive?: (terminalId: number, isActive: boolean) => void;
}

const TerminalCard: React.FC<TerminalCardProps> = ({ 
  terminal, 
  isEditing = false,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  // Function to format the operating days
  const formatOperatingDays = (days?: string[]) => {
    if (!days || days.length === 0) return 'No days specified';
    
    // The API may return abbreviated day names (Mon, Sun) instead of full names
    // Check if days are in abbreviated format
    const isAbbreviated = days.some(day => day.length <= 3);
    
    // Create mapping between abbreviated and full day names 
    const dayMappings = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    
    // Standardized days array (convert to full names if needed)
    let standardizedDays = days;
    if (isAbbreviated) {
      standardizedDays = days.map(day => {
        // @ts-ignore: Key access is safe because we're checking for abbreviations
        return dayMappings[day] || day;
      });
    }
    
    // If all days of the week are selected
    if (standardizedDays.length === 7) return 'Every day';
    
    // If Mon-Fri are selected
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const hasAllWeekdays = weekdays.every(day => standardizedDays.includes(day));
    const hasSat = standardizedDays.includes('Saturday');
    const hasSun = standardizedDays.includes('Sunday');
    
    if (hasAllWeekdays && !hasSat && !hasSun) return 'Weekdays only';
    if (hasAllWeekdays && hasSat && hasSun) return 'Every day';
    if (hasAllWeekdays && hasSat) return 'Mon-Sat';
    if (hasAllWeekdays && hasSun) return 'Weekdays & Sunday';
    
    // Just return the original days joined with commas
    return days.join(', ');
  };

  return (
    <View style={styles.terminalCard}>
      <View style={styles.terminalHeader}>
        <Text style={styles.terminalName}>{terminal.name}</Text>
        <Text style={styles.terminalFare}>R{terminal.fare}</Text>
      </View>
      
      <View style={styles.terminalDetails}>
        <Text style={styles.terminalInfo}>Travel Time: {terminal.travelTime}</Text>
        <Text style={styles.terminalInfo}>Distance: {terminal.distance}</Text>
        <Text style={styles.terminalInfo}>
          Operates: {formatOperatingDays(terminal.operatingDays)}
        </Text>
        
        {terminal.operatingDays && terminal.operatingDays.length > 0 && (
          <View style={styles.daysContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              // Check if this day is in the operatingDays array
              // It might be in full form or abbreviated form
              const isActive = terminal.operatingDays?.some(opDay => 
                opDay === day || // If API returned abbreviated (Mon)
                opDay.substring(0, 3) === day || // If stored as full day (Monday)
                (opDay.length > 3 && day === opDay.substring(0, 3)) // Other direction
              );
              
              return (
                <View 
                  key={day} 
                  style={[
                    styles.dayIndicator,
                    isActive ? styles.activeDayIndicator : styles.inactiveDayIndicator
                  ]}
                >
                  <Text 
                    style={[
                      styles.dayIndicatorText,
                      isActive ? styles.activeDayIndicatorText : styles.inactiveDayIndicatorText
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Active Status Toggle */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>
            Status: <Text style={terminal.isActive ? styles.activeStatus : styles.inactiveStatus}>
              {terminal.isActive ? 'Active' : 'Inactive'}
            </Text>
          </Text>
          {isEditing && onToggleActive && (
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Set {terminal.isActive ? 'Inactive' : 'Active'}</Text>
              <Switch
                value={terminal.isActive}
                onValueChange={(value) => onToggleActive(terminal.id, value)}
                trackColor={{ false: '#767577', true: '#111111' }}
                thumbColor={terminal.isActive ? '#f5f5f5' : '#f5f5f5'}
                ios_backgroundColor="#767577"
              />
            </View>
          )}
        </View>
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
  daysContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  activeDayIndicator: {
    backgroundColor: '#e3ac34',
  },
  inactiveDayIndicator: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dayIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeDayIndicatorText: {
    color: '#fff',
  },
  inactiveDayIndicatorText: {
    color: '#aaa',
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
  statusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  activeStatus: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  inactiveStatus: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#555',
  },
});

export default TerminalCard; 