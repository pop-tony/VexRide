import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';
import { GroupsIcon, PinIcon, FlagIcon, CalendarIcon, ClockIcon, WalletIcon, UsersIcon, ZapIcon, InfoIcon } from '../components/Icons';
import { friendlyError, logError } from '../services/errorHandling';

const heroImage = require('../../assets/images/vex_groups_bg_1784946398517.jpg');

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

  useEffect(() => { (async () => setCurrentUser(await getStoredUser()))() }, []);

  async function handleCreate() {
    try {
      setMessage('Creating group...');
      await postJson('/createGroup', {
        location: location.trim(), origin: origin.trim(), scheduleDate: scheduleDate.trim(),
        budget: Number(budget), maxMembers: Number(maxMembers), time: time.trim(),
        joinDeadline: joinDeadline.trim(), split_rules: 'Even split', userId: currentUser?.id
      });
      navigation.navigate('BrowseGroups');
    } catch (error) { logError('Create group', error); setMessage(friendlyError(error, 'Could not create the group. Please try again.')); }
  }

  const fields = [
    ['Destination Location', location, setLocation, 'e.g. Aqua Safari', 'default', PinIcon],
    ['Pickup Origin', origin, setOrigin, 'e.g. Madina', 'default', FlagIcon],
    ['Schedule Date', scheduleDate, setScheduleDate, 'YYYY-MM-DD', 'default', CalendarIcon],
    ['Departure Time', time, setTime, '7:00 PM', 'default', ClockIcon],
    ['Join Deadline', joinDeadline, setJoinDeadline, 'YYYY-MM-DDTHH:MM', 'default', ClockIcon],
    ['Total Group Budget (GHS)', budget, setBudget, 'Total budget', 'numeric', WalletIcon],
    ['Maximum Members', maxMembers, setMaxMembers, 'Max riders allowed', 'numeric', UsersIcon],
  ];

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="w-full max-w-lg self-center bg-[#0b172a]/95 rounded-3xl p-5 md:p-6 border border-[#00f2fe]/30 shadow-2xl backdrop-blur-xl py-2">

        {/* Form Title */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-2xl bg-[#ff5e36]/20 border border-[#ff5e36]/40 items-center justify-center flex-shrink-0">
            <GroupsIcon size={20} color="#ff5e36" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-xl font-black text-white">Create Live Group</Text>
            <Text className="text-[#8eb4c6] text-xs">Set your route, budget & invite riders</Text>
          </View>
        </View>

        {/* Form Fields */}
        {fields.map(([label, val, setter, ph, kb, FieldIcon]) => (
          <View key={label} className="mb-4">
            <Text className="text-[#c9e5f4] text-xs font-extrabold mb-1.5">{label}</Text>
            <View className="bg-white/[0.06] rounded-2xl px-4 py-3 border border-white/[0.12] focus:border-[#00f2fe] flex-row items-center gap-2.5">
              <FieldIcon size={16} color="#8eb4c6" />
              <TextInput
                className="flex-1 text-white font-bold text-sm p-0"
                placeholder={ph}
                placeholderTextColor="#688ca0"
                value={val}
                onChangeText={setter}
                keyboardType={kb}
              />
            </View>
          </View>
        ))}

        {/* Split Info Badge */}
        <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 p-3 rounded-2xl mb-4 flex-row items-center gap-2">
          <InfoIcon size={16} color="#00f2fe" />
          <Text className="text-[#00f2fe] text-xs font-bold flex-1">
            Even Split Rule: Each rider pays GHS {Math.max(1, Math.round(Number(budget || 0) / Math.max(1, Number(maxMembers || 1))))}
          </Text>
        </View>

        {message ? (
          <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 p-3 rounded-2xl mb-4">
            <Text className="text-[#00f2fe] text-xs font-bold text-center">{message}</Text>
          </View>
        ) : null}

        {/* Create Button */}
        <TouchableOpacity
          className="bg-[#ff5e36] border border-[#ff5e36]/60 p-4 rounded-2xl mt-2 items-center shadow-xl active:scale-98 flex-row justify-center gap-2"
          onPress={handleCreate}
        >
          <ZapIcon size={18} color="#ffffff" />
          <Text className="text-white font-black text-base tracking-wide">Create Group Crew</Text>
        </TouchableOpacity>

      </View>
    </ScreenLayout>
  );
}