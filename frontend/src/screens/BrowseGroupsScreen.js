import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { getJson, postJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80' };

export default function BrowseGroupsScreen({ navigation, route }) {
  const [groups, setGroups] = useState([]);
  const [activity, setActivity] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  async function loadGroups() {
    try { const result = await getJson(`/browseGroups?userId=${currentUser?.id}`); setGroups(result.groups || []); }
    catch (error) { setActivity(prev => [`Failed to load groups: ${error.message}`,...prev].slice(0, 4)); }
  }

  useEffect(() => { (async()=> setCurrentUser(await getStoredUser()))() }, []);
  useEffect(() => {
    if (!currentUser) return;
    loadGroups();
    const c1 = onSocket('groupCreated', ({ group }) => { setGroups(prev => [group,...prev]); setActivity(prev => [`New group created: ${group.origin} → ${group.location}`,...prev].slice(0, 4)); });
    const c2 = onSocket('groupJoined', ({ groupId, group }) => { if (group) setGroups(prev => prev.map(e => e.id === groupId? group : e)); setActivity(prev => [`A rider joined group ${groupId}`,...prev].slice(0, 4)); });
    const c4 = onSocket('groupMemberVerified', ({ groupId }) => { setActivity(prev => [`Group member verified for group ${groupId}`,...prev].slice(0, 4)); loadGroups(); });
    const c3 = onSocket('groupRideBooked', ({ ride }) => setActivity(prev => [`Group ride booked: ${ride.car} in ${ride.eta}`,...prev].slice(0, 4)));
    return () => { c1(); c2(); c3(); c4(); };
  }, [currentUser]);

  async function handleJoin(groupId) {
    try { const result = await postJson('/joinGroup', { groupId, userId: currentUser?.id }); setGroups(prev => prev.map(g => g.id === groupId? result.group : g)); setActivity(prev => [`Joined group ${groupId}. Pay GHS${result.paymentAmount} to move out of probation.`,...prev].slice(0, 4)); }
    catch (error) { setActivity(prev => [`Join failed: ${error.message}`,...prev].slice(0, 4)); }
  }
  async function handlePay(group) {
    const member = group.members?.find(e => e.userId === currentUser?.id);
    if (!member) { setActivity(prev => [`No probation member record found for group ${group.id}`,...prev].slice(0, 4)); return; }
    navigation.navigate('Payment', { paymentType: 'group', groupId: group.id, groupMemberId: member.membershipId, amount: group.paymentAmount || 0, groupTitle: `${group.origin} → ${group.location}` });
  }
  async function handleBook(groupId) {
    try { const result = await postJson('/bookGroupRide', { groupId }); setActivity(prev => [`Ride booked for group ${groupId}: ${result.ride.car}`,...prev].slice(0, 4)); }
    catch (error) { setActivity(prev => [`Book failed: ${error.message}`,...prev].slice(0, 4)); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <View className="flex-1 bg-[#061426] px-0">
        <ImageBackground source={heroImage} className="h- p-6 justify-end">
          <View className="absolute inset-0 bg-[#051527]/60" />
          <Text className="text-white text- font-black mb-1">Live groups</Text>
          <Text className="text-[#d4f4fb] text-sm leading-5">Join or start a crew and unlock member-only ride details.</Text>
        </ImageBackground>

        <View className="flex-1 px-6 pt-4">
          {groups.length === 0? <Text className="text-[#c9e5f4] text-center mt-6">No groups available yet. Create one to get started.</Text> :
            groups.map((group) => (
              <View key={group.id} className="bg-[#0f3153] rounded- p-5 mb-5 border border-[#21d3c7]/20">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white text-lg font-extrabold flex-1 mr-3">{group.origin} → {group.location}</Text>
                  <Text className="text-[#21d3c7] font-bold">{group.memberCount} riders</Text>
                </View>
                <Text className="text-[#aecde5] mt-2">Date: {group.schedule_date} • Time: {group.time}</Text>
                <Text className="text-[#aecde5] mt-1">Join by: {group.join_deadline? new Date(group.join_deadline).toLocaleString() : 'No deadline set'}</Text>
                <Text className="text-[#aecde5] mt-1">Budget: GHS{group.budget} • Max: {group.max_members || 'N/A'} • Share: GHS{group.paymentAmount || 0}</Text>

                {group.isMember? (
                  <View className="bg-white/5 rounded-2xl p-4 my-3">
                    <Text className="text-[#c2edf8] font-bold mb-2">Group members</Text>
                    {group.members.length === 0? <Text className="text-[#d9f3ff]">You're the first rider in this group.</Text> :
                      group.members.map((m) => <Text key={m.membershipId || m.id} className="text-[#d9f3ff] mb-1">• {m.name} {m.status? `(${m.status})` : ''}</Text>)}
                  </View>
                ) : <Text className="text-[#9ccfe3] my-3 leading-5">Join this group to see rider activity, member names, and booking updates.</Text>}

                <View className="flex-row justify-between gap-3 mt-2">
                  <TouchableOpacity className={`flex-1 p-3.5 rounded-2xl items-center ${(!group.canJoin || group.isMember)? 'bg-[#214a6b]/60' : 'bg-[#21d3c7]'}`} onPress={() => handleJoin(group.id)} disabled={!group.canJoin || group.isMember}>
                    <Text className="text-white font-extrabold">{group.isMember? 'Joined' : group.canJoin? 'Join' : 'Closed'}</Text>
                  </TouchableOpacity>
                  {group.isMember && group.members?.find(m => m.userId === currentUser?.id)?.status === 'probation'? (
                    <TouchableOpacity className="flex-1 bg-[#ff7a1a] p-3.5 rounded-2xl items-center" onPress={() => handlePay(group)}>
                      <Text className="text-white font-extrabold">Pay GHS{group.paymentAmount || 0}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity className={`flex-1 p-3.5 rounded-2xl items-center ${!group.isMember? 'bg-[#214a6b]/60' : 'bg-[#ff7a1a]'}`} onPress={() => handleBook(group.id)} disabled={!group.isMember}>
                      <Text className="text-white font-extrabold">{group.isMember? 'Book ride' : 'Members only'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {group.isMember && group.members?.find(m => m.userId === currentUser?.id)?.status === 'verified' && <Text className="text-[#ffb36b] font-bold mt-2">Your membership is verified.</Text>}
              </View>
            ))}

          <Text className="text-[#cef1ff] text-base font-bold mb-3">Activity</Text>
          <View className="bg-[#0a233d] rounded-2xl p-4 mb-4">
            {activity.length === 0? <Text className="text-[#b9e4fb] leading-5">No events yet. Stay tuned for group activity.</Text> :
              activity.map((item, i) => <Text key={i} className="text-[#b9e4fb] mb-2 leading-5">{item}</Text>)}
          </View>

          <TouchableOpacity className="bg-[#21d3c7] p-4 rounded-2xl mb-8 items-center" onPress={() => navigation.navigate('Home')}>
            <Text className="text-white font-extrabold text-">Back home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}