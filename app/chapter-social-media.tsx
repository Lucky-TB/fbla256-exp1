/**
 * Chapter Social Media Screen
 * 
 * Displays all chapter social media handles in a clean, organized view.
 * Shows Instagram, X/Twitter, TikTok, and Facebook with platform-specific styling.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getChapterSocialMedia } from '@/utils/userProfile';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface ChapterSocialMedia {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  facebook?: string;
}

export default function ChapterSocialMediaScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, textSizeMultiplier } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [socialMedia, setSocialMedia] = useState<ChapterSocialMedia | null>(null);
  const [chapterName, setChapterName] = useState<string>('');

  useEffect(() => {
    loadSocialMedia();
  }, []);

  const loadSocialMedia = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setChapterName(profile.chapter);
        const socialData = await getChapterSocialMedia(profile.chapter, user.id);
        setSocialMedia(socialData);
      }
    } catch (error) {
      console.error('Error loading social media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSocialMedia = async (platform: 'instagram' | 'twitter' | 'tiktok' | 'facebook') => {
    if (!socialMedia) return;

    let webUrl = '';
    let deepLink = '';

    switch (platform) {
      case 'instagram':
        if (!socialMedia.instagram) return;
        // Use desktop version for better post viewing capabilities
        webUrl = `https://www.instagram.com/${socialMedia.instagram}/`;
        deepLink = `instagram://user?username=${socialMedia.instagram}`;
        break;
      case 'twitter':
        if (!socialMedia.twitter) return;
        webUrl = `https://x.com/${socialMedia.twitter}`;
        deepLink = `twitter://user?screen_name=${socialMedia.twitter}`;
        break;
      case 'tiktok':
        if (!socialMedia.tiktok) return;
        webUrl = `https://www.tiktok.com/@${socialMedia.tiktok}`;
        deepLink = `tiktok://user?username=${socialMedia.tiktok}`;
        break;
      case 'facebook':
        if (!socialMedia.facebook) return;
        const fbHandle = socialMedia.facebook.startsWith('http')
          ? socialMedia.facebook
          : `https://facebook.com/${socialMedia.facebook}`;
        webUrl = fbHandle;
        deepLink = `fb://page/${socialMedia.facebook}`;
        break;
    }

    // Try deep linking first, fallback to WebView
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
        return;
      }
    } catch (error) {
      console.log('Deep link not available, using WebView');
    }

    // Fallback to WebView - navigate to pdf-viewer screen
    router.push(`/pdf-viewer?url=${encodeURIComponent(webUrl)}&title=${encodeURIComponent(platform)}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0A2E7F" />
          <Text className="text-[#6B7280] mt-4" style={{ fontSize: 14 * textSizeMultiplier }}>
            Loading social media...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasAnySocialMedia = socialMedia && (
    socialMedia.instagram || socialMedia.twitter || socialMedia.tiktok || socialMedia.facebook
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            Chapter Social Media
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {chapterName && (
            <Text
              className="text-[#6B7280] text-base mb-6"
              style={{ fontSize: 16 * textSizeMultiplier }}
            >
              {chapterName}
            </Text>
          )}

          {!hasAnySocialMedia ? (
            <View className="bg-[#F9FAFB] rounded-xl p-8 items-center">
              <FontAwesome name="share-alt" size={48} color="#9CA3AF" />
              <Text
                className="text-[#6B7280] text-center mt-4 font-semibold"
                style={{ fontSize: 18 * textSizeMultiplier }}
              >
                No Social Media Connected
              </Text>
              <Text
                className="text-[#9CA3AF] text-center mt-2 text-sm"
                style={{ fontSize: 14 * textSizeMultiplier }}
              >
                Social media handles can be added during onboarding or by editing your profile.
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {socialMedia.instagram && (
                <TouchableOpacity
                  onPress={() => handleOpenSocialMedia('instagram')}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex-row items-center"
                  style={styles.socialCard}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#E4405F' }}
                  >
                    <FontAwesome name="instagram" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[#2D2B2B] font-semibold mb-1"
                      style={{ fontSize: 16 * textSizeMultiplier }}
                    >
                      Instagram
                    </Text>
                    <Text
                      className="text-[#6B7280] text-sm"
                      style={{ fontSize: 14 * textSizeMultiplier }}
                    >
                      @{socialMedia.instagram}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {socialMedia.twitter && (
                <TouchableOpacity
                  onPress={() => handleOpenSocialMedia('twitter')}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex-row items-center"
                  style={styles.socialCard}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <FontAwesome name="twitter" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[#2D2B2B] font-semibold mb-1"
                      style={{ fontSize: 16 * textSizeMultiplier }}
                    >
                      X (Twitter)
                    </Text>
                    <Text
                      className="text-[#6B7280] text-sm"
                      style={{ fontSize: 14 * textSizeMultiplier }}
                    >
                      @{socialMedia.twitter}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {socialMedia.tiktok && (
                <TouchableOpacity
                  onPress={() => handleOpenSocialMedia('tiktok')}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex-row items-center"
                  style={styles.socialCard}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <FontAwesome name="music" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[#2D2B2B] font-semibold mb-1"
                      style={{ fontSize: 16 * textSizeMultiplier }}
                    >
                      TikTok
                    </Text>
                    <Text
                      className="text-[#6B7280] text-sm"
                      style={{ fontSize: 14 * textSizeMultiplier }}
                    >
                      @{socialMedia.tiktok}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {socialMedia.facebook && (
                <TouchableOpacity
                  onPress={() => handleOpenSocialMedia('facebook')}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex-row items-center"
                  style={styles.socialCard}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#1877F2' }}
                  >
                    <FontAwesome name="facebook" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[#2D2B2B] font-semibold mb-1"
                      style={{ fontSize: 16 * textSizeMultiplier }}
                    >
                      Facebook
                    </Text>
                    <Text
                      className="text-[#6B7280] text-sm"
                      style={{ fontSize: 14 * textSizeMultiplier }}
                      numberOfLines={1}
                    >
                      {socialMedia.facebook.startsWith('http')
                        ? socialMedia.facebook
                        : socialMedia.facebook}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  socialCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
