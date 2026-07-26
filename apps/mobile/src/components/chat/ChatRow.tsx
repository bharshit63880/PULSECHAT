import type { ChatDto } from '@chat-app/shared';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { palette, radii } from '@/styles/theme';

type ChatRowProps = {
  chat: ChatDto;
  currentUserId: string;
  active?: boolean;
  onPress: () => void;
};

export const ChatRow = ({ chat, currentUserId, active, onPress }: ChatRowProps) => {
  const counterpart = chat.isGroupChat
    ? null
    : chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0];
  const title = chat.isGroupChat ? chat.name ?? 'Untitled group' : counterpart?.name ?? 'Direct chat';
  const subtitle = chat.latestMessage
    ? chat.latestMessage.type === 'sticker'
      ? 'Sticker'
      : chat.latestMessage.type === 'gif'
        ? 'GIF'
        : chat.latestMessage.type === 'file'
          ? 'Encrypted attachment'
          : 'Encrypted message'
    : 'No messages yet';

  return (
    <Pressable onPress={onPress} style={[styles.row, active ? styles.rowActive : null]}>
      <Avatar name={title} online={counterpart?.isOnline} />
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.timestamp}>{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.bottomLine}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
          {chat.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffffcc'
  },
  rowActive: {
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5'
  },
  content: {
    flex: 1,
    gap: 6
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center'
  },
  title: {
    flex: 1,
    color: palette.ink,
    fontWeight: '700',
    fontSize: 16
  },
  subtitle: {
    flex: 1,
    color: palette.muted,
    fontSize: 13
  },
  timestamp: {
    color: palette.muted,
    fontSize: 12
  },
  badge: {
    minWidth: 24,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  }
});
