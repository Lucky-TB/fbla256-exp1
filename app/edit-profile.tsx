/**
 * Edit Profile Screen
 * 
 * Allows users to edit their profile information after password verification.
 * Requires entering current password to proceed with edits.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, saveUserProfile, UserProfile } from '@/utils/userProfile';
import { supabase } from '@/lib/supabase';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const GRADES = ['9th', '10th', '11th', '12th', 'Graduate'];
const GRADUATION_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { textSizeMultiplier } = useAccessibility();
  const [step, setStep] = useState<'password' | 'edit'>('password');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    school: '',
    chapter: '',
    grade: '',
    graduationYear: '',
    phoneNumber: '',
    completedOnboarding: true,
    chapterInstagram: '',
    chapterTwitter: '',
    chapterTikTok: '',
    chapterFacebook: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProfile(user.id);
      if (data) {
        setProfile({
          ...data,
          grade: data.grade || '',
          graduationYear: data.graduationYear || '',
          phoneNumber: data.phoneNumber || '',
          chapterInstagram: data.chapterInstagram || '',
          chapterTwitter: data.chapterTwitter || '',
          chapterTikTok: data.chapterTikTok || '',
          chapterFacebook: data.chapterFacebook || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password to continue.');
      return;
    }

    if (!user?.email) {
      Alert.alert('Error', 'Unable to verify password. Please try again.');
      return;
    }

    setVerifying(true);
    try {
      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
        setPassword('');
        return;
      }

      // Password verified, proceed to edit
      setStep('edit');
      setPassword('');
    } catch (error: any) {
      console.error('Error verifying password:', error);
      Alert.alert('Error', 'Failed to verify password. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profile.school.trim()) newErrors.school = 'School name is required';
    if (!profile.chapter.trim()) newErrors.chapter = 'Chapter name is required';
    if (!profile.grade) newErrors.grade = 'Please select your grade';
    if (!profile.graduationYear) newErrors.graduationYear = 'Please select graduation year';

    // Phone number is optional, but if provided, validate format
    if (profile.phoneNumber.trim()) {
      const cleaned = profile.phoneNumber.replace(/[\s\-\(\)]/g, '');
      if (!/^\d+$/.test(cleaned) || cleaned.length < 10 || cleaned.length > 15) {
        newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please sign in again.');
      return;
    }

    setSaving(true);
    try {
      const profileToSave: UserProfile = {
        ...profile,
        phoneNumber: profile.phoneNumber.trim() || undefined,
        chapterInstagram: profile.chapterInstagram.trim() || undefined,
        chapterTwitter: profile.chapterTwitter.trim() || undefined,
        chapterTikTok: profile.chapterTikTok.trim() || undefined,
        chapterFacebook: profile.chapterFacebook.trim() || undefined,
      };

      await saveUserProfile(profileToSave, user.id);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A2E7F" />
          <Text className="text-[#6B7280] mt-4" style={{ fontSize: 14 * textSizeMultiplier }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Password Verification Step
  if (step === 'password') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-[#E5E7EB]">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <FontAwesome name="chevron-left" size={20} color="#2D2B2B" />
              </TouchableOpacity>
              <Text
                className="text-[#2D2B2B] text-2xl font-bold"
                style={{ fontSize: 24 * textSizeMultiplier }}
              >
                Verify Password
              </Text>
            </View>
          </View>

          <View className="flex-1 px-6 pt-8">
            <Text
              className="text-[#2D2B2B] text-lg mb-2"
              style={{ fontSize: 18 * textSizeMultiplier }}
            >
              Enter your password to edit your profile
            </Text>
            <Text
              className="text-[#6B7280] text-base mb-6"
              style={{ fontSize: 16 * textSizeMultiplier }}
            >
              For security, we need to verify your identity before allowing profile changes.
            </Text>

            <View className="mb-6">
              <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Password</Text>
              <TextInput
                className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                style={{
                  borderColor: '#E5E7EB',
                  fontFamily: 'ApercuPro-Regular',
                }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={verifyPassword}
              />
            </View>

            <TouchableOpacity
              onPress={verifyPassword}
              disabled={verifying || !password.trim()}
              className="bg-[#0A2E7F] px-8 py-4 rounded-xl items-center"
              style={{ opacity: verifying || !password.trim() ? 0.5 : 1 }}
            >
              {verifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold" style={{ fontSize: 16 * textSizeMultiplier }}>
                  Verify & Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Edit Profile Step
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-[#E5E7EB]">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <FontAwesome name="chevron-left" size={20} color="#2D2B2B" />
            </TouchableOpacity>
            <Text
              className="text-[#2D2B2B] text-2xl font-bold"
              style={{ fontSize: 24 * textSizeMultiplier }}
            >
              Edit Profile
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6">
            {/* Personal Info */}
            <View className="mb-6">
              <Text
                className="text-[#2D2B2B] text-lg font-bold mb-4"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                Personal Information
              </Text>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">First Name</Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{
                    borderColor: errors.firstName ? '#DC2626' : '#E5E7EB',
                    fontFamily: 'ApercuPro-Regular',
                  }}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={profile.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  autoCapitalize="words"
                />
                {errors.firstName && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.firstName}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Last Name</Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{
                    borderColor: errors.lastName ? '#DC2626' : '#E5E7EB',
                    fontFamily: 'ApercuPro-Regular',
                  }}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  value={profile.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  autoCapitalize="words"
                />
                {errors.lastName && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* School Info */}
            <View className="mb-6">
              <Text
                className="text-[#2D2B2B] text-lg font-bold mb-4"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                School Information
              </Text>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">School Name</Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{
                    borderColor: errors.school ? '#DC2626' : '#E5E7EB',
                    fontFamily: 'ApercuPro-Regular',
                  }}
                  placeholder="e.g., Lincoln High School"
                  placeholderTextColor="#9CA3AF"
                  value={profile.school}
                  onChangeText={(value) => updateField('school', value)}
                  autoCapitalize="words"
                />
                {errors.school && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.school}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Chapter Name</Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{
                    borderColor: errors.chapter ? '#DC2626' : '#E5E7EB',
                    fontFamily: 'ApercuPro-Regular',
                  }}
                  placeholder="e.g., Lincoln High School FBLA"
                  placeholderTextColor="#9CA3AF"
                  value={profile.chapter}
                  onChangeText={(value) => updateField('chapter', value)}
                  autoCapitalize="words"
                />
                {errors.chapter && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.chapter}</Text>
                )}
              </View>
            </View>

            {/* Academic Info */}
            <View className="mb-6">
              <Text
                className="text-[#2D2B2B] text-lg font-bold mb-4"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                Academic Information
              </Text>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Current Grade</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {GRADES.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      onPress={() => updateField('grade', grade)}
                      className={`px-4 py-3 rounded-xl border-2 ${
                        profile.grade === grade
                          ? 'border-[#0A2E7F] bg-[rgba(10,46,127,0.1)]'
                          : 'border-[#E5E7EB] bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          profile.grade === grade ? 'text-[#0A2E7F]' : 'text-[#6B7280]'
                        }`}
                      >
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.grade && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.grade}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Graduation Year</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {GRADUATION_YEARS.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => updateField('graduationYear', year)}
                      className={`px-4 py-3 rounded-xl border-2 ${
                        profile.graduationYear === year
                          ? 'border-[#0A2E7F] bg-[rgba(10,46,127,0.1)]'
                          : 'border-[#E5E7EB] bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          profile.graduationYear === year ? 'text-[#0A2E7F]' : 'text-[#6B7280]'
                        }`}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.graduationYear && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.graduationYear}</Text>
                )}
              </View>
            </View>

            {/* Contact Info */}
            <View className="mb-6">
              <Text
                className="text-[#2D2B2B] text-lg font-bold mb-4"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                Contact Information
              </Text>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">
                  Phone Number <Text className="text-[#9CA3AF] font-normal">(Optional)</Text>
                </Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{
                    borderColor: errors.phoneNumber ? '#DC2626' : '#E5E7EB',
                    fontFamily: 'ApercuPro-Regular',
                  }}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  value={profile.phoneNumber}
                  onChangeText={(value) => updateField('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
                {errors.phoneNumber && (
                  <Text className="text-[#DC2626] text-xs mt-1">{errors.phoneNumber}</Text>
                )}
              </View>
            </View>

            {/* Chapter Social Media */}
            <View className="mb-6">
              <Text
                className="text-[#2D2B2B] text-lg font-bold mb-4"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                Chapter Social Media <Text className="text-[#9CA3AF] font-normal">(Optional)</Text>
              </Text>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Instagram</Text>
                <View className="flex-row items-center">
                  <Text className="text-[#6B7280] mr-2">@</Text>
                  <TextInput
                    className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border flex-1"
                    style={{ borderColor: '#E5E7EB', fontFamily: 'ApercuPro-Regular' }}
                    placeholder="username"
                    placeholderTextColor="#9CA3AF"
                    value={profile.chapterInstagram}
                    onChangeText={(value) => updateField('chapterInstagram', value.replace('@', ''))}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">X (Twitter)</Text>
                <View className="flex-row items-center">
                  <Text className="text-[#6B7280] mr-2">@</Text>
                  <TextInput
                    className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border flex-1"
                    style={{ borderColor: '#E5E7EB', fontFamily: 'ApercuPro-Regular' }}
                    placeholder="username"
                    placeholderTextColor="#9CA3AF"
                    value={profile.chapterTwitter}
                    onChangeText={(value) => updateField('chapterTwitter', value.replace('@', ''))}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">TikTok</Text>
                <View className="flex-row items-center">
                  <Text className="text-[#6B7280] mr-2">@</Text>
                  <TextInput
                    className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border flex-1"
                    style={{ borderColor: '#E5E7EB', fontFamily: 'ApercuPro-Regular' }}
                    placeholder="username"
                    placeholderTextColor="#9CA3AF"
                    value={profile.chapterTikTok}
                    onChangeText={(value) => updateField('chapterTikTok', value.replace('@', ''))}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Facebook</Text>
                <TextInput
                  className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                  style={{ borderColor: '#E5E7EB', fontFamily: 'ApercuPro-Regular' }}
                  placeholder="Page URL or username"
                  placeholderTextColor="#9CA3AF"
                  value={profile.chapterFacebook}
                  onChangeText={(value) => updateField('chapterFacebook', value)}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveProfile}
              disabled={saving}
              className="bg-[#0A2E7F] px-8 py-4 rounded-xl items-center mb-6"
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold" style={{ fontSize: 16 * textSizeMultiplier }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
