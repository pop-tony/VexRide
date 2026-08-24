import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { getJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';
import { joinChatRoom, joinUser, onSocket, onSocketConnect, sendChatMessage, socket } from '../services/socket';

const heroImage = require('../../assets/images/vex_map_bg_1784946439656.jpg');

export default function ChatScreen({ navigation, route }) {
  const { matchId, request, counterParty } = route.params || {};
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [matchDetails, setMatchDetails] = useState({ matchId, request, counterParty });

  function mergeMessages(existingMessages, incomingMessages) {
    const merged = [...existingMessages];
    const seenKeys = new Set(
      merged.map((message) => `${message.matchId || matchId}|${message.userId || ''}|${message.timestamp || ''}|${message.message || ''}`)
    );

    incomingMessages.forEach((message) => {
      const key = `${message.matchId || matchId}|${message.userId || ''}|${message.timestamp || ''}|${message.message || ''}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      merged.push(message);
    });

    return merged;
  }

  useEffect(() => {
    let active = true;
    let cleanConnection;

    async function loadUser() {
      const user = await getStoredUser();
      if (!active) return;
      setCurrentUser(user);

      if (!user?.id) return;

      const registerUser = () => joinUser(user.id);
      cleanConnection = onSocketConnect(registerUser);
      if (socket.connected) registerUser();
      else socket.connect();
    }

    loadUser();
    return () => {
      active = false;
      cleanConnection?.();
    };
  }, []);

  useEffect(() => {
    if (!matchId) return undefined;

    joinChatRoom(matchId);
 
    let active = true;
    (async () => {
      try {
        const result = await getJson(`/match/${matchId}/chat`);
        if (!active) return;
        //console.log(existingMessages, result.messages || []);
        setMessages((existingMessages) => mergeMessages(existingMessages, result.messages || []));
      } catch (error) {
        console.warn(error);
      }
    })();

    const cleanMessage = onSocket('chatMessage', (incomingMessage) => {
      if (String(incomingMessage.matchId) !== String(matchId)) return;
      setMessages((previousMessages) => mergeMessages(previousMessages, [incomingMessage]));
    });

    const cleanMatch = onSocket('matchFound', ({ matchId: incomingMatchId, request: incomingRequest, counterParty: incomingCounterParty }) => {
      if (String(incomingMatchId) !== String(matchId)) return;
      setMatchDetails({ matchId: incomingMatchId, request: incomingRequest, counterParty: incomingCounterParty });
    });

    return () => {
      active = false;
      cleanMessage();
      cleanMatch();
    };
  }, [matchId]);

  function handleSend() {
    const trimmedMessage = draft.trim();
    if (!trimmedMessage || !matchId) return;

    sendChatMessage({ matchId, message: trimmedMessage });
    setDraft('');
  }

  const partnerName = matchDetails?.counterParty?.name || matchDetails?.counterParty?.user_name || counterParty?.name || counterParty?.user_name || request?.name || request?.user_name || 'Matched rider';

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage} hideBottomNav>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 w-full max-w-md self-center py-2">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-black text-white">Chat</Text>
              <Text className="text-[#8eb4c6] text-xs">Conversation with {partnerName}</Text>
            </View>
            <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-1 rounded-full">
              <Text className="text-[#00f2fe] font-bold text-[10px] uppercase">Match #{matchId || 'N/A'}</Text>
            </View>
          </View>

          <View className="max-h-[520px] flex-1 rounded-3xl border border-[#00f2fe]/20 bg-[#0b172a]/95 overflow-auto shadow-2xl">
            <View className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
              <Text className="text-white font-extrabold text-sm">{partnerName}</Text>
              <Text className="text-[#8eb4c6] text-xs mt-0.5">Private room chat for this ride</Text>
            </View>

            <FlatList
              className="flex-1 px-4 py-4"
              data={messages}
              keyExtractor={(item, index) => `${item.timestamp || index}-${index}`}
              renderItem={({ item }) => {
                //{console.log(item, messages)}
                const senderId = item.userId ?? item.user_id;
                const isOwnMessage = String(senderId) === String(currentUser?.id);

                return (
                  <View className={`mb-3 flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <View className={`max-w-[82%] rounded-3xl px-4 py-3 border ${isOwnMessage ? 'bg-[#ff5e36] border-[#ff5e36]/60' : 'bg-white/[0.06] border-white/[0.10]'}`}>
                      <Text className={`text-xs font-bold mb-1 ${isOwnMessage ? 'text-white/80' : 'text-[#8eb4c6]'}`}>
                        {isOwnMessage ? 'You' : partnerName}
                      </Text>
                      <Text className="text-white text-sm leading-5">{item.message}</Text>
                      <Text className={`text-[10px] font-semibold mt-2 ${isOwnMessage ? 'text-white/70' : 'text-[#8eb4c6]'}`}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                      </Text>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: messages.length ? 'flex-end' : 'center' }}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Text className="text-[#8eb4c6] text-sm text-center">No messages yet. Say hello to your matched rider.</Text>
                </View>
              }
            />

            <View className="p-3 border-t border-white/[0.08] bg-[#08111f] flex-row items-end gap-2">
              <TextInput
                className="flex-1 min-h-[48px] max-h-[120px] rounded-2xl px-4 py-3 text-white border border-white/10 bg-white/[0.05]"
                placeholder="Type a message..."
                placeholderTextColor="#688ca0"
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <TouchableOpacity
                className={`h-12 px-4 rounded-2xl items-center justify-center flex-row gap-2 ${draft.trim() ? 'bg-[#ff5e36] border border-[#ff5e36]/60' : 'bg-white/[0.08] border border-white/[0.10]'}`}
                onPress={handleSend}
                disabled={!draft.trim()}
              >
                <Text className={`font-black text-xs ${draft.trim() ? 'text-white' : 'text-[#688ca0]'}`}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}