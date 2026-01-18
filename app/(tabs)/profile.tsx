import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserProfileWithPreferences,
  updateUserPreferences,
  UserProfile,
  UserPreferences,
} from '@/utils/userProfile';

/**
 * Profile Tab - Modern FBLA Member Profile Screen
 * 
 * Modern UI/UX Design Principles:
 * - Consistent spacing system (8px base unit)
 * - Clear visual hierarchy with proper typography scale
 * - Card-based layout with subtle shadows
 * - Generous whitespace for readability
 * - Modern color palette with proper contrast
 * - Smooth, polished interactions
 */

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || '?';
}

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

function InfoCard({ icon, label, value, iconColor = '#0A2E7F' }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardContent}>
        <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <FontAwesome name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

interface SettingRowProps {
  icon?: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}

function SettingRow({ icon, title, subtitle, rightElement, onPress, showBorder = true }: SettingRowProps) {
  const content = (
    <View style={[styles.settingRow, showBorder && styles.settingRowBorder]}>
      {icon && (
        <View style={styles.settingIconContainer}>
          <FontAwesome name={icon as any} size={20} color="#6B7280" />
        </View>
      )}
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProfileWithPreferences(user.id);
      if (data) {
        setProfile(data.profile);
        setPreferences(data.preferences);
      } else {
        setPreferences({
          notifications: {
            events: true,
            competitions: true,
            announcements: true,
          },
          accessibility: {
            textSize: 'medium',
            highContrast: false,
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setPreferences({
        notifications: {
          events: true,
          competitions: true,
          announcements: true,
        },
        accessibility: {
          textSize: 'medium',
          highContrast: false,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, [loadProfile]);

  const updateNotificationPreference = async (
    key: keyof UserPreferences['notifications'],
    value: boolean
  ) => {
    if (!user?.id || !preferences) return;

    try {
      const updatedPreferences: UserPreferences = {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: value,
        },
      };

      await updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      Alert.alert('Error', 'Failed to update notification preference');
    }
  };

  const updateAccessibilitySetting = async (
    key: keyof UserPreferences['accessibility'],
    value: string | boolean
  ) => {
    if (!user?.id || !preferences) return;

    try {
      const updatedPreferences: UserPreferences = {
        ...preferences,
        accessibility: {
          ...preferences.accessibility,
          [key]: value,
        },
      };

      await updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);

      if (key === 'textSize') {
        Alert.alert('Success', 'Text size preference saved. Restart app to apply.');
      }
    } catch (error) {
      console.error('Error updating accessibility setting:', error);
      Alert.alert('Error', 'Failed to update accessibility setting');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A2E7F" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A2E7F" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            
            <Text style={styles.name}>{fullName}</Text>
            
            {profile?.chapter && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{profile.chapter}</Text>
              </View>
            )}
            
            {profile?.school && (
              <Text style={styles.school}>{profile.school}</Text>
            )}
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.content}>
          {/* Member Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Information</Text>
            <View style={styles.card}>
              {profile?.grade && (
                <InfoCard icon="graduation-cap" label="Grade" value={profile.grade} />
              )}
              {profile?.graduationYear && (
                <InfoCard icon="calendar" label="Graduation Year" value={profile.graduationYear} />
              )}
              {profile?.chapter && (
                <InfoCard icon="users" label="FBLA Chapter" value={profile.chapter} />
              )}
              {profile?.school && (
                <InfoCard icon="building" label="High School" value={profile.school} />
              )}
              {profile?.phoneNumber && (
                <InfoCard icon="phone" label="Phone Number" value={profile.phoneNumber} />
              )}
              {user?.email && (
                <InfoCard icon="envelope" label="Email" value={user.email} />
              )}
              {profile?.officerRole && (
                <View style={styles.officerCard}>
                  <View style={styles.officerContent}>
                    <View style={styles.officerIconContainer}>
                      <FontAwesome name="star" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.officerTextContainer}>
                      <Text style={styles.officerLabel}>Officer Role</Text>
                      <Text style={styles.officerValue}>{profile.officerRole}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Engagement & Leadership */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Engagement & Leadership</Text>
            <View style={styles.card}>
              {profile?.membershipStatus && (
                <InfoCard
                  icon="check-circle"
                  label="Membership Status"
                  value={profile.membershipStatus.charAt(0).toUpperCase() + profile.membershipStatus.slice(1)}
                  iconColor="#10B981"
                />
              )}
              <InfoCard
                icon="clipboard-check"
                label="Onboarding Status"
                value={profile?.completedOnboarding ? 'Completed' : 'In Progress'}
                iconColor={profile?.completedOnboarding ? '#10B981' : '#F59E0B'}
              />
            </View>
          </View>

          {/* Settings & Preferences */}
          {preferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings & Preferences</Text>
              <View style={styles.card}>
                <Text style={styles.subsectionTitle}>Notifications</Text>
                <SettingRow
                  title="Events"
                  subtitle="Get notified about upcoming events"
                  rightElement={
                    <Switch
                      value={preferences.notifications.events}
                      onValueChange={(value) => updateNotificationPreference('events', value)}
                      trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                      thumbColor="#fff"
                    />
                  }
                />
                <SettingRow
                  title="Competitions"
                  subtitle="Competition updates and deadlines"
                  rightElement={
                    <Switch
                      value={preferences.notifications.competitions}
                      onValueChange={(value) => updateNotificationPreference('competitions', value)}
                      trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                      thumbColor="#fff"
                    />
                  }
                />
                <SettingRow
                  title="Announcements"
                  subtitle="Important chapter announcements"
                  rightElement={
                    <Switch
                      value={preferences.notifications.announcements}
                      onValueChange={(value) => updateNotificationPreference('announcements', value)}
                      trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                      thumbColor="#fff"
                    />
                  }
                  showBorder={false}
                />
              </View>

              <View style={[styles.card, styles.mt16]}>
                <Text style={styles.subsectionTitle}>Accessibility</Text>
                <View style={styles.textSizeContainer}>
                  <Text style={styles.textSizeLabel}>Text Size</Text>
                  <View style={styles.textSizeButtons}>
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => updateAccessibilitySetting('textSize', size)}
                        style={[
                          styles.textSizeButton,
                          preferences.accessibility.textSize === size && styles.textSizeButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.textSizeButtonText,
                            preferences.accessibility.textSize === size && styles.textSizeButtonTextActive,
                          ]}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <SettingRow
                  title="High Contrast Mode"
                  subtitle="Improve visibility for better readability"
                  rightElement={
                    <Switch
                      value={preferences.accessibility.highContrast}
                      onValueChange={(value) => updateAccessibilitySetting('highContrast', value)}
                      trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                      thumbColor="#fff"
                    />
                  }
                  showBorder={false}
                />
              </View>
            </View>
          )}

          {/* Account Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.securityInfo}>
                <FontAwesome name="lock" size={18} color="#0A2E7F" />
                <View style={styles.securityTextContainer}>
                  <Text style={styles.securityTitle}>Data Security</Text>
                  <Text style={styles.securityDescription}>
                    Your data is stored securely in Supabase with Row Level Security. 
                    Only you can access your profile data.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, styles.mt16]}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
                }}
              >
                <FontAwesome name="edit" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
                <FontAwesome name="sign-out" size={18} color="#DC2626" />
                <Text style={styles.dangerButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  },
  header: {
    backgroundColor: '#0A2E7F',
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0A2E7F',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  school: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mt16: {
    marginTop: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  officerCard: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  officerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  officerTextContainer: {
    flex: 1,
  },
  officerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  officerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    marginLeft: 12,
  },
  textSizeContainer: {
    marginBottom: 16,
  },
  textSizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  textSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  textSizeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  textSizeButtonActive: {
    borderColor: '#0A2E7F',
    backgroundColor: '#EFF6FF',
  },
  textSizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  textSizeButtonTextActive: {
    color: '#0A2E7F',
  },
  securityInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A2E7F',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A2E7F',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
});
