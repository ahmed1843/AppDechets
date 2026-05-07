// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Plus besoin de modifier cette ligne quand tu changes de Wifi !
import API_URL from "../services/api";


// Configuration des notifications - Version corrigée
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,   // ← Ajouté
    shouldShowList: true,     // ← Ajouté
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        token = 'web-token-' + Date.now();
        console.log('🔔 Token web généré:', token);
      }
    }
    return token;
  }

  // Pour mobile (si tu ajoutes plus tard)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Impossible d\'obtenir les permissions de notification');
      return;
    }
    
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log('📱 Token mobile:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token?.data;
}

export async function savePushToken(token: string) {
  const authToken = localStorage.getItem('token');
  
  if (!authToken) {
    console.log('❌ Pas de token d\'authentification');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/save-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    console.log('📥 Réponse save-push-token:', data);
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde token:', error);
  }
}

export async function assignStreet(street: string) {
  const authToken = localStorage.getItem('token');
  
  if (!authToken) {
    console.log('❌ Pas de token d\'authentification');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/assign-street`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ street })
    });
    
    const data = await response.json();
    console.log('📥 Réponse assign-street:', data);
    
  } catch (error) {
    console.error('❌ Erreur assignation rue:', error);
  }
}

// Fonction pour afficher une notification web
export function showWebNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body });
    console.log(`🔔 Notification: ${title}`);
  }
}