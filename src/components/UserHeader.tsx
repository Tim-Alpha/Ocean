import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { UserProfile } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { HostUserDataModal } from './HostUserDataModal';

interface UserHeaderProps {
  profile: UserProfile;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ profile }) => {
  const { logout } = useAuth();
  const [showDataModal, setShowDataModal] = useState(false);
  
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || profile.username;

  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || profile.username?.[0]?.toUpperCase() || '?';

  return (
    <View style={styles.container}>
      {profile.profile_image_url ? (
        <Image
          source={{ uri: profile.profile_image_url }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>{initials}</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.fullName}>{fullName}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {profile.email || profile.username}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => setShowDataModal(true)}
          style={styles.infoButton}
        >
          <Text style={styles.infoText}>ℹ️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <HostUserDataModal
        visible={showDataModal}
        onClose={() => setShowDataModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef2',
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  details: {
    marginLeft: 16,
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});






