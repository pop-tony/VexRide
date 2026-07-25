import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';
import { SearchIcon, PinIcon, FlagIcon, ClockIcon, ZapIcon } from '../components/Icons';

const heroImage = require('../../assets/images/vex_map_bg_1784946439656.jpg');

export default function FindRideScreen({ navigation, route }) {
  const [origin, setOrigin] = useState('Madina');
  const [destination, setDestination] = useState('University of Ghana');
  const [time, setTime] = useState('9:30 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [APP_USER, setAPP_USER] = useState({});

  useEffect(() => { (async () => { setAPP_USER(await getStoredUser()) })() }, []);

  async function handleFindRide() {
    try {
      setLoading(true); setError('');
      const data = await postJson('/findRide', { origin: origin.trim(), destination: destination.trim(), time: time.trim(), userName: APP_USER.name, userEmail: APP_USER.email });
      navigation.navigate('MatchResult', { origin, destination, time, match: data.match, request: data.request });
    } catch (err) { setError(err.message || 'Could not find a ride'); } finally { setLoading(false); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="flex-1 justify-center py-2">
        <View className="w-full max-w-md self-center bg-[#0b172a]/95 rounded-3xl p-5 md:p-6 border border-[#00f2fe]/30 shadow-2xl backdrop-blur-xl">

          {/* Header */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-2xl bg-[#00f2fe]/20 border border-[#00f2fe]/40 items-center justify-center flex-shrink-0">
              <SearchIcon size={20} color="#00f2fe" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-xl font-black text-white">Find Your Ride</Text>
              <Text className="text-[#8eb4c6] text-xs">Search live shared routes nearby</Text>
            </View>
          </View>

          {/* Visual Connected Route Card */}
          <View className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08] mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <PinIcon size={18} color="#00f2fe" />
              <View className="flex-1 min-w-0">
                <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Pick-up Origin</Text>
                <TextInput
                  className="text-white font-extrabold text-sm md:text-base p-0 py-1"
                  placeholder="Enter pickup location"
                  placeholderTextColor="#688ca0"
                  value={origin}
                  onChangeText={setOrigin}
                />
              </View>
            </View>

            <View className="h-4 w-0.5 bg-[#00f2fe]/40 ml-2 my-[-2px]" />

            <View className="flex-row items-center gap-3">
              <FlagIcon size={18} color="#ff5e36" />
              <View className="flex-1 min-w-0">
                <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Drop-off Destination</Text>
                <TextInput
                  className="text-white font-extrabold text-sm md:text-base p-0 py-1"
                  placeholder="Enter destination"
                  placeholderTextColor="#688ca0"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>
          </View>

          {/* Departure Time */}
          <View className="mb-5">
            <Text className="text-[#c9e5f4] text-xs font-extrabold mb-1.5">Departure Time</Text>
            <View className="bg-white/[0.06] rounded-2xl px-4 py-3 border border-white/[0.12] flex-row items-center gap-2.5">
              <ClockIcon size={18} color="#8eb4c6" />
              <TextInput
                className="flex-1 text-white font-extrabold text-sm p-0"
                placeholder="e.g. 9:30 AM"
                placeholderTextColor="#688ca0"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-[#ff5e36]/15 border border-[#ff5e36]/40 p-3 rounded-2xl mb-4">
              <Text className="text-[#ff7a5c] font-bold text-xs text-center">{error}</Text>
            </View>
          ) : null}

          {/* Submit Action */}
          <TouchableOpacity
            className={`py-3.5 rounded-2xl items-center shadow-xl flex-row justify-center gap-2 ${
              loading ? 'bg-[#ff5e36]/50' : 'bg-[#ff5e36] border border-[#ff5e36]/60 active:scale-98'
            }`}
            onPress={handleFindRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <ZapIcon size={18} color="#ffffff" />
                <Text className="text-white font-black text-sm md:text-base tracking-wide">Search Matches</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </ScreenLayout>
  );
}