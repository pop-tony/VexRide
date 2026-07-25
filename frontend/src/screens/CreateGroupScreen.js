import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1520974735194-8f4d31a0f38a?auto=format&fit=crop&w=1400&q=80' };

export default function CreateGroupScreen({ navigation, route }) {
  const [location, setLocation] = useState('Aqua Safari');
  const [origin, setOrigin] = useState('Madina');
  const [scheduleDate, setScheduleDate] = useState('2026-07-20');
  const [time, setTime] = useState('7:00 PM');
  const [joinDeadline, setJoinDeadline] = useState('2026-07-19T18:00');
  const [budget, setBudget] = useState('30');
  const [maxMembers, setMaxMembers] = useState('4');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { (async()=> setCurrentUser(await getStoredUser()))() }, []);

  async function handleCreate() {
    try {
      setMessage('Creating group...');
      await postJson('/createGroup', {
        location: location.trim(), origin: origin.trim(), scheduleDate: scheduleDate.trim(),
        budget: Number(budget), maxMembers: Number(maxMembers), time: time.trim(),
        joinDeadline: joinDeadline.trim(), split_rules: 'Even split', userId: currentUser?.id
      });
      navigation.navigate('BrowseGroups');
    } catch (error) { setMessage(error.message || 'Could not create group'); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} className="flex-1 bg-[#061426]">
        <View className="absolute inset-0 bg-[#061426]/70" />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 justify-center p-6">
            <View className="w-full max-w-lg self-center bg-[#06182c]/95 rounded- p-6 border border-[#21d3c7]/20">
              <Text className="text- font-black text-[#21d3c7] mb-2">Create a live group</Text>
              <Text className="text-[#c9e5f4] mb-6 leading-6">Set your route, budget, and time, then invite fellow riders.</Text>

              {[
                ['Location', location, setLocation, 'Location'],
                ['Origin', origin, setOrigin, 'Origin'],
                ['Schedule Date', scheduleDate, setScheduleDate, 'YYYY-MM-DD'],
                ['Time', time, setTime, '6:30 PM'],
                ['Join Deadline', joinDeadline, setJoinDeadline, 'YYYY-MM-DDTHH:MM'],
                ['Budget', budget, setBudget, 'Budget', 'numeric'],
                ['Max Members', maxMembers, setMaxMembers, 'Max members', 'numeric'],
              ].map(([label, val, setter, ph, kb]) => (
                <View key={label} className="mb-1">
                  <Text className="text-[#c9e5f4] text- font-bold mb-2">{label}</Text>
                  <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder={ph} placeholderTextColor="#9bb1ca" value={val} onChangeText={setter} keyboardType={kb || 'default'} />
                </View>
              ))}

              {message? <Text className="text-[#d5f1ff] font-bold mb-4">{message}</Text> : null}

              <TouchableOpacity className="bg-[#ff7a1a] p-4 rounded-2xl mt-2 items-center" onPress={handleCreate}>
                <Text className="text-white text-center font-extrabold text-base">Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}