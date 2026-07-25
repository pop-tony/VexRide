import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground, ScrollView, Linking } from 'react-native';
import { postJson, getJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80' };

export default function PaymentScreen({ navigation, route }) {
  const amount = route.params?.amount || 24;
  const matchId = route.params?.matchId;
  const paymentType = route.params?.paymentType || 'match';
  const groupId = route.params?.groupId;
  const groupMemberId = route.params?.groupMemberId;
  const share = Math.round(amount / 2);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to pay');
  const [reference, setReference] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async()=> setCurrentUser(await getStoredUser()))();
    const clean1 = onSocket('paymentStatus', ({ status }) => setStatusMessage(`Payment update: ${status}`));
    const cleanGroup = onSocket('groupPaymentStatus', ({ status }) => setStatusMessage(`Group payment update: ${status}`));
    const cleanVerified = onSocket('groupMemberVerified', () => setStatusMessage('Group membership verified.'));
    const clean2 = onSocket('rideBooked', (ride) => { setStatusMessage(`Ride booked: ${ride.driver} arriving ${ride.eta}`); navigation.navigate('RideDetails', { ride }); });
    return () => { clean1(); cleanGroup(); cleanVerified(); clean2(); };
  }, [navigation]);

  async function handlePaystack() {
    try {
      setLoading(true); setStatusMessage('Initializing payment...');
      const payload = paymentType === 'group'? { groupId, groupMemberId, userId: currentUser?.id, amount } : { matchId, userId: currentUser?.id, amount };
      const data = await postJson('/processPayment', payload);
      setReference(data.reference); setPaymentUrl(data.authorizationUrl); setStatusMessage('Opening Paystack checkout...'); await Linking.openURL(data.authorizationUrl);
    } catch (err) { setStatusMessage(err.message || 'Payment failed'); } finally { setLoading(false); }
  }
  async function handleVerify() {
    if (!reference) { setStatusMessage('Please start payment first.'); return; }
    try {
      setLoading(true); setStatusMessage('Verifying payment...'); const result = await getJson(`/verifyPayment/${encodeURIComponent(reference)}`);
      const status = result.payment.status; setStatusMessage(status === 'success'? 'Payment success!' : 'Payment failed.');
      if (status === 'success' && paymentType!== 'group') { const rideResult = await postJson('/bookRide', { matchId }); navigation.navigate('RideDetails', { ride: rideResult.ride }); }
      if (status === 'success' && paymentType === 'group') navigation.goBack();
    } catch (err) { setStatusMessage(err.message || 'Verification failed'); } finally { setLoading(false); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} className="flex-1">
        <View className="absolute inset-0 bg-[#050f1e]/80" />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} className="flex-1">
          <View className="w-full max-w-md self-center">
            <Text className="text-[#21d3c7] text- font-black mb-5">Pay with Paystack</Text>

            <View className="bg-white/10 rounded- p-5 mb-4 border border-[#21d3c7]/20">
              <Text className="text-[#9ddae0] text-sm uppercase mb-1">Total</Text>
              <Text className="text-white text-2xl font-extrabold mb-3">GHS{amount}</Text>
              <Text className="text-[#9ddae0] text-sm uppercase mb-1">{paymentType === 'group'? 'Group share' : 'Your share'}</Text>
              <Text className="text-white text-2xl font-extrabold">GHS{paymentType === 'group'? amount : share}</Text>
            </View>

            <Text className="text-[#bcdbe9] mb-4 leading-5">Use test card 4084 4084 0840 8408 with any future expiry and CVV.</Text>

            <View className="bg-white/10 p-4 rounded-2xl mb-4">
              <Text className="text-[#9ddae0] mb-2 font-bold">Status</Text>
              <Text className="text-white text-base">{statusMessage}</Text>
            </View>

            <TouchableOpacity className="bg-[#ff7a1a] p-4 rounded-2xl mb-3 items-center" onPress={handlePaystack} disabled={loading}>
              {loading? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-extrabold text-base">Start Paystack payment</Text>}
            </TouchableOpacity>
            <TouchableOpacity className={`p-4 rounded-2xl items-center ${!reference? 'bg-[#21d3c7]/50' : 'bg-[#21d3c7]'}`} onPress={handleVerify} disabled={loading ||!reference}>
              <Text className="text-white font-extrabold text-base">{reference? 'Verify payment' : 'Pay before verify'}</Text>
            </TouchableOpacity>
            {paymentUrl? <Text className="text-[#bcdbe9] mt-3 text-center">Payment URL opened in your browser.</Text> : null}
          </View>
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}