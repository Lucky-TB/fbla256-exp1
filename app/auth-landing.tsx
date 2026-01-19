import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AuthLandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top Section with Plants Illustration */}
        <View className="flex-1 bg-[#E8F4F8] justify-end items-center pb-8 px-8">
          {/* Plant illustrations */}
          <View className="flex-row items-end justify-center mb-8">
            {/* Left plant - succulent */}
            <View className="items-center mr-8">
              <View className="w-20 h-[100px] bg-[#A8D5BA] rounded-t-[40px] mb-2" />
              <View className="w-[70px] h-[70px] rounded-[35px] bg-[#B8E5C8]" />
            </View>
            {/* Right plant - snake plant */}
            <View className="items-center">
              <View className="w-[60px] h-[140px] bg-[#90C695] rounded-t-[30px] mb-2" />
              <View className="w-[60px] h-[60px] rounded-[30px] bg-white" />
            </View>
          </View>
        </View>

        {/* Bottom Section with Buttons */}
        <View className="px-6 py-8 bg-white">
          {/* Login Button */}
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="bg-[#0A2E7F] rounded-xl py-4 items-center mb-4"
          >
            <Text className="text-white text-lg font-semibold">Login</Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="bg-white border-2 border-[#0A2E7F] rounded-xl py-4 items-center mb-4"
          >
            <Text className="text-[#0A2E7F] text-lg font-semibold">Register</Text>
          </TouchableOpacity>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home')}
            className="items-center mt-2"
          >
            <Text className="text-[#1D52BC] text-base font-medium">Continue as a guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
