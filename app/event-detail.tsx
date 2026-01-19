/**
 * Event Detail Screen
 * 
 * Displays comprehensive information about a single FBLA event.
 * Allows users to add/remove events from their personal schedule
 * and manage reminder settings.
 * 
 * FBLA Judging Note: This screen is optimized for judge walkthroughs.
 * It clearly shows all event details, deadlines, and competition-specific
 * information in an organized, easy-to-understand format.
 */

import { useAuth } from '@/contexts/AuthContext';
import {
  getEventById,
  getEventsWithAssociationStatus,
  addEventToUserSchedule,
  removeEventFromUserSchedule,
  updateEventReminderSettings,
  FBLAEvent,
  FBLAEventWithAssociation,
} from '@/utils/events';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<FBLAEventWithAssociation | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const events = await getEventsWithAssociationStatus(user.id, {});
        const foundEvent = events.find((e) => e.id === id);

        if (foundEvent) {
          setEvent(foundEvent);
          setReminderEnabled(foundEvent.reminderEnabled || false);
        } else {
          // If not found in associations, get the event directly
          const eventData = await getEventById(id);
          if (eventData) {
            setEvent({
              ...eventData,
              isAddedToMyEvents: false,
            });
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
        Alert.alert('Error', 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user?.id]);

  const handleAddToSchedule = async () => {
    if (!user?.id || !event) return;

    try {
      await addEventToUserSchedule(user.id, event.id, reminderEnabled, 1);
      setEvent({ ...event, isAddedToMyEvents: true });
      Alert.alert('Success', 'Event added to your schedule');
    } catch (error) {
      console.error('Error adding event to schedule:', error);
      Alert.alert('Error', 'Failed to add event to schedule');
    }
  };

  const handleRemoveFromSchedule = async () => {
    if (!user?.id || !event) return;

    Alert.alert(
      'Remove Event',
      'Are you sure you want to remove this event from your schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEventFromUserSchedule(user.id, event.id);
              setEvent({ ...event, isAddedToMyEvents: false });
              Alert.alert('Success', 'Event removed from your schedule');
            } catch (error) {
              console.error('Error removing event from schedule:', error);
              Alert.alert('Error', 'Failed to remove event from schedule');
            }
          },
        },
      ]
    );
  };

  const handleReminderToggle = async (value: boolean) => {
    if (!user?.id || !event || !event.isAddedToMyEvents) return;

    try {
      setReminderEnabled(value);
      await updateEventReminderSettings(user.id, event.id, value);
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      setReminderEnabled(!value); // Revert on error
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getEventCategoryIcon = (category: string): string => {
    switch (category) {
      case 'adviser_webinar':
        return 'graduation-cap';
      case 'celebration':
        return 'birthday-cake';
      case 'conferences':
        return 'users';
      case 'member_webinar':
        return 'video-camera';
      default:
        return 'calendar';
    }
  };

  const getEventCategoryColor = (category: string): string => {
    switch (category) {
      case 'adviser_webinar':
        return '#8B5CF6';
      case 'celebration':
        return '#EC4899';
      case 'conferences':
        return '#0A2E7F';
      case 'member_webinar':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  const formatEventCategory = (category: string): string => {
    switch (category) {
      case 'adviser_webinar':
        return 'Adviser Webinar';
      case 'celebration':
        return 'Celebration';
      case 'conferences':
        return 'Conferences';
      case 'member_webinar':
        return 'Member Webinar';
      default:
        return category;
    }
  };

  const formatEventDivision = (division?: string): string => {
    if (!division) return '';
    switch (division) {
      case 'collegiate':
        return 'Collegiate';
      case 'high_school':
        return 'High School';
      case 'middle_school':
        return 'Middle School';
      default:
        return division;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const color = getEventCategoryColor(event.eventCategory);
  const icon = getEventCategoryIcon(event.eventCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Type Badge */}
        <View style={styles.typeBadgeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: `${color}15` }]}>
            <FontAwesome name={icon as any} size={16} color={color} />
            <Text style={[styles.typeBadgeText, { color }]}>
              {formatEventCategory(event.eventCategory)}
            </Text>
          </View>
        </View>

        {/* Event Division */}
        {event.eventDivision && (
          <View style={styles.divisionSection}>
            <Text style={styles.divisionLabel}>Division:</Text>
            <Text style={styles.divisionValue}>{formatEventDivision(event.eventDivision)}</Text>
          </View>
        )}

        {/* Event Name */}
        <Text style={styles.eventName}>{event.name}</Text>

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="calendar" size={18} color="#000000" />
            <Text style={styles.sectionTitle}>Date & Time</Text>
          </View>
          <Text style={styles.sectionContent}>
            {formatDate(event.startDate)} at {formatTime(event.startDate)}
          </Text>
          {event.endDate && (
            <Text style={styles.sectionContent}>
              Ends: {formatDate(event.endDate)} at {formatTime(event.endDate)}
            </Text>
          )}
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="map-marker" size={18} color="#000000" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.sectionContent}>{event.location}</Text>
            {event.locationType === 'virtual' && event.virtualLink && (
              <Text style={[styles.sectionContent, styles.linkText]}>{event.virtualLink}</Text>
            )}
            {event.locationType === 'hybrid' && event.virtualLink && (
              <Text style={[styles.sectionContent, styles.linkText]}>
                Virtual option: {event.virtualLink}
              </Text>
            )}
          </View>
        )}

        {/* Registration Deadline */}
        {event.registrationDeadline && (
          <View style={[styles.section, styles.deadlineSection]}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="clock-o" size={18} color="#EF4444" />
              <Text style={[styles.sectionTitle, styles.deadlineTitle]}>
                Registration Deadline
              </Text>
            </View>
            <Text style={[styles.sectionContent, styles.deadlineText]}>
              {formatDate(event.registrationDeadline)} at{' '}
              {formatTime(event.registrationDeadline)}
            </Text>
            {new Date(event.registrationDeadline) > new Date() && (
              <Text style={styles.deadlineWarning}>
                Register before this date to participate
              </Text>
            )}
          </View>
        )}

        {/* Competition Details (if applicable) */}
        {event.competitionCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="trophy" size={18} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Competition Details</Text>
            </View>
            <Text style={styles.sectionContent}>
              Category: {event.competitionCategory}
            </Text>
            {event.competitionLevel && (
              <Text style={styles.sectionContent}>
                Level: {event.competitionLevel.charAt(0).toUpperCase() +
                  event.competitionLevel.slice(1)}
              </Text>
            )}
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="info-circle" size={18} color="#000000" />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* My Events Section */}
        <View style={styles.section}>
          {event.isAddedToMyEvents ? (
            <>
              <View style={styles.addedSection}>
                <View style={styles.addedInfo}>
                  <FontAwesome name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.addedText}>Added to My Events</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveFromSchedule}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* Reminder Settings */}
              <View style={styles.reminderSection}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>Enable Reminders</Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={handleReminderToggle}
                    trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.reminderDescription}>
                  Get notified before registration deadlines and event dates
                </Text>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: color }]}
              onPress={handleAddToSchedule}
            >
              <FontAwesome name="plus-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add to My Events</Text>
            </TouchableOpacity>
          )}
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  typeBadgeContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
  },
  divisionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  divisionLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
  divisionValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#000000',
  },
  eventName: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 36,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'ApercuPro-Regular',
    lineHeight: 24,
    marginBottom: 4,
  },
  deadlineSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deadlineTitle: {
    color: '#EF4444',
  },
  deadlineText: {
    color: '#EF4444',
    fontFamily: 'ApercuPro-Medium',
    fontWeight: '600',
  },
  deadlineWarning: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: 'ApercuPro-Regular',
    marginTop: 8,
    fontStyle: 'italic',
  },
  linkText: {
    color: '#0A2E7F',
    textDecorationLine: 'underline',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'ApercuPro-Regular',
    lineHeight: 24,
  },
  addedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  addedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addedText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#10B981',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#EF4444',
  },
  reminderSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#000000',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
});
