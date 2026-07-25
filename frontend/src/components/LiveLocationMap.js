import React from 'react';
import { View, Text, Platform } from 'react-native';

let MapView = null;
let Marker = null;
let Polyline = null;
if (Platform.OS!== 'web') {
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

  if (isWeb ||!region || (!isValidLocation(user1Location) &&!isValidLocation(user2Location) &&!isValidLocation(carLocation))) {
    return (
      <View style={{ minHeight: height }} className="bg-white/10 rounded- p-4 border border-[#21d3c7]/20 mb-4 justify-center">
        <Text className="text-[#d4f3fb] font-extrabold text-base mb-2">{title}</Text>
        <Text className="text-[#c9e5f4] leading-5 mb-2">Waiting for live GPS coordinates from both riders.</Text>
        {liveLocationState?.pickupSummary? <Text className="text-[#9ddae0] leading-5">{liveLocationState.pickupSummary}</Text> : null}
      </View>
    );
  }

  return (
    <View className="bg-white/10 rounded- p-3.5 border border-[#21d3c7]/20 mb-4 w-full">
      <Text className="text-[#d4f3fb] font-extrabold text-base mb-2.5">{title}</Text>
      <MapView style={{ height, width: '100%', borderRadius: 18 }} initialRegion={region} region={region}>
        {isValidLocation(user1Location)? <Marker coordinate={user1Location} title="Rider 1" description={user1Location.name || 'First rider'} pinColor="#21d3c7" /> : null}
        {isValidLocation(user2Location)? <Marker coordinate={user2Location} title="Rider 2" description={user2Location.name || 'Second rider'} pinColor="#ff7a1a" /> : null}
        {isValidLocation(carLocation)? <Marker coordinate={carLocation} title="Car" description="Shared car location" pinColor="#ffffff" /> : null}
        {isValidLocation(user1Location) && isValidLocation(user2Location)? <Polyline coordinates={[user1Location, user2Location]} strokeColor="rgba(255,255,255,0.4)" strokeWidth={3} /> : null}
      </MapView>
      <Text className="text-[#9ddae0] mt-2.5 leading-5">{liveLocationState?.pickupSummary || 'Live tracking active'}</Text>
    </View>
  );
}