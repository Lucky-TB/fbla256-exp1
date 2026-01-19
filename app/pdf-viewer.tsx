/**
 * Web Viewer Screen
 * 
 * Displays PDF documents and web pages in an in-app WebView instead of opening
 * in an external browser. Provides a better user experience for
 * viewing FBLA documents and resources.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function PDFViewerScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  if (!url) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Web Viewer</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No PDF URL provided</Text>
        </View>
      </SafeAreaView>
    );
  }

  // For PDFs, determine the best viewing method
  // Supabase Storage URLs can be loaded directly
  // External PDF URLs use Google Docs Viewer for better compatibility
  // Web pages are loaded directly
  const isSupabaseStorage = url.includes('supabase.co/storage');
  const isPdf = url.includes('.pdf') || url.toLowerCase().includes('pdf');
  const webUrl = isPdf && !isSupabaseStorage
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : url;
  
  // Use desktop user agent for Instagram to enable post viewing
  // Instagram's mobile site heavily restricts functionality
  const isInstagram = url.includes('instagram.com');
  const userAgent = isInstagram
    ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Web Viewer'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: webUrl }}
        style={styles.webview}
        userAgent={userAgent}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          // Suppress warnings for App Store URLs and other special schemes
          const url = nativeEvent.url || '';
          if (
            url.includes('itms-appss://') ||
            url.includes('itms://') ||
            url.includes('apps.apple.com')
          ) {
            // Silently ignore App Store redirects
            return;
          }
          console.error('WebView error: ', nativeEvent);
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request;
          
          // Block App Store URLs and other special schemes that can't be opened
          if (
            url.includes('itms-appss://') ||
            url.includes('itms://') ||
            url.startsWith('itms-appss://') ||
            url.startsWith('itms://')
          ) {
            // Try to open in external browser if it's an App Store link
            if (url.includes('apps.apple.com')) {
              Linking.openURL(url).catch(() => {
                // Silently fail if we can't open it
              });
            }
            return false; // Prevent WebView from trying to load it
          }
          
          // Allow all other URLs to load normally
          return true;
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBF9',
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFBF9',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'ApercuPro-Regular',
  },
});
