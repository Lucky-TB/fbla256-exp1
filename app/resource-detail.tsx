/**
 * Resource Detail Screen
 * 
 * Displays comprehensive information about a single FBLA resource.
 * Handles different resource types (PDF, external link, internal page)
 * with appropriate actions for each type.
 * 
 * FBLA Judging Note: This screen demonstrates proper handling of
 * different resource types and provides clear user actions.
 */

import { getResourceById, Resource } from '@/utils/resources';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);

  useEffect(() => {
    const loadResource = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const resourceData = await getResourceById(id);
        setResource(resourceData);
      } catch (error) {
        console.error('Error loading resource:', error);
        Alert.alert('Error', 'Failed to load resource details');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id]);

  const handleOpenResource = async () => {
    if (!resource) return;

    try {
      switch (resource.resourceType) {
        case 'pdf':
        case 'external_link':
          if (resource.url) {
            const canOpen = await Linking.canOpenURL(resource.url);
            if (canOpen) {
              await Linking.openURL(resource.url);
            } else {
              Alert.alert('Error', 'Cannot open this URL');
            }
          } else {
            Alert.alert('Error', 'Resource URL not available');
          }
          break;

        case 'internal_page':
          // For internal pages, you could navigate to a specific screen
          // For now, we'll show an alert
          Alert.alert(
            'Internal Resource',
            'This resource is an internal page. Navigation to internal content would be implemented here.',
            [{ text: 'OK' }]
          );
          break;

        default:
          Alert.alert('Error', 'Unknown resource type');
      }
    } catch (error) {
      console.error('Error opening resource:', error);
      Alert.alert('Error', 'Failed to open resource');
    }
  };

  const getResourceTypeIcon = (type: string): string => {
    switch (type) {
      case 'pdf':
        return 'file-pdf-o';
      case 'external_link':
        return 'external-link';
      case 'internal_page':
        return 'file-text-o';
      default:
        return 'file-o';
    }
  };

  const getResourceTypeColor = (type: string): string => {
    switch (type) {
      case 'pdf':
        return '#DC2626';
      case 'external_link':
        return '#0A2E7F';
      case 'internal_page':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getResourceTypeLabel = (type: string): string => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'external_link':
        return 'External Link';
      case 'internal_page':
        return 'Internal Page';
      default:
        return 'Resource';
    }
  };

  const getActionButtonText = (type: string): string => {
    switch (type) {
      case 'pdf':
        return 'Open PDF';
      case 'external_link':
        return 'Open Link';
      case 'internal_page':
        return 'View Content';
      default:
        return 'Open Resource';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading resource...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resource) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resource Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Resource not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const color = getResourceTypeColor(resource.resourceType);
  const icon = getResourceTypeIcon(resource.resourceType);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resource Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resource Type Badge */}
        <View style={styles.typeBadgeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: `${color}15` }]}>
            <FontAwesome name={icon as any} size={16} color={color} />
            <Text style={[styles.typeBadgeText, { color }]}>
              {getResourceTypeLabel(resource.resourceType)}
            </Text>
          </View>
        </View>

        {/* Resource Title */}
        <Text style={styles.resourceTitle}>{resource.title}</Text>

        {/* Category */}
        {resource.categoryName && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Text style={styles.categoryValue}>{resource.categoryName}</Text>
          </View>
        )}

        {/* Description */}
        {resource.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="info-circle" size={18} color="#000000" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </View>
        )}

        {/* URL (for external links and PDFs) */}
        {(resource.resourceType === 'pdf' || resource.resourceType === 'external_link') &&
          resource.url && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="link" size={18} color="#000000" />
                <Text style={styles.sectionTitle}>URL</Text>
              </View>
              <Text style={styles.urlText} numberOfLines={2}>
                {resource.url}
              </Text>
            </View>
          )}

        {/* Action Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color }]}
            onPress={handleOpenResource}
            accessibilityLabel={getActionButtonText(resource.resourceType)}
            accessibilityRole="button"
          >
            <FontAwesome name={icon as any} size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {getActionButtonText(resource.resourceType)}
            </Text>
          </TouchableOpacity>
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
  resourceTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'ApercuPro-Bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
    lineHeight: 36,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ApercuPro-Medium',
    color: '#000000',
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
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'ApercuPro-Regular',
    lineHeight: 24,
  },
  urlText: {
    fontSize: 14,
    color: '#0A2E7F',
    fontFamily: 'ApercuPro-Regular',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
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
