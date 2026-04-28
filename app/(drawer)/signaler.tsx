import { FontAwesome } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Camera, MapPin, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TYPES_DECHETS = ["Plastique", "Verre", "Gravats", "Électronique", "Autre"];

export default function SignalerScreen() {
  const navigation = useNavigation();
  const [type, setType] = useState('Plastique');
  const [description, setDescription] = useState('');

  const handleEnvoyer = () => {
    Alert.alert("Succès", "Votre signalement a été envoyé aux services de nettoyage. Merci pour votre geste !");
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER SIMPLIFIÉ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <FontAwesome name="navicon" size={24} color="#166534" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signaler un déchet</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.content}>
        {/* 1. SECTION PHOTO */}
        <TouchableOpacity style={styles.photoCard}>
          <Camera size={40} color="#166534" />
          <Text style={styles.photoText}>Prendre une photo du dépôt</Text>
        </TouchableOpacity>

        {/* 2. TYPE DE DÉCHET */}
        <Text style={styles.label}>Type de déchet</Text>
        <View style={styles.typeGrid}>
          {TYPES_DECHETS.map((t) => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeBadge, type === t && styles.typeBadgeActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBadgeText, type === t && styles.typeBadgeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. LOCALISATION */}
        <View style={styles.locationBox}>
            <MapPin size={20} color="#ef4444" />
            <Text style={styles.locationText}>Géolocalisation automatique activée</Text>
        </View>

        {/* 4. DESCRIPTION */}
        <Text style={styles.label}>Description (Optionnel)</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ex: Gros volume, nécessite un camion..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* 5. BOUTON ENVOYER */}
        <TouchableOpacity style={styles.sendButton} onPress={handleEnvoyer}>
          <Text style={styles.sendButtonText}>Envoyer le signalement </Text>
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    
  container: { flex: 1, backgroundColor: '#f8fafc' },
 header: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  paddingHorizontal: 20, 
  paddingTop: 50, // Ajuste selon l'encoche de ton téléphone
  paddingBottom: 20,
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderBottomColor: '#f1f5f9'
},

  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  photoCard: { 
    height: 150, backgroundColor: '#dcfce7', borderRadius: 20, borderStyle: 'dashed', 
    borderWidth: 2, borderColor: '#166534', justifyContent: 'center', alignItems: 'center', marginBottom: 25 
  },
  photoText: { marginTop: 10, color: '#166534', fontWeight: '600' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  typeBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
  typeBadgeActive: { backgroundColor: '#166534', borderColor: '#166534' },
  typeBadgeText: { color: '#64748b' },
  typeBadgeTextActive: { color: 'white', fontWeight: 'bold' },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 15, borderRadius: 12, marginBottom: 25 },
  locationText: { marginLeft: 10, color: '#b91c1c', fontSize: 13, fontWeight: '500' },
  input: { backgroundColor: 'white', borderRadius: 15, padding: 15, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 30 },
  sendButton: { 
    backgroundColor: '#166534', padding: 18, borderRadius: 15, flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center', elevation: 4
  },
  sendButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
});
