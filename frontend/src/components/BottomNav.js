import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const navItems = [
  { name: 'Home', label: 'Home' },
  { name: 'FindRide', label: 'Search' },
  { name: 'RideTracking', label: 'Tracking' },
  { name: 'BrowseGroups', label: 'Groups' }
];

export default function BottomNav({ navigation, activeRoute }) {
  return (
    <View className="flex-row justify-between bg-[#071b2f] px-3 py-3 border-t border-white/10">
      {navItems.map((item) => {
        const active = activeRoute === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
            className={`flex-1 items-center py-2.5 rounded-2xl mx-1 ${active? 'bg-[#21d3c7]' : 'bg-white/5'}`}
          >
            <Text className={`font-bold text- ${active? 'text-white' : 'text-[#ccebf5]'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}