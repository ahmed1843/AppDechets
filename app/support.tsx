import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, Alert, Linking, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqData = [
    {
      q: "Comment signaler un dépôt sauvage ?",
      a: "Rendez-vous sur l'onglet 'Signaler' depuis l'accueil, choisissez la catégorie correspondante, ajoutez une description ainsi qu'une photo, puis validez. Nos équipes seront notifiées instantanément."
    },
    {
      q: "Comment recevoir les alertes camion ?",
      a: "Assurez-vous d'avoir activé les notifications dans les paramètres de votre profil. Vous recevrez une alerte push dès que le camion de collecte entrera dans votre zone."
    },
    {
      q: "Comment gagner des points éco ?",
      a: "Chaque signalement validé ou action citoyenne confirmée vous rapporte des points éco. Ces points font évoluer votre badge de niveau (Bronze, Argent, Or)."
    },
    {
      q: "Mon signalement n'apparaît pas ?",
      a: "Les signalements peuvent être mis en attente de modération par l'équipe d'administration pour éviter les doublons. Ils apparaissent dès validation."
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Erreur", "Veuillez rédiger un message avant d'envoyer.");
      return;
    }
    // Simuler l'envoi au backend
    Alert.alert("Succès", "Votre message a bien été envoyé à l'équipe EcoWaste !", [
      { text: "OK", onPress: () => setMessage('') }
    ]);
  };

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Aide et support</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Contacts utiles */}
        <Text style={styles.sectionTitle}>Contacts utiles</Text>
        <View style={styles.contactsGrid}>
          
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}
            onPress={() => Linking.openURL('tel:202123')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="call" size={20} color="white" />
            </View>
            <Text style={styles.contactName}>Allo Déchets</Text>
            <Text style={styles.contactSub}>Numéro vert SONAGED</Text>
            <View style={styles.phoneBadgeRed}>
              <Text style={styles.phoneTextRed}>202 123</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: '#f0f9ff', borderColor: '#e0f2fe' }]}
            onPress={() => Linking.openURL('tel:338490505')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#0284c7' }]}>
              <Ionicons name="business" size={20} color="white" />
            </View>
            <Text style={styles.contactName}>Mairie de Dakar</Text>
            <Text style={styles.contactSub}>Signalement officiel</Text>
            <View style={styles.phoneBadgeBlue}>
              <Text style={styles.phoneTextBlue}>33 849 05 05</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Support centralisé */}
        <View style={[styles.contactCardRow, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#166534' }]}>
            <Ionicons name="chatbubbles" size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactNameLeft}>Support SAMA GOX</Text>
            <Text style={styles.contactSubLeft}>WhatsApp / Email disponible</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionBtnGreen}
            onPress={() => Linking.openURL('mailto:support@samagox.sn')}
          >
            <Text style={styles.actionBtnText}>Nous écrire</Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Questions fréquentes */}
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Section 3: Formulaire de contact */}
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <View style={styles.formCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre problème ou suggestion..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={16} color="white" />
            <Text style={styles.sendButtonText}>Envoyer le message</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white', 
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' 
  },
  backBtn: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 16, marginBottom: 12, letterSpacing: 0.1 },
  
  // Grille Horizontale des numéros d'urgence
  contactsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  contactCard: { 
    flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.01, shadowRadius: 4 },
      android: { elevation: 0.5 }
    })
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  contactName: { fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  contactSub: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 2, marginBottom: 10 },
  
  phoneBadgeRed: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  phoneTextRed: { color: 'white', fontSize: 13, fontWeight: '700' },
  phoneBadgeBlue: { backgroundColor: '#0284c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  phoneTextBlue: { color: 'white', fontSize: 12, fontWeight: '700' },

  // Ligne de support EcoWaste
  contactCardRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 12,
  },
  contactNameLeft: { fontSize: 14, fontWeight: '700', color: '#166534' },
  contactSubLeft: { fontSize: 11, color: '#64748b', marginTop: 1 },
  actionBtnGreen: { backgroundColor: '#166534', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },

  // FAQ Accordéons
  faqContainer: { gap: 8, marginBottom: 8 },
  faqItem: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  faqQuestion: { fontSize: 13, fontWeight: '600', color: '#1e293b', flex: 1, paddingRight: 8 },
  faqBody: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  faqAnswer: { fontSize: 13, color: '#475569', lineHeight: 20 },

  // Formulaire de message
  formCard: { 
    backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 6 },
      android: { elevation: 1 }
    })
  },
  textArea: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 14, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, height: 100 },
  sendButton: { backgroundColor: '#166534', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sendButtonText: { color: 'white', fontSize: 14, fontWeight: '700' }
});