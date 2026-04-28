import { FontAwesome } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Award, Globe, Leaf, Mail, Phone, Recycle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import natureImg from '../../../assets/images/nikofendi-trash-4358272.jpg';


const { width } = Dimensions.get('window');

// --- FONCTIONS ET DONNÉES ---
const getInitiale = (nom: string) => nom.charAt(0).toUpperCase();

const CONSEQUENCES = [
  { id: 1, title: "Pollution", icon: "🌍", color: "#16a34a", bg: "#dcfce7", info: "Dégradation des sols et de l'air." },
  { id: 2, title: "Climat", icon: "🌡️", color: "#ef4444", bg: "#fee2e2", info: "Réchauffement de la planète." },
  { id: 3, title: "Santé", icon: "🏥", color: "#3b82f6", bg: "#dbeafe", info: "Propagation de maladies." },
  { id: 4, title: "Océans", icon: "🌊", color: "#06b6d4", bg: "#cffafe", info: "Destruction de la faune marine." },
  { id: 5, title: "Économie", icon: "💰", color: "#ca8a04", bg: "#fef9c3", info: "Gaspillage de ressources." },
];

const SOLUTIONS = [
  { id: 1, title: "Tri Sélectif", desc: "Séparez le sec du humide facilement.", icon: "🗑️", color: "#166534", btn: "Apprendre" },
  { id: 2, title: "Compostage", desc: "Créez votre propre engrais naturel.", icon: "🌱", color: "#d97706", btn: "Vidéo" },
  { id: 3, title: "Smart Recycling", desc: "Réutilisez vos objets du quotidien.", icon: "♻️", color: "#2563eb", btn: "Tutos" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [selectedImpact, setSelectedImpact] = useState<number | null>(null);
  
  // --- ANIMATIONS ---
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const translateX = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  return (
    <ScrollView style={styles.container}>
      {/* 1. HEADER AVEC MENU ET PROFIL */}
      <ImageBackground source={natureImg} style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.headerTopBar}>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <FontAwesome name="navicon" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <View style={styles.pointsBadge}>
                 <Award size={14} color="#166534" />
                 <Text style={styles.pointsText}>150 pts</Text>
              </View>
              <TouchableOpacity style={styles.profileCircle}>
                <Text style={styles.profileLetter}>{getInitiale("Moussa")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* 2. DASHBOARD ANIMÉ */}
      <Animated.View style={[styles.heroCard, { transform: [{ translateY }] }]}>
          <Text style={styles.heroTitle}>Eco Dashboard <Recycle size={26} color="#22c55e" /></Text>
          <View style={styles.divider} />
          <Text style={styles.heroSubtitle}>Votre solution intelligente pour la gestion des déchets.</Text>
      </Animated.View>

      {/* 3. SLOGAN ANIMÉ */}
      <Animated.View style={[styles.motivationCard, { transform: [{ translateX }] }]}>
        <Text style={styles.motivationText}>🌱 La Terre commence avec vous</Text>
        <View style={styles.iconRow}>
          <Leaf size={22} color="#22c55e" />
          <Globe size={22} color="#16a34a" />
          <Recycle size={22} color="#15803d" />
        </View>
      </Animated.View>

      {/* 4. CONSÉQUENCES */}
      <View style={styles.consequencesCard}>
        <Text style={styles.consequencesTitle}>Impacts du gaspillage</Text>
        <View style={styles.grid}>
          {CONSEQUENCES.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => setSelectedImpact(item.id === selectedImpact ? null : item.id)} 
              style={[styles.gridItem, { borderColor: item.color, backgroundColor: item.bg }, selectedImpact === item.id && { borderWidth: 3 }]}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[styles.gridText, { color: item.color }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedImpact && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{CONSEQUENCES.find(c => c.id === selectedImpact)?.info}</Text>
          </View>
        )}
      </View>

      {/* 5. SOLUTIONS */}
      <Text style={styles.sectionMainTitle}>Solutions durables</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.solutionsScroll}>
        {SOLUTIONS.map((item) => (
          <View key={item.id} style={styles.solutionCard}>
              <Text style={styles.solutionIcon}>{item.icon}</Text>
              <Text style={[styles.solutionTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={styles.solutionDesc}>{item.desc}</Text>
              <TouchableOpacity style={[styles.solutionBtn, { backgroundColor: item.color }]}>
                  <Text style={styles.solutionBtnText}>{item.btn}</Text>
              </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 6. FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>EcoWaste</Text>
        <Text style={styles.footerDesc}>Rendre la gestion des déchets plus intelligente pour un futur plus propre.</Text>
        <View style={styles.footerDivider} />
        <View style={styles.contactRow}><Mail color="white" size={16} /><Text style={styles.footerLink}>contact@ecowaste.com</Text></View>
        <View style={styles.contactRow}><Phone color="white" size={16} /><Text style={styles.footerLink}>+33 1 23 45 67 89</Text></View>
        <View style={styles.socialRow}>
          <FontAwesome name="facebook-square" size={24} color="white" />
          <FontAwesome name="twitter" size={24} color="white" />
          <FontAwesome name="instagram" size={24} color="white" />
        </View>
        <Text style={styles.copyright}>© 2024 EcoWaste. Tous droits réservés.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  backgroundImage: { width: '100%', height: 220 },
  overlay: { flex: 1, backgroundColor: 'rgba(22, 101, 52, 0.4)', paddingHorizontal: 20, paddingTop: 40 },
  
  headerTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8 },
  profileCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', marginLeft: 12,
  },
  profileLetter: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
  },
  pointsText: { color: '#166534', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },

  heroCard: {
    backgroundColor: 'white', margin: 20, marginTop: -50, padding: 20, borderRadius: 20,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  divider: { height: 3, width: 50, backgroundColor: '#22c55e', marginBottom: 10 },
  heroSubtitle: { color: '#64748b', lineHeight: 20 },
  
  motivationCard: {
    backgroundColor: '#166534', marginHorizontal: 20, padding: 15,
    borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  motivationText: { color: 'white', fontWeight: '600' },
  iconRow: { flexDirection: 'row', gap: 10 },

  consequencesCard: { padding: 20 },
  consequencesTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: (width - 60) / 2, padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1 },
  gridIcon: { fontSize: 24, marginBottom: 5 },
  gridText: { fontWeight: 'bold' },
  infoBox: { marginTop: 15, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 10 },
  infoText: { color: '#475569', fontStyle: 'italic', textAlign: 'center' },

  sectionMainTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 10 },
  solutionsScroll: { paddingLeft: 20, marginVertical: 15 },
  solutionCard: {
    backgroundColor: 'white', width: 200, padding: 20, borderRadius: 20,
    marginRight: 15, borderWidth: 1, borderColor: '#e2e8f0',
  },
  solutionIcon: { fontSize: 30, marginBottom: 10 },
  solutionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  solutionDesc: { fontSize: 12, color: '#64748b', marginBottom: 15 },
  solutionBtn: { padding: 8, borderRadius: 10, alignItems: 'center' },
  solutionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  footer: { backgroundColor: '#0f172a', padding: 30, marginTop: 20 },
  footerBrand: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  footerDesc: { color: '#94a3b8', marginTop: 10, lineHeight: 20 },
  footerDivider: { height: 1, backgroundColor: '#334155', marginVertical: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  footerLink: { color: '#f8fafc' },
  socialRow: { flexDirection: 'row', gap: 20, marginTop: 15 },
  copyright: { color: '#64748b', fontSize: 11, marginTop: 25, textAlign: 'center' },
});
