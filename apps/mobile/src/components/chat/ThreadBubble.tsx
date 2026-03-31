import type { MessageDto } from '@chat-app/shared';

import { StyleSheet, Text, View } from 'react-native';

import { palette, radii } from '@/styles/theme';

type ThreadBubbleProps = {
  message: MessageDto;
  own: boolean;
  plaintext: string;
};

export const ThreadBubble = ({ message, own, plaintext }: ThreadBubbleProps) => (
  <View style={[styles.row, own ? styles.rowOwn : styles.rowPeer]}>
    <View style={[styles.bubble, own ? styles.bubbleOwn : styles.bubblePeer]}>
      <Text style={[styles.body, own ? styles.bodyOwn : null]}>
        {plaintext || (message.type === 'file' ? 'Encrypted attachment' : 'Encrypted message')}
      </Text>
      <Text style={[styles.meta, own ? styles.metaOwn : null]}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12
  },
  rowOwn: {
    justifyContent: 'flex-end'
  },
  rowPeer: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  bubbleOwn: {
    backgroundColor: palette.accent
  },
  bubblePeer: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line
  },
  body: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 21
  },
  bodyOwn: {
    color: '#fff'
  },
  meta: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 11,
    textAlign: 'right'
  },
  metaOwn: {
    color: '#dcfce7'
  }
});
