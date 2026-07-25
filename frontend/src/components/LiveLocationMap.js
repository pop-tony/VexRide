import React from 'react';
import { View, Text, Platform } from 'react-native';

let MapView = null;
let Marker = null;
let Polyline = null;
if (Platform.OS !== 'web') {
  ({ default: MapView, Marker, Polyline } = require('react-native-maps'));
}

function toRegion(location) {
  if (!location) return null;
  return {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    latitudeDelta: 0.02,
    longitudeDelta: 0.02
  };
}
function isValidLocation(loc) {
  return loc && Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude));
}

export default function LiveLocationMap({ liveLocationState, height = 240, title = 'Live locations' }) {
  const user1Location = liveLocationState?.user1Location;
  const user2Location = liveLocationState?.user2Location;
  const carLocation = liveLocationState?.carLocation;
  const focusLocation = carLocation || user1Location || user2Location;
  const region = toRegion(focusLocation);
  const isWeb = Platform.OS === 'web';

  if (isWeb || !region || (!isValidLocation(user1Location) && !isValidLocation(user2Location) && !isValidLocation(carLocation))) {
    return (
      <View style={{ minHeight: height }} className="bg-[#0b172a] rounded-3xl p-4 border border-[#00f2fe]/30 shadow-xl mb-4 justify-center items-center">
        <Text className="text-white font-extrabold text-sm mb-2">{title}</Text>
        <Text className="text-[#8eb4c6] text-xs font-semibold text-center leading-5 mb-2">
          Waiting for live GPS coordinates from matched riders...
        </Text>
        {liveLocationState?.pickupSummary ? <Text className="text-[#00f2fe] text-xs font-bold text-center leading-4">{liveLocationState.pickupSummary}</Text> : null}
      </View>
    );
  }

  return (
    <View className="bg-[#0b172a] rounded-3xl p-4 border border-[#00f2fe]/30 shadow-xl mb-4 w-full">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white font-extrabold text-sm tracking-wide">{title}</Text>
        <View className="flex-row items-center gap-1 bg-[#00f2fe]/10 px-2.5 py-0.5 rounded-full border border-[#00f2fe]/30">
          <View className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
          <Text className="text-[#00f2fe] font-bold text-[10px] uppercase">GPS Live</Text>
        </View>
      </View>

      <MapView style={{ height, width: '100%', borderRadius: 16 }} initialRegion={region} region={region}>
        {isValidLocation(user1Location) ? <Marker coordinate={user1Location} title="Rider 1" description={user1Location.name || 'First rider'} pinColor="#00f2fe" /> : null}
        {isValidLocation(user2Location) ? <Marker coordinate={user2Location} title="Rider 2" description={user2Location.name || 'Second rider'} pinColor="#ff5e36" /> : null}
        {isValidLocation(carLocation) ? <Marker coordinate={carLocation} title="Car" description="Shared car location" pinColor="#ffffff" /> : null}
        {isValidLocation(user1Location) && isValidLocation(user2Location) ? <Polyline coordinates={[user1Location, user2Location]} strokeColor="rgba(0, 242, 254, 0.6)" strokeWidth={3} /> : null}
      </MapView>
      <Text className="text-[#00f2fe] text-xs font-bold mt-2.5 leading-4">{liveLocationState?.pickupSummary || 'Live tracking active'}</Text>
    </View>
  );
}