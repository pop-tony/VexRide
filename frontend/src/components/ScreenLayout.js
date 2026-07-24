import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import BottomNav from './BottomNav';

export default function ScreenLayout({ navigation, route, children, refreshControl, showsVerticalScrollIndicator = true, contentContainerStyle, className, ...props }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const canGoBack = navigation?.canGoBack?.() ?? false;

  const containerStyle = [
    styles.content,
    isWide && styles.contentWide,
    contentContainerStyle
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView
          className="app-scroll"
          contentContainerStyle={containerStyle}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          {...props}
        >
          <View style={styles.inner} className={className}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={[styles.backButton, !canGoBack && styles.backButtonDisabled]}
                onPress={() => canGoBack && navigation.goBack()}
                disabled={!canGoBack}
              >
                <Text style={styles.backButtonText}>Previous</Text>
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav navigation={navigation} activeRoute={route.name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#061426' },
  flex: { flex: 1 },
  inner: { width: '100%' },
  headerRow: {
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'flex-start'
  },
  backButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  backButtonDisabled: {
    opacity: 0.4
  },
  backButtonText: {
    color: '#c9e5f4',
    fontWeight: '800'
  },
  content: { minHeight: '100%', paddingBottom: 140, paddingHorizontal: 24 },
  contentWide: { alignSelf: 'center', width: '100%', maxWidth: 1024, paddingHorizontal: 32 }
});
