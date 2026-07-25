import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1555375771-1f10f2359ecf?auto=format&fit=crop&w=1400&q=80' };

export default function FindRideScreen({ navigation, route }) {
  const [origin, setOrigin] = useState('Madina');
  const [destination, setDestination] = useState('University of Ghana');
  const [time, setTime] = useState('9:30 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [APP_USER, setAPP_USER] = useState({});

  useEffect(()=>{ (async()=>{ setAPP_USER(await getStoredUser()) })() },[]);

  async function handleFindRide() {
    try {
      setLoading(true); setError('');
      const data = await postJson('/findRide', { origin: origin.trim(), destination: destination.trim(), time: time.trim(), userName: APP_USER.name, userEmail: APP_USER.email });
      navigation.navigate('MatchResult', { origin, destination, time, match: data.match, request: data.request });
    } catch (err) { setError(err.message || 'Could not find a ride'); } finally { setLoading(false); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} className="flex-1 bg-[#061426]">
        <View className="absolute inset-0 bg-[#061426]/40" />
        <View className="flex-1 justify-center p-6">
          <View className="w-full max-w-md self-center bg-[#081936]/95 rounded- p-6 border border-[#ff7a1a]/20">
            <Text className="text- font-black text-[#21d3c7] mb-2">Find your next ride</Text>
            <Text className="text-[#c9e5f4] mb-6 leading-6">Enter your route and catch the best shared trip instantly.</Text>

            <Text className="text-[#c9e5f4] text- font-bold mb-2">Origin</Text>
            <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Origin" placeholderTextColor="#9bb1ca" value={origin} onChangeText={setOrigin} />
            <Text className="text-[#c9e5f4] text- font-bold mb-2">Destination</Text>
            <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Destination" placeholderTextColor="#9bb1ca" value={destination} onChangeText={setDestination} />
            <Text className="text-[#c9e5f4] text- font-bold mb-2">Time</Text>
            <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Time (e.g. 7:30 PM)" placeholderTextColor="#9bb1ca" value={time} onChangeText={setTime} />

            {error? <Text className="text-[#ff9a5f] font-bold mb-3">{error}</Text> : null}

            <TouchableOpacity className="bg-[#ff7a1a] p-4 rounded-2xl mt-2 items-center" onPress={handleFindRide} disabled={loading}>
              {loading? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-extrabold text-base">Find Match</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}