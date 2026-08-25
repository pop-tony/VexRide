import React from 'react';
import { View, Text } from 'react-native';
import { useUnreadCount } from '../services/chatBadge';

export default function ChatUnreadBadge() {
  const unreadCount = useUnreadCount();
  if (!unreadCount) return null;

  return (
    <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
      <Text className="text-white text-[10px] font-black">{unreadCount > 99 ? '99+' : unreadCount}</Text>
    </View>
  );
}
