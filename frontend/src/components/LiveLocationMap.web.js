import React from 'react';
import { View, Text } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';

function isValidLocation(loc) {
  return loc && Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude));
}

export default function LiveLocationMap({ liveLocationState, height = 240, title = 'Live locations' }) {
  const user1Location = liveLocationState?.user1Location;
  const user2Location = liveLocationState?.user2Location;
  const carLocation = liveLocationState?.carLocation;
  const validLocations = [user1Location, user2Location, carLocation].filter(isValidLocation);
  const centerLocation = carLocation || user1Location || user2Location;
  const hasAnyLocation = validLocations.length > 0;
  const bounds = validLocations.length > 1 ? validLocations.map(l => [l.latitude, l.longitude]) : null;

  return (
    <View className="bg-[#0b172a] rounded-3xl p-4 border border-[#00f2fe]/30 shadow-xl mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white font-extrabold text-sm tracking-wide">{title}</Text>
        <View className="flex-row items-center gap-1 bg-[#00f2fe]/10 px-2.5 py-0.5 rounded-full border border-[#00f2fe]/30">
          <View className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
          <Text className="text-[#00f2fe] font-bold text-[10px] uppercase">GPS Live</Text>
        </View>
      </View>

      {hasAnyLocation ? (
        <MapContainer
          style={{ width: '100%', height, borderRadius: 16, overflow: 'hidden' }}
          center={bounds ? undefined : [centerLocation.latitude, centerLocation.longitude]}
          zoom={bounds ? undefined : 14}
          bounds={bounds || undefined}
          boundsOptions={{ padding: [36, 36] }}
          scrollWheelZoom={false}
        >
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {isValidLocation(user1Location) && <CircleMarker center={[user1Location.latitude, user1Location.longitude]} radius={10} pathOptions={{ color: '#00f2fe', fillColor: '#00f2fe', fillOpacity: 0.95 }}><Popup>{user1Location.name || 'Rider 1'}</Popup></CircleMarker>}
          {isValidLocation(user2Location) && <CircleMarker center={[user2Location.latitude, user2Location.longitude]} radius={10} pathOptions={{ color: '#ff5e36', fillColor: '#ff5e36', fillOpacity: 0.95 }}><Popup>{user2Location.name || 'Rider 2'}</Popup></CircleMarker>}
          {isValidLocation(carLocation) && <CircleMarker center={[carLocation.latitude, carLocation.longitude]} radius={9} pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.9 }}><Popup>Shared car location</Popup></CircleMarker>}
          {isValidLocation(user1Location) && isValidLocation(user2Location) && <Polyline positions={[[user1Location.latitude, user1Location.longitude], [user2Location.latitude, user2Location.longitude]]} pathOptions={{ color: 'rgba(0, 242, 254, 0.6)', weight: 3 }} />}
        </MapContainer>
      ) : (
        <View style={{ minHeight: height }} className="justify-center items-center py-6">
          <Text className="text-2xl mb-2">📡</Text>
          <Text className="text-[#8eb4c6] text-xs font-semibold text-center leading-5">
            Waiting for live GPS coordinates from matched riders...
          </Text>
        </View>
      )}

      {liveLocationState?.pickupSummary ? (
        <Text className="text-[#00f2fe] text-xs font-bold mt-3 leading-4">{liveLocationState.pickupSummary}</Text>
      ) : null}
    </View>
  );
}