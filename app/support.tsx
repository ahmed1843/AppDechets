import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import { API_URL } from '../services/api';
import { getToken } from '../services/auth';

const FAQ = [
  { q: "Comment signaler un dépôt sauvage ?", a: "Allez dans l'onglet Signaler, remplissez le formulaire et ajoutez une photo." },
  { q: "Comment recevoir les alertes camion ?", a: "Assurez-vous d'avoir activé les notifications et renseigné votre rue dans votre profil." },
  { q: "Comment gagner des points éco ?", a: "Chaque signalement validé vous rapporte des points. Atteignez 100 pts pour passer Argent, 500 pts pour Or." },
  { q: "Mon signalement n'apparaît pas ?", a: "Vérifiez votre connexion internet. Les signalements sont visibles dans l'historique après envoi." },
];

const CONTACTS = [
  {
    id: 'allo',
    icon: 'call',
    emoji: '🚨',
    title: 'Allo Déchets',
    subtitle: 'Numéro vert SONAGED',
    action: '202 123',
    color: '#ef4444',
    bg: '#fef2f2',
    onPress: () => Linking.openURL('tel:202123'),
  },
  {
    id: 'mairie',
    icon: 'business',
    emoji: '🏛️',
    title: 'Mairie de Dakar',
    subtitle: 'Signalement officiel',
    action: '33 849 05 05',
    color: '#0284c7',
    bg: '#f0f9ff',
    onPress: () => Linking.openURL('tel:+221338490505'),
  },
  {
    id: 'ecowaste',
    icon: 'chatbubble-ellipses',
    emoji: '💬',
    title: 'Support EcoWaste',
    subtitle: 'WhatsApp / Email',
    action: 'Nous écrire',
    color: '#166534',
    bg: '#f0fdf4',
    onPress: () => Linking.openURL('mailto:support@ecowaste.sn'),
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim().length < 10) {
      Alert.alert("Message trop court", "Décrivez votre problème en au moins 10 caractères.");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        Alert.alert("✅ Message envoyé", "Nous vous répondrons dans les plus brefs délais.");
        setMessage('');
      } else {
        Alert.alert("Erreur", "Impossible d'envoyer le message.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
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
        <Text style={styles.title}>Aide et support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Contacts urgents ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Contacts utiles</Text>
        <View style={styles.contactsGrid}>
          {CONTACTS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.contactCard, { backgroundColor: c.bg }]}
              onPress={c.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: c.color }]}>
                <Ionicons name={c.icon as any} size={20} color="white" />
              </View>
              <Text style={styles.contactTitle}>{c.title}</Text>
              <Text style={styles.contactSubtitle}>{c.subtitle}</Text>
              <View style={[styles.contactActionBtn, { backgroundColor: c.color }]}>
                <Text style={styles.contactActionText}>{c.action}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        {FAQ.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqCard}
            onPress={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Ionicons
                name={openIndex === index ? "chevron-up" : "chevron-down"}
                size={18} color="#64748b"
              />
            </View>
            {openIndex === index && (
              <Text style={styles.faqAnswer}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* ── Contact message ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <View style={styles.messageCard}>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder="Décrivez votre problème..."
            multiline
            numberOfLines={5}
          />
          {message.trim().length > 0 && message.trim().length < 10 && (
            <Text style={styles.errorText}>Minimum 10 caractères ({message.trim().length}/10)</Text>
          )}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabledButton]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.sendText}>Envoyer le message</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title:        { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content:      { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12, marginTop: 8 },

  // Contacts
  contactsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  contactCard: {
    width: '47%', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  contactIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  contactTitle:    { fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  contactSubtitle: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  contactActionBtn: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 4,
  },
  contactActionText: { color: 'white', fontSize: 12, fontWeight: '600' },

  // FAQ
  faqCard:     { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 10 },
  faqHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b', marginRight: 8 },
  faqAnswer:   { fontSize: 13, color: '#64748b', marginTop: 10, lineHeight: 20 },

  // Message
  messageCard:    { backgroundColor: 'white', borderRadius: 16, padding: 16 },
  textArea: {
    backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14,
    fontSize: 14, height: 120, textAlignVertical: 'top', color: '#1e293b',
  },
  errorText:      { color: '#ef4444', fontSize: 12, marginTop: 4 },
  sendButton:     { backgroundColor: '#166534', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  disabledButton: { backgroundColor: '#94a3b8' },
  sendText:       { color: 'white', fontSize: 15, fontWeight: '600' },
});