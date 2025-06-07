import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeIcon, ChatIcon, AddIcon, ProfileIcon } from '@/assets/icons/icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONCOLOR } from '@/assets/constants/theme';
import SettingsOverlay from '@/components/settingsOverlay';
import { useOverlay, OverlayProvider } from '@/contexts/overlayContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TabBarWithOverlay = () => {
  const { isOverlayVisible, setOverlayVisible, overlayType } = useOverlay();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({ }) => ({
          tabBarActiveTintColor: ICONCOLOR.active,
          tabBarInactiveTintColor: ICONCOLOR.inactive,
          tabBarStyle: {
            position: 'absolute',
            paddingTop: 5,
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: '#fff',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'PlusJakartaSans-Regular',
          },
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={() => setOverlayVisible(true, 'settings')}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 20 }}
              onPress={() => router.push('/prod/chat_list')}  // Updated path
            >
              <Ionicons name="chatbubble-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: '',
          headerStyle: {
            elevation: 0,
            height: 85,
          },
          headerShadowVisible: false,
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <HomeIcon isActive={focused} size={28} />,
          }}
        />
        <Tabs.Screen
          name="swapi"
          options={{
            title: 'Swapi',
            tabBarIcon: ({ focused }) => <ChatIcon isActive={focused} size={28} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: 'Post',
            tabBarIcon: ({ focused }) => <AddIcon isActive={focused} size={28} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={28}
                color={focused ? ICONCOLOR.active : ICONCOLOR.inactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <ProfileIcon isActive={focused} size={28} />,
          }}
        />
      </Tabs>
      {overlayType === 'settings' && <SettingsOverlay isVisible={isOverlayVisible} onClose={() => setOverlayVisible(false)} />}
    </View>
  );
};

export default function TabLayout() {
  return (
    <OverlayProvider>
      <TabBarWithOverlay />
    </OverlayProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});