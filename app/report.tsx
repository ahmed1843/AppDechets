import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../services/api';
import { getToken } from '../services/auth';

const CATEGORIES = [
  { id: 'depot_sauvage', label: 'Dépôt sauvage', icon: '🗑️' },
  { id: 'bac_plein', label: 'Bac plein', icon: '♻️' },
  { id: 'camion_absent', label: 'Camion absent', icon: '🚛' },
  { id: 'gravats', label: 'Tas de gravats', icon: '🪨' },
  { id: 'dechets_verts', label: 'Déchets verts', icon: '🌿' },
  { id: 'liquide', label: 'Déversement liquide', icon: '💧' },
  { id: 'odeur', label: 'Odeur insalubre', icon: '😷' },
  { id: 'autre', label: 'Autre problème', icon: '⚠️' },
];

export default function ReportScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Médina, Rue 10');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    if (!selectedCategory) {
      Alert.alert("Catégorie manquante", "Veuillez sélectionner une catégorie.");
      return;
    }
    if (title.trim().length < 5) {
      Alert.alert("Titre trop court", "Le titre doit contenir au moins 5 caractères.");
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert("Description insuffisante", "La description doit contenir au moins 10 caractères.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('category', selectedCategory);
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

      if (response.ok) {
     // Par :
const pointsGagnes = image ? 70 : 50;
Alert.alert(
  "✅ Signalement envoyé !",
  `🎉 Vous avez gagné +${pointsGagnes} points éco !`,
  [{ text: "Voir mes points", onPress: () => router.replace('/points') },
   { text: "OK", onPress: () => router.replace('/historique') }]
);
      } else {
        Alert.alert("Erreur", data.message || "Échec de l'envoi");
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
        <Text style={styles.headerTitle}>Signaler un dépôt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Catégories */}
        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                selectedCategory === cat.id && styles.categoryCardSelected
              ]}
              onPress={() => {
                setSelectedCategory(cat.id);
                setTitle(cat.label);
              }}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelSelected
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Titre */}
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre du signalement..."
        />
        {title.trim().length > 0 && title.trim().length < 5 && (
          <Text style={styles.errorText}>Minimum 5 caractères ({title.trim().length}/5)</Text>
        )}

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Décrivez le problème..."
        />
        {description.trim().length > 0 && description.trim().length < 10 && (
          <Text style={styles.errorText}>Minimum 10 caractères ({description.trim().length}/10)</Text>
        )}

        {/* Photos */}
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
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15 },
  textArea: {
    backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15,
    height: 100, textAlignVertical: 'top'
  },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  // Catégories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  categoryCard: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  categoryCardSelected: {
    borderColor: '#166534',
    backgroundColor: '#f0fdf4',
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 9,
    textAlign: 'center',
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#166534',
    fontWeight: '700',
  },
  // Photos
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