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
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const { textSize, highContrast, updateTextSize, updateHighContrast, colors, textSizeMultiplier, loading: accessibilityLoading } = useAccessibility();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for accessibility context to load
    if (!accessibilityLoading) {
      setLoading(false);
    }
  }, [accessibilityLoading]);

  // Create dynamic styles based on accessibility settings
  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: colors.background },
    header: { ...styles.header, backgroundColor: colors.background },
    headerTitle: { ...styles.headerTitle, color: colors.text, fontSize: 34 * textSizeMultiplier },
    loadingText: { ...styles.loadingText, color: colors.textSecondary, fontSize: 16 * textSizeMultiplier },
    sectionTitle: { ...styles.sectionTitle, color: colors.text, fontSize: 20 * textSizeMultiplier },
    sectionDescription: { ...styles.sectionDescription, color: colors.textSecondary, fontSize: 15 * textSizeMultiplier },
    optionText: { ...styles.optionText, color: colors.text, fontSize: 16 * textSizeMultiplier },
    settingTitle: { ...styles.settingTitle, color: colors.text, fontSize: 16 * textSizeMultiplier },
    settingDescription: { ...styles.settingDescription, color: colors.textSecondary, fontSize: 14 * textSizeMultiplier },
    settingRow: { ...styles.settingRow, backgroundColor: colors.cardBackground, borderColor: colors.border },
    optionButton: { ...styles.optionButton, backgroundColor: colors.cardBackground, borderColor: colors.border },
    infoText: { ...styles.infoText, color: colors.textSecondary, fontSize: 14 * textSizeMultiplier },
    infoBox: { ...styles.infoBox, backgroundColor: highContrast ? colors.cardBackground : '#F3F4F6' },
  };

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={dynamicStyles.loadingText}>Loading...</Text>
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
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Accessibility</Text>
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
            <Text style={dynamicStyles.sectionTitle}>Text Size</Text>
            <Text style={dynamicStyles.sectionDescription}>
              Adjust the text size to make content easier to read.
            </Text>
            <View style={styles.optionsContainer}>
              {textSizes.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    dynamicStyles.optionButton,
                    textSize === size.value && styles.optionButtonActive,
                  ]}
                  onPress={() => updateTextSize(size.value)}
                >
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      textSize === size.value && styles.optionTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                  {textSize === size.value && (
                    <FontAwesome name="check" size={16} color="#0A2E7F" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* High Contrast Section */}
          <View style={styles.section}>
            <View style={dynamicStyles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={dynamicStyles.settingTitle}>High Contrast</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Increase contrast for better visibility
                </Text>
              </View>
              <Switch
                value={highContrast}
                onValueChange={updateHighContrast}
                trackColor={{ false: colors.border, true: '#0A2E7F' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Info Note */}
          <View style={dynamicStyles.infoBox}>
            <FontAwesome name="info-circle" size={16} color={colors.textSecondary} />
            <Text style={dynamicStyles.infoText}>
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
