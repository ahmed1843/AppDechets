// components/NavBar.tsx

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

// ✅ Après
const HIDDEN_ON = ['/login', '/register', '/forgot-password', '/driver', '/admin'];

const NAV_ITEMS = [
  { route: '/',           icon: 'grid',           iconOutline: 'grid-outline',           label: 'Accueil'  },
  { route: '/map',        icon: 'map',             iconOutline: 'map-outline',             label: 'Carte'    },
  { route: '/calendrier', icon: 'calendar',        iconOutline: 'calendar-outline',        label: 'Agenda'   },
  { route: '/report',     icon: 'megaphone',       iconOutline: 'megaphone-outline',       label: 'Signaler' },
  { route: '/profile',    icon: 'person-circle',   iconOutline: 'person-circle-outline',   label: 'Profil'   },
];
type NavItemProps = {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  onPress: () => void;
};

function NavItem({ item, isActive, onPress }: NavItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pillAnim  = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const labelAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillAnim, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(labelAnim, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.82, useNativeDriver: true, tension: 300, friction: 10 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 8  }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.navItem}>
      <Animated.View style={[styles.navItemInner, { transform: [{ scale: scaleAnim }] }]}>

        {/* Pill de fond actif */}
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity: pillAnim,
              transform: [{ scaleX: pillAnim }, { scaleY: pillAnim }],
            },
          ]}
        />

        {/* Icône */}
        <Ionicons
          name={(isActive ? item.icon : item.iconOutline) as any}
          size={22}
          color={isActive ? '#166534' : '#94a3b8'}
        />

        {/* Label animé */}
        <Animated.Text
          style={[
            styles.navLabel,
            {
              color: isActive ? '#166534' : '#94a3b8',
              opacity: labelAnim,
              transform: [{
                translateY: labelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 0],
                }),
              }],
            },
          ]}
        >
          {item.label}
        </Animated.Text>

      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NavBar() {
  const router   = useRouter();
  const pathname = usePathname();

  // Cacher la NavBar sur login / register / forgot-password
  if (HIDDEN_ON.includes(pathname)) return null;

  const barContent = (
    <View style={styles.bar}>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.route}
          item={item}
          isActive={pathname === item.route}
          onPress={() => router.push(item.route as any)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={75} tint="light" style={styles.blurContainer}>
          {barContent}
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, styles.androidBg]}>
          {barContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Pas de position absolute — elle est dans le layout global
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
  blurContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  androidBg: {
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 48,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});