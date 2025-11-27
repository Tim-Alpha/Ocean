import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MiniAppStatus } from '../hooks/useMiniApps';

interface StatusFilterProps {
  selectedStatus: MiniAppStatus;
  onStatusChange: (status: MiniAppStatus) => void;
}

const STATUS_OPTIONS: { value: MiniAppStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: '#FFA500' },
  { value: 'APPROVED', label: 'Approved', color: '#4CAF50' },
  { value: 'REJECTED', label: 'Rejected', color: '#F44336' },
  { value: 'LIVE', label: 'Live', color: '#2196F3' },
  { value: 'REQUESTED_FOR_LIVE', label: 'Requested', color: '#9C27B0' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STATUS_OPTIONS.map((option) => {
          const isSelected = selectedStatus === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                isSelected && { backgroundColor: option.color },
              ]}
              onPress={() => onStatusChange(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                isSelected && styles.selectedText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
