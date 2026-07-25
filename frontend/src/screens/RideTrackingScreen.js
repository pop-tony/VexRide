import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, RefreshControl, Alert, ScrollView } from 'react-native';
import { getJson, postJson } from '../services/api';
import { getStoredUser } from '../services/user';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519914213166-db6e2b9b0b6b?auto=format&fit=crop&w=1400&q=80' };

export default function RideTrackingScreen({ navigation, route }) {
  const [activeRides, setActiveRides] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { (async()=>{ const user = await getStoredUser(); setCurrentUser(user); if (user) await loadRides(user.id); })() }, []);
  useEffect(() => {
    if (!currentUser) return;
    const c1 = onSocket('rideConfirmed', ({ matchId }) => loadRides(currentUser.id));
    const c2 = onSocket('matchLocationUpdate', () => loadRides(currentUser.id));
    const c3 = onSocket('userLocationUpdated', () => loadRides(currentUser.id));
    return () => { c1(); c2(); c3(); };
  }, [currentUser]);

  async function loadRides(userId) {
    try { const data = await getJson(`/activeRides/${userId}`); setActiveRides(data.rides || []); }
    catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
  }
  async function handleConfirmRide(ride) {
    if (!currentUser) return Alert.alert('Error', 'User not found');
    if ((ride.user1_id === currentUser.id && ride.user1_confirmed) || (ride.user2_id === currentUser.id && ride.user2_confirmed)) return Alert.alert('Already Confirmed', 'You have already confirmed this ride');
    try { await postJson('/confirmMatch', { matchId: ride.id, userId: currentUser.id }); Alert.alert('Success', 'Ride confirmation recorded!'); await loadRides(currentUser.id); }
    catch (error) { Alert.alert('Error', error.message); }
  }
  async function onRefresh() { setRefreshing(true); if (currentUser) await loadRides(currentUser.id); }

  if (loading) return (
    <ScreenLayout navigation={navigation} route={route}>
      <View className="flex-1 justify-center items-center p-6"><Text className="text-[#c9e5f4] text-base text-center">Loading active rides...</Text></View>
    </ScreenLayout>
  );

  return (
    <ScreenLayout navigation={navigation} route={route} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground source={heroImage} className="flex-1">
        <View className="absolute inset-0 bg-[#04142c]/60" />
        <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1" showsVerticalScrollIndicator={false}>
          <Text className="text-[#21d3c7] text- font-black mb-5">Active Rides</Text>

          {activeRides[0]?.liveLocationState? (
            <View className="rounded- overflow-hidden mb-4 border border-[#21d3c7]/20">
              <LiveLocationMap liveLocationState={activeRides[0].liveLocationState} title="Live ride map" height={260} />
            </View>
          ) : (
            <View className="bg-white/10 rounded- p-4 border border-[#21d3c7]/20 mb-4">
              <Text className="text-[#d4f3fb] font-extrabold mb-1">Live map</Text>
              <Text className="text-[#c9e5f4] leading-5">Waiting for GPS data from the matched riders.</Text>
            </View>
          )}

          {activeRides.length === 0? (
            <View className="items-center mt-14">
              <Text className="text-[#c9e5f4] text-lg font-semibold mb-2">No active confirmed rides</Text>
              <Text className="text-[#8eb4c6] text-sm">Find and match a ride to see it here</Text>
            </View>
          ) : (
            activeRides.map((ride) => {
              const isUser1 = ride.user1_id === currentUser?.id;
              const userConfirmed = ride.status === 'confirmed' || (isUser1? ride.user1_confirmed : ride.user2_confirmed);
              const userPaymentStatus = isUser1? ride.user1_payment_status : ride.user2_payment_status;
              const otherPaymentStatus = isUser1? ride.user2_payment_status : ride.user1_payment_status;
              return (
                <View key={ride.id} className="bg-[#0a2f47]/90 rounded- p-4 mb-4 border border-[#21d3c7]/20">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[#21d3c7] text-base font-extrabold">Ride #{ride.id}</Text>
                    <View className={`px-3 py-1.5 rounded-xl ${ride.status === 'confirmed'? 'bg-[#21d3c7]' : 'bg-[#ff7a1a]'}`}>
                      <Text className="text-white font-bold text-xs">{ride.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View className="bg-white/5 rounded-xl p-3 mb-3">
                    <View className="flex-row justify-between mb-2"><Text className="text-[#8eb4c6] text- font-semibold">From</Text><Text className="text-[#e8f9ff] text- font-semibold">{ride.pickup_location || 'Downtown'}</Text></View>
                    <View className="flex-row justify-between mb-2"><Text className="text-[#8eb4c6] text- font-semibold">To</Text><Text className="text-[#e8f9ff] text- font-semibold">{ride.dropoff_location || 'Airport'}</Text></View>
                    <View className="flex-row justify-between"><Text className="text-[#8eb4c6] text- font-semibold">Time</Text><Text className="text-[#e8f9ff] text- font-semibold">{ride.ride_time? new Date(ride.ride_time).toLocaleTimeString() : 'TBD'}</Text></View>
                  </View>

                  <View className="mb-3">
                    <Text className="text-[#c9e5f4] text- font-bold mb-2">Payment Status</Text>
                    <Text className="text-[#a8d6e8] text-xs mb-1">Your Payment: <Text className={userPaymentStatus === 'success'? 'text-[#21d3c7] font-bold' : 'text-[#ff7a1a] font-bold'}>{userPaymentStatus}</Text></Text>
                    <Text className="text-[#a8d6e8] text-xs">Other Party: <Text className={otherPaymentStatus === 'success'? 'text-[#21d3c7] font-bold' : 'text-[#ff7a1a] font-bold'}>{otherPaymentStatus}</Text></Text>
                  </View>

                  <View className="mb-3 flex-row">
                    <View className={`px-3 py-2 rounded-xl border ${userConfirmed? 'bg-[#21d3c7]/20 border-[#21d3c7]/40' : 'bg-[#ff7a1a]/20 border-[#ff7a1a]/40'}`}>
                      <Text className="font-bold text-xs text-[#ff7a1a]">{userConfirmed? '✓ Confirmed' : 'Pending'}</Text>
                    </View>
                  </View>

                  {!userConfirmed && ride.status!== 'confirmed' && userPaymentStatus === 'success' && otherPaymentStatus === 'success' && (
                    <TouchableOpacity className="bg-[#21d3c7] py-3 rounded-xl items-center mt-3" onPress={() => handleConfirmRide(ride)}>
                      <Text className="text-[#061426] font-extrabold text-sm">Confirm Ride</Text>
                    </TouchableOpacity>
                  )}

                  {userPaymentStatus!== 'success' && (
                    <View className="bg-[#ff7a1a]/15 rounded-xl p-3 mt-3 border border-[#ff7a1a]/30">
                      <Text className="text-[#ff7a1a] text-xs font-semibold">⚠ Both parties must complete payment to confirm</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}