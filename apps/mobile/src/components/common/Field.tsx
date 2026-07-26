import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { palette, radii } from '@/styles/theme';

type FieldProps = TextInputProps & {
  label: string;
  helperText?: string;
};

export const Field = ({ label, helperText, style, ...props }: FieldProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholderTextColor={palette.muted}
      style={[styles.input, style]}
      {...props}
    />
    {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '600'
  },
  input: {
    minHeight: 54,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 16,
    color: palette.ink,
    fontSize: 16
  },
  helper: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
