import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import LogoutConfirm from '../components/LogoutConfirm';
import { onSocket } from '../services/socket';
import { getStoredUser, logoutUser } from '../services/user';
import ScreenLayout from '../components/ScreenLayout';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1400&q=80' };

export default function HomeScreen({ navigation, route }) {
  const [alerts, setAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => { (async()=>{ setCurrentUser(await getStoredUser()) })() }, []);
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true })
    ])).start();
  }, []);
  useEffect(() => {
    const cleanups = [
      onSocket('rideMatched', ({ origin, destination }) => setAlerts(prev => [`New live match: ${origin} → ${destination}`,...prev].slice(0, 5))),
      onSocket('groupCreated', ({ group }) => setAlerts(prev => [`New group: ${group.origin} → ${group.location}`,...prev].slice(0, 5))),
      onSocket('groupRideBooked', ({ ride }) => setAlerts(prev => [`Ride booked: ${ride.provider} arrives in ${ride.eta}`,...prev].slice(0, 5)))
    ];
    return () => cleanups.forEach(fn => fn());
  }, []);

  async function handleLogout() {
    try { setLoggingOut(true); await logoutUser(); navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })); } finally { setLoggingOut(false); }
  }

  const heroScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  return (
    <ScreenLayout navigation={navigation} route={route} className="bg-dark">
      <View className="flex-1 bg-[#061426]">
        {currentUser && (
          <View className="bg-[#0a2f47] px-6 py-3 flex-row justify-between items-center border-b border-[#21d3c7]/20">
            <View className="flex-1">
              <Text className="text-base font-extrabold text-[#21d3c7] mb-0.5">{currentUser.name}</Text>
              <Text className="text- text-[#8eb4c6]">{currentUser.email}</Text>
            </View>
            <LogoutConfirm onLogout={handleLogout} loading={loggingOut} renderTrigger={({ open, disabled }) => (
              <TouchableOpacity className="bg-[#ff7a1a]/15 px-3 py-2 rounded-xl border border-[#ff7a1a]/30" onPress={open} disabled={disabled}>
                {disabled? <ActivityIndicator color="white" size="small" /> : <Text className="text-[#ff7a1a] font-bold text-">Logout</Text>}
              </TouchableOpacity>
            )} />
          </View>
        )}

        <ImageBackground source={heroImage} className="w-full h- mb-4">
          <View className="absolute inset-0 bg-[#061426]/40 rounded-b-" />
          <Animated.View style={{ transform: [{ scale: heroScale }] }} className="absolute left-5 right-5 bottom-6 p-5 rounded-3xl bg-[#032543]/90 border border-[#21d3c7]/20">
            <Text className="text- font-black text-white mb-2">Ride modern</Text>
            <Text className="text-[#cfe9f2] leading-6">Connect with nearby riders, share trips, and pay with confidence.</Text>
          </Animated.View>
        </ImageBackground>

        <View className="px-6 mb-4 flex-row flex-wrap gap-3">
          <TouchableOpacity className="flex-1 min-w- bg-[#21d3c7] p-4 rounded-2xl items-center" onPress={() => navigation.navigate('FindRide')}>
            <Text className="text-white font-extrabold text-base">Find Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 min-w- bg-[#ff7a1a] p-4 rounded-2xl items-center" onPress={() => navigation.navigate('CreateGroup')}>
            <Text className="text-white font-extrabold text-base">Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-full sm:w-full border-[#21d3c7] p-4 rounded-2xl items-center" onPress={() => navigation.navigate('BrowseGroups')}>
            <Text className="text-[#21d3c7] font-extrabold text-base">Browse Groups</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[#d4f3fb] text-lg font-bold mb-3 ml-6">Live feed</Text>
        <View className="flex-1 bg-[#071b2f] rounded-t- p-6">
          {alerts.length === 0? <Text className="text-[#e8f9ff] text-">Waiting for fresh matches and group updates...</Text> :
            alerts.map((alert, index) => (
              <View key={index} className="bg-[#0e3a5a] rounded-2xl p-4 mb-3">
                <Text className="text-[#e8f9ff] text-">{alert}</Text>
              </View>
            ))}
        </View>
      </View>
    </ScreenLayout>
  );
}