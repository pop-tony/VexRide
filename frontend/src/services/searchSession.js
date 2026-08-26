import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_SESSION_KEY = 'vex-active-search';

export async function saveSearchSession(search) {
  await AsyncStorage.setItem(SEARCH_SESSION_KEY, JSON.stringify(search));
}

export async function getSearchSession() {
  const value = await AsyncStorage.getItem(SEARCH_SESSION_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearSearchSession() {
  await AsyncStorage.removeItem(SEARCH_SESSION_KEY);
}
