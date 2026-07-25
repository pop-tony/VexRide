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
  const bounds = validLocations.length > 1? validLocations.map(l => [l.latitude, l.longitude]) : null;

  return (
    <View className="bg-white/10 rounded- p-3.5 border border-[#21d3c7]/20 mb-4">
      <Text className="text-[#d4f3fb] font-extrabold text-base mb-2.5">{title}</Text>
      {hasAnyLocation? (
        <MapContainer
          style={{ width: '100%', height, borderRadius: 18, overflow: 'hidden' }}
          center={bounds? undefined : [centerLocation.latitude, centerLocation.longitude]}
          zoom={bounds? undefined : 14}
          bounds={bounds || undefined}
          boundsOptions={{ padding: [36, 36] }}
          scrollWheelZoom={false}
        >
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {isValidLocation(user1Location) && <CircleMarker center={[user1Location.latitude, user1Location.longitude]} radius={10} pathOptions={{ color: '#21d3c7', fillColor: '#21d3c7', fillOpacity: 0.95 }}><Popup>{user1Location.name || 'Rider 1'}</Popup></CircleMarker>}
          {isValidLocation(user2Location) && <CircleMarker center={[user2Location.latitude, user2Location.longitude]} radius={10} pathOptions={{ color: '#ff7a1a', fillColor: '#ff7a1a', fillOpacity: 0.95 }}><Popup>{user2Location.name || 'Rider 2'}</Popup></CircleMarker>}
          {isValidLocation(carLocation) && <CircleMarker center={[carLocation.latitude, carLocation.longitude]} radius={9} pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.9 }}><Popup>Shared car location</Popup></CircleMarker>}
          {isValidLocation(user1Location) && isValidLocation(user2Location) && <Polyline positions={[[user1Location.latitude, user1Location.longitude], [user2Location.latitude, user2Location.longitude]]} pathOptions={{ color: 'rgba(255,255,255,0.5)', weight: 3 }} />}
        </MapContainer>
      ) : (
        <View style={{ minHeight: height }} className="justify-center">
          <Text className="text-[#c9e5f4] leading-5">Waiting for live GPS coordinates from both riders.</Text>
        </View>
      )}
      {liveLocationState?.pickupSummary? <Text className="text-[#9ddae0] mt-2.5 leading-5">{liveLocationState.pickupSummary}</Text> : null}
    </View>
  );
}