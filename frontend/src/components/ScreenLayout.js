import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from './BottomNav';

export default function ScreenLayout({ navigation, route, children, refreshControl, showsVerticalScrollIndicator = true, className = "" }) {
  const canGoBack = navigation?.canGoBack?.()?? false;

  return (
    <SafeAreaView className="flex-1 bg-[#061426]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios'? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios'? 60 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {/* RESPONSIVE CONTAINER: full on phone, max 1024px centered on tablet/web */}
          <View className={`w-full self-center max-w- px-6 md:px-8 py-2 ${className}`}>
            {/* Universal Back Button - auto-hides on Home/Auth */}
            <View className="pt-2 pb-4 items-start">
              <TouchableOpacity
                className={`min-h- px-4 rounded-full justify-center border flex-row items-center ${
                 !canGoBack? 'opacity-40 bg-white/5 border-white/10' : 'bg-white/10 border-white/15 active:bg-white/20'
                }`}
                onPress={() => canGoBack && navigation.goBack()}
                disabled={!canGoBack}
              >
                <Text className="text-[#c9e5f4] font-extrabold text-">← Previous</Text>
              </TouchableOpacity>
            </View>

            {/* Your screen content */}
            <View className="flex-1 w-full">
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav navigation={navigation} activeRoute={route?.name} />
    </SafeAreaView>
  );
}