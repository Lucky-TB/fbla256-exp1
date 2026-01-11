import { useAuth } from '@/contexts/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getRoleColor = () => {
    switch (role) {
      case 'student':
        return '#3B82F6';
      case 'teacher':
        return '#10B981';
      case 'admin':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'student':
        return 'graduation-cap';
      case 'teacher':
        return 'book';
      case 'admin':
        return 'cog';
      default:
        return 'user';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: getRoleColor() + '20' }}
          >
            <FontAwesome
              name={getRoleIcon() as any}
              size={40}
              color={getRoleColor()}
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {user?.email}
          </Text>
          {role && (
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: getRoleColor() + '20' }}
            >
              <Text
                className="text-sm font-semibold capitalize"
                style={{ color: getRoleColor() }}
              >
                {role}
              </Text>
            </View>
          )}
        </View>

        {/* User Info Card */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <View className="mb-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Email
            </Text>
            <Text className="text-base text-gray-900 dark:text-white">
              {user?.email}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              User ID
            </Text>
            <Text className="text-xs text-gray-900 dark:text-white font-mono">
              {user?.id}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-xl py-4 items-center mt-auto mb-4"
        >
          <View className="flex-row items-center">
            <FontAwesome name="sign-out" size={18} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}