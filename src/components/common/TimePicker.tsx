import React, { useState } from 'react';
import { StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { View, Text } from '@/components';
import { useTheme } from '@/contexts';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Saat seçin',
  disabled = false 
}) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempHour, setTempHour] = useState(9);
  const [tempMinute, setTempMinute] = useState(0);

  const formatTime = (timeString: string) => {
    if (!timeString) return placeholder;
    const [hours, minutes] = timeString.split(':');
    return `${hours?.padStart(2, '0') || '00'}:${minutes?.padStart(2, '0') || '00'}`;
  };

  const getTimeFromString = (timeString: string) => {
    if (!timeString) return { hour: 9, minute: 0 };
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hour: hours || 9, minute: minutes || 0 };
  };

  const openTimePicker = () => {
    const { hour, minute } = getTimeFromString(value);
    setTempHour(hour);
    setTempMinute(minute);
    setShowPicker(true);
  };

  const handleSave = () => {
    const hours = tempHour.toString().padStart(2, '0');
    const minutes = tempMinute.toString().padStart(2, '0');
    onChange(`${hours}:${minutes}`);
    setShowPicker(false);
  };

  const handleCancel = () => {
    const { hour, minute } = getTimeFromString(value);
    setTempHour(hour);
    setTempMinute(minute);
    setShowPicker(false);
  };

  return (
    <View variant="transparent">
      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            borderColor: colors.border,
            backgroundColor: disabled ? colors.background : colors.card,
          },
        ]}
        onPress={() => !disabled && openTimePicker()}
        disabled={disabled}
      >
        <Text 
          variant={value ? 'primary' : 'secondary'} 
          size="medium"
          style={{ color: disabled ? colors.textSecondary : undefined }}
        >
          {formatTime(value)}
        </Text>
        <Text variant="secondary" size="medium">🕐</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: colors.card,
              shadowColor: colors.text,
            }
          ]}>
            <Text variant="primary" size="large" weight="bold" style={styles.modalTitle}>
              Saat Seçin
            </Text>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <View style={styles.timePickerHeader}>
                  <Text variant="secondary" size="medium" weight="medium" style={styles.timePickerLabel}>
                    Saat
                  </Text>
                </View>
                <ScrollView 
                  style={styles.timePickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 80 }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timePickerItem,
                        tempHour === i && { backgroundColor: colors.primary + '20' }
                      ]}
                      onPress={() => setTempHour(i)}
                    >
                      <Text 
                        variant={tempHour === i ? 'primary' : 'secondary'} 
                        size="large" 
                        weight={tempHour === i ? 'bold' : 'medium'}
                        style={[
                          styles.timePickerText,
                          ...(tempHour === i ? [{ color: colors.primary }] : [])
                        ] as any}
                      >
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.timePickerColumn}>
                <View style={styles.timePickerHeader}>
                  <Text variant="secondary" size="medium" weight="medium" style={styles.timePickerLabel}>
                    Dakika
                  </Text>
                </View>
                <ScrollView 
                  style={styles.timePickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 80 }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timePickerItem,
                        tempMinute === i && { backgroundColor: colors.primary + '20' }
                      ]}
                      onPress={() => setTempMinute(i)}
                    >
                      <Text 
                        variant={tempMinute === i ? 'primary' : 'secondary'} 
                        size="large" 
                        weight={tempMinute === i ? 'bold' : 'medium'}
                        style={[
                          styles.timePickerText,
                          ...(tempMinute === i ? [{ color: colors.primary }] : [])
                        ] as any}
                      >
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text variant="secondary" size="medium" weight="semibold" style={styles.modalButtonText}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text variant="primary" size="medium" weight="semibold" style={[styles.modalButtonText, { color: 'white' }] as any}>
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timePickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timePickerHeader: {
    marginBottom: 10,
  },
  timePickerLabel: {
    textAlign: 'center',
  },
  timePickerScroll: {
    height: 200,
    width: '100%',
  },
  timePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  timePickerText: {
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    textAlign: 'center',
  },
});

export default TimePicker;