import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { API_URL } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Citoyen");
  const [stats, setStats] = useState({
    reportsCount: 0,
    points: 0,
    nextPickup: "Aucun"
  });
  const [loading, setLoading] = useState(true);

  // Charger les données au chargement de la page
  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      // Récupérer les infos utilisateur (à adapter selon ton API)
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          'Accept': 'application/json',
          // Ajouter token si authentification
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.name) setUserName(data.name.split(' ')[0]);
      }
    } catch (error) {
      console.log('Erreur chargement user:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Récupérer les stats (à adapter selon ton API)
      const response = await fetch(`${API_URL}/my-reports`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          reportsCount: data.data?.length || 0,
          points: (data.data?.length || 0) * 10,
          nextPickup: getNextPickupDay()
        });
      }
    } catch (error) {
      console.log('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextPickupDay = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay() - 1] || 'Vendredi';
  };

  const services = [
    { 
      id: 1, 
      name: "Points de collecte", 
      icon: "map", 
      color: "#10b981",
      route: "/map",
      description: "Trouver le point le plus proche"
    },
    { 
      id: 2, 
      name: "Horaires", 
      icon: "time", 
      color: "#3b82f6",
      route: "/calendrier",
      description: "Prochains passages"
    },
    { 
      id: 3, 
      name: "Guide de tri", 
      icon: "book", 
      color: "#f59e0b",
      route: "/guide",
      description: "Bien trier ses déchets"
    },
    { 
      id: 4, 
      name: "Mes points", 
      icon: "star", 
      color: "#8b5cf6",
      route: "/points",
      description: "Mon impact écologique"
    }
  ];

  const handleServicePress = (route: string) => {
    router.push(route);
  };

  const handleReportPress = () => {
    router.push("/report");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec bienvenue */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#166534" />
            <View style={styles.notificationBadge} />
          </View>
        </View>

        {/* Carte de signalement */}
        <TouchableOpacity style={styles.alertCard} onPress={handleReportPress}>
          <View style={styles.alertIconContainer}>
            <Ionicons name="warning" size={32} color="#fff" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Signaler un dépôt sauvage</Text>
            <Text style={styles.alertDescription}>
              Prenez une photo et décrivez le problème
            </Text>
            <View style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Signaler →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Statistiques rapides */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.reportsCount}</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.points}</Text>
            <Text style={styles.statLabel}>Points éco</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.nextPickup}</Text>
            <Text style={styles.statLabel}>Prochain passage</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesHeader}>
          <Text style={styles.sectionTitle}>Nos services</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service.route)}
            >
              <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
                <Ionicons name={service.icon as any} size={28} color={service.color} />
              </View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Derniers signalements dans le quartier */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>🚨 Dans votre quartier</Text>
          <View style={styles.recentCard}>
            <View style={styles.recentHeader}>
              <Ionicons name="location" size={16} color="#ef4444" />
              <Text style={styles.recentLocation}>Médina, à 200m</Text>
              <Text style={styles.recentTime}>Il y a 2h</Text>
            </View>
            <Text style={styles.recentText}>
              Dépôt sauvage de gravats rue 10
            </Text>
            <View style={styles.recentStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>En cours de traitement</Text>
            </View>
          </View>
        </View>

        {/* Espacement bas */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FBF7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FBF7",
  },
  loadingText: {
    marginTop: 10,
    color: "#166534",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  notificationIcon: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  // Carte alerte
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#166534",
    margin: 20,
    marginTop: 10,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  alertIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  alertDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 10,
  },
  alertButton: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertButtonText: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 12,
  },
  // Statistiques
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#166534",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  // Services
  servicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  seeAll: {
    color: "#166534",
    fontSize: 14,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    gap: 15,
  },
  serviceCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#64748b",
  },
  // Section récente
  recentSection: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  recentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recentLocation: {
    fontSize: 13,
    color: "#ef4444",
    marginLeft: 4,
    flex: 1,
  },
  recentTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  recentText: {
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 10,
  },
  recentStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#f59e0b",
  },
});
