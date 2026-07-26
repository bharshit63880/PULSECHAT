import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { ViewStyle } from 'react-native';

import { palette, radii } from '@/styles/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style
}: PrimaryButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      variant === 'ghost' && styles.ghost,
      pressed && !disabled ? styles.pressed : null,
      (disabled || loading) && styles.disabled,
      style
    ]}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'primary' ? '#fff' : palette.accent} />
    ) : (
      <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: palette.accent
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  primaryLabel: {
    color: '#fff'
  },
  secondaryLabel: {
    color: palette.ink
  },
  label: {
    fontSize: 16,
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.88
  },
  disabled: {
    opacity: 0.55
  }
});
