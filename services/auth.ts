import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAuth = async (
  token: string,
  user: { name: string; email: string; id: number; role?: string }
) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  // ✅ Sauvegarder le rôle séparément pour y accéder facilement
  if (user.role) {
    await AsyncStorage.setItem('role', user.role);
  }
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

export const getUser = async (): Promise<{
  name: string; email: string; id: number; role?: string
} | null> => {
  const raw = await AsyncStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const getRole = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('role');
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  await AsyncStorage.removeItem('role');
};