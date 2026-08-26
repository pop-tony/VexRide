import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getJson, postJson } from '../services/api';
import { getStoredUser } from '../services/user';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';
import { CheckIcon, PinIcon, FlagIcon, ClockIcon, HomeIcon, ChatIcon, UsersIcon } from '../components/Icons';
import ChatUnreadBadge from '../components/ChatUnreadBadge';
import { friendlyError, logError } from '../services/errorHandling';

const heroImage = require('../../assets/images/vex_home_bg_1784946351687.jpg');

export default function RideDetailsScreen({ navigation, route }) {
  const ride = route.params?.ride || {};
  const matchId = route.params?.matchId || ride.matchId || ride.id;
  const [liveLocationState, setLiveLocationState] = useState(route.params?.liveLocationState || ride.liveLocationState || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmingCompleted, setConfirmingCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      const storedUser = await getStoredUser();
      if (active) {
        setCurrentUser(storedUser);
      }
    })();

    async function loadLiveState() {
      if (!matchId || liveLocationState) return;
      try {
        const result = await getJson(`/match/${matchId}/live`);
        if (!active) return;
        if (result.liveLocationState) {
          setLiveLocationState(result.liveLocationState);
        }
      } catch (error) {
        logError('Load ride location', error);
      }
    }

    loadLiveState();
    return () => {
      active = false;
    };
  }, [matchId, liveLocationState]);

  const rideStatus = String(ride.status || '').toLowerCase();
  const rideStatusLabel = rideStatus === 'completed'
    ? 'completed'
    : rideStatus === 'confirmed'
      ? 'confirmed'
      : rideStatus === 'cancelled'
        ? 'cancelled'
        : 'pending';

  const isUser1 = currentUser?.id ? Number(ride.user1_id) === Number(currentUser.id) : true;
  const currentUserName = currentUser?.name || 'You';
  const partnerName = isUser1 ? ride.user2_name || 'Matched rider' : ride.user1_name || 'Matched rider';
  const currentUserCompletion = isUser1 ? ride.user1_completed_confirmed : ride.user2_completed_confirmed;
  const partnerCompletion = isUser1 ? ride.user2_completed_confirmed : ride.user1_completed_confirmed;
  const departureTime = ride.ride_time ? new Date(ride.ride_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'TBD';

  async function handleConfirmRideCompleted() {
    if (!currentUser?.id || !matchId) {
      Alert.alert('Error', 'Unable to confirm ride completion right now.');
      return;
    }

    try {
      setConfirmingCompleted(true);
      const result = await postJson('/confirmRideCompleted', { matchId, userId: currentUser.id });
      if (result.match?.status === 'completed') {
        setCompletionMessage('Both riders confirmed completion. Ride is now completed.');
      } else {
        setCompletionMessage('Your completion confirmation is recorded. Waiting for the other rider.');
      }
    } catch (error) {
      logError('Confirm ride completion', error);
      Alert.alert('Unable to confirm', friendlyError(error, 'Ride completion could not be confirmed. Please try again.'));
    } finally {
      setConfirmingCompleted(false);
    }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="w-full max-w-md self-center py-2">
        <View className="items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]/50 items-center justify-center mb-3 shadow-xl">
            <CheckIcon size={24} color="#00f2fe" />
          </View>
          <Text className="text-2xl font-black text-white">Ride Details</Text>
          <Text className="text-[#8eb4c6] text-xs mt-1">Confirm completion when both riders are done</Text>
        </View>

        <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between">
          <Text className="text-white font-bold text-xs uppercase tracking-widest">Ride Status</Text>
          <View className={`px-3 py-1 rounded-full ${rideStatusLabel === 'completed' ? 'bg-[#00f2fe]' : rideStatusLabel === 'cancelled' ? 'bg-[#ff5e36]' : 'bg-[#f5b700]'}`}>
            <Text className={`font-black text-[10px] uppercase ${rideStatusLabel === 'completed' ? 'text-[#050c1a]' : 'text-white'}`}>{rideStatusLabel}</Text>
          </View>
        </View>

        <View className="mb-5 rounded-3xl overflow-hidden border border-[#00f2fe]/30 shadow-2xl bg-[#0b172a]">
          <LiveLocationMap liveLocationState={liveLocationState} title="Ride map" height={220} />
        </View>

        <View className="bg-[#0b172a]/95 rounded-3xl p-5 border border-[#00f2fe]/30 shadow-2xl mb-5 backdrop-blur-xl">
          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <PinIcon size={18} color="#00f2fe" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Pick-up</Text>
              <Text className="text-white text-base font-extrabold">{ride.pickup_location || 'TBD'}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <FlagIcon size={18} color="#ff5e36" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Drop-off</Text>
              <Text className="text-white text-base font-extrabold">{ride.dropoff_location || 'TBD'}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <UsersIcon size={18} color="#00f2fe" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Riders</Text>
              <Text className="text-white text-sm font-extrabold">{ride.user1_name || 'Rider 1'} and {ride.user2_name || 'Rider 2'}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <ClockIcon size={18} color="#8eb4c6" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Departure Time</Text>
              <Text className="text-white text-base font-extrabold">{departureTime}</Text>
            </View>
          </View>

          <View className="bg-white/[0.04] rounded-2xl p-3.5 mb-2.5 border border-white/[0.08] flex-row items-center gap-3">
            <CheckIcon size={18} color="#00f2fe" />
            <View className="flex-1 min-w-0">
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Completion Confirmation</Text>
              <Text className="text-white text-sm font-extrabold">{currentUserName}: {currentUserCompletion ? 'Confirmed' : 'Pending'}</Text>
              <Text className="text-[#8eb4c6] text-xs mt-0.5">{partnerName}: {partnerCompletion ? 'Confirmed' : 'Pending'}</Text>
            </View>
          </View>
        </View>

        {rideStatusLabel === 'confirmed' ? (
          <TouchableOpacity
            className={`bg-[#00f2fe] border border-[#00f2fe]/60 p-4 rounded-2xl items-center shadow-xl active:scale-98 flex-row justify-center gap-2 mb-3 ${confirmingCompleted ? 'opacity-60' : ''}`}
            onPress={handleConfirmRideCompleted}
            disabled={confirmingCompleted}
          >
            <CheckIcon size={18} color="#050c1a" />
            <Text className="text-[#050c1a] font-black text-base tracking-wide">
              {confirmingCompleted ? 'Saving...' : 'Confirm Ride Completed'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {completionMessage ? (
          <View className="bg-[#050e1d] border border-white/[0.08] rounded-2xl px-4 py-3 mb-3">
            <Text className="text-[#8eb4c6] text-xs leading-4">{completionMessage}</Text>
          </View>
        ) : null}

        {matchId ? (
          <TouchableOpacity
            className="bg-[#00f2fe]/10 border border-[#00f2fe]/40 p-4 rounded-2xl items-center shadow-xl active:bg-[#00f2fe]/20 flex-row justify-center gap-2 mb-3"
            onPress={() => navigation.navigate('Chat', { matchId, ride, liveLocationState })}
          >
            <ChatIcon size={18} color="#00f2fe" />
            <Text className="text-[#00f2fe] font-black text-base tracking-wide">Open Chat</Text>
            <ChatUnreadBadge />
          </TouchableOpacity>
        ) : null}

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
