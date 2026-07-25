import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { LogoutIcon } from './Icons';

export default function LogoutConfirm({ onLogout, loading = false, children, renderTrigger }) {
  const [visible, setVisible] = useState(false);
  function open() { if (!loading) setVisible(true); }

  return (
    <View>
      {renderTrigger ? renderTrigger({ open, disabled: loading }) : (
        <TouchableOpacity onPress={open} className="bg-[#ff5e36] px-4 py-2.5 rounded-xl shadow-lg flex-row items-center gap-2" disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : children ? children : (
            <>
              <LogoutIcon size={16} color="#ffffff" />
              <Text className="text-white font-bold text-sm">Logout</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <Modal transparent visible={visible} animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-6 backdrop-blur-sm">
          <View className="bg-[#0b172a] w-full max-w-sm rounded-3xl p-6 border border-[#00f2fe]/30 shadow-2xl">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-2xl bg-[#ff5e36]/15 border border-[#ff5e36]/40 items-center justify-center">
                <LogoutIcon size={20} color="#ff5e36" />
              </View>
              <Text className="text-xl font-black text-white">Log Out</Text>
            </View>
            <Text className="text-[#8eb4c6] mb-6 leading-6 text-sm">
              Are you sure you want to end your current rider session?
            </Text>
            <View className="flex-row justify-end items-center gap-3">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="px-5 py-3 rounded-2xl bg-white/[0.08] border border-white/[0.1]"
              >
                <Text className="text-[#c9e5f4] font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => { setVisible(false); await onLogout?.(); }}
                className="bg-[#ff5e36] px-6 py-3 rounded-2xl shadow-lg border border-[#ff5e36]/50"
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-extrabold text-sm">Confirm Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}