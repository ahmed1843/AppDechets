import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
import { getToken, logout } from '../services/auth';

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
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Accès galerie refusé");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  } catch (e) {
    console.error(e);
    Alert.alert("Erreur", "Impossible d'ouvrir la galerie");
  }
};
  const handleWebImage = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };
// ✅ Récupère la position GPS réelle du signalement, avec fallback sûr.
// Le chauffeur doit connaître la vraie position du dépôt — mais on ne bloque
// jamais l'envoi si le GPS échoue ou si la permission est refusée (fiabilité en démo).
const getReportCoordinates = async (): Promise<{ latitude: string; longitude: string; isReal: boolean }> => {
  const DEFAULT_COORDS = { latitude: '14.6937', longitude: '-17.4441', isReal: false };

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return DEFAULT_COORDS;
    }

    // Timeout de sécurité : le GPS peut être lent/instable en intérieur.
    // On abandonne après 8s plutôt que de laisser l'utilisateur bloqué.
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);

    if (!position) {
      return DEFAULT_COORDS;
    }

    return {
      latitude: String(position.coords.latitude),
      longitude: String(position.coords.longitude),
      isReal: true,
    };
  } catch (e) {
    console.log('⚠️ GPS indisponible, position par défaut utilisée:', e);
    return DEFAULT_COORDS;
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
    const coords = await getReportCoordinates();
formData.append('latitude', coords.latitude);
formData.append('longitude', coords.longitude);

if (!coords.isReal) {
  console.log('ℹ️ Signalement envoyé avec position par défaut (GPS indisponible ou refusé)');
}

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
    'Accept': 'application/json',
  },
  body: formData,
});

if (response.status === 401) {
  await logout();
  router.replace('/login');
  return;
}

const data = await response.json();

if (response.ok) {
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signaler un dépôt</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
              ]} numberOfLines={2}>
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
          placeholderTextColor="#94a3b8"
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
          numberOfLines={4}
          placeholder="Décrivez le problème avec précision..."
          placeholderTextColor="#94a3b8"
        />
        {description.trim().length > 0 && description.trim().length < 10 && (
          <Text style={styles.errorText}>Minimum 10 caractères ({description.trim().length}/10)</Text>
        )}

        {/* Photos */}
        <Text style={styles.label}>Ajouter des photos</Text>
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={26} color="#166534" />
            <Text style={styles.photoText}>Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Ionicons name="images" size={26} color="#166534" />
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
              <Ionicons name="close-circle" size={26} color="#ef4444" />
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // Arrière-plan rafraîchi pour correspondre au calendrier
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
  },
  backBtn: {
    padding: 6, backgroundColor: '#f1f5f9', borderRadius: 10
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 18, letterSpacing: 0.1 },
  
  input: { 
    backgroundColor: 'white', borderRadius: 10, padding: 14, fontSize: 14,
    color: '#0f172a', borderWidth: 1, borderColor: '#cbd5e1'
  },
  textArea: {
    backgroundColor: 'white', borderRadius: 10, padding: 14, fontSize: 14,
    color: '#0f172a', borderWidth: 1, borderColor: '#cbd5e1',
    height: 110, textAlignVertical: 'top'
  },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 5, fontWeight: '500' },
  
  // Catégories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 2,
  },
  categoryCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    
    // Ombre discrète
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4 },
      android: { elevation: 1 }
    })
  },
  categoryCardSelected: {
    borderColor: '#166534',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 9,
    textAlign: 'center',
    color: '#475569',
    fontWeight: '600',
    lineHeight: 11,
  },
  categoryLabelSelected: {
    color: '#166534',
    fontWeight: '700',
  },
  
  // Photos
  photoContainer: { flexDirection: 'row', gap: 12, marginTop: 2 },
  photoButton: {
    flex: 1, height: 65, borderStyle: 'dashed', borderWidth: 1.5,
    borderColor: '#166534', borderRadius: 10, flexDirection: 'row',
    gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4'
  },
  photoText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  previewContainer: { marginTop: 16, position: 'relative' },
  preview: { width: '100%', height: 180, borderRadius: 12 },
  removePhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'white', borderRadius: 20
  },
  
  submitButton: {
    backgroundColor: '#166534', marginTop: 24, height: 50,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#166534', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitText: { color: 'white', fontSize: 15, fontWeight: '700' }
});