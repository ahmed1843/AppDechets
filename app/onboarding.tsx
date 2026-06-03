import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🚛',
    title: 'Suivez votre camion',
    description: 'Sachez exactement quand le camion arrive dans votre rue. Recevez une alerte en temps réel.',
    bg: '#f0fdf4',
    accent: '#166534',
  },
  {
    id: '2',
    emoji: '📅',
    title: 'Calendrier de collecte',
    description: 'Consultez les jours et horaires de passage par quartier. Ne ratez plus aucune collecte.',
    bg: '#eff6ff',
    accent: '#0284c7',
  },
  {
    id: '3',
    emoji: '🏆',
    title: 'Gagnez des points éco',
    description: 'Signalez les dépôts sauvages, montez en niveau et contribuez à un quartier plus propre.',
    bg: '#fffbeb',
    accent: '#d97706',
  },
  {
    id: '4',
    emoji: '📍',
    title: 'Signalez en quelques secondes',
    description: 'Photo + description + envoi. Simple, rapide, efficace. Votre signalement est transmis immédiatement.',
    bg: '#fdf2f8',
    accent: '#9333ea',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
   // Remplace les 2 occurrences de router.replace('/login') par :
router.replace('/landing');
  };

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiContainer, { backgroundColor: item.bg }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.slideTitle, { color: item.accent }]}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex
                ? { backgroundColor: SLIDES[currentIndex].accent, width: 24 }
                : { backgroundColor: '#cbd5e1' },
            ]}
          />
        ))}
      </View>

      {/* Bouton suivant / commencer */}
      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].accent }]}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>
          {currentIndex === SLIDES.length - 1 ? 'Commencer mon impact ✨' : 'Suivant'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#ffffff', alignItems: 'center' },
  skipBtn:        { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  skipText:       { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  slide:          { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 20 },
  emojiContainer: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center', marginBottom: 40,
  },
  emoji:          { fontSize: 72 },
  slideTitle:     { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  slideDesc:      { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  dotsRow:        { flexDirection: 'row', gap: 8, marginBottom: 32, marginTop: 16 },
  dot:            { height: 8, borderRadius: 4, width: 8 },
  nextBtn:        {
    marginHorizontal: 24, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    width: width - 48,
  },
  nextText:       { color: 'white', fontSize: 16, fontWeight: '700' },
});