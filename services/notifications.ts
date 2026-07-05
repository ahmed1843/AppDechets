// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_URL } from "../services/api";
import { getToken } from "../services/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ✅ Détecte si l'app tourne dans Expo Go (vs un build natif/EAS)
const isExpoGo = Constants.appOwnership === 'expo';

// ✅ SOURCE UNIQUE pour l'enregistrement des push notifications.
// Avant, cette logique était dupliquée à 3 endroits différents (notifications.ts, login.tsx, index.tsx)
// avec des comportements incohérents (canal Android absent dans certaines versions, guard Expo Go absent
// dans d'autres, source du projectId différente). Toute la logique vit maintenant ici, appelée
// depuis login.tsx et index.tsx, garantissant un comportement identique partout dans l'app.
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

  // ✅ Guard : Expo Go (SDK 53+) ne supporte plus les push notifications distantes.
  if (isExpoGo) {
    console.log('ℹ️ Push notifications désactivées (Expo Go) — polling actif en fallback');
    return undefined;
  }

  if (!Device.isDevice) {
    console.log('ℹ️ Push notifications indisponibles sur simulateur/émulateur');
    return undefined;
  }

  // ✅ Canal de notification Android — requis sur Android 8+ pour un affichage correct
  // (son, vibration, importance). Auparavant configuré uniquement dans index.tsx,
  // donc absent si l'enregistrement se déclenchait d'abord via login.tsx.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('truck-alerts', {
      name: 'Alertes camion poubelle',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#166534',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('⚠️ Permission de notification refusée');
    return undefined;
  }

  // ✅ try/catch pour éviter un crash si le réseau est instable
  try {
    // ✅ projectId : convention standard EAS (Constants.expoConfig), avec fallback
    // sur la variable d'environnement utilisée précédemment dans index.tsx.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenData.data;
    console.log('📱 Token mobile:', token);
  } catch (error) {
    console.log('⚠️ Impossible de récupérer le token push (réseau indisponible), polling reste actif:', error);
    return undefined;
  }

  return token;
}

export async function savePushToken(token: string) {
  const authToken = await getToken();

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

// ✅ Fonction pratique combinant enregistrement + sauvegarde en un seul appel,
// pour éviter que chaque écran (login, index...) ait à répéter les deux étapes manuellement.
export async function registerAndSavePushToken() {
  const token = await registerForPushNotificationsAsync();
  if (token) {
    await savePushToken(token);
  }
  return token;
}

export async function assignStreet(street: string) {
  const authToken = await getToken();

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

export function showWebNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body });
    console.log(`🔔 Notification: ${title}`);
  }
}