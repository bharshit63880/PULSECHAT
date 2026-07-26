import { StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { palette, radii } from '@/styles/theme';

type ThreadComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export const ThreadComposer = ({ value, onChange, onSend, disabled }: ThreadComposerProps) => (
  <View style={styles.wrapper}>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="Write a secure message"
      placeholderTextColor={palette.muted}
      multiline
      style={styles.input}
      editable={!disabled}
    />
    <PrimaryButton label="Send" onPress={onSend} disabled={disabled || !value.trim()} style={styles.button} />
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    paddingTop: 12
  },
  input: {
    flex: 1,
    minHeight: 54,
    maxHeight: 120,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#ffffffde',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: palette.ink,
    fontSize: 15
  },
  button: {
    minWidth: 96
  }
});
