import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=1400&q=80' };

export default function RideDetailsScreen({ navigation, route }) {
  const ride = route.params?.ride || {};
  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} className="flex-1">
        <View className="absolute inset-0 bg-[#031120]/75" />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} className="flex-1">
          <View className="w-full max-w-md self-center">
            <Text className="text- font-black text-[#21d3c7] mb-5">Ride confirmed</Text>
            {[
              ['Provider', ride.provider || 'Uber/Bolt mock'],
              ['Driver', ride.driver || 'Ava'],
              ['Car', ride.car || 'Tesla Model 3'],
              ['ETA', ride.eta || '4 mins'],
              ['License', ride.license || 'LXB-9824'],
            ].map(([label, val]) => (
              <View key={label} className="bg-white/10 rounded- p-4 mb-3 border border-[#21d3c7]/20">
                <Text className="text-[#9ddae0] text-xs uppercase mb-1">{label}</Text>
                <Text className="text-white text-lg font-bold">{val}</Text>
              </View>
            ))}
            <TouchableOpacity className="bg-[#ff7a1a] p-4 rounded- mt-4 items-center" onPress={() => navigation.navigate('Home')}>
              <Text className="text-white font-extrabold text-base">Back home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}