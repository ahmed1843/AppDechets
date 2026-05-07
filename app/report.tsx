import React, { useState, useEffect } from 'react';
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
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Médina, Rue 10');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Prendre une photo (Mobile)
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission", "On a besoin de la caméra.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageFile(null);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre la photo.");
    }
  };

  // Choisir de la galerie (Mobile)
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission", "On a besoin de la galerie.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageFile(null);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger la photo.");
    }
  };

  // Pour Web
  const handleWebImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Alert.alert("Erreur", "Le fichier doit être une image");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert("Erreur", "L'image ne doit pas dépasser 5MB");
        return;
      }
      
      const url = URL.createObjectURL(file);
      setImage(url);
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!title || title.trim().length < 3) {
      Alert.alert("Champ requis", "Le titre doit faire au moins 3 caractères.");
      return;
    }

    if (!description || description.trim().length < 5) {
      Alert.alert("Champ requis", "La description doit faire au moins 5 caractères.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location);
      
      if (Platform.OS === 'web') {
        if (imageFile) {
          formData.append('photo', imageFile);
        }
      } else {
        if (image) {
          const filename = image.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('photo', {
            uri: image,
            name: filename,
            type: type,
          } as any);
        }
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        // ✅ ALERTE FORCÉE - S'affichera à coup sûr
        window.alert("✅ Succès !\n\nVotre signalement a été envoyé avec succès !");
        
        // Redirection après un court délai
        setTimeout(() => {
          router.replace("/home");
        }, 1500);
      } else {
        let errorMessage = data.message || "Problème lors de l'envoi";
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat().join('\n');
        }
        window.alert("❌ Erreur\n\n" + errorMessage);
      }
    } catch (error) {
      setLoading(false);
      window.alert("❌ Erreur réseau\n\nImpossible de contacter le serveur.");
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.label}>Titre du signalement *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ex: Dépôt sauvage rue de la Paix"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description du problème *</Text>
        <TextInput 
          style={styles.textArea}
          placeholder="Ex: Gros tas de gravats devant l'école..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.locationBox}>
          <Ionicons name="location" size={20} color="#166534" />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        {/* DEUX BOUTONS : Prendre photo + Choisir photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={30} color="#166534" />
            <Text style={styles.photoText}>Prendre photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Ionicons name="images" size={30} color="#166534" />
            <Text style={styles.photoText}>Choisir photo</Text>
          </TouchableOpacity>
        </View>

        {/* Pour Web : input file caché via les boutons */}
        {Platform.OS === 'web' && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif"
            onChange={handleWebImage}
            style={{ display: 'none' }}
            id="web-image-input"
          />
        )}

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} resizeMode="contain" />
            <TouchableOpacity onPress={() => {
              setImage(null);
              setImageFile(null);
            }} style={styles.removePhoto}>
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 10, 
    marginTop: 10,
    color: '#1e293b' 
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
  },
  textArea: { 
    backgroundColor: '#f1f5f9', 
    borderRadius: 15, 
    padding: 15, 
    height: 120, 
    textAlignVertical: 'top' 
  },
  locationBox: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 20, 
    backgroundColor: '#dcfce7', 
    padding: 15, 
    borderRadius: 12 
  },
  locationText: { 
    marginLeft: 10, 
    color: '#166534', 
    fontWeight: '500' 
  },
  photoContainer: { 
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 20,
  },
  photoButton: { 
    flex: 1,
    height: 100, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#166534', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f0fdf4'
  },
  photoText: { 
    color: '#166534', 
    marginTop: 5, 
    fontWeight: 'bold' 
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    padding: 10,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
  },
  submitButton: { 
    backgroundColor: '#166534', 
    marginTop: 30, 
    height: 60, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  submitText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});