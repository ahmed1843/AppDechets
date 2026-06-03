import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Rect } from 'react-native-svg';

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <View style={logo.container}>
      <Svg width={44} height={44} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="38" fill="#166534" />
        <Rect x="33" y="14" width="14" height="9" rx="4" fill="#86efac" />
        <Rect x="20" y="22" width="40" height="9" rx="4" fill="#86efac" />
        <Rect x="23" y="33" width="34" height="28" rx="4" fill="#4ade80" />
        <Line x1="33" y1="36" x2="33" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="40" y1="36" x2="40" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="47" y1="36" x2="47" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Ellipse cx="62" cy="22" rx="8" ry="5" fill="#4ade80" rotation="-25" originX="62" originY="22" />
        <Line x1="60" y1="25" x2="54" y2="30" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
      <View>
        <View style={logo.row}>
          <Text style={logo.sama}>SAMA</Text>
          <Text style={logo.gox}> GOX</Text>
        </View>
        <Text style={logo.tagline}>Mon quartier propre</Text>
      </View>
    </View>
  );
}

const logo = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  row:       { flexDirection: 'row', alignItems: 'baseline' },
  sama:      { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  gox:       { fontSize: 22, fontWeight: '300', color: '#4ade80', letterSpacing: 3 },
  tagline:   { fontSize: 10, color: '#86efac', letterSpacing: 0.5, marginTop: 1 },
});

// ── Actions rapides ───────────────────────────────────────────────────────────
const ACTIONS = [
  { icon: 'notifications', label: 'Alertes',         color: '#166534', route: '/report'   },
  { icon: 'settings',      label: 'Services',        color: '#0f766e', route: '/support'  },
  { icon: 'lock-closed',   label: 'Connexion',       color: '#166534', route: '/login'    },
  { icon: 'person-add',    label: "S'inscrire",      color: '#15803d', route: '/register' },
  { icon: 'people',        label: 'Mes alertes',     color: '#166534', route: '/historique'},
  { icon: 'map',           label: 'Points collecte', color: '#0f766e', route: '/map'      },
];

export default function LandingScreen() {
  const router = useRouter();

const PROTECTED = ['/report', '/historique'];

const handleAction = async (route: string) => {
  await AsyncStorage.setItem('onboarding_done', 'true');
  await AsyncStorage.setItem('landing_seen', 'true');

  if (PROTECTED.includes(route)) {
    router.push('/login');
    return;
  }
  router.push(route as any);
};

  return (
    <ImageBackground
      source={require('../assets/images/collecte.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Overlay vert semi-transparent comme SETALMA */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>

        {/* Logo centré */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Card principale */}
        <View style={styles.card}>

          {/* Grille 2x3 */}
          <View style={styles.grid}>
            {ACTIONS.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionBtn}
                onPress={() => handleAction(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={28} color="white" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* Tagline bas */}
        <Text style={styles.taglineBottom}>Une application citoyenne de propreté</Text>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg:      { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 83, 45, 0.72)',
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },

  logoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 28,
  },

  actionBtn: {
    width: '46%',
    alignItems: 'center',
    gap: 10,
  },

  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000', shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 6,
  },

  actionLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  taglineBottom: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
});