import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";

export default function GuideScreen() {
  const router = useRouter();

  const categories = [
    { 
      name: "Déchets verts", 
      icon: "leaf", 
      color: "#10b981", 
      items: ["Tontes de pelouse", "Feuilles mortes", "Branchages", "Plantes fanées"],
      bin: "Bac vert",
      tip: "Ne pas mettre de sacs plastiques"
    },
    { 
      name: "Recyclables", 
      icon: "recycle", 
      color: "#3b82f6", 
      items: ["Bouteilles plastique", "Canettes", "Papiers", "Cartons", "Verre"],
      bin: "Bac jaune",
      tip: "Vider et rincer les contenants"
    },
    { 
      name: "Déchets ménagers", 
      icon: "trash", 
      color: "#64748b", 
      items: ["Restes alimentaires", "Couches", "Essuie-tout", "Cendres"],
      bin: "Bac gris",
      tip: "Bien fermer les sacs"
    },
    { 
      name: "Déchets dangereux", 
      icon: "warning", 
      color: "#ef4444", 
      items: ["Piles", "Médicaments", "Peintures", "Solvants", "Ampoules"],
      bin: "Déchèterie",
      tip: "Ne jamais jeter dans la nature"
    },
    { 
      name: "Encombrants", 
      icon: "cube", 
      color: "#f59e0b", 
      items: ["Meubles", "Électroménager", "Matelas", "Gravats"],
      bin: "Déchèterie",
      tip: "Appeler pour un ramassage spécial"
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Guide de tri</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Ionicons name="bulb-outline" size={32} color="#f59e0b" />
          <Text style={styles.introTitle}>Bien trier, c'est protéger notre environnement</Text>
          <Text style={styles.introText}>
            Chaque geste compte pour un Sénégal plus propre. Suivez ce guide pour bien trier vos déchets.
          </Text>
        </View>

        {/* Catégories */}
        {categories.map((cat, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: `${cat.color}15` }]}>
              <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={24} color="white" />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardName}>{cat.name}</Text>
                <View style={[styles.binBadge, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={[styles.binText, { color: cat.color }]}>{cat.bin}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.sectionLabel}>🗑️ Que jeter ?</Text>
              <View style={styles.itemsList}>
                {cat.items.map((item, i) => (
                  <View key={i} style={styles.itemTag}>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.sectionLabel}>💡 Astuce</Text>
              <Text style={styles.tipText}>{cat.tip}</Text>
            </View>
          </View>
        ))}

        {/* Rappel important */}
        <View style={styles.reminder}>
          <Ionicons name="heart-circle" size={32} color="#166534" />
          <Text style={styles.reminderText}>
            Collecte des déchets tous les jours de 8h à 13h dans votre quartier.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 16, paddingBottom: 40 },
  intro: { backgroundColor: '#fef3c7', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  introTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginTop: 10 },
  introText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: 'white', borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  cardTitleContainer: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  binBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, alignSelf: 'flex-start', marginTop: 6 },
  binText: { fontSize: 12, fontWeight: '600' },
  cardBody: { padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  itemTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  itemText: { fontSize: 13, color: '#1e293b' },
  tipText: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  reminder: { flexDirection: 'row', backgroundColor: '#dcfce7', borderRadius: 16, padding: 16, alignItems: 'center', gap: 12, marginTop: 20 },
  reminderText: { flex: 1, fontSize: 13, color: '#166534', fontWeight: '500' },
});