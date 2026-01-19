import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserProfileWithPreferences,
  updateUserPreferences,
  UserPreferences,
} from '@/utils/userProfile';

export default function AccessibilitySettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserProfileWithPreferences(user.id);
        if (data) {
          setPreferences(data.preferences);
        } else {
          // Default preferences
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
        console.error('Error loading preferences:', error);
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
      }
    };

    loadPreferences();
  }, [user?.id]);

  const updateAccessibilityPreference = async (
    field: 'textSize' | 'highContrast',
    value: 'small' | 'medium' | 'large' | boolean
  ) => {
    if (!user?.id || !preferences) return;

    try {
      const updatedPreferences: UserPreferences = {
        ...preferences,
        accessibility: {
          ...preferences.accessibility,
          [field]: value,
        },
      };

      await updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating accessibility preference:', error);
      Alert.alert('Error', 'Failed to update accessibility setting');
    }
  };

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

  const textSizes: Array<{ label: string; value: 'small' | 'medium' | 'large' }> = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Text Size Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Text Size</Text>
            <Text style={styles.sectionDescription}>
              Adjust the text size to make content easier to read.
            </Text>
            <View style={styles.optionsContainer}>
              {textSizes.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.optionButton,
                    preferences?.accessibility.textSize === size.value && styles.optionButtonActive,
                  ]}
                  onPress={() => updateAccessibilityPreference('textSize', size.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      preferences?.accessibility.textSize === size.value && styles.optionTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                  {preferences?.accessibility.textSize === size.value && (
                    <FontAwesome name="check" size={16} color="#0A2E7F" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* High Contrast Section */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>High Contrast</Text>
                <Text style={styles.settingDescription}>
                  Increase contrast for better visibility
                </Text>
              </View>
              <Switch
                value={preferences?.accessibility.highContrast || false}
                onValueChange={(value) => updateAccessibilityPreference('highContrast', value)}
                trackColor={{ false: '#E5E7EB', true: '#0A2E7F' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoBox}>
            <FontAwesome name="info-circle" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              These settings will be applied throughout the app to improve readability and
              accessibility.
            </Text>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    borderColor: '#0A2E7F',
    backgroundColor: 'rgba(10, 46, 127, 0.05)',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'ApercuPro-Regular',
  },
  optionTextActive: {
    color: '#0A2E7F',
    fontFamily: 'ApercuPro-Medium',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
    lineHeight: 20,
  },
});
