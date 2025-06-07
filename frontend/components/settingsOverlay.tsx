// components/settingsOverlay.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useClerk  } from '@clerk/clerk-expo';


const { width } = Dimensions.get('window');
const OVERLAY_WIDTH = width * 0.7;

interface SettingsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const { signOut } = useClerk();

  const translateX = useSharedValue(isVisible ? 0 : -OVERLAY_WIDTH);

  React.useEffect(() => {
    translateX.value = withSpring(isVisible ? 0 : -OVERLAY_WIDTH, { damping: 15 });
  }, [isVisible, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logged out');
      router.replace('/(auth)/signin');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'person-outline', label: 'Profile', onPress: () => { router.push('/(tabs)/profile'); onClose(); } },
    { icon: 'lock-closed-outline', label: 'Password', onPress: () => { router.push('/home'); onClose(); } },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => { router.push('/home'); onClose(); } },
    { icon: 'heart-outline', label: 'Favorites', onPress: () => { router.push('/home'); onClose(); } },
    { icon: 'star-outline', label: 'Purchases', onPress: () => { router.push('/purch/purchase_list'); onClose(); } },
    { icon: 'help-circle-outline', label: 'Help', onPress: () => { router.push('/home'); onClose(); } },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlayBackground} onPress={onClose} activeOpacity={1}>
        <Animated.View style={[styles.overlay, animatedStyle]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {menuItems.slice(0, 4).map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={20} color="#333" />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={24} color="#333" style={styles.arrow} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More</Text>
            {menuItems.slice(4).map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={20} color="#333" />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={24} color="#333" style={styles.arrow} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>

        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlay: {
    width: OVERLAY_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  section: {
    marginTop: 70,
    marginHorizontal: 5,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  arrow: {
    marginLeft: 10,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

export default SettingsOverlay;