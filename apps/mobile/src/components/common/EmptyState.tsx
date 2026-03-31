import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/styles/theme';

type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: palette.line,
    borderStyle: 'dashed',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffffaa'
  },
  title: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700'
  },
  description: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  }
});
