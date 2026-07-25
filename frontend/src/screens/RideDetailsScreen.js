import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';
import { CheckIcon, CarIcon, UserIcon, ClockIcon, HomeIcon, ChatIcon } from '../components/Icons';

const heroImage = require('../../assets/images/vex_home_bg_1784946351687.jpg');

export default function RideDetailsScreen({ navigation, route }) {
  const ride = route.params?.ride || {};
  const matchId = route.params?.matchId || ride.matchId || ride.id;
  const [liveLocationState, setLiveLocationState] = useState(route.params?.liveLocationState || ride.liveLocationState || null);

  useEffect(() => {
    let active = true;

    async function loadLiveState() {
      if (!matchId || liveLocationState) return;
      try {
        const result = await getJson(`/match/${matchId}/live`);
        if (!active) return;
        if (result.liveLocationState) {
          setLiveLocationState(result.liveLocationState);
        }
      } catch (error) {
        console.warn(error);
      }
    }

    loadLiveState();
    return () => {
      active = false;
    };
  }, [matchId, liveLocationState]);

  const rideStatus = String(ride.status || '').toLowerCase() === 'confirmed'
    ? 'fulfilled'
    : String(ride.status || '').toLowerCase() === 'cancelled'
      ? 'cancelled'
      : 'pending';

  const details = [
    ['Ride Provider', ride.provider || 'Uber/Bolt Mock', CarIcon],
    ['Assigned Driver', ride.driver || 'Ava', UserIcon],
    ['Vehicle Model', ride.car || 'Tesla Model 3', CarIcon],
    ['Estimated Arrival (ETA)', ride.eta || '4 mins', ClockIcon],
    ['License Plate', ride.license || 'LXB-9824', CheckIcon],
  ];

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="w-full max-w-md self-center py-2">

        {/* Banner Title */}
        <View className="items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]/50 items-center justify-center mb-3 shadow-xl">
            <CheckIcon size={24} color="#00f2fe" />
          </View>
          <Text className="text-2xl font-black text-white">Ride Confirmed!</Text>
          <Text className="text-[#8eb4c6] text-xs mt-1">Your driver is en route to your pick-up spot</Text>
        </View>

        <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between">
          <Text className="text-white font-bold text-xs uppercase tracking-widest">Ride Status</Text>
          <View className={`px-3 py-1 rounded-full ${rideStatus === 'fulfilled' ? 'bg-[#00f2fe]' : rideStatus === 'cancelled' ? 'bg-[#ff5e36]' : 'bg-[#f5b700]'}`}>
            <Text className={`font-black text-[10px] uppercase ${rideStatus === 'fulfilled' ? 'text-[#050c1a]' : 'text-white'}`}>{rideStatus}</Text>
          </View>
        </View>

        <View className="mb-5 rounded-3xl overflow-hidden border border-[#00f2fe]/30 shadow-2xl bg-[#0b172a]">
          <LiveLocationMap liveLocationState={liveLocationState} title="Ride map" height={220} />
        </View>

        {/* Details Card Grid */}
        <View className="bg-[#0b172a]/95 rounded-3xl p-5 border border-[#00f2fe]/30 shadow-2xl mb-5 backdrop-blur-xl">
          {details.map(([label, val, DetailIcon]) => (
            <View key={label} className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
              <DetailIcon size={18} color="#00f2fe" />
              <View className="flex-1 min-w-0">
                <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">{label}</Text>
                <Text className="text-white text-base font-extrabold">{val}</Text>
              </View>
            </View>
          ))}
        </View>

        {matchId ? (
          <TouchableOpacity
            className="bg-[#00f2fe]/10 border border-[#00f2fe]/40 p-4 rounded-2xl items-center shadow-xl active:bg-[#00f2fe]/20 flex-row justify-center gap-2 mb-3"
            onPress={() => navigation.navigate('Chat', { matchId, ride, liveLocationState })}
          >
            <ChatIcon size={18} color="#00f2fe" />
            <Text className="text-[#00f2fe] font-black text-base tracking-wide">Open Chat</Text>
          </TouchableOpacity>
        ) : null}

        {/* Back Home Action */}
        <TouchableOpacity
          className="bg-[#ff5e36] border border-[#ff5e36]/60 p-4 rounded-2xl items-center shadow-xl active:scale-98 flex-row justify-center gap-2"
          onPress={() => navigation.navigate('Home')}
        >
          <HomeIcon size={18} color="#ffffff" />
          <Text className="text-white font-black text-base tracking-wide">Back to Home</Text>
        </TouchableOpacity>

      </View>
    </ScreenLayout>
  );
}