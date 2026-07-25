import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { HomeIcon, SearchIcon, TrackingIcon, GroupsIcon } from './Icons';

const navItems = [
  { name: 'Home', label: 'Home', IconComponent: HomeIcon },
  { name: 'FindRide', label: 'Search', IconComponent: SearchIcon },
  { name: 'RideTracking', label: 'Tracking', IconComponent: TrackingIcon },
  { name: 'BrowseGroups', label: 'Groups', IconComponent: GroupsIcon }
];

export default function BottomNav({ navigation, activeRoute }) {
  return (
    <View className="w-full max-w-md self-center px-4 pb-4 pt-1 z-50">
      <View className="bg-[#07162b]/95 border border-[#00f2fe]/30 rounded-full px-2 py-2 flex-row justify-around items-center shadow-2xl shadow-[#00f2fe]/25 backdrop-blur-2xl">
        {navItems.map((item) => {
          const active = activeRoute === item.name;
          const { IconComponent } = item;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.8}
              className={`items-center justify-center py-2 px-3 sm:px-4 rounded-full flex-row gap-1.5 transition-all ${
                active
                  ? 'bg-[#00f2fe] border border-[#00f2fe] shadow-lg shadow-[#00f2fe]/40 scale-105'
                  : 'bg-transparent active:bg-white/[0.08]'
              }`}
            >
              <IconComponent size={17} color={active ? '#050c1a' : '#8eb4c6'} />
              <Text
                numberOfLines={1}
                className={`font-black text-xs tracking-wider ${
                  active ? 'text-[#050c1a]' : 'text-[#8eb4c6]'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}