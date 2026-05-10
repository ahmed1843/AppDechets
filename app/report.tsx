import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, Image, Alert, ActivityIndicator, ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../services/api';

export default function ReportScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Médina, Rue 10');
  const [image, setImage] = useState<string | null>(null); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "Accès caméra refusé");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setImageFile(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      document.getElementById('web-image-input')?.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled) setImage(result.assets[0].uri);
    }
  };

  const handleWebImage = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    console.log(">>> Bouton cliqué !");

    if (!title || !description) {
      Alert.alert("Attention", "Merci de remplir les champs obligatoires.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('latitude', '14.6937');
      formData.append('longitude', '-17.4441');

      if (image) {
        if (Platform.OS === 'web' && imageFile) {
          formData.append('image', imageFile);
        } else {
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1];
          // @ts-ignore
          formData.append('image', {
            uri: image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("📥 Réponse report:", data);

   if (response.ok) {
  // Alert.alert ne supporte pas onPress sur web
  if (typeof window !== 'undefined') {
    window.alert("✅ Signalement envoyé avec succès !");
    router.replace('/historique');
  } else {
    Alert.alert("✅ Succès", "Signalement envoyé !", [
      { text: "OK", onPress: () => router.replace('/historique') }
    ]);
  }
}

    } catch (error) {
      console.error("Erreur report:", error);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle} 
          placeholder="Titre du signalement..." 
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput 
          style={styles.textArea} 
          value={description} 
          onChangeText={setDescription} 
          multiline 
          placeholder="Décrivez le problème..." 
        />

        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={30} color="#166534" />
            <Text style={styles.photoText}>Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Ionicons name="images" size={30} color="#166534" />
            <Text style={styles.photoText}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' && (
          <input 
            type="file" 
            id="web-image-input" 
            accept="image/*" 
            onChange={handleWebImage} 
            style={{ display: 'none' }} 
          />
        )}

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            <TouchableOpacity onPress={() => setImage(null)} style={styles.removePhoto}>
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Envoyer le signalement</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' 
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15 },
  textArea: { 
    backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, 
    height: 100, textAlignVertical: 'top' 
  },
  photoContainer: { flexDirection: 'row', gap: 15, marginTop: 20 },
  photoButton: { 
    flex: 1, height: 80, borderStyle: 'dashed', borderWidth: 2, 
    borderColor: '#166534', borderRadius: 12, justifyContent: 'center', 
    alignItems: 'center', backgroundColor: '#f0fdf4' 
  },
  photoText: { color: '#166534', fontSize: 12, fontWeight: 'bold' },
  previewContainer: { marginTop: 20, position: 'relative' },
  preview: { width: '100%', height: 200, borderRadius: 12 },
  removePhoto: { 
    position: 'absolute', top: 5, right: 5, 
    backgroundColor: 'white', borderRadius: 20 
  },
  submitButton: { 
    backgroundColor: '#166534', marginTop: 30, height: 55, 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center' 
  },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});