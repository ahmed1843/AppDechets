import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
// On utilise Ionicons qui est inclus dans Expo par défaut
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { ActionButton } from "../components/ui/ActionButton";
import { Colors } from "../constants/Design";

export default function SignalerScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!image) {
      Alert.alert("Photo manquante", "Veuillez prendre une photo du déchet.");
      return;
    }
    Alert.alert("Succès", "Signalement envoyé !");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.title}>Signaler un déchet</Text>
        <Text style={styles.subtitle}>Aidez-nous à localiser les dépôts sauvages.</Text>

        <View style={styles.photoSection}>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={28} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={50} color={Colors.accent} />
                <Text style={styles.photoBtnText}>Prendre une photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez le problème..."
            placeholderTextColor={Colors.textMuted}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.locationBox}>
            <Ionicons name="location" size={20} color={Colors.accent} />
            <Text style={styles.locationText}>Ma position GPS sera jointe</Text>
          </View>

          <ActionButton 
            label="Envoyer le signalement" 
            onPress={handleSubmit}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24 },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: "900", marginBottom: 8 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 30 },
  photoSection: { marginBottom: 25 },
  photoPlaceholder: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtn: { alignItems: 'center' },
  photoBtnText: { color: Colors.textPrimary, marginTop: 10, fontWeight: "600" },
  imageWrapper: { height: 250, borderRadius: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 10, right: 10 },
  form: { gap: 15 },
  label: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 100,
  },
  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surfaceHover, padding: 15, borderRadius: 12 },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
});
