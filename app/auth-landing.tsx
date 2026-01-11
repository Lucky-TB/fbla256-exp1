import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AuthLandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Section with Plants Illustration */}
        <View style={styles.topSection}>
          {/* Plant illustrations */}
          <View style={styles.plantsContainer}>
            {/* Left plant - succulent */}
            <View style={styles.plantWrapper}>
              <View style={styles.succulentPot} />
              <View style={styles.succulentBase} />
            </View>
            {/* Right plant - snake plant */}
            <View style={styles.plantWrapper}>
              <View style={styles.snakePlantPot} />
              <View style={styles.snakePlantBase} />
            </View>
          </View>
        </View>

        {/* Bottom Section with Buttons */}
        <View style={styles.bottomSection}>
          {/* Login Button */}
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home')}
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>Continue as a guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 32,
  },
  plantsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 32,
  },
  plantWrapper: {
    alignItems: 'center',
  },
  succulentPot: {
    width: 80,
    height: 100,
    backgroundColor: '#A8D5BA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginBottom: 8,
  },
  succulentBase: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#B8E5C8',
  },
  snakePlantPot: {
    width: 60,
    height: 140,
    backgroundColor: '#90C695',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: 8,
  },
  snakePlantBase: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#0A2E7F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0A2E7F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#0A2E7F',
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  guestButtonText: {
    color: '#1D52BC',
    fontSize: 16,
    fontWeight: '500',
  },
});
