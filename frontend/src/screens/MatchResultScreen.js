import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { getJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';

const heroImage = { uri: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80' };

export default function MatchResultScreen({ navigation, route }) {
  const { origin, destination, time, match, request } = route.params || {};
  const [currentMatch, setCurrentMatch] = useState(match);
  const [status, setStatus] = useState(match? 'Match ready' : 'Searching for a rider nearby...');
  const [activeRequest, setActiveRequest] = useState(request);

  useEffect(() => {
    const cleanup = onSocket('matchFound', ({ matchId, request, liveLocationState }) => {
      setCurrentMatch({ id: matchId, liveLocationState }); setActiveRequest(request); setStatus('Live match found!');
    });
    return cleanup;
  }, []);

  useEffect(() => {
    async function loadLiveState() {
      if (!currentMatch?.id || currentMatch?.liveLocationState) return;
      try { const result = await getJson(`/match/${currentMatch.id}/live`); if (result.liveLocationState) setCurrentMatch(prev => ({...prev, liveLocationState: result.liveLocationState })); }
      catch (e) { console.warn(e); }
    }
    loadLiveState();
  }, [currentMatch?.id]);

  const liveLocationState = currentMatch?.liveLocationState;

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} className="flex-1">
        <View className="absolute inset-0 bg-[#04142c]/70" />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} className="flex-1">
          <View className="w-full max-w-md self-center">
            <Text className="text-[#21d3c7] text- font-black mb-5">Ride match</Text>

            <View className="mb-4 rounded- overflow-hidden border border-[#21d3c7]/20">
              <LiveLocationMap liveLocationState={liveLocationState} title="Your live match map" height={220} />
            </View>

            {[
              ['Origin', origin || activeRequest?.origin || request?.origin || 'Downtown'],
              ['Destination', destination || activeRequest?.destination || request?.destination || 'Airport'],
              ['Time', time || activeRequest?.time || request?.time || '7:30 PM'],
            ].map(([label, val]) => (
              <View key={label} className="bg-white/5 rounded- p-4 mb-3 border border-[#21d3c7]/20">
                <Text className="text-[#a8d6e8] text-sm mb-1">{label}</Text>
                <Text className="text-white text-lg font-bold">{val}</Text>
              </View>
            ))}

            <Text className="text-[#d4f5ff] text-base font-bold my-4 text-center">{currentMatch? `Match ID ${currentMatch.id}` : 'Waiting for the best match...'}</Text>
            <Text className="text-[#cfe8f5] text- mb-5 text-center">{status}</Text>
            {liveLocationState?.pickupSummary? <Text className="text-[#9ddae0] mb-5 text-center leading-5">{liveLocationState.pickupSummary}</Text> : null}

            <TouchableOpacity className={`p-4 rounded- items-center ${!currentMatch? 'bg-[#ff7a1a]/50' : 'bg-[#ff7a1a]'}`} onPress={() => navigation.navigate('Payment', { amount: 24, matchId: currentMatch?.id })} disabled={!currentMatch}>
              <Text className="text-white font-extrabold text-base">{currentMatch? 'Continue to payment' : 'Waiting...'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border border-[#21d3c7] p-4 rounded- items-center mt-3" onPress={() => navigation.navigate('RideTracking')}>
              <Text className="text-[#21d3c7] font-extrabold text-">Open live tracking</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}