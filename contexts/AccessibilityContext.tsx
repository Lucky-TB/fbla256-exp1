/**
 * Accessibility Context
 * 
 * Provides global accessibility settings (text size, high contrast)
 * that are applied throughout the app. Settings are persisted to Supabase
 * and loaded on app start.
 */

import { getUserProfileWithPreferences, updateUserPreferences, UserPreferences } from '@/utils/userProfile';
import { useAuth } from '@/contexts/AuthContext';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AccessibilityContextType {
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  textSizeMultiplier: number;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    cardBackground: string;
  };
  updateTextSize: (size: 'small' | 'medium' | 'large') => Promise<void>;
  updateHighContrast: (enabled: boolean) => Promise<void>;
  loading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Text size multipliers
const TEXT_SIZE_MULTIPLIERS = {
  small: 0.875, // 87.5% of base size
  medium: 1.0, // 100% (base)
  large: 1.25, // 125% of base size
};

// Color schemes
const NORMAL_COLORS = {
  background: '#FBFBF9',
  text: '#000000',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  cardBackground: '#FFFFFF',
};

const HIGH_CONTRAST_COLORS = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#000000',
  border: '#000000',
  cardBackground: '#FFFFFF',
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserProfileWithPreferences(user.id);
        if (data?.preferences?.accessibility) {
          setTextSize(data.preferences.accessibility.textSize || 'medium');
          setHighContrast(data.preferences.accessibility.highContrast || false);
        }
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  const updateTextSize = useCallback(async (size: 'small' | 'medium' | 'large') => {
    if (!user?.id) return;

    try {
      setTextSize(size);
      
      // Get current preferences
      const data = await getUserProfileWithPreferences(user.id);
      const currentPreferences: UserPreferences = data?.preferences || {
        notifications: {
          events: true,
          competitions: true,
          announcements: true,
        },
        accessibility: {
          textSize: 'medium',
          highContrast: false,
        },
      };

      // Update preferences
      await updateUserPreferences(user.id, {
        ...currentPreferences,
        accessibility: {
          ...currentPreferences.accessibility,
          textSize: size,
        },
      });
    } catch (error) {
      console.error('Error updating text size:', error);
      // Revert on error
      const data = await getUserProfileWithPreferences(user.id);
      if (data?.preferences?.accessibility?.textSize) {
        setTextSize(data.preferences.accessibility.textSize);
      }
    }
  }, [user?.id]);

  const updateHighContrast = useCallback(async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      setHighContrast(enabled);
      
      // Get current preferences
      const data = await getUserProfileWithPreferences(user.id);
      const currentPreferences: UserPreferences = data?.preferences || {
        notifications: {
          events: true,
          competitions: true,
          announcements: true,
        },
        accessibility: {
          textSize: 'medium',
          highContrast: false,
        },
      };

      // Update preferences
      await updateUserPreferences(user.id, {
        ...currentPreferences,
        accessibility: {
          ...currentPreferences.accessibility,
          highContrast: enabled,
        },
      });
    } catch (error) {
      console.error('Error updating high contrast:', error);
      // Revert on error
      const data = await getUserProfileWithPreferences(user.id);
      if (data?.preferences?.accessibility?.highContrast !== undefined) {
        setHighContrast(data.preferences.accessibility.highContrast);
      }
    }
  }, [user?.id]);

  const textSizeMultiplier = TEXT_SIZE_MULTIPLIERS[textSize];
  const colors = highContrast ? HIGH_CONTRAST_COLORS : NORMAL_COLORS;

  const value: AccessibilityContextType = {
    textSize,
    highContrast,
    textSizeMultiplier,
    colors,
    updateTextSize,
    updateHighContrast,
    loading,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
