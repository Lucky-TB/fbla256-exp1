/**
 * Announcement Detail Screen
 * 
 * Displays full details of a single announcement.
 * Similar to event-detail.tsx for consistency.
 */

import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  getChapterAnnouncements,
  formatAnnouncementDate,
  deleteAnnouncement,
  canDeleteAnnouncement,
  Announcement,
} from '@/utils/announcements';
import { getUserProfile } from '@/utils/userProfile';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function AnnouncementDetailScreen() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { colors, textSizeMultiplier } = useAccessibility();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [userChapter, setUserChapter] = useState<string>('');
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const loadAnnouncement = async () => {
      if (!id || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUserChapter(profile.chapter);
          const announcements = await getChapterAnnouncements(profile.chapter);
          const foundAnnouncement = announcements.find((a) => a.id === id);
          if (foundAnnouncement) {
            setAnnouncement(foundAnnouncement);
            // Check if user can delete this announcement
            const canDeleteResult = await canDeleteAnnouncement(
              foundAnnouncement,
              role,
              profile.chapter
            );
            setCanDelete(canDeleteResult);
          }
        }
      } catch (error) {
        console.error('Error loading announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, [id, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={[styles.loadingText, { fontSize: 16 * textSizeMultiplier }]}>
            Loading announcement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcement</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { fontSize: 16 * textSizeMultiplier }]}>
            Announcement not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    if (!announcement) return;

    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAnnouncement(announcement.id);
              Alert.alert('Success', 'Announcement deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', error?.message || 'Failed to delete announcement. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    announcementTitle: { ...styles.announcementTitle, fontSize: 24 * textSizeMultiplier },
    sectionTitle: { ...styles.sectionTitle, fontSize: 17 * textSizeMultiplier },
    sectionContent: { ...styles.sectionContent, fontSize: 16 * textSizeMultiplier },
    postedByText: { ...styles.postedByText, fontSize: 15 * textSizeMultiplier },
    dateText: { ...styles.dateText, fontSize: 14 * textSizeMultiplier },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcement</Text>
        {canDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={styles.deleteButton}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <FontAwesome name="trash" size={18} color="#EF4444" />
            )}
          </TouchableOpacity>
        )}
        {!canDelete && <View style={styles.headerRight} />}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Posted By Badge */}
        {announcement.postedByRole && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <FontAwesome name="user" size={14} color="#0A2E7F" />
              <Text style={styles.badgeText}>{announcement.postedByRole}</Text>
            </View>
          </View>
        )}

        {/* Title */}
        <Text style={dynamicStyles.announcementTitle}>{announcement.title}</Text>

        {/* Date & Posted By */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
            <Text style={dynamicStyles.dateText}>
              {formatAnnouncementDate(announcement.createdAt)}
            </Text>
          </View>
          {announcement.postedByRole && (
            <View style={styles.metaRow}>
              <FontAwesome name="user" size={14} color={colors.textSecondary} />
              <Text style={dynamicStyles.postedByText}>{announcement.postedByRole}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="file-text-o" size={18} color="#000000" />
            <Text style={dynamicStyles.sectionTitle}>Content</Text>
          </View>
          <Text style={dynamicStyles.sectionContent}>{announcement.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBF9',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FBFBF9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  deleteButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  badgeContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0A2E7F15',
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#0A2E7F',
  },
  announcementTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
    lineHeight: 32,
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'ApercuPro-Regular',
    color: '#6B7280',
  },
  postedByText: {
    fontSize: 15,
    fontFamily: 'ApercuPro-Regular',
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: 'ApercuPro-Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'ApercuPro-Regular',
    color: '#6B7280',
  },
});
