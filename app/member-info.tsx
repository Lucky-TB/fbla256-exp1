import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, UserProfile } from '@/utils/userProfile';
import { TouchableOpacity } from 'react-native';

export default function MemberInfoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserProfile(user.id);
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Information</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {profile?.grade && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <FontAwesome name="graduation-cap" size={20} color="#000000" style={styles.icon} />
                <Text style={styles.infoLabel}>Grade</Text>
              </View>
              <Text style={styles.infoValue}>{profile.grade}</Text>
            </View>
          )}

          {profile?.graduationYear && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <FontAwesome name="calendar" size={20} color="#000000" style={styles.icon} />
                <Text style={styles.infoLabel}>Graduation Year</Text>
              </View>
              <Text style={styles.infoValue}>{profile.graduationYear}</Text>
            </View>
          )}

          {profile?.chapter && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <FontAwesome name="users" size={20} color="#000000" style={styles.icon} />
                <Text style={styles.infoLabel}>FBLA Chapter</Text>
              </View>
              <Text style={styles.infoValue}>{profile.chapter}</Text>
            </View>
          )}

          {profile?.phoneNumber && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <FontAwesome name="phone" size={20} color="#000000" style={styles.icon} />
                <Text style={styles.infoLabel}>Phone Number</Text>
              </View>
              <Text style={styles.infoValue}>{profile.phoneNumber}</Text>
            </View>
          )}

          {profile?.officerRole && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <FontAwesome name="star" size={20} color="#F59E0B" style={styles.icon} />
                <Text style={styles.infoLabel}>Officer Role</Text>
              </View>
              <Text style={[styles.infoValue, styles.officerValue]}>{profile.officerRole}</Text>
            </View>
          )}

          {!profile && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No member information available</Text>
            </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  infoRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'ApercuPro-Medium',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    textAlign: 'right',
    flex: 1,
  },
  officerValue: {
    color: '#F59E0B',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
});
