/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Helper to safely get accessibility settings
function useAccessibilitySafe() {
  try {
    return useAccessibility();
  } catch {
    // Return defaults if context not available
    return {
      textSizeMultiplier: 1.0,
      colors: {
        background: '#FBFBF9',
        text: '#000000',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        cardBackground: '#FFFFFF',
      },
    };
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const theme = useColorScheme() ?? 'light';
  const { textSizeMultiplier, colors } = useAccessibilitySafe();
  const color = lightColor || darkColor || colors.text;

  // Apply text size multiplier to fontSize if specified
  const processedStyle = Array.isArray(style)
    ? style.map((s) => {
        if (s && typeof s === 'object' && 'fontSize' in s) {
          return { ...s, fontSize: (s.fontSize as number) * textSizeMultiplier };
        }
        return s;
      })
    : style && typeof style === 'object' && 'fontSize' in style
      ? { ...style, fontSize: (style.fontSize as number) * textSizeMultiplier }
      : style;

  return (
    <DefaultText
      className={className}
      style={[{ color, fontFamily: 'ApercuPro-Regular' }, processedStyle]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const { colors } = useAccessibilitySafe();
  const backgroundColor = lightColor || darkColor || colors.background;

  return <DefaultView className={className} style={[{ backgroundColor }, style]} {...otherProps} />;
}
