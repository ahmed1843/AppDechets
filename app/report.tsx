import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '../services/api';

export default function ReportScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Médina, Rue 10 (Auto-détecté)'); // Simulation GPS

  const handleSubmit = async () => {
    if (!description) {
      // Utilise l'alerte classique du navigateur pour le Web
      alert("Veuillez décrire le problème.");
      return;
    }

    try {
      // Message de succès
      alert("Succès : Signalement envoyé avec succès ! Un chauffeur a été alerté.");
      
      // REDIRECTION EXPLICITE (Remplace router.back())
      router.replace("/home"); 
      
    } catch (error) {
      alert("Erreur : Impossible d'envoyer le signalement.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Signaler un dépôt</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Description du problème</Text>
        <TextInput 
          style={styles.textArea}
          placeholder="Ex: Gros tas de gravats devant l'école..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.locationBox}>
          <Ionicons name="location" size={20} color="#166534" />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <TouchableOpacity style={styles.photoButton}>
          <Ionicons name="camera" size={30} color="#166534" />
          <Text style={styles.photoText}>Prendre une photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Envoyer le signalement</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#1e293b' },
  textArea: { backgroundColor: '#f1f5f9', borderRadius: 15, padding: 15, height: 120, textAlignVertical: 'top' },
  locationBox: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: '#dcfce7', padding: 15, borderRadius: 12 },
  locationText: { marginLeft: 10, color: '#166534', fontWeight: '500' },
  photoButton: { marginTop: 20, height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: '#166534', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: '#166534', marginTop: 5, fontWeight: 'bold' },
  submitButton: { backgroundColor: '#166534', marginTop: 40, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
