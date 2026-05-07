import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions
} from "react-native";

const { width, height } = Dimensions.get('window');

interface Depot {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  description: string;
  type: 'sauvage' | 'collecte';
  status?: 'signalé' | 'en_cours' | 'résolu';
  distance?: string;
}

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<'tous' | 'sauvage' | 'collecte'>('tous');
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);

  // Points de collecte mockés
  const [depots] = useState<Depot[]>([
    {
      id: '1',
      latitude: 48.8566,
      longitude: 2.3522,
      title: 'Dépôt sauvage - Plastiques',
      address: 'Rue de Rivoli, 75001 Paris',
      description: 'Sac de plastiques et canettes',
      type: 'sauvage',
      status: 'signalé',
      distance: '200m'
    },
    {
      id: '2',
      latitude: 48.8576,
      longitude: 2.3532,
      title: 'Point de collecte - Verre',
      address: 'Place de l\'Hôtel de Ville, 75004 Paris',
      description: 'Conteneurs à verre',
      type: 'collecte',
      distance: '450m'
    },
    {
      id: '3',
      latitude: 48.8556,
      longitude: 2.3512,
      title: 'Dépôt sauvage - Encombrants',
      address: 'Rue Saint-Antoine, 75004 Paris',
      description: 'Matelas et meubles',
      type: 'sauvage',
      status: 'en_cours',
      distance: '350m'
    },
    {
      id: '4',
      latitude: 48.8586,
      longitude: 2.3542,
      title: 'Point de collecte - Électronique',
      address: 'Rue de la Verrerie, 75004 Paris',
      description: 'Bornes pour petits appareils',
      type: 'collecte',
      distance: '600m'
    },
    {
      id: '5',
      latitude: 48.8546,
      longitude: 2.3562,
      title: 'Point de collecte - Textile',
      address: 'Rue des Francs Bourgeois, 75004 Paris',
      description: 'Conteneurs pour vêtements',
      type: 'collecte',
      distance: '800m'
    },
    {
      id: '6',
      latitude: 48.8596,
      longitude: 2.3502,
      title: 'Dépôt sauvage - Déchets verts',
      address: 'Boulevard Beaumarchais, 75011 Paris',
      description: 'Branchages et tontes',
      type: 'sauvage',
      status: 'signalé',
      distance: '550m'
    },
  ]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.log('Erreur géolocalisation:', error);
          setLoading(false);
          setLocation({ lat: 48.8566, lng: 2.3522 });
        }
      );
    } else {
      setLoading(false);
      setLocation({ lat: 48.8566, lng: 2.3522 });
    }
  };

  const openMap = (lat: number, lng: number, title: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const filteredDepots = depots.filter(depot => {
    if (selectedType === 'tous') return true;
    return depot.type === selectedType;
  }).filter(depot =>
    searchQuery === "" || 
    depot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    depot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string, status?: string) => {
    if (type === 'collecte') return '#10b981';
    if (status === 'résolu') return '#94a3b8';
    if (status === 'en_cours') return '#f59e0b';
    return '#ef4444';
  };

  const getTypeIcon = (type: string) => {
    return type === 'collecte' ? 'trash-bin' : 'warning';
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'signalé': return 'Signalé';
      case 'en_cours': return 'En cours de traitement';
      case 'résolu': return 'Résolu';
      default: return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Récupération de votre position...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Points de collecte</Text>
        <TouchableOpacity onPress={getLocation} style={styles.locationButton}>
          <Ionicons name="locate" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un lieu..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'tous' && styles.filterChipActive]}
          onPress={() => setSelectedType('tous')}
        >
          <Text style={[styles.filterText, selectedType === 'tous' && styles.filterTextActive]}>
            Tous ({depots.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'sauvage' && styles.filterChipActive]}
          onPress={() => setSelectedType('sauvage')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.filterText, selectedType === 'sauvage' && styles.filterTextActive]}>
            Dépôts sauvages ({depots.filter(d => d.type === 'sauvage').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'collecte' && styles.filterChipActive]}
          onPress={() => setSelectedType('collecte')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.filterText, selectedType === 'collecte' && styles.filterTextActive]}>
            Points de collecte ({depots.filter(d => d.type === 'collecte').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Mini carte aperçu */}
      {location && (
        <TouchableOpacity 
          style={styles.mapPreview}
          onPress={() => {
            if (filteredDepots.length > 0) {
              openMap(filteredDepots[0].latitude, filteredDepots[0].longitude, filteredDepots[0].title);
            } else if (location) {
              openMap(location.lat, location.lng, 'Ma position');
            }
          }}
        >
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color="#166534" />
            <Text style={styles.mapPlaceholderText}>Cliquez pour voir la carte complète</Text>
            <Text style={styles.mapPlaceholderSubText}>{filteredDepots.length} points à proximité</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Liste des points */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>À proximité</Text>
        {filteredDepots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Aucun point trouvé</Text>
          </View>
        ) : (
          filteredDepots.map((depot) => (
            <TouchableOpacity 
              key={depot.id} 
              style={styles.lieuCard}
              onPress={() => setSelectedDepot(selectedDepot?.id === depot.id ? null : depot)}
            >
              <View style={styles.lieuCardHeader}>
                <View style={[styles.lieuIcon, { backgroundColor: `${getTypeColor(depot.type, depot.status)}15` }]}>
                  <Ionicons name={getTypeIcon(depot.type)} size={24} color={getTypeColor(depot.type, depot.status)} />
                </View>
                <View style={styles.lieuInfo}>
                  <Text style={styles.lieuName}>{depot.title}</Text>
                  <Text style={styles.lieuAddress}>{depot.address}</Text>
                  <View style={styles.lieuTags}>
                    {depot.distance && (
                      <Text style={styles.lieuDistance}>📍 {depot.distance}</Text>
                    )}
                    {depot.type === 'sauvage' && depot.status && (
                      <View style={[styles.statusBadge, { backgroundColor: `${getTypeColor(depot.type, depot.status)}15` }]}>
                        <Text style={[styles.statusText, { color: getTypeColor(depot.type, depot.status) }]}>
                          {getStatusLabel(depot.status)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color="#cbd5e1" />
              </View>
              
              {selectedDepot?.id === depot.id && (
                <View style={styles.lieuCardFooter}>
                  <Text style={styles.lieuDescription}>{depot.description}</Text>
                  <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => openDirections(depot.latitude, depot.longitude)}
                  >
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.directionButtonText}>Y aller</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bouton flottant pour signaler */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/report")}
      >
        <Ionicons name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FBF7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1e293b',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#166534',
  },
  filterText: {
    fontSize: 13,
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapPreview: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  mapPlaceholderSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  lieuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  lieuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  lieuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lieuInfo: {
    flex: 1,
  },
  lieuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  lieuAddress: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  lieuTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lieuDistance: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  lieuCardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  lieuDescription: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  directionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});