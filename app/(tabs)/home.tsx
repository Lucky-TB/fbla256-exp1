/**
 * Home Tab - Dashboard Overview
 * 
 * Provides a comprehensive dashboard-style overview of key FBLA member information,
 * upcoming events, recent announcements, and quick access to important resources.
 * 
 * ============================================================================
 * FBLA COMPETITION ALIGNMENT
 * ============================================================================
 * 
 * This tab demonstrates:
 * - Member profiles display (FBLA requirement)
 * - Calendar for events and competition reminders (FBLA requirement)
 * - News feed with announcements and updates (FBLA requirement)
 * - Access to key FBLA resources and documents (FBLA requirement)
 * - Role-based conditional rendering
 * - Real data handling from Supabase (no mock data)
 * - Professional UX design
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { getUserProfile, UserProfile } from '@/utils/userProfile';
import { getAllEvents, FBLAEvent } from '@/utils/events';
import { getChapterAnnouncements, formatAnnouncementDate, Announcement } from '@/utils/announcements';
import { getAllResources, Resource } from '@/utils/resources';

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || '?';
}

export default function HomeScreen() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { colors, textSizeMultiplier } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<FBLAEvent[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Load all data in parallel
      const [profileData, eventsData, announcementsData, resourcesData] = await Promise.all([
        getUserProfile(user.id),
        getAllEvents({ status: 'upcoming' }),
        (async () => {
          const profile = await getUserProfile(user.id);
          if (profile) {
            return await getChapterAnnouncements(profile.chapter);
          }
          return [];
        })(),
        getAllResources(),
      ]);

      setProfile(profileData);
      
      // Get 3 upcoming events, sorted by date
      const sortedEvents = eventsData
        .filter((e) => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3);
      setUpcomingEvents(sortedEvents);

      // Get 3 most recent announcements
      setRecentAnnouncements(announcementsData.slice(0, 3));

      // Get featured resources (from important categories)
      const featured = resourcesData
        .filter((r) => 
          r.categoryName === 'Official FBLA Documents' ||
          r.categoryName === 'Competitions & Events' ||
          r.title.toLowerCase().includes('guide') ||
          r.title.toLowerCase().includes('competition')
        )
        .slice(0, 4);
      setFeaturedResources(featured);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Build full name
  let fullName = 'Member';
  let displayFirstName = '';
  let displayLastName = '';
  
  if (profile?.firstName && profile?.lastName) {
    fullName = `${profile.firstName} ${profile.lastName}`;
    displayFirstName = profile.firstName;
    displayLastName = profile.lastName;
  } else if (profile?.firstName) {
    fullName = profile.firstName;
    displayFirstName = profile.firstName;
  } else if (user?.email) {
    const emailParts = user.email.split('@')[0].split('.');
    if (emailParts.length >= 2) {
      displayFirstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
      displayLastName = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
      fullName = `${displayFirstName} ${displayLastName}`;
    } else {
      fullName = user.email.split('@')[0];
      displayFirstName = fullName;
    }
  }
  
  const initials = getInitials(displayFirstName || profile?.firstName, displayLastName || profile?.lastName);

  // Create dynamic styles
  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: colors.background },
    header: { ...styles.header, backgroundColor: colors.background },
    headerTitle: { ...styles.headerTitle, color: colors.text, fontSize: 34 * textSizeMultiplier },
    loadingText: { ...styles.loadingText, color: colors.textSecondary, fontSize: 16 * textSizeMultiplier },
    profileCard: { ...styles.profileCard, backgroundColor: colors.cardBackground },
    profileName: { ...styles.profileName, color: colors.text, fontSize: 20 * textSizeMultiplier },
    profileText: { ...styles.profileText, color: colors.textSecondary, fontSize: 15 * textSizeMultiplier },
    sectionTitle: { ...styles.sectionTitle, color: colors.text, fontSize: 18 * textSizeMultiplier },
    cardTitle: { ...styles.cardTitle, color: colors.text, fontSize: 16 * textSizeMultiplier },
    cardText: { ...styles.cardText, color: colors.textSecondary, fontSize: 14 * textSizeMultiplier },
    emptyStateText: { ...styles.emptyStateText, color: colors.textSecondary, fontSize: 15 * textSizeMultiplier },
  };

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={dynamicStyles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Home</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Member Info Card */}
        <View style={dynamicStyles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={dynamicStyles.profileName}>{fullName}</Text>
              {profile?.chapter && (
                <Text style={dynamicStyles.profileText}>{profile.chapter}</Text>
              )}
              <View style={styles.profileDetails}>
                {profile?.grade && (
                  <Text style={[dynamicStyles.profileText, styles.profileDetailItem]}>
                    {profile.grade}
                  </Text>
                )}
                {profile?.graduationYear && (
                  <Text style={[dynamicStyles.profileText, styles.profileDetailItem]}>
                    Class of {profile.graduationYear}
                  </Text>
                )}
                {role && (
                  <Text style={[dynamicStyles.profileText, styles.profileDetailItem, { textTransform: 'capitalize' }]}>
                    {role}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Admin Quick Actions */}
        {(role === 'admin' || role === 'teacher') && (
          <View style={styles.quickActionsSection}>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/create-announcement')}
                activeOpacity={0.7}
              >
                <FontAwesome name="bullhorn" size={20} color="#0A2E7F" />
                <Text style={styles.quickActionText}>Post Announcement</Text>
              </TouchableOpacity>
              {role === 'admin' && (
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push('/(tabs)/events')}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="calendar-plus-o" size={20} color="#0A2E7F" />
                  <Text style={styles.quickActionText}>Add Event</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="calendar" size={20} color={colors.text} />
            <Text style={dynamicStyles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/events')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <FontAwesome name="chevron-right" size={12} color="#0A2E7F" />
              </TouchableOpacity>
            )}
          </View>

          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="calendar-o" size={32} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyStateText}>No upcoming events</Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {upcomingEvents.map((event) => {
                const getEventCategoryColor = (category: string): string => {
                  switch (category) {
                    case 'conferences': return '#0A2E7F';
                    case 'celebration': return '#F59E0B';
                    case 'adviser_webinar': return '#10B981';
                    case 'member_webinar': return '#8B5CF6';
                    default: return '#6B7280';
                  }
                };
                const getEventCategoryIcon = (category: string): string => {
                  switch (category) {
                    case 'conferences': return 'users';
                    case 'celebration': return 'birthday-cake';
                    case 'adviser_webinar': return 'graduation-cap';
                    case 'member_webinar': return 'video-camera';
                    default: return 'calendar';
                  }
                };
                const formatEventCategory = (category: string): string => {
                  switch (category) {
                    case 'conferences': return 'Conference';
                    case 'celebration': return 'Celebration';
                    case 'adviser_webinar': return 'Adviser Webinar';
                    case 'member_webinar': return 'Member Webinar';
                    default: return category;
                  }
                };
                const categoryColor = getEventCategoryColor(event.eventCategory);
                const icon = getEventCategoryIcon(event.eventCategory);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                    onPress={() => router.push(`/event-detail?id=${event.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eventCardHeader}>
                      <View style={[styles.eventBadge, { backgroundColor: `${categoryColor}15` }]}>
                        <FontAwesome name={icon as any} size={12} color={categoryColor} />
                        <Text style={[styles.eventBadgeText, { color: categoryColor }]}>
                          {formatEventCategory(event.eventCategory)}
                        </Text>
                      </View>
                    </View>
                    <Text style={dynamicStyles.cardTitle} numberOfLines={2}>
                      {event.name}
                    </Text>
                    <View style={styles.eventCardDetails}>
                      <View style={styles.eventCardRow}>
                        <FontAwesome name="calendar" size={12} color={colors.textSecondary} />
                        <Text style={dynamicStyles.cardText}>
                          {formatDate(event.startDate)} at {formatTime(event.startDate)}
                        </Text>
                      </View>
                      {event.location && (
                        <View style={styles.eventCardRow}>
                          <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
                          <Text style={dynamicStyles.cardText} numberOfLines={1}>
                            {event.location}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Recent Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="bullhorn" size={20} color={colors.text} />
            <Text style={dynamicStyles.sectionTitle}>Recent Announcements</Text>
            {recentAnnouncements.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/community')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <FontAwesome name="chevron-right" size={12} color="#0A2E7F" />
              </TouchableOpacity>
            )}
          </View>

          {recentAnnouncements.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="bullhorn" size={32} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyStateText}>No announcements yet</Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {recentAnnouncements.map((announcement) => (
                <TouchableOpacity
                  key={announcement.id}
                  style={[styles.announcementCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push(`/announcement-detail?id=${announcement.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.announcementCardHeader}>
                    {announcement.postedByRole && (
                      <View style={styles.announcementBadge}>
                        <Text style={styles.announcementBadgeText}>{announcement.postedByRole}</Text>
                      </View>
                    )}
                    <Text style={styles.announcementDate}>
                      {formatAnnouncementDate(announcement.createdAt)}
                    </Text>
                  </View>
                  <Text style={dynamicStyles.cardTitle} numberOfLines={2}>
                    {announcement.title}
                  </Text>
                  <Text style={dynamicStyles.cardText} numberOfLines={2}>
                    {announcement.body}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Resource Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="book" size={20} color={colors.text} />
            <Text style={dynamicStyles.sectionTitle}>Quick Resources</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/resources')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <FontAwesome name="chevron-right" size={12} color="#0A2E7F" />
            </TouchableOpacity>
          </View>

          {featuredResources.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="book" size={32} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyStateText}>No resources available</Text>
            </View>
          ) : (
            <View style={styles.resourcesGrid}>
              {featuredResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={[styles.resourceButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push(`/resource-detail?id=${resource.id}`)}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={resource.resourceType === 'pdf' ? 'file-pdf-o' : 'link'}
                    size={20}
                    color="#0A2E7F"
                  />
                  <Text style={[dynamicStyles.cardTitle, { marginTop: 8 }]} numberOfLines={2}>
                    {resource.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FBFBF9',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    marginBottom: 6,
  },
  profileText: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
    marginBottom: 4,
  },
  profileDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  profileDetailItem: {
    marginRight: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#0A2E7F',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#0A2E7F',
  },
  cardsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventCardHeader: {
    marginBottom: 12,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
  },
  eventCardDetails: {
    marginTop: 8,
    gap: 6,
  },
  eventCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: '#0A2E7F15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  announcementBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#0A2E7F',
  },
  announcementDate: {
    fontSize: 11,
    fontFamily: 'ApercuPro-Regular',
    color: '#9CA3AF',
  },
  emptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'ApercuPro-Regular',
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 100,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'ApercuPro-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});
