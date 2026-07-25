import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

export default function LogoutConfirm({ onLogout, loading = false, children, renderTrigger }) {
  const [visible, setVisible] = useState(false);
  function open() { if (!loading) setVisible(true); }

  return (
    <View>
      {renderTrigger? renderTrigger({ open, disabled: loading }) : (
        <TouchableOpacity onPress={open} className="bg-[#ff7a1a] p-3 rounded-xl" disabled={loading}>
          {loading? <ActivityIndicator color="white" /> : children? children : <Text className="text-white font-bold">Logout</Text>}
        </TouchableOpacity>
      )}

      <Modal transparent visible={visible} animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <View className="bg-white w-full max-w-sm rounded- p-5">
            <Text className="text-lg font-bold mb-2 text-zinc-900">Logout</Text>
            <Text className="text-zinc-600 mb-5 leading-5">Are you sure you want to log out?</Text>
            <View className="flex-row justify-end items-center gap-3">
              <TouchableOpacity onPress={() => setVisible(false)} className="px-4 py-2 rounded-xl bg-zinc-100">
                <Text className="text-zinc-600 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => { setVisible(false); await onLogout?.(); }}
                className="bg-[#ff7a1a] px-5 py-2.5 rounded-xl"
                disabled={loading}
              >
                {loading? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}