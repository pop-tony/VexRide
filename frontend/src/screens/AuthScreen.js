import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { postJson } from '../services/api';
import { saveUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80' };

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage('');
      const endpoint = mode === 'signup'? '/auth/signup' : '/auth/login';
      const body = mode === 'signup'? { name, email, phone, password } : { email, password };
      if (mode === 'signup') {
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
        if (password!== confirmPassword) throw new Error('Passwords do not match');
      }
      const result = await postJson(endpoint, body);
      await saveUser(result.user);
      navigation.replace('Home');
    } catch (error) {
      setMessage(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground source={heroImage} className="flex-1 bg-[#061426]">
      <View className="absolute inset-0 bg-[#061426]/70" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6">
          <View className="w-full max-w-md self-center bg-[#06182c]/95 rounded- p-6 border border-[#21d3c7]/20">
            <TouchableOpacity
              className={`self-start min-h- px-4 rounded-full justify-center border mb-4 ${!navigation.canGoBack()? 'opacity-40 bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              disabled={!navigation.canGoBack()}
            >
              <Text className="text-[#c9e5f4] font-extrabold">Previous</Text>
            </TouchableOpacity>

            <Text className="text- font-black text-[#21d3c7] mb-2">{mode === 'signup'? 'Create your account' : 'Welcome back'}</Text>
            <Text className="text-[#c9e5f4] mb-6 leading-5">Sign up or log in to test real rider accounts.</Text>

            {mode === 'signup' && (
              <>
                <Text className="text-[#c9e5f4] text- font-bold mb-2 mt-1">Full Name</Text>
                <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Your name" placeholderTextColor="#8eb4c6" value={name} onChangeText={setName} />
                <Text className="text-[#c9e5f4] text- font-bold mb-2">Phone Number</Text>
                <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Phone number" placeholderTextColor="#8eb4c6" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <View className="mb-4">
                  <Text className="text-[#c9e5f4] text- font-bold mb-2">Password</Text>
                  <View className="relative justify-center">
                    <TextInput className="bg-white/10 rounded-2xl px-4 py-4 text-white border border-white/10 pr-16" placeholder="Password" placeholderTextColor="#8eb4c6" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity className="absolute right-4" onPress={() => setShowPassword(s =>!s)}>
                      <Text className="text-[#6fe7de] font-bold">{showPassword? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="mb-2">
                  <Text className="text-[#c9e5f4] text- font-bold mb-2">Confirm Password</Text>
                  <View className="relative justify-center">
                    <TextInput className="bg-white/10 rounded-2xl px-4 py-4 text-white border border-white/10 pr-16" placeholder="Confirm password" placeholderTextColor="#8eb4c6" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
                    <TouchableOpacity className="absolute right-4" onPress={() => setShowConfirmPassword(s =>!s)}>
                      <Text className="text-[#6fe7de] font-bold">{showConfirmPassword? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-[#c9e5f4] text-xs mt-2">{passwordStrength(password)}</Text>
              </>
            )}

            <Text className="text-[#c9e5f4] text- font-bold mb-2 mt-4">Email Address</Text>
            <TextInput className="bg-white/10 rounded-2xl px-4 py-4 mb-4 text-white border border-white/10" placeholder="Email address" placeholderTextColor="#8eb4c6" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            {mode === 'login' && (
              <View className="mb-4">
                <Text className="text-[#c9e5f4] text- font-bold mb-2">Password</Text>
                <View className="relative justify-center">
                  <TextInput className="bg-white/10 rounded-2xl px-4 py-4 text-white border border-white/10 pr-16" placeholder="Password" placeholderTextColor="#8eb4c6" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity className="absolute right-4" onPress={() => setShowPassword(s =>!s)}>
                    <Text className="text-[#6fe7de] font-bold">{showPassword? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {message? <Text className="text-[#ffd099] font-bold mb-3">{message}</Text> : null}

            <TouchableOpacity
              className={`p-4 rounded-2xl mt-3 items-center ${loading ||!canSubmit(mode, name, email, password, confirmPassword)? 'bg-[#ff7a1a]/50' : 'bg-[#ff7a1a]'}`}
              onPress={handleSubmit}
              disabled={loading ||!canSubmit(mode, name, email, password, confirmPassword)}
            >
              {loading? <ActivityIndicator color="white" /> : <Text className="text-white font-extrabold text-base">{mode === 'signup'? 'Sign up' : 'Log in'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 items-center" onPress={() => setMode(mode === 'signup'? 'login' : 'signup')}>
              <Text className="text-[#6fe7de] font-bold">{mode === 'signup'? 'Already have an account? Log in' : 'Need an account? Sign up'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function passwordStrength(pw) {
  if (!pw) return '';
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'Weak password';
  if (score === 2) return 'Okay password';
  return 'Strong password';
}
function canSubmit(mode, name, email, password, confirm) {
  if (mode === 'login') return email && password;
  return name && email && password && confirm && password === confirm && password.length >= 6;
}