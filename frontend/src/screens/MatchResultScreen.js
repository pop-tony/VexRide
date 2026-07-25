import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';
import { ZapIcon, PinIcon, FlagIcon, ClockIcon, CardIcon, TrackingIcon } from '../components/Icons';

const heroImage = require('../../assets/images/vex_map_bg_1784946439656.jpg');

export default function MatchResultScreen({ navigation, route }) {
  const { origin, destination, time, match, request } = route.params || {};
  const [currentMatch, setCurrentMatch] = useState(match);
  const [status, setStatus] = useState(match ? 'Match ready' : 'Searching for a rider nearby...');
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
      try { const result = await getJson(`/match/${currentMatch.id}/live`); if (result.liveLocationState) setCurrentMatch(prev => ({ ...prev, liveLocationState: result.liveLocationState })); }
      catch (e) { console.warn(e); }
    }
    loadLiveState();
  }, [currentMatch?.id]);

  const liveLocationState = currentMatch?.liveLocationState;

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="w-full max-w-md self-center py-2">

        {/* Screen Title */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2.5">
            <View className="w-9 h-9 rounded-2xl bg-[#00f2fe]/20 border border-[#00f2fe]/40 items-center justify-center">
              <ZapIcon size={18} color="#00f2fe" />
            </View>
            <Text className="text-xl font-black text-white">Ride Match</Text>
          </View>
          <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-1 rounded-full">
            <Text className="text-[#00f2fe] font-bold text-[10px] uppercase">
              {currentMatch ? `Match #${currentMatch.id}` : 'Searching'}
            </Text>
          </View>
        </View>

        {/* Live Map Card */}
        <View className="mb-4 rounded-3xl overflow-hidden border border-[#00f2fe]/30 shadow-2xl bg-[#0b172a]">
          <LiveLocationMap liveLocationState={liveLocationState} title="Your live match map" height={220} />
        </View>

        {/* Route Summary Cards */}
        <View className="bg-[#0b172a]/95 rounded-3xl p-5 border border-[#00f2fe]/20 shadow-xl mb-4">
          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <PinIcon size={18} color="#00f2fe" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Pick-up Origin</Text>
              <Text className="text-white text-sm font-extrabold">{origin || activeRequest?.origin || request?.origin || 'Downtown'}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <FlagIcon size={18} color="#ff5e36" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Drop-off Destination</Text>
              <Text className="text-white text-sm font-extrabold">{destination || activeRequest?.destination || request?.destination || 'Airport'}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/[0.08] flex-row items-center gap-3">
            <ClockIcon size={18} color="#8eb4c6" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Departure Time</Text>
              <Text className="text-white text-sm font-extrabold">{time || activeRequest?.time || request?.time || '7:30 PM'}</Text>
            </View>
          </View>
        </View>

        {/* Live Status Info Banner */}
        <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 rounded-2xl p-3.5 mb-5 items-center">
          <Text className="text-[#00f2fe] text-xs font-black tracking-wide text-center">{status}</Text>
          {liveLocationState?.pickupSummary ? (
            <Text className="text-[#ccebf5] text-xs text-center mt-1 leading-4">{liveLocationState.pickupSummary}</Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center shadow-xl mb-3 flex-row justify-center gap-2 ${
            !currentMatch ? 'bg-[#ff5e36]/40 border border-[#ff5e36]/30' : 'bg-[#ff5e36] border border-[#ff5e36]/60 active:scale-98'
          }`}
          onPress={() => navigation.navigate('Payment', { amount: 24, matchId: currentMatch?.id })}
          disabled={!currentMatch}
        >
          <CardIcon size={18} color="#ffffff" />
          <Text className="text-white font-black text-base tracking-wide">
            {currentMatch ? 'Continue to Payment' : 'Waiting for Match...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-[#00f2fe]/50 bg-[#00f2fe]/10 py-3.5 rounded-2xl items-center flex-row justify-center gap-2 active:bg-[#00f2fe]/20 shadow-md"
          onPress={() => navigation.navigate('RideTracking')}
        >
          <TrackingIcon size={16} color="#00f2fe" />
          <Text className="text-[#00f2fe] font-extrabold text-sm">Open Live Tracking</Text>
        </TouchableOpacity>

      </View>
    </ScreenLayout>
  );
}