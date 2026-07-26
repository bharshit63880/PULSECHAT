import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/styles/theme';

type AvatarProps = {
  name: string;
  online?: boolean;
};

export const Avatar = ({ name, online }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.wrapper}>
      <View style={styles.circle}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      {online ? <View style={styles.onlineDot} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative'
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d6ead9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  initials: {
    color: '#1f6d3a',
    fontSize: 18,
    fontWeight: '700'
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.accent,
    borderWidth: 2,
    borderColor: palette.surface
  }
});
