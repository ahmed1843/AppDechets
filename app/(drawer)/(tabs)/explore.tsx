import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, Camera, CheckCircle2, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReportScreen() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // État pour la modale

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
   if (!result.canceled) {
  // On récupère l'uri du premier élément du tableau 'assets'
  setImage(result.assets[0].uri);
}

  };

  const handleSubmit = () => {
    if (!description || !image) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    // On affiche la modale de succès
    setShowModal(true);
  };

  const closeSuccess = () => {
    setShowModal(false);
    setDescription('');
    setImage(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ... (Reste de ton formulaire précédent) ... */}
      <View style={styles.header}>
        <AlertTriangle color="#ef4444" size={32} />
        <Text style={styles.title}>Signaler un problème</Text>
      </View>

      <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
        {image ? <Image source={{ uri: image }} style={styles.previewImage} /> : 
        <View style={styles.emptyImage}><Camera color="#94a3b8" size={40} /><Text>Ajouter une photo</Text></View>}
      </TouchableOpacity>

      <TextInput
        style={styles.textArea}
        placeholder="Décrivez le problème..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Envoyer</Text>
        <Send color="white" size={20} />
      </TouchableOpacity>

      {/* --- LA MODALE DE SUCCÈS --- */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CheckCircle2 color="#22c55e" size={80} />
            <Text style={styles.modalTitle}>Signalement Reçu !</Text>
            <Text style={styles.modalDesc}>
              Merci ! Nos équipes vont intervenir rapidement pour traiter ce dépôt sauvage.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeSuccess}>
              <Text style={styles.closeButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  title: { fontSize: 22, fontWeight: 'bold' },
  imagePlaceholder: { height: 200, backgroundColor: 'white', borderRadius: 15, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', marginBottom: 20 },
  previewImage: { width: '100%', height: '100%', borderRadius: 15 },
  emptyImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textArea: { backgroundColor: 'white', padding: 15, borderRadius: 15, height: 100, borderWidth: 1, borderColor: '#e2e8f0' },
  submitButton: { backgroundColor: '#ef4444', flexDirection: 'row', justifyContent: 'center', padding: 18, borderRadius: 15, marginTop: 30, gap: 10 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  
  // Styles de la modale
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 20 },
  modalDesc: { textAlign: 'center', color: '#64748b', marginTop: 10, lineHeight: 20 },
  closeButton: { backgroundColor: '#22c55e', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 10, marginTop: 25 },
  closeButtonText: { color: 'white', fontWeight: 'bold' }
});
