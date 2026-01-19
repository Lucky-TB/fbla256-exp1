import { useAuth } from '@/contexts/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserRole = 'student' | 'teacher' | 'admin';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const roles: { value: UserRole; label: string; icon: string; color: string }[] = [
    { value: 'student', label: 'Student', icon: 'graduation-cap', color: '#1D52BC' },
    { value: 'teacher', label: 'Teacher', icon: 'book', color: '#1D52BC' },
    { value: 'admin', label: 'Admin', icon: 'cog', color: '#1D52BC' },
  ];

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email, password, selectedRole);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 w-10"
            >
              <FontAwesome name="arrow-left" size={24} color="#2D2B2B" />
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-[30px] font-bold text-[#2D2B2B] mb-2">
              Welcome back!{'\n'}Glad to see you again!
            </Text>

            {/* Role Selection */}
            <View className="mb-6 mt-4">
              <Text className="text-sm font-semibold text-[#2D2B2B] mb-3">Select Your Role</Text>
              <View className="flex-row">
                {roles.map((role, index) => (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => {
                      setSelectedRole(role.value);
                      setError('');
                    }}
                    className={`flex-1 p-3 rounded-xl border-2 ${index > 0 ? 'ml-3' : ''} ${
                      selectedRole === role.value
                        ? 'border-[#0A2E7F] bg-[rgba(10,46,127,0.1)]'
                        : 'border-[#E5E7EB] bg-white'
                    }`}
                  >
                    <View className="items-center">
                      <FontAwesome
                        name={role.icon as any}
                        size={20}
                        color={selectedRole === role.value ? '#0A2E7F' : '#9CA3AF'}
                      />
                      <Text
                        className={`mt-2 text-xs font-semibold ${
                          selectedRole === role.value ? 'text-[#0A2E7F]' : 'text-[#6B7280]'
                        }`}
                      >
                        {role.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <TextInput
                className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border border-[#E5E7EB]"
                style={{ fontFamily: 'ApercuPro-Regular' }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View className="relative">
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 pr-12 text-[#2D2B2B] text-base border border-[#E5E7EB]"
                  style={{ fontFamily: 'ApercuPro-Regular' }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <FontAwesome
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6 self-end">
              <Text className="text-[#1D52BC] text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? (
              <View className="mb-4 p-3 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
                <Text className="text-[#DC2626] text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`bg-[#0A2E7F] rounded-xl py-4 items-center mb-8 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Login</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View className="items-center">
              <Text className="text-[#6B7280] text-sm">
                Don't have an account?{' '}
                <Text
                  className="text-[#1D52BC] font-semibold"
                  onPress={() => router.push('/register')}
                >
                  Register Now
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

