import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { hasCompletedOnboarding } from '@/utils/userProfile';

export default function Index() {
  const { session, user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (session && user?.id) {
      hasCompletedOnboarding(user.id).then(setOnboardingComplete);
    } else if (session && !user?.id) {
      // If we have a session but no user, wait a bit for user to load
      const timer = setTimeout(() => {
        if (user?.id) {
          hasCompletedOnboarding(user.id).then(setOnboardingComplete);
        } else {
          setOnboardingComplete(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setOnboardingComplete(null);
    }
  }, [session, user?.id]);

  if (loading || (session && onboardingComplete === null)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0A2E7F" />
      </View>
    );
  }

  if (session) {
    if (!onboardingComplete) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth-landing" />;
}

