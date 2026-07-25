import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { postJson, getJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';
import { CardIcon, InfoIcon, LockIcon, CheckIcon } from '../components/Icons';

const heroImage = require('../../assets/images/vex_home_bg_1784946351687.jpg');

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
    (async () => setCurrentUser(await getStoredUser()))();
    const clean1 = onSocket('paymentStatus', ({ status }) => setStatusMessage(`Payment update: ${status}`));
    const cleanGroup = onSocket('groupPaymentStatus', ({ status }) => setStatusMessage(`Group payment update: ${status}`));
    const cleanVerified = onSocket('groupMemberVerified', () => setStatusMessage('Group membership verified.'));
    const clean2 = onSocket('rideBooked', (ride) => { setStatusMessage(`Ride booked: ${ride.driver} arriving ${ride.eta}`); navigation.navigate('RideDetails', { ride }); });
    return () => { clean1(); cleanGroup(); cleanVerified(); clean2(); };
  }, [navigation]);

  async function handlePaystack() {
    try {
      setLoading(true); setStatusMessage('Initializing payment...');
      const payload = paymentType === 'group' ? { groupId, groupMemberId, userId: currentUser?.id, amount } : { matchId, userId: currentUser?.id, amount };
      const data = await postJson('/processPayment', payload);
      setReference(data.reference); setPaymentUrl(data.authorizationUrl); setStatusMessage('Opening Paystack checkout...'); await Linking.openURL(data.authorizationUrl);
    } catch (err) { setStatusMessage(err.message || 'Payment failed'); } finally { setLoading(false); }
  }

  async function handleVerify() {
    if (!reference) { setStatusMessage('Please start payment first.'); return; }
    try {
      setLoading(true); setStatusMessage('Verifying payment...'); const result = await getJson(`/verifyPayment/${encodeURIComponent(reference)}`);
      const status = result.payment.status; setStatusMessage(status === 'success' ? 'Payment success!' : 'Payment failed.');
      if (status === 'success' && paymentType !== 'group') { const rideResult = await postJson('/bookRide', { matchId }); navigation.navigate('RideDetails', { ride: rideResult.ride }); }
      if (status === 'success' && paymentType === 'group') navigation.goBack();
    } catch (err) { setStatusMessage(err.message || 'Verification failed'); } finally { setLoading(false); }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} bgImage={heroImage}>
      <View className="w-full max-w-md self-center py-2">

        {/* Title Header */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-2xl bg-[#00f2fe]/20 border border-[#00f2fe]/40 items-center justify-center flex-shrink-0">
            <CardIcon size={20} color="#00f2fe" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-xl font-black text-white">Paystack Checkout</Text>
            <Text className="text-[#8eb4c6] text-xs">Secure instant payment verification</Text>
          </View>
        </View>

        {/* Amount Breakdown Card */}
        <View className="bg-[#0b172a]/95 rounded-3xl p-5 md:p-6 border border-[#00f2fe]/30 shadow-2xl mb-4">
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-white/[0.08]">
            <View>
              <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold tracking-wider">Total Ride Fare</Text>
              <Text className="text-xl md:text-2xl font-black text-white">GHS {amount}</Text>
            </View>
            <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-1 rounded-full">
              <Text className="text-[#00f2fe] font-extrabold text-[11px]">
                {paymentType === 'group' ? 'Group Share' : 'Your Split Share'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-white/[0.04] p-3 rounded-2xl border border-white/[0.08]">
            <Text className="text-[#c9e5f4] text-xs font-bold">Your Payable Amount:</Text>
            <Text className="text-[#00f2fe] text-lg font-black">
              GHS {paymentType === 'group' ? amount : share}
            </Text>
          </View>
        </View>

        {/* Paystack Test Card Info Badge */}
        <View className="bg-[#0b172a]/90 border border-white/[0.08] p-3 rounded-2xl mb-4 flex-row items-center gap-2.5">
          <InfoIcon size={16} color="#00f2fe" />
          <View className="flex-1 min-w-0">
            <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Paystack Test Card</Text>
            <Text className="text-[#e6f7ff] text-xs font-extrabold tracking-wider">4084 4084 0840 8408</Text>
          </View>
        </View>

        {/* Status Message Box */}
        <View className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 p-3.5 rounded-2xl mb-4 flex-row items-center gap-2.5">
          <View className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]" />
          <View className="flex-1 min-w-0">
            <Text className="text-[#8eb4c6] text-[10px] uppercase font-bold">Payment Status</Text>
            <Text className="text-white text-xs font-extrabold mt-0.5">{statusMessage}</Text>
          </View>
        </View>

        {/* Primary Pay Action */}
        <TouchableOpacity
          className={`py-3.5 rounded-2xl items-center shadow-xl mb-3 flex-row justify-center gap-2 ${
            loading ? 'bg-[#ff5e36]/50' : 'bg-[#ff5e36] border border-[#ff5e36]/60 active:scale-98'
          }`}
          onPress={handlePaystack}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <LockIcon size={16} color="#ffffff" />
              <Text className="text-white font-black text-sm md:text-base tracking-wide">Start Paystack Payment</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Verify Action */}
        <TouchableOpacity
          className={`py-3 rounded-2xl items-center flex-row justify-center gap-2 shadow-md ${
            !reference ? 'bg-white/[0.05] border border-white/[0.1]' : 'bg-[#00f2fe]/15 border border-[#00f2fe]/50 active:bg-[#00f2fe]/30'
          }`}
          onPress={handleVerify}
          disabled={loading || !reference}
        >
          <CheckIcon size={16} color={!reference ? '#688ca0' : '#00f2fe'} />
          <Text className={`font-extrabold text-xs md:text-sm ${!reference ? 'text-[#688ca0]' : 'text-[#00f2fe]'}`}>
            {reference ? 'Verify Payment Transaction' : 'Pay before verification'}
          </Text>
        </TouchableOpacity>

        {paymentUrl ? (
          <Text className="text-[#8eb4c6] text-[11px] text-center mt-3 font-semibold">
            Payment checkout opened in your browser window.
          </Text>
        ) : null}

      </View>
    </ScreenLayout>
  );
}