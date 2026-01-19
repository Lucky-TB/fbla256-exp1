/**
 * Create Announcement Screen
 * 
 * Allows teachers and admins to create new announcements for their chapter.
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
import { getUserProfile } from '@/utils/userProfile';
import { createAnnouncement } from '@/utils/announcements';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const POSTED_BY_ROLES = ['Chapter Officer', 'Chapter Adviser', 'Admin', 'Teacher'];

export default function CreateAnnouncementScreen() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { textSizeMultiplier } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapterName, setChapterName] = useState<string>('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postedByRole, setPostedByRole] = useState<string>('');

  const [errors, setErrors] = useState<{
    title?: string;
    body?: string;
  }>({});

  useEffect(() => {
    // Check if user is teacher or admin
    if (role !== 'teacher' && role !== 'admin') {
      Alert.alert(
        'Access Denied',
        'Only teachers and admins can create announcements.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadChapter();
  }, [role]);

  const loadChapter = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setChapterName(profile.chapter);
        // Set default posted by role based on user role
        if (role === 'admin') {
          setPostedByRole('Admin');
        } else if (role === 'teacher') {
          setPostedByRole('Chapter Adviser');
        }
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load chapter information.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; body?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!body.trim()) {
      newErrors.body = 'Body is required';
    }

    if (body.trim().length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before creating the announcement.');
      return;
    }

    if (!chapterName) {
      Alert.alert('Error', 'Chapter name not found. Please try again.');
      return;
    }

    setSaving(true);
    try {
      await createAnnouncement(title.trim(), body.trim(), chapterName, postedByRole || undefined);
      Alert.alert('Success', 'Announcement created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', error?.message || 'Failed to create announcement. Please try again.');
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
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              Create Announcement
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6">
            {/* Chapter Info */}
            <View className="mb-6">
              <Text
                className="text-[#6B7280] text-sm mb-1"
                style={{ fontSize: 14 * textSizeMultiplier }}
              >
                Chapter
              </Text>
              <Text
                className="text-[#2D2B2B] text-base font-semibold"
                style={{ fontSize: 16 * textSizeMultiplier }}
              >
                {chapterName}
              </Text>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Title *</Text>
              <TextInput
                className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                style={{
                  borderColor: errors.title ? '#DC2626' : '#E5E7EB',
                  fontFamily: 'ApercuPro-Regular',
                }}
                placeholder="Enter announcement title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.title;
                      return newErrors;
                    });
                  }
                }}
                autoCapitalize="words"
                maxLength={100}
              />
              {errors.title && (
                <Text className="text-[#DC2626] text-xs mt-1">{errors.title}</Text>
              )}
            </View>

            {/* Body */}
            <View className="mb-4">
              <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">Content *</Text>
              <TextInput
                className="bg-[#F9FAFB] rounded-xl px-4 py-4 text-[#2D2B2B] text-base border"
                style={{
                  borderColor: errors.body ? '#DC2626' : '#E5E7EB',
                  fontFamily: 'ApercuPro-Regular',
                  minHeight: 150,
                  textAlignVertical: 'top',
                }}
                placeholder="Enter announcement content..."
                placeholderTextColor="#9CA3AF"
                value={body}
                onChangeText={(value) => {
                  setBody(value);
                  if (errors.body) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.body;
                      return newErrors;
                    });
                  }
                }}
                multiline
                numberOfLines={6}
                maxLength={2000}
              />
              {errors.body && (
                <Text className="text-[#DC2626] text-xs mt-1">{errors.body}</Text>
              )}
              <Text className="text-[#9CA3AF] text-xs mt-1">
                {body.length}/2000 characters
              </Text>
            </View>

            {/* Posted By Role */}
            <View className="mb-6">
              <Text className="text-[#2D2B2B] text-sm font-semibold mb-2">
                Posted By <Text className="text-[#9CA3AF] font-normal">(Optional)</Text>
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {POSTED_BY_ROLES.map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    onPress={() => setPostedByRole(roleOption)}
                    className={`px-4 py-3 rounded-xl border-2 ${
                      postedByRole === roleOption
                        ? 'border-[#0A2E7F] bg-[rgba(10,46,127,0.1)]'
                        : 'border-[#E5E7EB] bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        postedByRole === roleOption ? 'text-[#0A2E7F]' : 'text-[#6B7280]'
                      }`}
                    >
                      {roleOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={saving}
              className="bg-[#0A2E7F] px-8 py-4 rounded-xl items-center mb-6"
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold" style={{ fontSize: 16 * textSizeMultiplier }}>
                  Create Announcement
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
